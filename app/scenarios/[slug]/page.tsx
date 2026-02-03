import { db } from '@/lib/db';
import { scenarios } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import InterviewScenario from '@/components/InterviewScenario';
import type { Metadata } from 'next';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const scenario = await db
        .select()
        .from(scenarios)
        .where(eq(scenarios.slug, slug))
        .get();

    if (!scenario) {
        return {
            title: 'Scenario Not Found'
        };
    }

    const content = JSON.parse(scenario.content);

    return {
        title: `${scenario.title} | Principal Engineer Interview Prep`,
        description: content.problem?.statement || content.problem?.context?.substring(0, 160)
    };
}

export default async function ScenarioPage({ params }: PageProps) {
    const { slug } = await params;

    const scenario = await db
        .select()
        .from(scenarios)
        .where(eq(scenarios.slug, slug))
        .get();

    if (!scenario) {
        notFound();
    }

    const content = JSON.parse(scenario.content);

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
