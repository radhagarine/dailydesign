'use client';

import { useState } from 'react';
import Link from 'next/link';
import Timer from './Timer';
import ExpandableSection from './ExpandableSection';
import ComparisonTable from './ComparisonTable';
import SelfAssessmentChecklist from './SelfAssessmentChecklist';
import ProgressTracker from './ProgressTracker';
import ArchitectureDiagram from './ArchitectureDiagram';
import Badge from './Badge';
import MarkdownContent from './MarkdownContent';

interface Answer {
    type: 'bad' | 'good' | 'best';
    title: string;
    content: string;
    analysis: string;
    diagram?: string;
    diagramTitle?: string;
}

interface DesignProblemProps {
    id: string;
    title: string;
    category: string;
    difficulty: 'Senior' | 'Staff' | 'Principal';
    estimatedTime: string;
    summary: string;
    context: string;
    question: string;
    guidingQuestions: string[];
    pitfalls: string[];
    answers: Answer[];
    comparisonRows: {
        aspect: string;
        bad: string;
        good: string;
        best: string;
    }[];
    rubricItems: string[];
    keyTakeaways: string[];
    relatedChallenges?: { title: string; href: string }[];
}

const getBadgeColor = (type: 'bad' | 'good' | 'best') => {
    switch (type) {
        case 'bad': return 'border-red-900/30 bg-red-900/20';
        case 'good': return 'border-blue-900/30 bg-blue-900/20';
        case 'best': return 'border-green-900/30 bg-green-900/20';
    }
};

const getHeaderColor = (type: 'bad' | 'good' | 'best') => {
    switch (type) {
        case 'bad': return 'bg-red-900/20 border-red-900/30 text-red-400';
        case 'good': return 'bg-blue-900/20 border-blue-900/30 text-blue-400';
        case 'best': return 'bg-green-900/20 border-green-900/30 text-green-400';
    }
};

export default function DesignProblem(props: DesignProblemProps) {
    const [showAnswers, setShowAnswers] = useState(false);

    return (
        <div className="min-h-screen bg-dark-900 text-white pb-20">
            {/* Header */}
            <div className="bg-dark-800/80 border-b border-white/5 sticky top-0 z-10 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-maroon-400 hover:text-maroon-300 transition">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Back to Hub
                    </Link>
                    <div className="flex gap-4 items-center text-sm">
                        <span className="text-maroon-400">{props.category}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                        <span className="text-gray-400">{props.estimatedTime}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                        <Badge type="neutral">{props.difficulty}</Badge>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Title Section */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold mb-4">{props.title}</h1>
                    <p className="text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
                        {props.summary}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Problem Context */}
                        <div className="bg-dark-800 border border-white/10 rounded-xl p-8">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-maroon-500">00</span> The Challenge
                            </h2>
                            <MarkdownContent content={props.context} className="mb-6" />

                            <div className="bg-maroon-900/20 border border-maroon-900/40 rounded-lg p-6">
                                <h3 className="text-lg font-bold text-maroon-400 mb-2">Your Task</h3>
                                <p className="text-lg text-white">{props.question}</p>
                            </div>
                        </div>

                        {/* Step-by-Step Framework */}
                        <ProgressTracker />

                        {/* Guiding Questions */}
                        <ExpandableSection title="Guiding Questions" defaultExpanded={true}>
                            <ul className="space-y-3">
                                {props.guidingQuestions.map((q, i) => (
                                    <li key={i} className="flex gap-3 text-gray-300">
                                        <span className="text-maroon-500 font-bold">?</span>
                                        <span>{q}</span>
                                    </li>
                                ))}
                            </ul>
                        </ExpandableSection>

                        {/* Common Pitfalls */}
                        <div className="bg-dark-800 border border-red-900/30 rounded-xl p-6">
                            <h3 className="text-red-400 font-bold mb-4 flex items-center gap-2">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Common Pitfalls to Avoid
                            </h3>
                            <ul className="space-y-2">
                                {props.pitfalls.map((pitfall, i) => (
                                    <li key={i} className="flex gap-2 text-gray-300">
                                        <span className="text-red-500">•</span>
                                        {pitfall}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Timer & Active Practice */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold">Your Turn</h2>
                            <p className="text-gray-400">
                                Before revealing the answers, take 30 minutes to sketch your own solution.
                                Principal engineers don&apos;t just read—they solve.
                            </p>
                            <Timer scenarioId={props.id} />

                            {!showAnswers ? (
                                <button
                                    onClick={() => setShowAnswers(true)}
                                    className="w-full py-4 mt-4 bg-dark-800 border border-white/10 rounded-xl hover:border-maroon-900/50 transition-all font-semibold flex flex-col items-center gap-2 group"
                                >
                                    <span className="text-gray-300">Ready to compare your solution?</span>
                                    <span className="text-maroon-400 group-hover:text-maroon-300">Reveal Answers & Analysis</span>
                                </button>
                            ) : (
                                <div className="space-y-12 mt-12">
                                    <h2 className="text-3xl font-bold text-center">Solution Analysis</h2>

                                    {/* Answers */}
                                    <div className="space-y-8">
                                        {props.answers.map((answer, index) => (
                                            <div key={index} className={`bg-dark-800 border rounded-xl overflow-hidden ${getBadgeColor(answer.type)}`}>
                                                {/* Answer Header */}
                                                <div className={`px-6 py-4 border-b ${getHeaderColor(answer.type)}`}>
                                                    <h4 className="font-bold flex items-center gap-2">
                                                        <span>
                                                            {answer.type === 'bad' && '❌'}
                                                            {answer.type === 'good' && '✓'}
                                                            {answer.type === 'best' && '⭐'}
                                                        </span>
                                                        <span className="text-white">{answer.title}</span>
                                                    </h4>
                                                </div>

                                                <div className="p-6">
                                                    {/* Diagram if present */}
                                                    {answer.diagram && (
                                                        <div className="mb-6">
                                                            <ArchitectureDiagram
                                                                diagram={answer.diagram}
                                                                title={answer.diagramTitle}
                                                            />
                                                        </div>
                                                    )}

                                                    <MarkdownContent content={answer.content} className="mb-6" />

                                                    <div className={`rounded-lg p-4 ${
                                                        answer.type === 'bad' ? 'bg-red-900/10 border border-red-900/20' :
                                                        answer.type === 'good' ? 'bg-blue-900/10 border border-blue-900/20' :
                                                        'bg-green-900/10 border border-green-900/20'
                                                    }`}>
                                                        <h4 className={`font-semibold mb-2 ${
                                                            answer.type === 'bad' ? 'text-red-400' :
                                                            answer.type === 'good' ? 'text-blue-400' :
                                                            'text-green-400'
                                                        }`}>
                                                            Analysis
                                                        </h4>
                                                        <MarkdownContent content={answer.analysis} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Comparison Table */}
                                    <ComparisonTable rows={props.comparisonRows} />

                                    {/* Self Assessment */}
                                    <SelfAssessmentChecklist
                                        scenarioId={props.id}
                                        items={props.rubricItems}
                                        title="Self-Evaluation Rubric"
                                    />

                                    {/* Key Takeaways */}
                                    <div className="bg-dark-800 border border-white/10 rounded-xl p-8">
                                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                            <span className="text-maroon-500">📚</span> Key Takeaways
                                        </h3>
                                        <ul className="space-y-4">
                                            {props.keyTakeaways.map((takeaway, i) => (
                                                <li key={i} className="flex gap-4 items-start p-3 rounded-lg hover:bg-white/5 transition-colors">
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-maroon-900/30 text-maroon-400 flex items-center justify-center font-bold text-sm border border-maroon-900/50">
                                                        {i + 1}
                                                    </span>
                                                    <span className="text-gray-300 leading-relaxed">{takeaway}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sticky Sidebar */}
                    <div className="hidden lg:block">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-dark-800 border border-white/10 rounded-xl p-6">
                                <h3 className="font-bold mb-4 text-maroon-400">Progress</h3>
                                <div className="space-y-2 text-sm text-gray-400">
                                    <div className="flex justify-between">
                                        <span>Problem Analysis</span>
                                        <span className="text-green-500">✓</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Strategy Design</span>
                                        <span className="text-green-500">✓</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Solution Comparison</span>
                                        <span>{showAnswers ? <span className="text-green-500">✓</span> : <span className="text-gray-600">○</span>}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Self-Evaluation</span>
                                        <span className="text-gray-600">○</span>
                                    </div>
                                </div>
                            </div>

                            {props.relatedChallenges && (
                                <div className="bg-dark-800 border border-white/10 rounded-xl p-6">
                                    <h3 className="font-bold mb-4 text-white">Related Challenges</h3>
                                    <ul className="space-y-3">
                                        {props.relatedChallenges.map((challenge, i) => (
                                            <li key={i}>
                                                <Link href={challenge.href} className="text-sm text-gray-400 hover:text-maroon-400 transition-colors flex items-center gap-2">
                                                    <span className="text-maroon-500">→</span>
                                                    {challenge.title}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
