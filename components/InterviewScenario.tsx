'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Badge from './Badge';
import MarkdownContent from './MarkdownContent';

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

import { getThemeLabel } from '@/lib/utils';

// Answer Card Component with expandable functionality
function AnswerCard({
    response,
    isExpanded,
    onToggle
}: {
    response: FrameworkStepResponse;
    isExpanded: boolean;
    onToggle: () => void;
}) {
    const levelConfig = {
        bad: {
            border: 'border-red-900/40',
            bg: 'bg-red-900/10',
            headerBg: 'bg-red-900/20',
            accent: 'text-red-400',
            badge: 'Weak Signal',
            badgeBg: 'bg-red-900/30 text-red-300'
        },
        good: {
            border: 'border-blue-900/40',
            bg: 'bg-blue-900/10',
            headerBg: 'bg-blue-900/20',
            accent: 'text-blue-400',
            badge: 'Senior Signal',
            badgeBg: 'bg-blue-900/30 text-blue-300'
        },
        best: {
            border: 'border-green-900/40',
            bg: 'bg-green-900/10',
            headerBg: 'bg-green-900/20',
            accent: 'text-green-400',
            badge: 'Principal Signal',
            badgeBg: 'bg-green-900/30 text-green-300'
        }
    };

    const config = levelConfig[response.level];
    const levelLabels = { bad: 'Bad Answer', good: 'Good Answer', best: 'Best Answer' };

    return (
        <div className={`rounded-xl border ${config.border} overflow-hidden transition-all duration-300`}>
            {/* Clickable Header */}
            <button
                onClick={onToggle}
                className={`w-full px-4 py-3 ${config.headerBg} flex items-center justify-between hover:brightness-110 transition`}
            >
                <div className="flex items-center gap-3">
                    <span className="text-lg">{response.icon}</span>
                    <span className="text-white font-medium">{levelLabels[response.level]}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.badgeBg}`}>
                        {config.badge}
                    </span>
                </div>
                <svg
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Expandable Content */}
            <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className={`p-4 ${config.bg}`}>
                    <MarkdownContent content={response.response} className="mb-4" />

                    {/* Analysis Section */}
                    <div className={`rounded-lg p-4 border ${config.border}`}>
                        <h5 className={`${config.accent} font-semibold mb-2 text-sm`}>
                            {response.level === 'bad' ? 'Why this is weak:' :
                             response.level === 'good' ? 'Why this passes senior bar:' :
                             'Why this is principal-level:'}
                        </h5>
                        <p className="text-gray-400 text-sm mb-3">{response.why_this_level}</p>

                        {/* Red Flags (Bad) */}
                        {response.red_flags && response.red_flags.length > 0 && (
                            <div className="mt-3">
                                <h6 className="text-red-400 text-sm font-medium mb-1">Red Flags:</h6>
                                <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                                    {response.red_flags.map((flag, i) => (
                                        <li key={i}>{flag}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Strengths */}
                        {response.strengths && response.strengths.length > 0 && (
                            <div className="mt-3">
                                <h6 className={`${config.accent} text-sm font-medium mb-1`}>Strengths:</h6>
                                <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                                    {response.strengths.map((strength, i) => (
                                        <li key={i}>{strength}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* What's Missing (Good) */}
                        {response.what_is_missing && (
                            <div className="mt-3">
                                <h6 className="text-yellow-400 text-sm font-medium mb-1">What&apos;s missing for principal:</h6>
                                <p className="text-gray-400 text-sm">{response.what_is_missing}</p>
                            </div>
                        )}

                        {/* Principal Engineer Signals */}
                        {response.principal_engineer_signals && response.principal_engineer_signals.length > 0 && (
                            <div className="mt-3">
                                <h6 className="text-green-400 text-sm font-medium mb-1">Principal Engineer Signals:</h6>
                                <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                                    {response.principal_engineer_signals.map((signal, i) => (
                                        <li key={i}>{signal}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Comparison Section with expandable answer cards
function AnswerLevelsSection({
    table,
    showResponses
}: {
    table: ComparisonTable;
    showResponses: boolean;
}) {
    const [expandedLevel, setExpandedLevel] = useState<string | null>(null);

    if (!showResponses) return null;

    const badResponse = table.responses.find(r => r.level === 'bad');
    const goodResponse = table.responses.find(r => r.level === 'good');
    const bestResponse = table.responses.find(r => r.level === 'best');

    return (
        <div className="space-y-3 mt-4">
            {table.interviewer_question && (
                <div className="bg-accent-900/20 border border-accent-900/40 rounded-lg p-4 mb-4">
                    <p className="text-accent-200 font-medium text-sm">Interviewer Question:</p>
                    <p className="text-white mt-1">{table.interviewer_question}</p>
                </div>
            )}

            {/* Answer Level Cards */}
            {badResponse && (
                <AnswerCard
                    response={badResponse}
                    isExpanded={expandedLevel === 'bad'}
                    onToggle={() => setExpandedLevel(expandedLevel === 'bad' ? null : 'bad')}
                />
            )}
            {goodResponse && (
                <AnswerCard
                    response={goodResponse}
                    isExpanded={expandedLevel === 'good'}
                    onToggle={() => setExpandedLevel(expandedLevel === 'good' ? null : 'good')}
                />
            )}
            {bestResponse && (
                <AnswerCard
                    response={bestResponse}
                    isExpanded={expandedLevel === 'best'}
                    onToggle={() => setExpandedLevel(expandedLevel === 'best' ? null : 'best')}
                />
            )}
        </div>
    );
}

// Sidebar Navigation Item
function SidebarNavItem({
    step,
    isActive,
    isCompleted,
    onClick
}: {
    step: FrameworkStep;
    isActive: boolean;
    isCompleted: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-3 rounded-lg transition-all duration-200 group ${
                isActive
                    ? 'bg-accent-900/40 border border-accent-800'
                    : 'hover:bg-dark-700/50 border border-transparent'
            }`}
        >
            <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    isCompleted
                        ? 'bg-green-600 text-white'
                        : isActive
                            ? 'bg-accent-600 text-white'
                            : 'bg-dark-600 text-gray-400 group-hover:bg-dark-500'
                }`}>
                    {isCompleted ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        step.step_number
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate text-sm ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                        {step.step_name}
                    </p>
                    <p className="text-xs text-gray-500">{step.time_allocation}</p>
                </div>
            </div>
        </button>
    );
}

// Mobile Navigation
function MobileNav({
    steps,
    currentStep,
    revealedSteps,
    onStepClick
}: {
    steps: FrameworkStep[];
    currentStep: number;
    revealedSteps: Set<number>;
    onStepClick: (index: number) => void;
}) {
    return (
        <div className="lg:hidden sticky top-16 z-20 bg-dark-900/95 backdrop-blur-lg border-b border-white/5 -mx-4 px-4 py-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {steps.map((step, i) => (
                    <button
                        key={i}
                        onClick={() => onStepClick(i)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-full whitespace-nowrap text-sm transition-all ${
                            currentStep === i
                                ? 'bg-accent-600 text-white'
                                : revealedSteps.has(i)
                                    ? 'bg-green-900/30 text-green-300 border border-green-800'
                                    : 'bg-dark-700 text-gray-400'
                        }`}
                    >
                        {revealedSteps.has(i) ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <span className="w-5 h-5 rounded-full bg-dark-600 flex items-center justify-center text-xs">
                                {step.step_number}
                            </span>
                        )}
                        <span className="hidden sm:inline">{step.step_name}</span>
                        <span className="sm:hidden">Step {step.step_number}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

// Main Step Content Component
function StepContent({
    step,
    stepIndex,
    isRevealed,
    onReveal
}: {
    step: FrameworkStep;
    stepIndex: number;
    isRevealed: boolean;
    onReveal: () => void;
}) {
    return (
        <div className="space-y-6">
            {/* Step Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-white/10">
                <span className="w-10 h-10 flex items-center justify-center bg-accent-900 text-white rounded-full text-lg font-bold">
                    {step.step_number}
                </span>
                <div>
                    <h2 className="text-xl font-bold text-white">{step.step_name}</h2>
                    <p className="text-sm text-gray-400">{step.time_allocation}</p>
                </div>
            </div>

            {/* Description */}
            <p className="text-gray-300 leading-relaxed">{step.description}</p>

            {/* Pause Prompt - Always visible but styled differently based on reveal state */}
            <div className={`bg-accent-900/20 border border-accent-900/40 rounded-lg p-4 transition-all ${isRevealed ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-3">
                    <span className="text-accent-400 text-xl">💭</span>
                    <div className="flex-1">
                        <p className="text-xs text-accent-400 font-medium mb-1 uppercase tracking-wide">Think about this first</p>
                        <p className="text-accent-200 italic">{step.pause_prompt}</p>
                        {!isRevealed && (
                            <button
                                onClick={onReveal}
                                className="mt-4 px-5 py-2.5 bg-accent-600 hover:bg-accent-500 text-white rounded-lg font-medium transition inline-flex items-center gap-2"
                            >
                                <span>Reveal Analysis</span>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Answer Levels */}
            {step.comparison_table && (
                <AnswerLevelsSection table={step.comparison_table} showResponses={isRevealed} />
            )}

            {/* Interviewer Response */}
            {isRevealed && step.interviewer_response && (
                <div className="bg-dark-700/50 rounded-lg p-4 border border-white/5">
                    <h5 className="text-accent-400 font-semibold mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Interviewer Clarifications
                    </h5>
                    <ul className="space-y-2">
                        {step.interviewer_response.clarifications.map((clarification, i) => (
                            <li key={i} className="text-gray-300 text-sm flex gap-2">
                                <span className="text-accent-500">•</span>
                                {clarification}
                            </li>
                        ))}
                    </ul>
                    {step.interviewer_response.additional_context && (
                        <p className="text-gray-400 text-sm mt-3 italic border-t border-white/5 pt-3">
                            {step.interviewer_response.additional_context}
                        </p>
                    )}
                </div>
            )}

            {/* Calculations Breakdown */}
            {isRevealed && step.calculations_breakdown && (
                <div className="bg-dark-700/50 rounded-lg p-4 border border-white/5">
                    <h5 className="text-accent-400 font-semibold mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Calculations Breakdown
                    </h5>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-dark-800 rounded-lg p-3">
                            <h6 className="text-gray-400 text-xs uppercase mb-2 font-medium">Storage</h6>
                            <ul className="text-sm space-y-1">
                                <li className="text-gray-300">Total: <span className="text-white font-mono">{step.calculations_breakdown.storage.total_data}</span></li>
                                <li className="text-gray-300">Working Set: <span className="text-white font-mono">{step.calculations_breakdown.storage.working_set}</span></li>
                                <li className="text-gray-300">Per Region: <span className="text-white font-mono">{step.calculations_breakdown.storage.per_region}</span></li>
                            </ul>
                        </div>
                        <div className="bg-dark-800 rounded-lg p-3">
                            <h6 className="text-gray-400 text-xs uppercase mb-2 font-medium">Throughput</h6>
                            <ul className="text-sm space-y-1">
                                <li className="text-gray-300">Global: <span className="text-white font-mono">{step.calculations_breakdown.throughput.global_qps}</span></li>
                                <li className="text-gray-300">Per Region: <span className="text-white font-mono">{step.calculations_breakdown.throughput.per_region_qps}</span></li>
                                <li className="text-gray-300">Cache Hit: <span className="text-white font-mono">{step.calculations_breakdown.throughput.cache_hit_qps}</span></li>
                                <li className="text-gray-300">Database: <span className="text-white font-mono">{step.calculations_breakdown.throughput.database_qps}</span></li>
                            </ul>
                        </div>
                        <div className="bg-dark-800 rounded-lg p-3">
                            <h6 className="text-gray-400 text-xs uppercase mb-2 font-medium">Bandwidth</h6>
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
                <div className="bg-dark-700/50 rounded-lg p-4 border border-white/5">
                    <h5 className="text-accent-400 font-semibold mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        Architecture Overview
                    </h5>
                    <MarkdownContent content={step.architecture_diagram_description} />
                </div>
            )}

            {/* Component Decisions */}
            {isRevealed && step.component_decisions && step.component_decisions.length > 0 && (
                <div className="space-y-4">
                    <h5 className="text-accent-400 font-semibold flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Component Decisions
                    </h5>
                    {step.component_decisions.map((decision, i) => (
                        <div key={i} className="bg-dark-800/50 rounded-lg p-4 border border-white/5">
                            <h6 className="text-white font-medium mb-3">{decision.component}</h6>
                            <AnswerLevelsSection table={decision.comparison_table} showResponses={true} />
                        </div>
                    ))}
                </div>
            )}

            {/* Other Failure Scenarios */}
            {isRevealed && step.other_failure_scenarios && step.other_failure_scenarios.length > 0 && (
                <div className="bg-dark-700/50 rounded-lg p-4 border border-white/5">
                    <h5 className="text-accent-400 font-semibold mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Additional Failure Scenarios
                    </h5>
                    <div className="space-y-3">
                        {step.other_failure_scenarios.map((scenario, i) => (
                            <div key={i} className="border-l-2 border-yellow-600 pl-4 py-2">
                                <p className="text-white font-medium">{scenario.scenario}</p>
                                <p className="text-red-400 text-sm mt-1">
                                    <span className="font-medium">Impact:</span> {scenario.impact}
                                </p>
                                <p className="text-green-400 text-sm mt-1">
                                    <span className="font-medium">Mitigation:</span> {scenario.mitigation}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Key Takeaways */}
            {isRevealed && step.key_takeaways && step.key_takeaways.length > 0 && (
                <div className="bg-gradient-to-r from-accent-900/20 to-accent-900/5 border border-accent-900/30 rounded-lg p-4">
                    <h5 className="text-accent-400 font-semibold mb-3 flex items-center gap-2">
                        <span className="text-lg">💡</span>
                        Key Takeaways
                    </h5>
                    <ul className="space-y-2">
                        {step.key_takeaways.map((takeaway, i) => (
                            <li key={i} className="flex gap-3 text-gray-300 text-sm">
                                <span className="text-accent-500 font-bold">{i + 1}.</span>
                                <span>{takeaway}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default function InterviewScenario(props: InterviewScenarioProps) {
    const { scenario } = props;
    const [revealedSteps, setRevealedSteps] = useState<Set<number>>(new Set());
    const [currentStep, setCurrentStep] = useState(0);
    const [showSimulation, setShowSimulation] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const stepRefs = useRef<(HTMLElement | null)[]>([]);
    const simulationRef = useRef<HTMLDivElement>(null);
    const summaryRef = useRef<HTMLDivElement>(null);

    const handleRevealStep = (stepIndex: number) => {
        setRevealedSteps(prev => {
            const newSet = new Set(prev);
            newSet.add(stepIndex);
            return newSet;
        });
    };

    const scrollToStep = useCallback((index: number) => {
        setCurrentStep(index);
        stepRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);

    const scrollToSimulation = () => {
        simulationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const scrollToSummary = () => {
        summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // Update current step based on scroll position (throttled with rAF)
    useEffect(() => {
        let rafId = 0;
        const handleScroll = () => {
            if (rafId) return;
            rafId = requestAnimationFrame(() => {
                const scrollPosition = window.scrollY + 200;
                for (let i = stepRefs.current.length - 1; i >= 0; i--) {
                    const ref = stepRefs.current[i];
                    if (ref && ref.offsetTop <= scrollPosition) {
                        setCurrentStep(i);
                        break;
                    }
                }
                rafId = 0;
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, []);

    const allStepsRevealed = scenario.framework_steps.every((_, i) => revealedSteps.has(i));
    const completedCount = revealedSteps.size + (showSimulation ? 1 : 0) + (showSummary ? 1 : 0);
    const totalSections = scenario.framework_steps.length + 2; // steps + simulation + summary

    return (
        <div className="min-h-screen bg-dark-900 text-white">
            {/* Sticky Header */}
            <div className="bg-dark-800/95 border-b border-white/5 sticky top-0 z-30 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
                    <Link href="/archive" className="flex items-center gap-2 text-accent-400 hover:text-accent-300 transition">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        <span className="hidden sm:inline">All Scenarios</span>
                    </Link>

                    <div className="flex-1 mx-4 max-w-md">
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                            <span>{scenario.problem.title}</span>
                            <span>{completedCount}/{totalSections}</span>
                        </div>
                        <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-accent-600 to-accent-500 transition-all duration-500"
                                style={{ width: `${(completedCount / totalSections) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 items-center text-sm">
                        <span className="hidden md:inline text-gray-400">{scenario.metadata.estimated_time_minutes} min</span>
                        <Badge type="neutral">{scenario.metadata.difficulty}</Badge>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <MobileNav
                steps={scenario.framework_steps}
                currentStep={currentStep}
                revealedSteps={revealedSteps}
                onStepClick={scrollToStep}
            />

            <div className="max-w-7xl mx-auto flex">
                {/* Sidebar - Desktop Only */}
                <aside className={`hidden lg:block sticky top-16 h-[calc(100vh-4rem)] transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-72'}`}>
                    <div className="h-full border-r border-white/5 p-4 overflow-y-auto">
                        {/* Collapse Toggle */}
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="w-full flex items-center justify-center p-2 mb-4 rounded-lg hover:bg-dark-700 transition text-gray-400"
                        >
                            <svg
                                className={`w-5 h-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                        </button>

                        {!sidebarCollapsed && (
                            <>
                                {/* Framework Title */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Framework</h3>
                                    <p className="text-xs text-gray-500">{getThemeLabel(props.theme)}</p>
                                </div>

                                {/* Progress Circle */}
                                <div className="flex items-center gap-3 mb-6 p-3 bg-dark-800 rounded-lg">
                                    <div className="relative w-12 h-12">
                                        <svg className="w-12 h-12 -rotate-90">
                                            <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" className="text-dark-600" />
                                            <circle
                                                cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4"
                                                className="text-accent-500"
                                                strokeDasharray={`${(completedCount / totalSections) * 125.6} 125.6`}
                                            />
                                        </svg>
                                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                                            {Math.round((completedCount / totalSections) * 100)}%
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{completedCount} of {totalSections}</p>
                                        <p className="text-xs text-gray-400">sections done</p>
                                    </div>
                                </div>

                                {/* Step Navigation */}
                                <nav className="space-y-2">
                                    {scenario.framework_steps.map((step, i) => (
                                        <SidebarNavItem
                                            key={i}
                                            step={step}
                                            isActive={currentStep === i}
                                            isCompleted={revealedSteps.has(i)}
                                            onClick={() => scrollToStep(i)}
                                        />
                                    ))}

                                    {/* Simulation Nav Item */}
                                    {allStepsRevealed && (
                                        <button
                                            onClick={scrollToSimulation}
                                            className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                                                showSimulation
                                                    ? 'bg-yellow-900/20 border border-yellow-800'
                                                    : 'hover:bg-dark-700/50 border border-transparent'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${
                                                    showSimulation ? 'bg-yellow-600 text-white' : 'bg-dark-600 text-gray-400'
                                                }`}>
                                                    ⚡
                                                </div>
                                                <div>
                                                    <p className={`font-medium text-sm ${showSimulation ? 'text-white' : 'text-gray-300'}`}>
                                                        Curveball
                                                    </p>
                                                    <p className="text-xs text-gray-500">Interview simulation</p>
                                                </div>
                                            </div>
                                        </button>
                                    )}

                                    {/* Summary Nav Item */}
                                    {showSimulation && (
                                        <button
                                            onClick={scrollToSummary}
                                            className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                                                showSummary
                                                    ? 'bg-green-900/20 border border-green-800'
                                                    : 'hover:bg-dark-700/50 border border-transparent'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${
                                                    showSummary ? 'bg-green-600 text-white' : 'bg-dark-600 text-gray-400'
                                                }`}>
                                                    📋
                                                </div>
                                                <div>
                                                    <p className={`font-medium text-sm ${showSummary ? 'text-white' : 'text-gray-300'}`}>
                                                        Summary
                                                    </p>
                                                    <p className="text-xs text-gray-500">Reflection & review</p>
                                                </div>
                                            </div>
                                        </button>
                                    )}
                                </nav>
                            </>
                        )}

                        {/* Collapsed State */}
                        {sidebarCollapsed && (
                            <nav className="space-y-2">
                                {scenario.framework_steps.map((step, i) => (
                                    <button
                                        key={i}
                                        onClick={() => scrollToStep(i)}
                                        className={`w-full p-2 rounded-lg transition-all ${
                                            currentStep === i
                                                ? 'bg-accent-900/40'
                                                : 'hover:bg-dark-700/50'
                                        }`}
                                    >
                                        <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-bold ${
                                            revealedSteps.has(i)
                                                ? 'bg-green-600 text-white'
                                                : currentStep === i
                                                    ? 'bg-accent-600 text-white'
                                                    : 'bg-dark-600 text-gray-400'
                                        }`}>
                                            {revealedSteps.has(i) ? '✓' : step.step_number}
                                        </div>
                                    </button>
                                ))}
                            </nav>
                        )}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 px-4 lg:px-8 py-8">
                    {/* Title Section */}
                    <div className="mb-10">
                        <p className="text-accent-400 text-sm font-mono mb-2">{formatDate(props.generatedAt)}</p>
                        <h1 className="text-3xl lg:text-4xl font-bold mb-4">{scenario.problem.title}</h1>
                        <p className="text-lg text-gray-400 leading-relaxed mb-4">{scenario.problem.statement}</p>

                        {/* Topics */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {scenario.metadata.topics.map((topic, i) => (
                                <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400">
                                    {topic}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Problem Context */}
                    <section className="mb-10">
                        <div className="bg-dark-800 border border-white/10 rounded-xl p-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-accent-900 flex items-center justify-center text-sm font-mono">00</span>
                                The Situation
                            </h2>
                            <MarkdownContent content={scenario.problem.context} className="mb-4" />
                            <div className="bg-accent-900/20 border border-accent-900/40 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <span className="text-accent-400 text-xl">💭</span>
                                    <p className="text-accent-200 italic">{scenario.problem.pause_prompt}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Framework Steps */}
                    {scenario.framework_steps.map((step, i) => (
                        <section
                            key={i}
                            ref={el => { stepRefs.current[i] = el; }}
                            className="mb-10 scroll-mt-24"
                        >
                            <div className="bg-dark-800 border border-white/10 rounded-xl p-6">
                                <StepContent
                                    step={step}
                                    stepIndex={i}
                                    isRevealed={revealedSteps.has(i)}
                                    onReveal={() => handleRevealStep(i)}
                                />
                            </div>

                            {/* Next Step Button */}
                            {revealedSteps.has(i) && i < scenario.framework_steps.length - 1 && (
                                <div className="mt-4 text-center">
                                    <button
                                        onClick={() => scrollToStep(i + 1)}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm text-accent-400 hover:text-accent-300 transition"
                                    >
                                        Continue to Step {i + 2}
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </section>
                    ))}

                    {/* Interview Simulation Section */}
                    {allStepsRevealed && (
                        <section ref={simulationRef} className="mb-10 scroll-mt-24">
                            <div className="bg-dark-800 border border-yellow-900/30 rounded-xl overflow-hidden">
                                <div className="px-6 py-4 bg-yellow-900/20 border-b border-yellow-900/30 flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-full bg-yellow-900 flex items-center justify-center text-xl">⚡</span>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{scenario.interview_simulation.title}</h3>
                                        <p className="text-sm text-yellow-200/70">Interview simulation</p>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <p className="text-gray-300 mb-4">{scenario.interview_simulation.description}</p>

                                    <div className="bg-yellow-900/10 border border-yellow-900/30 rounded-lg p-4 mb-4">
                                        <p className="text-yellow-200 font-medium mb-2">Interviewer asks:</p>
                                        <p className="text-white">{scenario.interview_simulation.scenario.interviewer_question}</p>
                                    </div>

                                    {!showSimulation ? (
                                        <div className="text-center py-4">
                                            <p className="text-gray-400 mb-4 italic">{scenario.interview_simulation.scenario.pause_prompt}</p>
                                            <button
                                                onClick={() => setShowSimulation(true)}
                                                className="px-6 py-3 bg-yellow-700 hover:bg-yellow-600 text-white rounded-lg font-medium transition inline-flex items-center gap-2"
                                            >
                                                Reveal How to Adapt
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <AnswerLevelsSection
                                                table={scenario.interview_simulation.scenario.comparison_table}
                                                showResponses={true}
                                            />
                                            {scenario.interview_simulation.key_takeaways.length > 0 && (
                                                <div className="mt-6 bg-yellow-900/10 border border-yellow-900/20 rounded-lg p-4">
                                                    <h5 className="text-yellow-400 font-semibold mb-3 flex items-center gap-2">
                                                        <span>💡</span>
                                                        Key Takeaways
                                                    </h5>
                                                    <ul className="space-y-2">
                                                        {scenario.interview_simulation.key_takeaways.map((takeaway, i) => (
                                                            <li key={i} className="flex gap-3 text-gray-300 text-sm">
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
                        <section ref={summaryRef} className="mb-10 scroll-mt-24">
                            {!showSummary ? (
                                <div className="text-center py-8">
                                    <button
                                        onClick={() => setShowSummary(true)}
                                        className="px-6 py-3 bg-accent-600 hover:bg-accent-500 text-white rounded-lg font-medium transition inline-flex items-center gap-2"
                                    >
                                        View Summary & Reflection
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Critical Concepts */}
                                    <div className="bg-dark-800 border border-white/10 rounded-xl p-6">
                                        <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                                            <span className="text-2xl">📚</span>
                                            Critical Concepts Covered
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {scenario.summary.critical_concepts_covered.map((concept, i) => (
                                                <span key={i} className="px-3 py-2 bg-accent-900/30 border border-accent-900/50 rounded-lg text-sm text-gray-300">
                                                    {concept}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Patterns Demonstrated */}
                                    <div className="bg-dark-800 border border-white/10 rounded-xl p-6">
                                        <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                                            <span className="text-2xl">🎯</span>
                                            Patterns Demonstrated
                                        </h3>
                                        <ul className="space-y-2">
                                            {scenario.summary.patterns_demonstrated.map((pattern, i) => (
                                                <li key={i} className="flex gap-3 text-gray-300">
                                                    <span className="text-accent-500">•</span>
                                                    {pattern}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* What Made Responses Best */}
                                    <div className="bg-dark-800 border border-green-900/30 rounded-xl p-6">
                                        <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                                            <span className="text-2xl">⭐</span>
                                            What Made Responses Principal-Level
                                        </h3>
                                        <ul className="space-y-2">
                                            {scenario.summary.what_made_responses_best_level.map((reason, i) => (
                                                <li key={i} className="flex gap-3 text-gray-300">
                                                    <span className="text-green-500 font-bold">{i + 1}.</span>
                                                    {reason}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Reflection Prompts */}
                                    <div className="bg-dark-800 border border-white/10 rounded-xl p-6">
                                        <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                                            <span className="text-2xl">🤔</span>
                                            Self-Reflection
                                        </h3>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="text-accent-400 font-semibold mb-3">Self-Assessment Questions</h4>
                                                <ul className="space-y-3">
                                                    {scenario.reflection_prompts.self_assessment.map((question, i) => (
                                                        <li key={i} className="text-gray-300 text-sm bg-dark-700/50 p-3 rounded-lg">
                                                            {question}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <h4 className="text-accent-400 font-semibold mb-3">Practice Suggestions</h4>
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
                            className="text-accent-400 hover:text-accent-300 transition"
                        >
                            Subscribe for Daily Scenarios →
                        </Link>
                    </div>
                </main>
            </div>
        </div>
    );
}
