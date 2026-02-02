import { db } from '@/lib/db';
import { scenarios } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import DynamicScenario from '@/components/DynamicScenario';
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

    return {
        title: `${scenario.title} | Principal Engineer Interview Prep`,
        description: scenario.summary || scenario.context.substring(0, 160)
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

    // Parse JSON fields
    const answers = JSON.parse(scenario.answers);
    const keyTakeaways = JSON.parse(scenario.keyTakeaways);

    return (
        <DynamicScenario
            slug={scenario.slug}
            title={scenario.title}
            difficulty={scenario.difficulty || 'Principal'}
            summary={scenario.summary || undefined}
            context={scenario.context}
            question={scenario.question}
            answers={answers}
            keyTakeaways={keyTakeaways}
            theme={scenario.theme}
            problemType={scenario.problemType}
            focusArea={scenario.focusArea || undefined}
            generatedAt={scenario.generatedAt ? new Date(scenario.generatedAt) : new Date()}
        />
    );
}
