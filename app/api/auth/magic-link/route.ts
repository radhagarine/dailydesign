import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscribers } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const subscriber = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.email, normalizedEmail))
      .get();

    if (!subscriber || subscriber.status !== 'active') {
      return NextResponse.json(
        { error: 'No active subscription found for that email' },
        { status: 404 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://dailydesign.radhagarine.com';
    const magicLink = `${baseUrl}/archive?token=${subscriber.unsubscribeToken}`;

    await sendEmail({
      to: normalizedEmail,
      subject: 'Your DailyDesign Archive Access Link',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
          <div style="max-width:480px;margin:0 auto;padding:40px 24px;">
            <h1 style="color:#ffffff;font-size:24px;margin-bottom:8px;">DailyDesign</h1>
            <p style="color:#9ca3af;font-size:14px;margin-bottom:32px;">Archive Access</p>
            <p style="color:#d1d5db;font-size:16px;line-height:1.6;margin-bottom:24px;">
              Click the button below to access the scenario archive. This link will keep you signed in for 30 days.
            </p>
            <a href="${magicLink}" style="display:inline-block;padding:14px 32px;background:#6366f1;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;">
              Open Archive
            </a>
            <p style="color:#6b7280;font-size:12px;margin-top:32px;line-height:1.5;">
              If you didn't request this link, you can safely ignore this email.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Magic link error:', error);
    return NextResponse.json({ error: 'Failed to send access link' }, { status: 500 });
  }
}
