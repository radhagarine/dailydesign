import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { db } from '@/lib/db';
import { emailEvents } from '@/lib/schema';

const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

interface ResendWebhookPayload {
    type: string;
    data: {
        email_id: string;
        to: string[];
        from: string;
        subject: string;
        created_at: string;
        // click events include the clicked URL
        click?: { url: string };
    };
}

export async function POST(req: Request) {
    if (!webhookSecret) {
        console.error('RESEND_WEBHOOK_SECRET not configured');
        return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const body = await req.text();
    const svixId = req.headers.get('svix-id');
    const svixTimestamp = req.headers.get('svix-timestamp');
    const svixSignature = req.headers.get('svix-signature');

    if (!svixId || !svixTimestamp || !svixSignature) {
        return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
    }

    let payload: ResendWebhookPayload;

    try {
        const wh = new Webhook(webhookSecret);
        payload = wh.verify(body, {
            'svix-id': svixId,
            'svix-timestamp': svixTimestamp,
            'svix-signature': svixSignature,
        }) as ResendWebhookPayload;
    } catch (err) {
        console.error('Resend webhook verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const eventType = payload.type;
    const data = payload.data;

    // Only track events we care about
    const trackedEvents = ['email.delivered', 'email.opened', 'email.clicked', 'email.bounced', 'email.complained'];
    if (!trackedEvents.includes(eventType)) {
        return NextResponse.json({ received: true, tracked: false });
    }

    try {
        // Store for each recipient
        const recipients = data.to || [];
        for (const recipient of recipients) {
            await db.insert(emailEvents).values({
                resendEmailId: data.email_id,
                recipientEmail: recipient,
                eventType: eventType.replace('email.', ''), // 'delivered', 'opened', etc.
                metadata: data.click ? JSON.stringify({ url: data.click.url }) : null,
            }).run();
        }

        return NextResponse.json({ received: true, tracked: true });
    } catch (error) {
        console.error('Failed to store email event:', error);
        return NextResponse.json({ error: 'Failed to process event' }, { status: 500 });
    }
}
