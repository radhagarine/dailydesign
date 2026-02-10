import { cache } from 'react';
import { db } from '@/lib/db';
import { scenarios } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import InterviewScenario from '@/components/InterviewScenario';
import ScenarioTeaser from '@/components/ScenarioTeaser';
import { validateScenarioAccess } from '@/lib/access';
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

export const revalidate = 3600; // ISR: revalidate every hour

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const scenario = await getScenario(slug);

    if (!scenario) {
        return {
            title: 'Scenario Not Found'
        };
    }

    const content = JSON.parse(scenario.content);

    return {
        title: `${scenario.title} | DailyDesign`,
        description: content.problem?.statement || content.problem?.context?.substring(0, 160)
    };
}

export default async function ScenarioPage({ params, searchParams }: PageProps) {
    const { slug } = await params;
    const { token } = await searchParams;

    const scenario = await getScenario(slug);

    if (!scenario) {
        notFound();
    }

    const content = JSON.parse(scenario.content);

    // Check access: valid token required for full content
    const { valid } = token ? await validateScenarioAccess(token) : { valid: false };

    if (!valid) {
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
