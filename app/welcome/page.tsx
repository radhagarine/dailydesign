'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

type YearsExperience = '8-12' | '12-16' | '16-20' | '20+';
type PrimaryRole = 'backend' | 'fullstack' | 'infrastructure';
type PrepStage = 'starting' | 'active' | 'scheduled';

function WelcomeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';
    const token = searchParams.get('token') || '';

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [preferences, setPreferences] = useState({
        yearsExperience: '' as YearsExperience | '',
        primaryRole: '' as PrimaryRole | '',
        prepStage: '' as PrepStage | '',
    });

    const handleSubmit = async () => {
        if (!preferences.yearsExperience || !preferences.primaryRole || !preferences.prepStage) {
            setError('Please complete all questions');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch('/api/preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    ...preferences
                })
            });

            if (response.ok) {
                router.push('/welcome/complete');
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to save preferences');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const skipOnboarding = () => {
        router.push('/archive');
    };

    return (
        <main className="min-h-screen bg-dark-900 text-white flex items-center justify-center px-4 py-12">
            <div className="max-w-lg w-full">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-900/30 border border-accent-900/50 mb-6">
                        <div className="w-2 h-2 rounded-full bg-accent-500"></div>
                        <span className="text-xs font-mono text-accent-400">QUICK SETUP</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-3">Welcome aboard!</h1>
                    <p className="text-gray-400">
                        {email && <span className="text-white font-mono text-sm">{email}</span>}
                        {email && <br />}
                        Help us personalize your experience with 3 quick questions.
                    </p>
                </div>

                {/* Progress indicator */}
                <div className="flex gap-2 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                                s <= step ? 'bg-accent-500' : 'bg-white/10'
                            }`}
                        />
                    ))}
                </div>

                {/* Step 1: Years of Experience */}
                {step === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold">How many years of experience do you have?</h2>
                        <p className="text-gray-500 text-sm">This helps us calibrate the content depth.</p>
                        <div className="grid gap-3">
                            {[
                                { value: '8-12', label: '8-12 years', desc: 'Senior Engineer level' },
                                { value: '12-16', label: '12-16 years', desc: 'Staff Engineer level' },
                                { value: '16-20', label: '16-20 years', desc: 'Principal Engineer level' },
                                { value: '20+', label: '20+ years', desc: 'Distinguished/Fellow level' },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        setPreferences({ ...preferences, yearsExperience: option.value as YearsExperience });
                                        setStep(2);
                                    }}
                                    className={`p-4 rounded-lg border text-left transition-all ${
                                        preferences.yearsExperience === option.value
                                            ? 'border-accent-500 bg-accent-900/20'
                                            : 'border-white/10 hover:border-white/30 bg-dark-800'
                                    }`}
                                >
                                    <div className="font-medium">{option.label}</div>
                                    <div className="text-gray-500 text-sm">{option.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Primary Role */}
                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold">What is your primary focus area?</h2>
                        <p className="text-gray-500 text-sm">This helps us prioritize relevant scenarios.</p>
                        <div className="grid gap-3">
                            {[
                                { value: 'backend', label: 'Backend Engineering', desc: 'APIs, services, databases, distributed systems' },
                                { value: 'fullstack', label: 'Full-Stack Engineering', desc: 'End-to-end product development' },
                                { value: 'infrastructure', label: 'Infrastructure/Platform', desc: 'Reliability, scaling, DevOps, SRE' },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        setPreferences({ ...preferences, primaryRole: option.value as PrimaryRole });
                                        setStep(3);
                                    }}
                                    className={`p-4 rounded-lg border text-left transition-all ${
                                        preferences.primaryRole === option.value
                                            ? 'border-accent-500 bg-accent-900/20'
                                            : 'border-white/10 hover:border-white/30 bg-dark-800'
                                    }`}
                                >
                                    <div className="font-medium">{option.label}</div>
                                    <div className="text-gray-500 text-sm">{option.desc}</div>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setStep(1)}
                            className="text-gray-500 hover:text-white text-sm transition"
                        >
                            ← Back
                        </button>
                    </div>
                )}

                {/* Step 3: Prep Stage */}
                {step === 3 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold">What is your interview prep status?</h2>
                        <p className="text-gray-500 text-sm">This helps us understand your urgency level.</p>
                        <div className="grid gap-3">
                            {[
                                { value: 'starting', label: 'Just Starting', desc: 'Beginning to think about interview prep' },
                                { value: 'active', label: 'Actively Preparing', desc: 'Currently studying and practicing' },
                                { value: 'scheduled', label: 'Interviews Scheduled', desc: 'Have upcoming interviews lined up' },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        setPreferences({ ...preferences, prepStage: option.value as PrepStage });
                                    }}
                                    className={`p-4 rounded-lg border text-left transition-all ${
                                        preferences.prepStage === option.value
                                            ? 'border-accent-500 bg-accent-900/20'
                                            : 'border-white/10 hover:border-white/30 bg-dark-800'
                                    }`}
                                >
                                    <div className="font-medium">{option.label}</div>
                                    <div className="text-gray-500 text-sm">{option.desc}</div>
                                </button>
                            ))}
                        </div>

                        {error && (
                            <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep(2)}
                                className="text-gray-500 hover:text-white text-sm transition"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !preferences.prepStage}
                                className="flex-1 py-3 rounded-lg bg-accent-600 hover:bg-accent-500 disabled:opacity-50 disabled:cursor-not-allowed transition text-white font-semibold"
                            >
                                {isSubmitting ? 'Saving...' : 'Complete Setup'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Skip option */}
                <div className="text-center mt-8">
                    <button
                        onClick={skipOnboarding}
                        className="text-gray-600 hover:text-gray-400 text-sm transition"
                    >
                        Skip for now →
                    </button>
                </div>
            </div>
        </main>
    );
}

function LoadingFallback() {
    return (
        <main className="min-h-screen bg-dark-900 text-white flex items-center justify-center">
            <div className="animate-pulse text-center">
                <div className="h-8 w-48 bg-white/10 rounded mb-4 mx-auto" />
                <div className="h-4 w-64 bg-white/5 rounded mx-auto" />
            </div>
        </main>
    );
}

export default function WelcomePage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <WelcomeContent />
        </Suspense>
    );
}
