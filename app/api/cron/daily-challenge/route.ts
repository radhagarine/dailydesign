import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscribers, emails, scenarios, generateScenarioSlug } from '@/lib/schema';
import { generateDailyScenario, InterviewScenario } from '@/lib/ai';
import { sendEmail } from '@/lib/email';
import { eq } from 'drizzle-orm';
import { getDailyStrategy } from '@/lib/content-strategy';

export const maxDuration = 120; // Allow longer timeout for comprehensive content generation

// Get base URL for links
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const baseUrl = getBaseUrl();
    const today = new Date();

    // 1. Determine Strategy (Theme & Problem Type)
    const strategy = getDailyStrategy(today);
    console.log(`Using strategy: ${strategy.theme.title} / ${strategy.problemType} / ${strategy.focusArea}`);

    // 2. Generate Content
    console.log('Generating comprehensive scenario...');
    const scenario = await generateDailyScenario(strategy);

    // 3. Save scenario to database
    const slug = generateScenarioSlug(scenario.problem.title, today);
    console.log(`Saving scenario with slug: ${slug}`);

    await db.insert(scenarios).values({
      slug,
      title: scenario.problem.title,
      content: JSON.stringify(scenario),
      theme: strategy.theme.id,
      problemType: strategy.problemType,
      focusArea: strategy.focusArea,
    }).run();

    const scenarioUrl = `${baseUrl}/scenarios/${slug}`;

    // 4. Get Active Subscribers
    const activeSubscribers = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.status, 'active'))
      .all();

    if (activeSubscribers.length === 0) {
      return NextResponse.json({
        message: 'No active subscribers',
        scenarioSaved: slug
      });
    }

    // 5. Send Emails with personalized unsubscribe links
    console.log(`Sending to ${activeSubscribers.length} subscribers...`);
    let recipientCount = 0;

    const results = await Promise.all(activeSubscribers.map(async (sub) => {
      const unsubscribeUrl = `${baseUrl}/unsubscribe?token=${sub.unsubscribeToken}`;

      const emailHtml = generateEmailHtml(scenario, scenarioUrl, unsubscribeUrl);

      const res = await sendEmail({
        to: sub.email,
        subject: `Daily Challenge: ${scenario.problem.title}`,
        html: emailHtml
      });
      if (res.success) recipientCount++;
      return res;
    }));

    // 6. Log to DB
    await db.insert(emails).values({
      subject: scenario.problem.title,
      body: JSON.stringify(scenario),
      recipientCount: recipientCount
    }).run();

    return NextResponse.json({
      success: true,
      generated: scenario.problem.title,
      slug,
      sentTo: recipientCount,
      stepsGenerated: scenario.framework_steps.length,
      results
    });

  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
  }
}

function generateEmailHtml(scenario: InterviewScenario, scenarioUrl: string, unsubscribeUrl: string): string {
  // Get first step's responses for preview
  const firstStep = scenario.framework_steps[0];
  const responses = firstStep?.comparison_table?.responses || [];
  const badResponse = responses.find(r => r.level === 'bad');
  const goodResponse = responses.find(r => r.level === 'good');
  const bestResponse = responses.find(r => r.level === 'best');

  // Collect key takeaways from all steps
  const allTakeaways = scenario.framework_steps.flatMap(step => step.key_takeaways).slice(0, 4);

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
          <span style="display: inline-block; padding: 4px 12px; background-color: #7f1d1d; color: #fca5a5; border-radius: 4px; font-size: 12px; font-weight: 600;">40-MINUTE INTERVIEW SIMULATION</span>
        </div>

        <h1 style="color: #ffffff; font-size: 24px; margin-bottom: 8px; text-align: center;">${scenario.problem.title}</h1>
        <p style="color: #9ca3af; text-align: center; margin-bottom: 16px;">${scenario.problem.statement}</p>

        <!-- Topics Tags -->
        <div style="text-align: center; margin-bottom: 24px;">
          ${scenario.metadata.topics.slice(0, 3).map(topic =>
            `<span style="display: inline-block; padding: 2px 8px; background-color: #374151; color: #9ca3af; border-radius: 4px; font-size: 11px; margin: 2px;">${topic}</span>`
          ).join('')}
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${scenarioUrl}" style="display: inline-block; padding: 14px 28px; background-color: #7f1d1d; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">Start Interview Simulation</a>
        </div>

        <hr style="border: none; border-top: 1px solid #333; margin: 24px 0;" />

        <!-- Framework Steps Preview -->
        <h3 style="color: #ffffff; font-size: 16px; margin-bottom: 16px;">Today's Framework</h3>
        <div style="background-color: #1f1f1f; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
          ${scenario.framework_steps.map((step, i) => `
            <div style="display: flex; align-items: center; margin-bottom: ${i < scenario.framework_steps.length - 1 ? '12px' : '0'};">
              <span style="display: inline-block; width: 24px; height: 24px; background-color: #7f1d1d; color: #fff; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; margin-right: 12px;">${step.step_number}</span>
              <span style="color: #d1d5db; font-size: 14px;">${step.step_name}</span>
              <span style="color: #6b7280; font-size: 12px; margin-left: auto;">${step.time_allocation}</span>
            </div>
          `).join('')}
        </div>

        <!-- Context Preview -->
        <h3 style="color: #ffffff; font-size: 16px; margin-bottom: 12px;">The Situation</h3>
        <p style="color: #d1d5db; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          ${scenario.problem.context.substring(0, 300)}${scenario.problem.context.length > 300 ? '...' : ''}
        </p>

        <hr style="border: none; border-top: 1px solid #333; margin: 24px 0;" />

        <p style="color: #fca5a5; font-size: 14px; text-align: center; margin-bottom: 24px; font-style: italic;">
          ${scenario.problem.pause_prompt}
        </p>

        <!-- Response Level Preview -->
        <h3 style="color: #ffffff; font-size: 16px; margin-bottom: 16px;">What You'll Learn</h3>

        <div style="background-color: #1f1f1f; border-radius: 6px; padding: 16px; margin-bottom: 12px; border-left: 3px solid #ef4444;">
          <h4 style="color: #ef4444; font-size: 13px; margin: 0 0 8px 0;">❌ Bad Answer Pattern</h4>
          <p style="color: #9ca3af; font-size: 13px; margin: 0;">${badResponse?.response?.substring(0, 120) || ''}...</p>
        </div>

        <div style="background-color: #1f1f1f; border-radius: 6px; padding: 16px; margin-bottom: 12px; border-left: 3px solid #3b82f6;">
          <h4 style="color: #3b82f6; font-size: 13px; margin: 0 0 8px 0;">✓ Good Answer Pattern</h4>
          <p style="color: #9ca3af; font-size: 13px; margin: 0;">${goodResponse?.response?.substring(0, 120) || ''}...</p>
        </div>

        <div style="background-color: #1f1f1f; border-radius: 6px; padding: 16px; margin-bottom: 24px; border-left: 3px solid #22c55e;">
          <h4 style="color: #22c55e; font-size: 13px; margin: 0 0 8px 0;">✓✓ Principal-Level Pattern</h4>
          <p style="color: #9ca3af; font-size: 13px; margin: 0;">${bestResponse?.response?.substring(0, 120) || ''}...</p>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${scenarioUrl}" style="display: inline-block; padding: 14px 28px; background-color: #7f1d1d; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">Start Full Simulation</a>
        </div>

        <!-- Key Takeaways Preview -->
        <h3 style="color: #ffffff; font-size: 16px; margin-bottom: 12px;">Key Takeaways</h3>
        <ul style="color: #d1d5db; font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0;">
          ${allTakeaways.map((k: string) => `<li>${k}</li>`).join('')}
        </ul>

      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 24px; padding: 16px;">
        <p style="color: #6b7280; font-size: 12px; margin-bottom: 8px;">
          Principal Engineer Interview Prep
        </p>
        <p style="color: #4b5563; font-size: 11px; margin: 0;">
          <a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>
          &nbsp;|&nbsp;
          <a href="${scenarioUrl.replace(/\/scenarios\/.*$/, '')}" style="color: #6b7280; text-decoration: underline;">Visit Website</a>
        </p>
      </div>
    </body>
    </html>
  `;
}
