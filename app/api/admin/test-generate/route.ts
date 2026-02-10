import { NextResponse } from 'next/server';
import { generateDailyScenario } from '@/lib/ai';
import { THEMES, type ProblemType } from '@/lib/content-strategy';
import { verifyBearerToken } from '@/lib/auth';

export const maxDuration = 120;

export async function POST(req: Request) {
    if (!verifyBearerToken(req.headers.get('authorization'), process.env.CRON_SECRET)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { theme: themeId, focusArea, problemType } = body as {
            theme?: string;
            focusArea?: string;
            problemType?: ProblemType;
        };

        // Find theme or default to first
        const theme = (themeId ? THEMES.find(t => t.id === themeId) : THEMES[0]) || THEMES[0];

        // Validate focusArea belongs to theme
        const resolvedFocusArea = focusArea && theme.focusAreas.includes(focusArea)
            ? focusArea
            : theme.focusAreas[0];

        const resolvedProblemType: ProblemType = problemType === 'SYSTEM_DESIGN' || problemType === 'TACTICAL'
            ? problemType
            : 'SYSTEM_DESIGN';

        const strategy = { theme, problemType: resolvedProblemType, focusArea: resolvedFocusArea };

        console.log(`[test-generate] Generating: ${JSON.stringify({ theme: theme.id, focusArea: resolvedFocusArea, problemType: resolvedProblemType })}`);

        const startTime = Date.now();
        const scenario = await generateDailyScenario(strategy);
        const durationMs = Date.now() - startTime;

        const jsonStr = JSON.stringify(scenario);
        const estimatedTokens = Math.ceil(jsonStr.length / 4);

        return NextResponse.json({
            success: true,
            stats: {
                generationTimeMs: durationMs,
                generationTimeSec: Math.round(durationMs / 1000),
                estimatedOutputTokens: estimatedTokens,
                responseBytes: jsonStr.length,
            },
            input: {
                theme: theme.id,
                focusArea: resolvedFocusArea,
                problemType: resolvedProblemType,
            },
            scenario,
        });
    } catch (error) {
        console.error('[test-generate] Generation failed:', error);
        return NextResponse.json(
            { error: 'Generation failed', details: String(error) },
            { status: 500 },
        );
    }
}
