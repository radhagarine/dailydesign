import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscribers, emails, scenarios, generateScenarioSlug } from '@/lib/schema';
import { generateDailyScenario } from '@/lib/ai';
import { sendEmail } from '@/lib/email';
import { eq } from 'drizzle-orm';
import { getDailyStrategy } from '@/lib/content-strategy';

export const maxDuration = 60; // Allow longer timeout for generation and sending

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
    console.log(`Using strategy: ${strategy.theme.title} / ${strategy.problemType}`);

    // 2. Generate Content
    console.log('Generating scenario...');
    const scenario = await generateDailyScenario(strategy);

    // 3. Save scenario to database
    const slug = generateScenarioSlug(scenario.title, today);
    console.log(`Saving scenario with slug: ${slug}`);

    await db.insert(scenarios).values({
      slug,
      title: scenario.title,
      difficulty: scenario.difficulty || 'Principal',
      summary: scenario.summary,
      context: scenario.context,
      question: scenario.question,
      answers: JSON.stringify(scenario.answers),
      keyTakeaways: JSON.stringify(scenario.keyTakeaways),
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
        subject: `Daily Challenge: ${scenario.title}`,
        html: emailHtml
      });
      if (res.success) recipientCount++;
      return res;
    }));

    // 6. Log to DB
    await db.insert(emails).values({
      subject: scenario.title,
      body: JSON.stringify(scenario),
      recipientCount: recipientCount
    }).run();

    return NextResponse.json({
      success: true,
      generated: scenario.title,
      slug,
      sentTo: recipientCount,
      results
    });

  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function generateEmailHtml(scenario: any, scenarioUrl: string, unsubscribeUrl: string): string {
  const badAnswer = scenario.answers.find((a: any) => a.type === 'bad');
  const goodAnswer = scenario.answers.find((a: any) => a.type === 'good');
  const bestAnswer = scenario.answers.find((a: any) => a.type === 'best');

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
          <span style="display: inline-block; padding: 4px 12px; background-color: #7f1d1d; color: #fca5a5; border-radius: 4px; font-size: 12px; font-weight: 600;">DAILY CHALLENGE</span>
        </div>

        <h1 style="color: #ffffff; font-size: 24px; margin-bottom: 8px; text-align: center;">${scenario.title}</h1>
        <p style="color: #9ca3af; text-align: center; margin-bottom: 24px;">${scenario.summary}</p>

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${scenarioUrl}" style="display: inline-block; padding: 12px 24px; background-color: #7f1d1d; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">View Full Scenario</a>
        </div>

        <hr style="border: none; border-top: 1px solid #333; margin: 24px 0;" />

        <!-- Context Preview -->
        <h3 style="color: #ffffff; font-size: 16px; margin-bottom: 12px;">The Situation</h3>
        <div style="color: #d1d5db; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          ${scenario.context.replace(/\n/g, '<br/>').substring(0, 500)}${scenario.context.length > 500 ? '...' : ''}
        </div>

        <h3 style="color: #ffffff; font-size: 16px; margin-bottom: 12px;">The Question</h3>
        <p style="color: #fca5a5; font-size: 16px; font-weight: 500; margin-bottom: 24px;">${scenario.question}</p>

        <hr style="border: none; border-top: 1px solid #333; margin: 24px 0;" />

        <p style="color: #6b7280; font-size: 14px; text-align: center; margin-bottom: 24px;">
          Take 10-15 minutes to think through your answer before viewing the analysis.
        </p>

        <!-- Quick Preview of Answers -->
        <div style="background-color: #1f1f1f; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
          <h4 style="color: #ef4444; font-size: 14px; margin: 0 0 8px 0;">Bad Answer Preview</h4>
          <p style="color: #9ca3af; font-size: 13px; margin: 0;">${badAnswer?.content?.substring(0, 150) || ''}...</p>
        </div>

        <div style="background-color: #1f1f1f; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
          <h4 style="color: #3b82f6; font-size: 14px; margin: 0 0 8px 0;">Good Answer Preview</h4>
          <p style="color: #9ca3af; font-size: 13px; margin: 0;">${goodAnswer?.content?.substring(0, 150) || ''}...</p>
        </div>

        <div style="background-color: #1f1f1f; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
          <h4 style="color: #22c55e; font-size: 14px; margin: 0 0 8px 0;">Best Answer Preview</h4>
          <p style="color: #9ca3af; font-size: 13px; margin: 0;">${bestAnswer?.content?.substring(0, 150) || ''}...</p>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${scenarioUrl}" style="display: inline-block; padding: 12px 24px; background-color: #7f1d1d; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">Read Full Analysis</a>
        </div>

        <!-- Key Takeaways -->
        <h3 style="color: #ffffff; font-size: 16px; margin-bottom: 12px;">Key Takeaways</h3>
        <ul style="color: #d1d5db; font-size: 14px; line-height: 1.8; padding-left: 20px;">
          ${scenario.keyTakeaways.slice(0, 3).map((k: string) => `<li>${k}</li>`).join('')}
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
