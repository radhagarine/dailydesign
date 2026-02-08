import { NextResponse } from 'next/server';
import { verifyBearerToken } from '@/lib/auth';

export const maxDuration = 300; // 5 min for generating 7 scenarios

export async function GET(req: Request) {
    if (!verifyBearerToken(req.headers.get('authorization'), process.env.CRON_SECRET)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Determine base URL for internal call
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
            || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

        const response = await fetch(`${baseUrl}/api/admin/pre-generate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.CRON_SECRET}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ days: 7 }),
        });

        const result = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Pre-generation failed', details: result },
                { status: response.status }
            );
        }

        return NextResponse.json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error('Weekly pre-generation cron failed:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
