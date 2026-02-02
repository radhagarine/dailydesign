import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscribers, generateUnsubscribeToken } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
        }

        // Check if already subscribed
        const existing = await db
            .select()
            .from(subscribers)
            .where(eq(subscribers.email, email))
            .get();

        if (existing) {
            return NextResponse.json({
                success: true,
                message: 'Already subscribed',
                token: existing.unsubscribeToken,
                isNew: false
            });
        }

        // Create new subscriber with token
        const token = generateUnsubscribeToken();
        await db.insert(subscribers).values({
            email,
            unsubscribeToken: token
        }).run();

        return NextResponse.json({
            success: true,
            token,
            isNew: true
        });
    } catch (error) {
        console.error('Subscription error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
