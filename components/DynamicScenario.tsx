'use client';

import { useState } from 'react';
import Link from 'next/link';
import Badge from './Badge';

interface Answer {
    type: 'bad' | 'good' | 'best';
    title: string;
    content: string;
    analysis: string;
}

interface DynamicScenarioProps {
    slug: string;
    title: string;
    difficulty: string;
    summary?: string;
    context: string;
    question: string;
    answers: Answer[];
    keyTakeaways: string[];
    theme: string;
    problemType: string;
    focusArea?: string;
    generatedAt: Date;
}

const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

import { getThemeLabel } from '@/lib/utils';

export default function DynamicScenario(props: DynamicScenarioProps) {
    const [showAnswers, setShowAnswers] = useState(false);

    const badAnswer = props.answers.find(a => a.type === 'bad');
    const goodAnswer = props.answers.find(a => a.type === 'good');
    const bestAnswer = props.answers.find(a => a.type === 'best');

    return (
        <div className="min-h-screen bg-dark-900 text-white pb-20">
            {/* Header */}
            <div className="bg-dark-800/80 border-b border-white/5 sticky top-0 z-10 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/archive" className="flex items-center gap-2 text-accent-400 hover:text-accent-300 transition">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        All Scenarios
                    </Link>
                    <div className="flex gap-4 items-center text-sm">
                        <span className="text-gray-400">{getThemeLabel(props.theme)}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                        <Badge type="neutral">{props.problemType === 'SYSTEM_DESIGN' ? 'System Design' : 'Tactical'}</Badge>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Title Section */}
                <div className="mb-8">
                    <p className="text-accent-400 text-sm font-mono mb-2">{formatDate(props.generatedAt)}</p>
                    <h1 className="text-4xl font-bold mb-4">{props.title}</h1>
                    {props.summary && (
                        <p className="text-xl text-gray-400 leading-relaxed">{props.summary}</p>
                    )}
                    {props.focusArea && (
                        <div className="mt-4">
                            <span className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400">
                                Focus: {props.focusArea}
                            </span>
                        </div>
                    )}
                </div>

                {/* Context Section */}
                <section className="mb-8">
                    <div className="bg-dark-800 border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="text-accent-500">01</span> The Situation
                        </h2>
                        <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {props.context}
                        </div>
                    </div>
                </section>

                {/* Question Section */}
                <section className="mb-8">
                    <div className="bg-accent-900/20 border border-accent-900/40 rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="text-accent-500">02</span> The Question
                        </h2>
                        <p className="text-lg text-accent-200 font-medium">{props.question}</p>
                    </div>
                </section>

                {/* Think First Prompt */}
                {!showAnswers && (
                    <section className="mb-8 text-center">
                        <div className="bg-dark-800/50 border border-white/5 rounded-xl p-8">
                            <p className="text-gray-400 mb-6">
                                Take 10-15 minutes to think through your answer before viewing the analysis.
                            </p>
                            <button
                                onClick={() => setShowAnswers(true)}
                                className="px-6 py-3 bg-accent-900 hover:bg-accent-800 text-white rounded-lg font-medium transition"
                            >
                                Reveal Analysis
                            </button>
                        </div>
                    </section>
                )}

                {/* Answers Section */}
                {showAnswers && (
                    <div className="space-y-8">
                        {/* Bad Answer */}
                        {badAnswer && (
                            <section>
                                <div className="bg-dark-800 border border-red-900/30 rounded-xl overflow-hidden">
                                    <div className="px-6 py-4 bg-red-900/20 border-b border-red-900/30">
                                        <h2 className="text-lg font-bold flex items-center gap-2">
                                            <span className="text-red-500">❌</span> Bad Answer (Weak Signal)
                                        </h2>
                                    </div>
                                    <div className="p-6">
                                        <div className="text-gray-300 leading-relaxed whitespace-pre-wrap mb-6">
                                            {badAnswer.content}
                                        </div>
                                        <div className="bg-red-900/10 border border-red-900/20 rounded-lg p-4">
                                            <h3 className="text-red-400 font-semibold mb-2">Why interviewers get concerned:</h3>
                                            <p className="text-gray-400 text-sm whitespace-pre-wrap">{badAnswer.analysis}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Good Answer */}
                        {goodAnswer && (
                            <section>
                                <div className="bg-dark-800 border border-blue-900/30 rounded-xl overflow-hidden">
                                    <div className="px-6 py-4 bg-blue-900/20 border-b border-blue-900/30">
                                        <h2 className="text-lg font-bold flex items-center gap-2">
                                            <span className="text-blue-500">✅</span> Good Answer (Senior Signal)
                                        </h2>
                                    </div>
                                    <div className="p-6">
                                        <div className="text-gray-300 leading-relaxed whitespace-pre-wrap mb-6">
                                            {goodAnswer.content}
                                        </div>
                                        <div className="bg-blue-900/10 border border-blue-900/20 rounded-lg p-4">
                                            <h3 className="text-blue-400 font-semibold mb-2">Why this passes senior bar:</h3>
                                            <p className="text-gray-400 text-sm whitespace-pre-wrap">{goodAnswer.analysis}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Best Answer */}
                        {bestAnswer && (
                            <section>
                                <div className="bg-dark-800 border border-green-900/30 rounded-xl overflow-hidden">
                                    <div className="px-6 py-4 bg-green-900/20 border-b border-green-900/30">
                                        <h2 className="text-lg font-bold flex items-center gap-2">
                                            <span className="text-green-500">⭐</span> Best Answer (Principal Signal)
                                        </h2>
                                    </div>
                                    <div className="p-6">
                                        <div className="text-gray-300 leading-relaxed whitespace-pre-wrap mb-6">
                                            {bestAnswer.content}
                                        </div>
                                        <div className="bg-green-900/10 border border-green-900/20 rounded-lg p-4">
                                            <h3 className="text-green-400 font-semibold mb-2">Why this is principal-level:</h3>
                                            <p className="text-gray-400 text-sm whitespace-pre-wrap">{bestAnswer.analysis}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Key Takeaways */}
                        <section>
                            <div className="bg-dark-800 border border-white/10 rounded-xl p-6">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <span className="text-accent-500">💡</span> Key Takeaways
                                </h2>
                                <ul className="space-y-3">
                                    {props.keyTakeaways.map((takeaway, index) => (
                                        <li key={index} className="flex gap-3 text-gray-300">
                                            <span className="text-accent-500 font-bold">{index + 1}.</span>
                                            <span>{takeaway}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>
                    </div>
                )}

                {/* Navigation */}
                <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center">
                    <Link
                        href="/archive"
                        className="text-gray-400 hover:text-white transition flex items-center gap-2"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Back to Archive
                    </Link>
                    <Link
                        href="/"
                        className="text-accent-400 hover:text-accent-300 transition"
                    >
                        Subscribe for Daily Scenarios →
                    </Link>
                </div>
            </main>
        </div>
    );
}
