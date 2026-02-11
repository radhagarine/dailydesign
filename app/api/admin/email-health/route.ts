import { NextResponse } from 'next/server';
import { verifyBearerToken } from '@/lib/auth';
import { getDeadLetterStats, retryFailedEmails } from '@/lib/email-retry';

// GET: View dead letter stats and recent errors
export async function GET(req: Request) {
    if (!verifyBearerToken(req.headers.get('authorization'), process.env.CRON_SECRET)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const stats = await getDeadLetterStats();
        return NextResponse.json(stats);
    } catch (error) {
        console.error('Email health check error:', error);
        return NextResponse.json({ error: 'Failed to fetch email health' }, { status: 500 });
    }
}

// POST: Trigger retry of failed emails
export async function POST(req: Request) {
    if (!verifyBearerToken(req.headers.get('authorization'), process.env.CRON_SECRET)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await retryFailedEmails();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Email retry error:', error);
        return NextResponse.json({ error: 'Retry failed' }, { status: 500 });
    }
}
