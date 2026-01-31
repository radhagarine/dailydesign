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

interface Answer {
    type: 'bad' | 'good' | 'best';
    title: string;
    content: string;
    analysis: string;
    diagram?: string;
    diagramTitle?: string;
}

interface DesignProblemProps {
    id: string; // unique identifier for localStorage
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

export default function DesignProblem(props: DesignProblemProps) {
    const [showAnswers, setShowAnswers] = useState(false);

    return (
        <div className="min-h-screen pb-20">
            {/* Header / Metadata Bar */}
            <div className="bg-gradient-to-r from-[rgba(0,217,255,0.1)] to-[rgba(124,58,237,0.1)] border-b border-[var(--glass-border)] sticky top-0 z-10 backdrop-blur-xl">
                <div className="container-custom py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-[var(--accent-primary)] hover:opacity-80 transition-opacity">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Back to Hub
                    </Link>
                    <div className="flex gap-4 items-center text-sm font-medium">
                        <span className="text-[var(--accent-secondary)]">{props.category}</span>
                        <span className="w-1 h-1 rounded-full bg-[var(--text-tertiary)]"></span>
                        <span>{props.estimatedTime}</span>
                        <span className="w-1 h-1 rounded-full bg-[var(--text-tertiary)]"></span>
                        <Badge type="neutral">{props.difficulty}</Badge>
                    </div>
                </div>
            </div>

            <main className="container-custom py-8 max-w-4xl">
                <div className="animate-fade-in">
                    <h1 className="text-4xl font-bold mb-4 gradient-text">{props.title}</h1>
                    <p className="text-xl text-[var(--text-secondary)] mb-8 leading-relaxed">
                        {props.summary}
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            {/* Problem Context */}
                            <div className="glass p-8 rounded-2xl">
                                <h2 className="text-2xl font-bold mb-4">The Challenge</h2>
                                <div className="prose prose-invert max-w-none text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
                                    {props.context}
                                </div>

                                <div className="mt-8 p-6 bg-[rgba(124,58,237,0.1)] border border-[var(--accent-tertiary)] rounded-xl">
                                    <h3 className="text-lg font-bold text-[var(--accent-primary)] mb-2">Your Task</h3>
                                    <p className="text-lg font-medium">{props.question}</p>
                                </div>
                            </div>

                            {/* Step-by-Step Framework */}
                            <ProgressTracker />

                            {/* Guiding Questions */}
                            <ExpandableSection title="🤔 Guiding Questions" defaultExpanded={true}>
                                <ul className="space-y-3">
                                    {props.guidingQuestions.map((q, i) => (
                                        <li key={i} className="flex gap-3">
                                            <span className="text-[var(--accent-primary)] font-bold">?</span>
                                            <span>{q}</span>
                                        </li>
                                    ))}
                                </ul>
                            </ExpandableSection>

                            {/* Common Pitfalls */}
                            <div className="p-6 border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.05)] rounded-xl">
                                <h3 className="text-[#ef4444] font-bold mb-4 flex items-center gap-2">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    Common Pitfalls to Avoid
                                </h3>
                                <ul className="space-y-2">
                                    {props.pitfalls.map((pitfall, i) => (
                                        <li key={i} className="flex gap-2 text-[var(--text-secondary)]">
                                            <span className="text-[#ef4444]">•</span>
                                            {pitfall}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Timer & Active Practice */}
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold">Your Turn</h2>
                                <p className="text-[var(--text-secondary)]">
                                    Before acting on the answers, take 30 minutes to sketch your own solution.
                                    Principal engineers don't just read—they solve.
                                </p>
                                <Timer scenarioId={props.id} />

                                {!showAnswers ? (
                                    <button
                                        onClick={() => setShowAnswers(true)}
                                        className="w-full py-4 mt-4 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl hover:bg-[var(--bg-tertiary)] transition-all font-semibold flex flex-col items-center gap-2 group"
                                    >
                                        <span>Ready to compare your solution?</span>
                                        <span className="text-[var(--accent-primary)] group-hover:underline">Reveal Answers & Analysis ↓</span>
                                    </button>
                                ) : (
                                    <div className="space-y-12 animate-fade-in mt-12">
                                        <h2 className="text-3xl font-bold text-center gradient-text">Solution Analysis</h2>

                                        {/* Answers */}
                                        <div className="space-y-12">
                                            {props.answers.map((answer, index) => (
                                                <div key={index} className="relative">
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <Badge type={answer.type}>{answer.title}</Badge>
                                                    </div>

                                                    <div className="glass p-6 rounded-xl border-l-4 border-l-[var(--glass-border)]"
                                                        style={{ borderLeftColor: `var(--status-${answer.type})` }}>

                                                        {/* Diagram if present */}
                                                        {answer.diagram && (
                                                            <div className="mb-6">
                                                                <ArchitectureDiagram
                                                                    diagram={answer.diagram}
                                                                    title={answer.diagramTitle}
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="prose prose-invert max-w-none mb-6 whitespace-pre-wrap">
                                                            {answer.content}
                                                        </div>

                                                        <div className="bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--glass-border)]">
                                                            <h4 className="font-bold mb-2 flex items-center gap-2">
                                                                <span>🧐</span> Analysis
                                                            </h4>
                                                            <p className="text-[var(--text-secondary)] text-sm leading-relaxed whitespace-pre-wrap">
                                                                {answer.analysis}
                                                            </p>
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
                                        <div className="glass p-8 rounded-2xl bg-gradient-to-br from-[var(--bg-secondary)] to-[rgba(124,58,237,0.1)]">
                                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                                <span>🧠</span> Key Takeaways
                                            </h3>
                                            <ul className="space-y-4">
                                                {props.keyTakeaways.map((takeaway, i) => (
                                                    <li key={i} className="flex gap-4 items-start p-3 rounded-lg hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[rgba(16,185,129,0.2)] text-[#10b981] flex items-center justify-center font-bold text-sm">
                                                            {i + 1}
                                                        </span>
                                                        <span className="text-[var(--text-secondary)] leading-relaxed">{takeaway}</span>
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
                                <div className="glass p-6 rounded-xl">
                                    <h3 className="font-bold mb-4 text-[var(--accent-secondary)]">Progress</h3>
                                    <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                                        <div className="flex justify-between">
                                            <span>Problem Analysis</span>
                                            <span>✓</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Strategy Design</span>
                                            <span>✓</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Solution Comparison</span>
                                            <span>{showAnswers ? '✓' : '○'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Self-Evaluation</span>
                                            <span>○</span>
                                        </div>
                                    </div>
                                </div>

                                {props.relatedChallenges && (
                                    <div className="glass p-6 rounded-xl">
                                        <h3 className="font-bold mb-4">Related Challenges</h3>
                                        <ul className="space-y-3">
                                            {props.relatedChallenges.map((challenge, i) => (
                                                <li key={i}>
                                                    <Link href={challenge.href} className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors flex items-center gap-2">
                                                        <span>→</span>
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
                </div>
            </main>
        </div>
    );
}
