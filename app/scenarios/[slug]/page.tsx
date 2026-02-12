import { cache } from 'react';
import { db } from '@/lib/db';
import { scenarios } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import InterviewScenario from '@/components/InterviewScenario';
import ScenarioTeaser from '@/components/ScenarioTeaser';
import { validateScenarioAccess } from '@/lib/access';
import { getSubscriberFromCookie, isSubscriberPaid } from '@/lib/cookies';
import type { Metadata } from 'next';

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ token?: string }>;
}

// Deduplicate DB query across generateMetadata and page component
const getScenario = cache(async (slug: string) => {
    return db
        .select()
        .from(scenarios)
        .where(eq(scenarios.slug, slug))
        .get();
});

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const scenario = await getScenario(slug);

    if (!scenario) {
        return {
            title: 'Scenario Not Found'
        };
    }

    try {
        const content = JSON.parse(scenario.content);
        return {
            title: `${scenario.title} | DailyDesign`,
            description: content.problem?.statement || content.problem?.context?.substring(0, 160)
        };
    } catch {
        return {
            title: `${scenario.title} | DailyDesign`,
        };
    }
}

export default async function ScenarioPage({ params, searchParams }: PageProps) {
    const { slug } = await params;
    const { token } = await searchParams;

    const scenario = await getScenario(slug);

    if (!scenario) {
        notFound();
    }

    let content;
    try {
        content = JSON.parse(scenario.content);
    } catch {
        console.error(`Corrupted scenario content for slug: ${slug}`);
        notFound();
    }

    // Check access: cookie first, then fallback to ?token= param
    const cookieSubscriber = await getSubscriberFromCookie();
    let subscriber = cookieSubscriber;

    if (!subscriber && token) {
        const accessResult = await validateScenarioAccess(token);
        if (accessResult.valid) {
            subscriber = accessResult.subscriber ?? null;
        }
    }

    // Must be an active subscriber AND paid to see full content
    const isPaid = subscriber ? await isSubscriberPaid(subscriber) : false;

    if (!isPaid) {
        return (
            <ScenarioTeaser
                title={scenario.title}
                metadata={content.metadata}
                problem={content.problem}
                theme={scenario.theme}
                problemType={scenario.problemType}
            />
        );
    }

    return (
        <InterviewScenario
            slug={scenario.slug}
            scenario={content}
            theme={scenario.theme}
            problemType={scenario.problemType}
            focusArea={scenario.focusArea || undefined}
            generatedAt={scenario.generatedAt ? new Date(scenario.generatedAt) : new Date()}
        />
    );
}
