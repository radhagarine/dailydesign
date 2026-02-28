'use client';

import { useState } from 'react';

interface PricingButtonProps {
    plan: 'monthly' | 'annual';
    className?: string;
    children: React.ReactNode;
}

export default function PricingButton({ plan, className = '', children }: PricingButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showEmailInput, setShowEmailInput] = useState(false);
    const [showComingSoon, setShowComingSoon] = useState(false);
    const [email, setEmail] = useState('');
    const [waitlistEmail, setWaitlistEmail] = useState('');
    const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleClick = () => {
        setShowEmailInput(true);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !email.includes('@')) {
            setError('Please enter a valid email');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan, email }),
            });

            const data = await response.json();

            if (response.status === 503) {
                // Payment not configured — show coming soon
                setWaitlistEmail(email);
                setShowEmailInput(false);
                setShowComingSoon(true);
                setIsLoading(false);
                return;
            }

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create checkout');
            }

            // Redirect to Stripe Checkout
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setShowEmailInput(false);
        setShowComingSoon(false);
        setEmail('');
        setWaitlistEmail('');
        setWaitlistSubmitted(false);
        setError('');
    };

    const handleWaitlistSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!waitlistEmail || !waitlistEmail.includes('@')) return;

        try {
            await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: waitlistEmail }),
            });
            setWaitlistSubmitted(true);
        } catch {
            setWaitlistSubmitted(true); // show success anyway — they'll get picked up
        }
    };

    if (showComingSoon) {
        const planLabel = plan === 'annual' ? 'Annual ($180/yr)' : 'Monthly ($20/mo)';
        return (
            <div className="rounded-xl border border-accent-700/30 bg-accent-900/10 p-6 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-accent-900/40 flex items-center justify-center border border-accent-700/30">
                    <svg className="w-6 h-6 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-theme-text">Paid Plans Launching Soon</h3>
                    <p className="text-sm text-theme-muted mt-1">
                        The <strong className="text-theme-body">{planLabel}</strong> plan is coming shortly. We&apos;re finalizing payment integration.
                    </p>
                </div>

                {waitlistSubmitted ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-green-400 py-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        You&apos;re on the list! We&apos;ll notify you at launch.
                    </div>
                ) : (
                    <form onSubmit={handleWaitlistSubmit} className="space-y-3">
                        <input
                            type="email"
                            value={waitlistEmail}
                            onChange={(e) => setWaitlistEmail(e.target.value)}
                            placeholder="Your email"
                            className="w-full px-4 py-2.5 bg-theme-bg border border-theme-border rounded-lg text-theme-text text-sm placeholder-theme-muted focus:outline-none focus:border-accent-500"
                        />
                        <button
                            type="submit"
                            className="w-full py-2.5 rounded-lg bg-accent-600 hover:bg-accent-500 transition text-white font-semibold text-sm"
                        >
                            Notify Me When It Launches
                        </button>
                    </form>
                )}

                <div className="pt-2 border-t border-theme-border-s">
                    <p className="text-xs text-theme-muted mb-2">
                        Meanwhile, free subscribers get daily scenarios in their inbox.
                    </p>
                    <button
                        onClick={handleCancel}
                        className="text-xs text-accent-400 hover:text-accent-300 transition"
                    >
                        &larr; Go back
                    </button>
                </div>
            </div>
        );
    }

    if (showEmailInput) {
        return (
            <div className="space-y-3">
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-lg text-theme-text placeholder-theme-muted focus:outline-none focus:border-accent-500"
                        disabled={isLoading}
                        autoFocus
                    />
                    {error && (
                        <p className="text-red-400 text-sm">{error}</p>
                    )}
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isLoading}
                            className="flex-1 py-3 rounded-lg border border-theme-border hover:bg-surface-inset transition text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`flex-1 py-3 rounded-lg font-semibold transition ${
                                plan === 'annual'
                                    ? 'bg-accent-600 hover:bg-accent-500 text-white'
                                    : 'bg-surface-inset hover:bg-theme-inset'
                            }`}
                        >
                            {isLoading ? 'Loading...' : 'Continue'}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <button
            onClick={handleClick}
            className={className}
        >
            {children}
        </button>
    );
}
