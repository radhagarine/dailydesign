import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scenarios, generateScenarioSlug } from '@/lib/schema';
import { generateDailyScenario } from '@/lib/ai';
import { getDailyStrategy } from '@/lib/content-strategy';
import { and, gte, lte } from 'drizzle-orm';

export const maxDuration = 300; // 5 min for generating multiple scenarios

function startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
}

function endOfDay(date: Date): Date {
    const d = new Date(date);
    d.setUTCHours(23, 59, 59, 999);
    return d;
}

function addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() + days);
    return d;
}

// POST: Generate scenarios for upcoming days
export async function POST(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const days = Math.min(body.days || 7, 14); // Cap at 14 days
        const startDate = body.startDate ? new Date(body.startDate) : new Date();
        const force = body.force || false;

        const results: Array<{ date: string; status: string; title?: string; slug?: string; error?: string }> = [];

        for (let i = 0; i < days; i++) {
            const targetDate = addDays(startDate, i);
            const dateStr = targetDate.toISOString().split('T')[0];
            const dayStart = startOfDay(targetDate);
            const dayEnd = endOfDay(targetDate);

            // Check if scenario already exists for this date
            if (!force) {
                const existing = await db.select({ id: scenarios.id })
                    .from(scenarios)
                    .where(and(
                        gte(scenarios.scheduledFor, dayStart),
                        lte(scenarios.scheduledFor, dayEnd),
                    ))
                    .get();

                if (existing) {
                    results.push({ date: dateStr, status: 'skipped', title: 'Already exists' });
                    continue;
                }
            }

            try {
                const strategy = getDailyStrategy(targetDate);
                const scenario = await generateDailyScenario(strategy, targetDate);
                const slug = generateScenarioSlug(scenario.problem.title, targetDate);

                await db.insert(scenarios).values({
                    slug,
                    title: scenario.problem.title,
                    content: JSON.stringify(scenario),
                    theme: strategy.theme.id,
                    problemType: strategy.problemType,
                    focusArea: strategy.focusArea,
                    scheduledFor: dayStart,
                    scenarioStatus: 'pending',
                }).run();

                results.push({ date: dateStr, status: 'generated', title: scenario.problem.title, slug });
            } catch (err) {
                results.push({ date: dateStr, status: 'error', error: String(err) });
            }

            // 1s delay between requests to avoid rate limiting
            if (i < days - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        const generated = results.filter(r => r.status === 'generated').length;
        const skipped = results.filter(r => r.status === 'skipped').length;
        const errors = results.filter(r => r.status === 'error').length;

        return NextResponse.json({
            success: true,
            summary: { generated, skipped, errors, total: days },
            results,
        });
    } catch (error) {
        console.error('Pre-generation failed:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
    }
}

// GET: Check status of upcoming pre-generated scenarios
export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    const upcoming: Array<{ date: string; hasScenario: boolean; title?: string; status?: string }> = [];

    for (let i = 0; i < 7; i++) {
        const targetDate = addDays(today, i);
        const dateStr = targetDate.toISOString().split('T')[0];
        const dayStart = startOfDay(targetDate);
        const dayEnd = endOfDay(targetDate);

        const existing = await db.select({
            title: scenarios.title,
            scenarioStatus: scenarios.scenarioStatus,
        })
            .from(scenarios)
            .where(and(
                gte(scenarios.scheduledFor, dayStart),
                lte(scenarios.scheduledFor, dayEnd),
            ))
            .get();

        upcoming.push({
            date: dateStr,
            hasScenario: !!existing,
            title: existing?.title,
            status: existing?.scenarioStatus ?? undefined,
        });
    }

    const ready = upcoming.filter(d => d.hasScenario).length;

    return NextResponse.json({
        upcoming,
        summary: { ready, missing: 7 - ready },
    });
}
