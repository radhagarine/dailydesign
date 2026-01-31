import React from 'react';
import Button from './Button';
import Card from './Card';
import Badge from './Badge';

interface Answer {
    type: 'bad' | 'good' | 'best';
    title: string;
    content: string;
    analysis: string;
}

interface InterviewSimulationProps {
    title: string;
    category: string;
    context: string;
    question: string;
    answers: Answer[];
    rubric: {
        strongSignals: string[];
        redFlags: string[];
        followUpProbes: string[];
    };
    keyTakeaways: string[];
}

export default function InterviewSimulation({
    title,
    category,
    context,
    question,
    answers,
    rubric,
    keyTakeaways
}: InterviewSimulationProps) {
    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="glass-strong border-b border-[var(--glass-border)] sticky top-0 z-10 backdrop-blur-xl">
                <div className="container-custom py-6">
                    <div className="flex items-center justify-between">
                        <Button variant="outline" size="sm" href="/">
                            ← Back to Home
                        </Button>
                        <span className="glass px-4 py-2 rounded-full text-sm font-semibold">
                            {category}
                        </span>
                    </div>
                </div>
            </div>

            <div className="container-custom py-12 max-w-4xl">
                {/* Title */}
                <div className="mb-12 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
                    <p className="text-[var(--text-secondary)] text-lg">
                        Daily Interview Simulation • Principal Engineer Level
                    </p>
                </div>

                {/* Interview Context */}
                <section className="mb-12 animate-slide-up">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                        <span className="text-3xl">🎯</span>
                        Interview Context
                    </h2>
                    <Card>
                        <div className="prose prose-invert max-w-none">
                            <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                                {context}
                            </p>
                        </div>
                    </Card>
                </section>

                {/* Interview Question */}
                <section className="mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                        <span className="text-3xl">❓</span>
                        The Question
                    </h2>
                    <Card className="border-l-4 border-[var(--accent-primary)]">
                        <p className="text-xl font-semibold text-white leading-relaxed">
                            {question}
                        </p>
                    </Card>
                </section>

                {/* Answers */}
                {answers.map((answer, index) => (
                    <section
                        key={answer.type}
                        className="mb-12 animate-slide-up"
                        style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                    >
                        <div className="mb-4">
                            <Badge type={answer.type}>{answer.title}</Badge>
                        </div>
                        <Card className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-3 text-white">Response:</h3>
                                <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                                    {answer.content}
                                </p>
                            </div>
                            <div className="border-t border-[var(--glass-border)] pt-6">
                                <h3 className="text-lg font-semibold mb-3 text-white">
                                    {answer.type === 'bad' ? '⚠️ Why This Fails' :
                                        answer.type === 'good' ? '💡 Why This Works (But Isn\'t Enough)' :
                                            '🌟 Why This Excels'}
                                </h3>
                                <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                                    {answer.analysis}
                                </p>
                            </div>
                        </Card>
                    </section>
                ))}

                {/* Interviewer Rubric */}
                <section className="mb-12 animate-slide-up" style={{ animationDelay: '0.5s' }}>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                        <span className="text-3xl">📋</span>
                        Interviewer Evaluation Rubric
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <h3 className="text-lg font-semibold mb-4 text-emerald-400 flex items-center gap-2">
                                <span>✓</span> Strong Signals
                            </h3>
                            <ul className="space-y-2">
                                {rubric.strongSignals.map((signal, i) => (
                                    <li key={i} className="text-[var(--text-secondary)] flex items-start gap-2">
                                        <span className="text-emerald-500 mt-1">•</span>
                                        <span>{signal}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        <Card>
                            <h3 className="text-lg font-semibold mb-4 text-red-400 flex items-center gap-2">
                                <span>⚠</span> Red Flags
                            </h3>
                            <ul className="space-y-2">
                                {rubric.redFlags.map((flag, i) => (
                                    <li key={i} className="text-[var(--text-secondary)] flex items-start gap-2">
                                        <span className="text-red-500 mt-1">•</span>
                                        <span>{flag}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>

                    <Card className="mt-6">
                        <h3 className="text-lg font-semibold mb-4 text-amber-400 flex items-center gap-2">
                            <span>🔍</span> Follow-Up Probes
                        </h3>
                        <ul className="space-y-2">
                            {rubric.followUpProbes.map((probe, i) => (
                                <li key={i} className="text-[var(--text-secondary)] flex items-start gap-2">
                                    <span className="text-amber-500 mt-1">•</span>
                                    <span>{probe}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </section>

                {/* Key Takeaways */}
                <section className="mb-12 animate-slide-up" style={{ animationDelay: '0.6s' }}>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                        <span className="text-3xl">💎</span>
                        Key Takeaways
                    </h2>
                    <Card className="border-l-4 border-[var(--accent-secondary)]">
                        <ul className="space-y-4">
                            {keyTakeaways.map((takeaway, i) => (
                                <li key={i} className="text-[var(--text-secondary)] flex items-start gap-3">
                                    <span className="text-[var(--accent-secondary)] font-bold mt-1">{i + 1}.</span>
                                    <span className="leading-relaxed">{takeaway}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </section>

                {/* CTA */}
                <section className="text-center py-12">
                    <Card className="border-2 border-[var(--accent-primary)]">
                        <h3 className="text-2xl font-bold mb-4">Want Daily Simulations Like This?</h3>
                        <p className="text-[var(--text-secondary)] mb-6">
                            Get a new principal-level interview scenario every day. Start your 7-day free trial.
                        </p>
                        <Button variant="primary" size="lg" href="/#pricing">
                            Start Free Trial →
                        </Button>
                    </Card>
                </section>
            </div>
        </div>
    );
}
