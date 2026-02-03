'use client';

import { useState } from 'react';
import Link from 'next/link';
import Badge from './Badge';
import ReactMarkdown from 'react-markdown';

// Styled markdown component for rendering responses
function MarkdownContent({ content, className = '' }: { content: string; className?: string }) {
    return (
        <div className={`leading-relaxed ${className}`}>
            <ReactMarkdown
                components={{
                    p: ({ children }) => <p className="text-gray-300 mb-3 last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                    em: ({ children }) => <em className="text-gray-200">{children}</em>,
                    ul: ({ children }) => <ul className="list-disc list-outside ml-5 space-y-1 mb-3 text-gray-300">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-outside ml-5 space-y-1 mb-3 text-gray-300">{children}</ol>,
                    li: ({ children }) => <li className="text-gray-300 pl-1">{children}</li>,
                    code: ({ children }) => <code className="bg-dark-700 px-1.5 py-0.5 rounded text-maroon-300 font-mono text-xs">{children}</code>,
                    h1: ({ children }) => <h1 className="text-xl font-bold text-white mb-3 mt-4">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-bold text-white mb-2 mt-4">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-semibold text-white mb-2 mt-3">{children}</h3>,
                    h4: ({ children }) => <h4 className="text-sm font-semibold text-white mb-2 mt-2">{children}</h4>,
                    blockquote: ({ children }) => <blockquote className="border-l-2 border-maroon-500 pl-4 my-3 text-gray-400 italic">{children}</blockquote>,
                    hr: () => <hr className="border-white/10 my-4" />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}

// Types from lib/ai.ts
interface FrameworkStepResponse {
    level: 'bad' | 'good' | 'best';
    icon: string;
    response: string;
    why_this_level: string;
    red_flags?: string[];
    strengths?: string[];
    what_is_missing?: string;
    principal_engineer_signals?: string[];
}

interface ComparisonTable {
    criterion: string;
    interviewer_question?: string;
    responses: FrameworkStepResponse[];
}

interface ComponentDecision {
    component: string;
    comparison_table: ComparisonTable;
}

interface FrameworkStep {
    step_number: number;
    step_name: string;
    time_allocation: string;
    description: string;
    pause_prompt: string;
    comparison_table?: ComparisonTable;
    interviewer_response?: {
        clarifications: string[];
        additional_context: string;
    };
    calculations_breakdown?: {
        storage: { total_data: string; working_set: string; per_region: string };
        throughput: { global_qps: string; per_region_qps: string; cache_hit_qps: string; database_qps: string };
        bandwidth: { peak_bandwidth: string; per_region_bandwidth: string };
    };
    architecture_diagram_description?: string;
    component_decisions?: ComponentDecision[];
    other_failure_scenarios?: Array<{ scenario: string; impact: string; mitigation: string }>;
    key_takeaways: string[];
}

interface InterviewScenarioData {
    metadata: {
        difficulty: string;
        estimated_time_minutes: number;
        topics: string[];
        generated_date: string;
    };
    problem: {
        title: string;
        statement: string;
        context: string;
        pause_prompt: string;
    };
    framework_steps: FrameworkStep[];
    interview_simulation: {
        title: string;
        description: string;
        scenario: {
            interviewer_question: string;
            pause_prompt: string;
            comparison_table: ComparisonTable;
        };
        key_takeaways: string[];
    };
    summary: {
        critical_concepts_covered: string[];
        patterns_demonstrated: string[];
        what_made_responses_best_level: string[];
    };
    reflection_prompts: {
        self_assessment: string[];
        practice_next: string[];
    };
}

interface InterviewScenarioProps {
    slug: string;
    scenario: InterviewScenarioData;
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

const getThemeLabel = (theme: string) => {
    const labels: Record<string, string> = {
        'scale': 'Designing at Massive Scale',
        'performance': 'Performance & Capacity',
        'reliability': 'Reliability & Incidents',
        'architecture': 'Architecture Tradeoffs'
    };
    return labels[theme] || theme;
};

// Component for rendering comparison tables
function ComparisonTableView({ table, showResponses }: { table: ComparisonTable; showResponses: boolean }) {
    if (!showResponses) return null;

    const badResponse = table.responses.find(r => r.level === 'bad');
    const goodResponse = table.responses.find(r => r.level === 'good');
    const bestResponse = table.responses.find(r => r.level === 'best');

    return (
        <div className="space-y-6 mt-6">
            {table.interviewer_question && (
                <div className="bg-maroon-900/20 border border-maroon-900/40 rounded-lg p-4 mb-4">
                    <p className="text-maroon-200 font-medium">{table.interviewer_question}</p>
                </div>
            )}

            {/* Bad Response */}
            {badResponse && (
                <div className="bg-dark-800 border border-red-900/30 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 bg-red-900/20 border-b border-red-900/30">
                        <h4 className="font-bold flex items-center gap-2">
                            <span className="text-red-500">{badResponse.icon}</span>
                            <span className="text-white">Bad Answer (Weak Signal)</span>
                        </h4>
                    </div>
                    <div className="p-6">
                        <MarkdownContent content={badResponse.response} className="mb-4" />
                        <div className="bg-red-900/10 border border-red-900/20 rounded-lg p-4">
                            <h5 className="text-red-400 font-semibold mb-2">Why this is weak:</h5>
                            <p className="text-gray-400 text-sm mb-3">{badResponse.why_this_level}</p>
                            {badResponse.red_flags && badResponse.red_flags.length > 0 && (
                                <div>
                                    <h6 className="text-red-400 text-sm font-medium mb-1">Red Flags:</h6>
                                    <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                                        {badResponse.red_flags.map((flag, i) => (
                                            <li key={i}>{flag}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Good Response */}
            {goodResponse && (
                <div className="bg-dark-800 border border-blue-900/30 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 bg-blue-900/20 border-b border-blue-900/30">
                        <h4 className="font-bold flex items-center gap-2">
                            <span className="text-blue-500">{goodResponse.icon}</span>
                            <span className="text-white">Good Answer (Senior Signal)</span>
                        </h4>
                    </div>
                    <div className="p-6">
                        <MarkdownContent content={goodResponse.response} className="mb-4" />
                        <div className="bg-blue-900/10 border border-blue-900/20 rounded-lg p-4">
                            <h5 className="text-blue-400 font-semibold mb-2">Why this passes senior bar:</h5>
                            <p className="text-gray-400 text-sm mb-3">{goodResponse.why_this_level}</p>
                            {goodResponse.strengths && goodResponse.strengths.length > 0 && (
                                <div className="mb-3">
                                    <h6 className="text-blue-400 text-sm font-medium mb-1">Strengths:</h6>
                                    <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                                        {goodResponse.strengths.map((strength, i) => (
                                            <li key={i}>{strength}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {goodResponse.what_is_missing && (
                                <div>
                                    <h6 className="text-yellow-400 text-sm font-medium mb-1">What&apos;s missing for principal:</h6>
                                    <p className="text-gray-400 text-sm">{goodResponse.what_is_missing}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Best Response */}
            {bestResponse && (
                <div className="bg-dark-800 border border-green-900/30 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 bg-green-900/20 border-b border-green-900/30">
                        <h4 className="font-bold flex items-center gap-2">
                            <span className="text-green-500">{bestResponse.icon}</span>
                            <span className="text-white">Best Answer (Principal Signal)</span>
                        </h4>
                    </div>
                    <div className="p-6">
                        <MarkdownContent content={bestResponse.response} className="mb-4" />
                        <div className="bg-green-900/10 border border-green-900/20 rounded-lg p-4">
                            <h5 className="text-green-400 font-semibold mb-2">Why this is principal-level:</h5>
                            <p className="text-gray-400 text-sm mb-3">{bestResponse.why_this_level}</p>
                            {bestResponse.strengths && bestResponse.strengths.length > 0 && (
                                <div className="mb-3">
                                    <h6 className="text-green-400 text-sm font-medium mb-1">Strengths:</h6>
                                    <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                                        {bestResponse.strengths.map((strength, i) => (
                                            <li key={i}>{strength}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {bestResponse.principal_engineer_signals && bestResponse.principal_engineer_signals.length > 0 && (
                                <div>
                                    <h6 className="text-green-400 text-sm font-medium mb-1">Principal Engineer Signals:</h6>
                                    <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                                        {bestResponse.principal_engineer_signals.map((signal, i) => (
                                            <li key={i}>{signal}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Component for a single framework step
function FrameworkStepView({ step, stepIndex, revealedSteps, onReveal }: {
    step: FrameworkStep;
    stepIndex: number;
    revealedSteps: Set<number>;
    onReveal: (stepIndex: number) => void;
}) {
    const isRevealed = revealedSteps.has(stepIndex);

    return (
        <section className="mb-12">
            <div className="bg-dark-800 border border-white/10 rounded-xl overflow-hidden">
                {/* Step Header */}
                <div className="px-6 py-4 bg-dark-700/50 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="w-8 h-8 flex items-center justify-center bg-maroon-900 text-white rounded-full text-sm font-bold">
                            {step.step_number}
                        </span>
                        <h3 className="text-lg font-bold text-white">{step.step_name}</h3>
                    </div>
                    <span className="text-sm text-gray-400">{step.time_allocation}</span>
                </div>

                <div className="p-6">
                    {/* Description */}
                    <p className="text-gray-300 mb-4">{step.description}</p>

                    {/* Pause Prompt */}
                    {!isRevealed && (
                        <div className="bg-maroon-900/20 border border-maroon-900/40 rounded-lg p-4 mb-4">
                            <p className="text-maroon-200 italic">{step.pause_prompt}</p>
                        </div>
                    )}

                    {/* Reveal Button */}
                    {!isRevealed && (
                        <div className="text-center">
                            <button
                                onClick={() => onReveal(stepIndex)}
                                className="px-6 py-3 bg-maroon-900 hover:bg-maroon-800 text-white rounded-lg font-medium transition"
                            >
                                Reveal Analysis
                            </button>
                        </div>
                    )}

                    {/* Comparison Table */}
                    {step.comparison_table && (
                        <ComparisonTableView table={step.comparison_table} showResponses={isRevealed} />
                    )}

                    {/* Interviewer Response */}
                    {isRevealed && step.interviewer_response && (
                        <div className="mt-6 bg-dark-700/50 rounded-lg p-4">
                            <h5 className="text-maroon-400 font-semibold mb-3">Interviewer Clarifications:</h5>
                            <ul className="space-y-2">
                                {step.interviewer_response.clarifications.map((clarification, i) => (
                                    <li key={i} className="text-gray-300 text-sm flex gap-2">
                                        <span className="text-maroon-500">•</span>
                                        {clarification}
                                    </li>
                                ))}
                            </ul>
                            {step.interviewer_response.additional_context && (
                                <p className="text-gray-400 text-sm mt-3 italic">
                                    {step.interviewer_response.additional_context}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Calculations Breakdown */}
                    {isRevealed && step.calculations_breakdown && (
                        <div className="mt-6 bg-dark-700/50 rounded-lg p-4">
                            <h5 className="text-maroon-400 font-semibold mb-3">Calculations Breakdown</h5>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <h6 className="text-gray-400 text-xs uppercase mb-2">Storage</h6>
                                    <ul className="text-sm space-y-1">
                                        <li className="text-gray-300">Total: <span className="text-white font-mono">{step.calculations_breakdown.storage.total_data}</span></li>
                                        <li className="text-gray-300">Working Set: <span className="text-white font-mono">{step.calculations_breakdown.storage.working_set}</span></li>
                                        <li className="text-gray-300">Per Region: <span className="text-white font-mono">{step.calculations_breakdown.storage.per_region}</span></li>
                                    </ul>
                                </div>
                                <div>
                                    <h6 className="text-gray-400 text-xs uppercase mb-2">Throughput</h6>
                                    <ul className="text-sm space-y-1">
                                        <li className="text-gray-300">Global: <span className="text-white font-mono">{step.calculations_breakdown.throughput.global_qps}</span></li>
                                        <li className="text-gray-300">Per Region: <span className="text-white font-mono">{step.calculations_breakdown.throughput.per_region_qps}</span></li>
                                        <li className="text-gray-300">Cache Hit: <span className="text-white font-mono">{step.calculations_breakdown.throughput.cache_hit_qps}</span></li>
                                        <li className="text-gray-300">Database: <span className="text-white font-mono">{step.calculations_breakdown.throughput.database_qps}</span></li>
                                    </ul>
                                </div>
                                <div>
                                    <h6 className="text-gray-400 text-xs uppercase mb-2">Bandwidth</h6>
                                    <ul className="text-sm space-y-1">
                                        <li className="text-gray-300">Peak: <span className="text-white font-mono">{step.calculations_breakdown.bandwidth.peak_bandwidth}</span></li>
                                        <li className="text-gray-300">Per Region: <span className="text-white font-mono">{step.calculations_breakdown.bandwidth.per_region_bandwidth}</span></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Architecture Diagram Description */}
                    {isRevealed && step.architecture_diagram_description && (
                        <div className="mt-6 bg-dark-700/50 rounded-lg p-4">
                            <h5 className="text-maroon-400 font-semibold mb-3">Architecture Overview</h5>
                            <MarkdownContent content={step.architecture_diagram_description} />
                        </div>
                    )}

                    {/* Component Decisions */}
                    {isRevealed && step.component_decisions && step.component_decisions.length > 0 && (
                        <div className="mt-6">
                            <h5 className="text-maroon-400 font-semibold mb-4">Component Decisions</h5>
                            {step.component_decisions.map((decision, i) => (
                                <div key={i} className="mb-6">
                                    <h6 className="text-white font-medium mb-3">{decision.component}</h6>
                                    <ComparisonTableView table={decision.comparison_table} showResponses={true} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Other Failure Scenarios */}
                    {isRevealed && step.other_failure_scenarios && step.other_failure_scenarios.length > 0 && (
                        <div className="mt-6 bg-dark-700/50 rounded-lg p-4">
                            <h5 className="text-maroon-400 font-semibold mb-3">Additional Failure Scenarios</h5>
                            <div className="space-y-4">
                                {step.other_failure_scenarios.map((scenario, i) => (
                                    <div key={i} className="border-l-2 border-yellow-600 pl-4">
                                        <p className="text-white font-medium">{scenario.scenario}</p>
                                        <p className="text-red-400 text-sm mt-1">Impact: {scenario.impact}</p>
                                        <p className="text-green-400 text-sm mt-1">Mitigation: {scenario.mitigation}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Key Takeaways */}
                    {isRevealed && step.key_takeaways && step.key_takeaways.length > 0 && (
                        <div className="mt-6 bg-maroon-900/10 border border-maroon-900/20 rounded-lg p-4">
                            <h5 className="text-maroon-400 font-semibold mb-2">Key Takeaways</h5>
                            <ul className="space-y-2">
                                {step.key_takeaways.map((takeaway, i) => (
                                    <li key={i} className="flex gap-2 text-gray-300 text-sm">
                                        <span className="text-maroon-500 font-bold">{i + 1}.</span>
                                        {takeaway}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default function InterviewScenario(props: InterviewScenarioProps) {
    const { scenario } = props;
    const [revealedSteps, setRevealedSteps] = useState<Set<number>>(new Set());
    const [showSimulation, setShowSimulation] = useState(false);
    const [showSummary, setShowSummary] = useState(false);

    const handleRevealStep = (stepIndex: number) => {
        setRevealedSteps(prev => {
            const newSet = new Set(Array.from(prev));
            newSet.add(stepIndex);
            return newSet;
        });
    };

    const allStepsRevealed = scenario.framework_steps.every((_, i) => revealedSteps.has(i));

    return (
        <div className="min-h-screen bg-dark-900 text-white pb-20">
            {/* Header */}
            <div className="bg-dark-800/80 border-b border-white/5 sticky top-0 z-10 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/archive" className="flex items-center gap-2 text-maroon-400 hover:text-maroon-300 transition">
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

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Title Section */}
                <div className="mb-8 text-center">
                    <p className="text-maroon-400 text-sm font-mono mb-2">{formatDate(props.generatedAt)}</p>
                    <h1 className="text-4xl font-bold mb-4">{scenario.problem.title}</h1>
                    <p className="text-xl text-gray-400 leading-relaxed mb-4">{scenario.problem.statement}</p>

                    {/* Topics */}
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                        {scenario.metadata.topics.map((topic, i) => (
                            <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400">
                                {topic}
                            </span>
                        ))}
                    </div>

                    {/* Time Estimate */}
                    <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                        </svg>
                        {scenario.metadata.estimated_time_minutes} minutes
                    </div>
                </div>

                {/* Problem Context */}
                <section className="mb-8">
                    <div className="bg-dark-800 border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="text-maroon-500">00</span> The Situation
                        </h2>
                        <MarkdownContent content={scenario.problem.context} className="mb-4" />
                        <div className="bg-maroon-900/20 border border-maroon-900/40 rounded-lg p-4">
                            <p className="text-maroon-200 italic">{scenario.problem.pause_prompt}</p>
                        </div>
                    </div>
                </section>

                {/* Framework Steps Progress */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white">Interview Framework</h2>
                        <span className="text-sm text-gray-400">
                            {revealedSteps.size} / {scenario.framework_steps.length} steps completed
                        </span>
                    </div>
                    <div className="flex gap-2">
                        {scenario.framework_steps.map((step, i) => (
                            <div
                                key={i}
                                className={`flex-1 h-2 rounded-full ${revealedSteps.has(i) ? 'bg-maroon-600' : 'bg-dark-700'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Framework Steps */}
                {scenario.framework_steps.map((step, i) => (
                    <FrameworkStepView
                        key={i}
                        step={step}
                        stepIndex={i}
                        revealedSteps={revealedSteps}
                        onReveal={handleRevealStep}
                    />
                ))}

                {/* Interview Simulation Section */}
                {allStepsRevealed && (
                    <section className="mb-12">
                        <div className="bg-dark-800 border border-yellow-900/30 rounded-xl overflow-hidden">
                            <div className="px-6 py-4 bg-yellow-900/20 border-b border-yellow-900/30">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span className="text-yellow-500">⚡</span>
                                    {scenario.interview_simulation.title}
                                </h3>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-300 mb-4">{scenario.interview_simulation.description}</p>

                                <div className="bg-yellow-900/10 border border-yellow-900/30 rounded-lg p-4 mb-4">
                                    <p className="text-yellow-200 font-medium mb-2">Interviewer asks:</p>
                                    <p className="text-white">{scenario.interview_simulation.scenario.interviewer_question}</p>
                                </div>

                                {!showSimulation ? (
                                    <div className="text-center">
                                        <p className="text-gray-400 mb-4 italic">{scenario.interview_simulation.scenario.pause_prompt}</p>
                                        <button
                                            onClick={() => setShowSimulation(true)}
                                            className="px-6 py-3 bg-yellow-900 hover:bg-yellow-800 text-white rounded-lg font-medium transition"
                                        >
                                            Reveal How to Adapt
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <ComparisonTableView
                                            table={scenario.interview_simulation.scenario.comparison_table}
                                            showResponses={true}
                                        />
                                        {scenario.interview_simulation.key_takeaways.length > 0 && (
                                            <div className="mt-6 bg-yellow-900/10 border border-yellow-900/20 rounded-lg p-4">
                                                <h5 className="text-yellow-400 font-semibold mb-2">Key Takeaways</h5>
                                                <ul className="space-y-2">
                                                    {scenario.interview_simulation.key_takeaways.map((takeaway, i) => (
                                                        <li key={i} className="flex gap-2 text-gray-300 text-sm">
                                                            <span className="text-yellow-500 font-bold">{i + 1}.</span>
                                                            {takeaway}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* Summary Section */}
                {allStepsRevealed && showSimulation && (
                    <section className="mb-12">
                        {!showSummary ? (
                            <div className="text-center py-8">
                                <button
                                    onClick={() => setShowSummary(true)}
                                    className="px-6 py-3 bg-maroon-900 hover:bg-maroon-800 text-white rounded-lg font-medium transition"
                                >
                                    View Summary & Reflection
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Critical Concepts */}
                                <div className="bg-dark-800 border border-white/10 rounded-xl p-6">
                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <span className="text-maroon-500">📚</span> Critical Concepts Covered
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {scenario.summary.critical_concepts_covered.map((concept, i) => (
                                            <span key={i} className="px-3 py-2 bg-maroon-900/30 border border-maroon-900/50 rounded-lg text-sm text-gray-300">
                                                {concept}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Patterns Demonstrated */}
                                <div className="bg-dark-800 border border-white/10 rounded-xl p-6">
                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <span className="text-maroon-500">🎯</span> Patterns Demonstrated
                                    </h3>
                                    <ul className="space-y-2">
                                        {scenario.summary.patterns_demonstrated.map((pattern, i) => (
                                            <li key={i} className="flex gap-2 text-gray-300">
                                                <span className="text-maroon-500">•</span>
                                                {pattern}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* What Made Responses Best */}
                                <div className="bg-dark-800 border border-green-900/30 rounded-xl p-6">
                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <span className="text-green-500">⭐</span> What Made Responses Principal-Level
                                    </h3>
                                    <ul className="space-y-2">
                                        {scenario.summary.what_made_responses_best_level.map((reason, i) => (
                                            <li key={i} className="flex gap-2 text-gray-300">
                                                <span className="text-green-500 font-bold">{i + 1}.</span>
                                                {reason}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Reflection Prompts */}
                                <div className="bg-dark-800 border border-white/10 rounded-xl p-6">
                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <span className="text-maroon-500">🤔</span> Self-Reflection
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-maroon-400 font-semibold mb-3">Self-Assessment Questions</h4>
                                            <ul className="space-y-3">
                                                {scenario.reflection_prompts.self_assessment.map((question, i) => (
                                                    <li key={i} className="text-gray-300 text-sm bg-dark-700/50 p-3 rounded-lg">
                                                        {question}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="text-maroon-400 font-semibold mb-3">Practice Suggestions</h4>
                                            <ul className="space-y-3">
                                                {scenario.reflection_prompts.practice_next.map((suggestion, i) => (
                                                    <li key={i} className="text-gray-300 text-sm bg-dark-700/50 p-3 rounded-lg">
                                                        {suggestion}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
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
                        className="text-maroon-400 hover:text-maroon-300 transition"
                    >
                        Subscribe for Daily Scenarios →
                    </Link>
                </div>
            </main>
        </div>
    );
}
