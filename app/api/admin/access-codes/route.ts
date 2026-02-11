import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { accessCodes, subscribers, generateAccessCode } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { verifyBearerToken } from '@/lib/auth';

function authenticate(request: NextRequest): NextResponse | null {
    if (!verifyBearerToken(request.headers.get('authorization'), process.env.CRON_SECRET)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return null;
}

// POST /api/admin/access-codes — Generate a new access code
// Body: { expiresInDays?: number } (defaults to 30)
export async function POST(request: NextRequest) {
    const authError = authenticate(request);
    if (authError) return authError;

    try {
        const body = await request.json().catch(() => ({}));
        const expiresInDays = body.expiresInDays ?? 30;

        const code = generateAccessCode();
        const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

        await db.insert(accessCodes).values({ code, expiresAt });

        return NextResponse.json({
            success: true,
            code,
            expiresAt: expiresAt.toISOString(),
            expiresInDays,
        });
    } catch (error) {
        console.error('Generate access code error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// GET /api/admin/access-codes — List all codes with status
export async function GET(request: NextRequest) {
    const authError = authenticate(request);
    if (authError) return authError;

    try {
        const codes = await db
            .select({
                id: accessCodes.id,
                code: accessCodes.code,
                expiresAt: accessCodes.expiresAt,
                redeemedBy: accessCodes.redeemedBy,
                redeemedAt: accessCodes.redeemedAt,
                createdAt: accessCodes.createdAt,
            })
            .from(accessCodes)
            .all();

        const now = new Date();
        const enriched = await Promise.all(
            codes.map(async (c) => {
                let status: string;
                let redeemerEmail: string | null = null;

                if (c.redeemedBy) {
                    status = 'redeemed';
                    const sub = await db
                        .select({ email: subscribers.email })
                        .from(subscribers)
                        .where(eq(subscribers.id, c.redeemedBy))
                        .get();
                    redeemerEmail = sub?.email ?? null;
                } else if (c.expiresAt && c.expiresAt < now) {
                    status = 'expired';
                } else {
                    status = 'unused';
                }

                return {
                    ...c,
                    status,
                    redeemerEmail,
                };
            })
        );

        return NextResponse.json({ count: enriched.length, codes: enriched });
    } catch (error) {
        console.error('List access codes error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
