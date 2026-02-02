import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscribers } from '@/lib/schema';
import { eq } from 'drizzle-orm';

const VALID_YEARS = ['8-12', '12-16', '16-20', '20+'];
const VALID_ROLES = ['backend', 'fullstack', 'infrastructure'];
const VALID_STAGES = ['starting', 'active', 'scheduled'];

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token, yearsExperience, primaryRole, prepStage } = body;

        // Validate token
        if (!token) {
            return NextResponse.json({ error: 'Missing token' }, { status: 400 });
        }

        // Validate preferences
        if (yearsExperience && !VALID_YEARS.includes(yearsExperience)) {
            return NextResponse.json({ error: 'Invalid years of experience' }, { status: 400 });
        }
        if (primaryRole && !VALID_ROLES.includes(primaryRole)) {
            return NextResponse.json({ error: 'Invalid primary role' }, { status: 400 });
        }
        if (prepStage && !VALID_STAGES.includes(prepStage)) {
            return NextResponse.json({ error: 'Invalid prep stage' }, { status: 400 });
        }

        // Find subscriber by token
        const subscriber = await db
            .select()
            .from(subscribers)
            .where(eq(subscribers.unsubscribeToken, token))
            .get();

        if (!subscriber) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
        }

        // Update preferences
        await db
            .update(subscribers)
            .set({
                yearsExperience: yearsExperience || subscriber.yearsExperience,
                primaryRole: primaryRole || subscriber.primaryRole,
                prepStage: prepStage || subscriber.prepStage,
            })
            .where(eq(subscribers.unsubscribeToken, token))
            .run();

        return NextResponse.json({
            success: true,
            message: 'Preferences saved'
        });
    } catch (error) {
        console.error('Preferences error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
