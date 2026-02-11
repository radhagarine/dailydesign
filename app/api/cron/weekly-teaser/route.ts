import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emails, scenarios } from '@/lib/schema';
import { sendEmail } from '@/lib/email';
import { eq, desc } from 'drizzle-orm';
import { getBaseUrl } from '@/lib/utils';
import { verifyBearerToken } from '@/lib/auth';
import { getActiveSubscribersByTier } from '@/lib/subscribers';

export const maxDuration = 120;

export async function GET(req: Request) {
  if (!verifyBearerToken(req.headers.get('authorization'), process.env.CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const baseUrl = getBaseUrl();

    // 1. Get most recent sent scenario
    const latestScenario = await db.select()
      .from(scenarios)
      .where(eq(scenarios.scenarioStatus, 'sent'))
      .orderBy(desc(scenarios.generatedAt))
      .get();

    if (!latestScenario) {
      return NextResponse.json({ message: 'No sent scenarios found' });
    }

    const content = JSON.parse(latestScenario.content);

    // 2. Get free subscribers
    const { free: freeSubscribers } = await getActiveSubscribersByTier();

    if (freeSubscribers.length === 0) {
      return NextResponse.json({
        message: 'No free subscribers',
        scenario: latestScenario.slug,
      });
    }

    // 3. Send teaser emails in batches
    console.log(`Sending weekly teaser to ${freeSubscribers.length} free subscribers...`);
    let recipientCount = 0;
    const BATCH_SIZE = 10;

    for (let i = 0; i < freeSubscribers.length; i += BATCH_SIZE) {
      const batch = freeSubscribers.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(async (sub) => {
        const unsubscribeUrl = `${baseUrl}/unsubscribe?token=${sub.unsubscribeToken}`;
        const upgradeUrl = `${baseUrl}/#pricing`;
        const emailHtml = generateTeaserEmailHtml(content, upgradeUrl, unsubscribeUrl);

        const res = await sendEmail({
          to: sub.email,
          subject: `This Week's Challenge: ${content.problem.title}`,
          html: emailHtml,
        });
        if (res.success) recipientCount++;
        return res;
      }));

      if (i + BATCH_SIZE < freeSubscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // 4. Log to DB
    await db.insert(emails).values({
      subject: `[Teaser] ${content.problem.title}`,
      body: JSON.stringify({ type: 'weekly-teaser', scenarioSlug: latestScenario.slug }),
      recipientCount,
    }).run();

    return NextResponse.json({
      success: true,
      scenario: latestScenario.slug,
      sentTo: recipientCount,
      totalFreeSubscribers: freeSubscribers.length,
    });

  } catch (error) {
    console.error('Weekly teaser cron failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface TeaserScenario {
  metadata: { difficulty: string; topics: string[]; estimated_time: string };
  problem: { title: string; statement: string; context: string; pause_prompt: string };
  framework_steps: Array<{ step_number: number; step_name: string; time_allocation: string }>;
}

function generateTeaserEmailHtml(scenario: TeaserScenario, upgradeUrl: string, unsubscribeUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1a1a1a; color: #e5e5e5;">
      <div style="background-color: #262626; border-radius: 8px; padding: 32px; border: 1px solid #333;">

        <!-- Header -->
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="display: inline-block; padding: 4px 12px; background-color: #1e3a5f; color: #93c5fd; border-radius: 4px; font-size: 12px; font-weight: 600;">WEEKLY PREVIEW</span>
        </div>

        <h1 style="color: #ffffff; font-size: 24px; margin-bottom: 8px; text-align: center;">${escapeHtml(scenario.problem.title)}</h1>
        <p style="color: #9ca3af; text-align: center; margin-bottom: 16px;">${escapeHtml(scenario.problem.statement)}</p>

        <!-- Topics & Difficulty Tags -->
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="display: inline-block; padding: 2px 8px; background-color: #374151; color: #fbbf24; border-radius: 4px; font-size: 11px; margin: 2px;">${escapeHtml(scenario.metadata.difficulty)}</span>
          ${scenario.metadata.topics.slice(0, 3).map(topic =>
            `<span style="display: inline-block; padding: 2px 8px; background-color: #374151; color: #9ca3af; border-radius: 4px; font-size: 11px; margin: 2px;">${escapeHtml(topic)}</span>`
          ).join('')}
        </div>

        <!-- Full Context (the hook) -->
        <h3 style="color: #ffffff; font-size: 16px; margin-bottom: 12px;">The Situation</h3>
        <p style="color: #d1d5db; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          ${escapeHtml(scenario.problem.context)}
        </p>

        <hr style="border: none; border-top: 1px solid #333; margin: 24px 0;" />

        <!-- Framework Steps (names only, muted) -->
        <h3 style="color: #ffffff; font-size: 16px; margin-bottom: 16px;">Interview Framework</h3>
        <div style="background-color: #1f1f1f; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
          ${scenario.framework_steps.map((step, i) => `
            <div style="display: flex; align-items: center; margin-bottom: ${i < scenario.framework_steps.length - 1 ? '12px' : '0'};">
              <span style="display: inline-block; width: 24px; height: 24px; background-color: #374151; color: #6b7280; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; margin-right: 12px;">${step.step_number}</span>
              <span style="color: #6b7280; font-size: 14px;">${escapeHtml(step.step_name)}</span>
              <span style="color: #4b5563; font-size: 12px; margin-left: auto;">${escapeHtml(step.time_allocation)}</span>
            </div>
          `).join('')}
        </div>

        <!-- Locked Content Box -->
        <div style="border: 2px dashed #374151; border-radius: 8px; padding: 24px; margin-bottom: 24px; text-align: center;">
          <p style="color: #9ca3af; font-size: 14px; margin: 0 0 12px 0; font-weight: 600;">Paid members get daily access to:</p>
          <ul style="color: #6b7280; font-size: 13px; line-height: 2; list-style: none; padding: 0; margin: 0 0 16px 0;">
            <li>Full bad/good/best answer comparisons</li>
            <li>Principal-level response patterns</li>
            <li>Detailed key takeaways per step</li>
            <li>Interview dialogue simulation</li>
            <li>Reflection prompts & summary</li>
          </ul>
          <a href="${upgradeUrl}" style="display: inline-block; padding: 14px 28px; background-color: #7f1d1d; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">Upgrade for Full Daily Analysis</a>
        </div>

        <p style="color: #6b7280; font-size: 13px; text-align: center; margin: 0;">
          Free subscribers receive a weekly preview. Upgrade to get full scenarios delivered daily.
        </p>

      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 24px; padding: 16px;">
        <p style="color: #6b7280; font-size: 12px; margin-bottom: 8px;">
          DailyDesign
        </p>
        <p style="color: #4b5563; font-size: 11px; margin: 0;">
          <a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>
          &nbsp;|&nbsp;
          <a href="${upgradeUrl.replace(/#pricing$/, '')}" style="color: #6b7280; text-decoration: underline;">Visit Website</a>
        </p>
      </div>
    </body>
    </html>
  `;
}
