import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emailEvents, emails } from '@/lib/schema';
import { sql } from 'drizzle-orm';
import { verifyBearerToken } from '@/lib/auth';

export async function GET(req: Request) {
    if (!verifyBearerToken(req.headers.get('authorization'), process.env.CRON_SECRET)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Aggregate counts by event type
        const eventCounts = await db
            .select({
                eventType: emailEvents.eventType,
                count: sql<number>`count(*)`,
            })
            .from(emailEvents)
            .groupBy(emailEvents.eventType)
            .all();

        // Total emails sent (from emails table)
        const totalSentResult = await db
            .select({
                totalRecipients: sql<number>`coalesce(sum(${emails.recipientCount}), 0)`,
                totalEmails: sql<number>`count(*)`,
            })
            .from(emails)
            .get();

        const counts: Record<string, number> = {};
        for (const row of eventCounts) {
            counts[row.eventType] = row.count;
        }

        const delivered = counts['delivered'] || 0;
        const opened = counts['opened'] || 0;
        const clicked = counts['clicked'] || 0;
        const bounced = counts['bounced'] || 0;
        const complained = counts['complained'] || 0;

        // Unique opens (deduplicated by recipient + resend email ID)
        const uniqueOpensResult = await db
            .select({
                count: sql<number>`count(distinct ${emailEvents.recipientEmail} || ':' || ${emailEvents.resendEmailId})`,
            })
            .from(emailEvents)
            .where(sql`${emailEvents.eventType} = 'opened'`)
            .get();

        const uniqueOpens = uniqueOpensResult?.count || 0;

        return NextResponse.json({
            totalEmailsSent: totalSentResult?.totalEmails || 0,
            totalRecipients: totalSentResult?.totalRecipients || 0,
            events: {
                delivered,
                opened,
                clicked,
                bounced,
                complained,
            },
            uniqueOpens,
            rates: {
                deliveryRate: delivered > 0 ? ((delivered / (totalSentResult?.totalRecipients || 1)) * 100).toFixed(1) + '%' : 'N/A',
                openRate: delivered > 0 ? ((uniqueOpens / delivered) * 100).toFixed(1) + '%' : 'N/A',
                clickRate: opened > 0 ? ((clicked / opened) * 100).toFixed(1) + '%' : 'N/A',
                bounceRate: delivered > 0 ? ((bounced / (delivered + bounced)) * 100).toFixed(1) + '%' : 'N/A',
            },
        });
    } catch (error) {
        console.error('Email metrics error:', error);
        return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
    }
}
