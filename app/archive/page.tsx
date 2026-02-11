import { db } from '@/lib/db';
import { scenarios } from '@/lib/schema';
import { desc, sql } from 'drizzle-orm';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Scenario Archive | DailyDesign',
    description: 'Browse all past interview simulation scenarios'
};

const getThemeLabel = (theme: string) => {
    const labels: Record<string, string> = {
        'scale': 'Massive Scale',
        'performance': 'Performance',
        'reliability': 'Reliability',
        'architecture': 'Architecture'
    };
    return labels[theme] || theme;
};

const getThemeColor = (theme: string) => {
    const colors: Record<string, string> = {
        'scale': 'bg-purple-900/30 text-purple-400 border-purple-900/50',
        'performance': 'bg-orange-900/30 text-orange-400 border-orange-900/50',
        'reliability': 'bg-red-900/30 text-red-400 border-red-900/50',
        'architecture': 'bg-blue-900/30 text-blue-400 border-blue-900/50'
    };
    return colors[theme] || 'bg-gray-900/30 text-gray-400 border-gray-900/50';
};

const formatDate = (date: Date | number | null) => {
    if (!date) return '';
    const d = typeof date === 'number' ? new Date(date * 1000) : new Date(date);
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

export const revalidate = 3600; // ISR: revalidate every hour

export default async function ArchivePage() {
    const allScenarios = await db
        .select({
            id: scenarios.id,
            slug: scenarios.slug,
            title: scenarios.title,
            theme: scenarios.theme,
            problemType: scenarios.problemType,
            generatedAt: scenarios.generatedAt,
            summary: sql<string | null>`json_extract(${scenarios.content}, '$.problem.statement')`,
        })
        .from(scenarios)
        .orderBy(desc(scenarios.generatedAt))
        .all();

    return (
        <div className="min-h-screen bg-dark-900 text-white">
            {/* Header */}
            <div className="bg-dark-800/80 border-b border-white/5">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-accent-400 hover:text-accent-300 transition">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Home
                    </Link>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-6 py-12">
                {/* Title */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold mb-4">Scenario Archive</h1>
                    <p className="text-gray-400 text-lg">
                        {allScenarios.length} interview simulations available
                    </p>
                </div>

                {/* Scenarios Grid */}
                {allScenarios.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold mb-2">No scenarios yet</h2>
                        <p className="text-gray-500 mb-6">
                            Subscribe to receive daily interview simulations
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-accent-900 hover:bg-accent-800 text-white rounded-lg font-medium transition"
                        >
                            Get Started
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {allScenarios.map((scenario) => {
                            return (
                                <Link
                                    key={scenario.id}
                                    href={`/scenarios/${scenario.slug}`}
                                    className="group bg-dark-800 border border-white/5 rounded-xl p-6 hover:border-accent-900/50 transition"
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getThemeColor(scenario.theme)}`}>
                                            {getThemeLabel(scenario.theme)}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {scenario.problemType === 'SYSTEM_DESIGN' ? 'Design' : 'Tactical'}
                                        </span>
                                    </div>
                                    <h2 className="text-lg font-semibold mb-2 group-hover:text-accent-400 transition">
                                        {scenario.title}
                                    </h2>
                                    {scenario.summary && (
                                        <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                                            {scenario.summary}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between text-xs text-gray-600">
                                        <span>{formatDate(scenario.generatedAt)}</span>
                                        <span className="group-hover:text-accent-400 transition flex items-center gap-1">
                                            Read
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Sample Scenarios Section */}
                <div className="mt-16 pt-12 border-t border-white/5">
                    <h2 className="text-2xl font-bold mb-6 text-center">Sample Scenarios</h2>
                    <p className="text-gray-400 text-center mb-8">
                        Try these curated examples to see the full interview simulation format
                    </p>
                    <div className="grid gap-6 md:grid-cols-3">
                        <Link
                            href="/samples/scenario-1"
                            className="group bg-dark-800 border border-white/10 rounded-xl p-6 hover:border-accent-900/50 transition"
                        >
                            <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-purple-900/30 text-purple-400 border border-purple-900/50 mb-3">
                                System Design
                            </span>
                            <h3 className="text-lg font-semibold mb-2 group-hover:text-accent-400 transition">
                                Distributed Rate Limiter
                            </h3>
                            <p className="text-gray-500 text-sm">
                                Design a rate limiting system for 5M RPS
                            </p>
                        </Link>
                        <Link
                            href="/samples/scenario-2"
                            className="group bg-dark-800 border border-white/10 rounded-xl p-6 hover:border-accent-900/50 transition"
                        >
                            <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-blue-900/30 text-blue-400 border border-blue-900/50 mb-3">
                                Architecture
                            </span>
                            <h3 className="text-lg font-semibold mb-2 group-hover:text-accent-400 transition">
                                Microservices vs Monolith
                            </h3>
                            <p className="text-gray-500 text-sm">
                                Make the build vs migrate decision
                            </p>
                        </Link>
                        <Link
                            href="/samples/scenario-3"
                            className="group bg-dark-800 border border-white/10 rounded-xl p-6 hover:border-accent-900/50 transition"
                        >
                            <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-red-900/30 text-red-400 border border-red-900/50 mb-3">
                                Tactical
                            </span>
                            <h3 className="text-lg font-semibold mb-2 group-hover:text-accent-400 transition">
                                API Performance Crisis
                            </h3>
                            <p className="text-gray-500 text-sm">
                                Debug latency spikes in production
                            </p>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
