'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface NewsletterSignupProps {
    redirectToOnboarding?: boolean;
    compact?: boolean;
}

export default function NewsletterSignup({ redirectToOnboarding = true, compact = false }: NewsletterSignupProps) {
    const router = useRouter();
    const [refCode, setRefCode] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [showCodeField, setShowCodeField] = useState(false);
    const [redeemStatus, setRedeemStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [redeemMessage, setRedeemMessage] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        if (ref) setRefCode(ref);
    }, []);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleRedeem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !accessCode.trim()) return;

        setRedeemStatus('loading');
        setRedeemMessage('');

        try {
            const res = await fetch('/api/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), code: accessCode.trim() }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to redeem code');
            }

            setRedeemStatus('success');
            setRedeemMessage(data.message || 'Premium access activated!');
            if (redirectToOnboarding) {
                setTimeout(() => router.push('/archive'), 1500);
            }
        } catch (error) {
            setRedeemStatus('error');
            setRedeemMessage(error instanceof Error ? error.message : 'Something went wrong');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        setErrorMessage('');

        try {
            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, ...(refCode ? { ref: refCode } : {}) }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Subscription failed');
            }

            setStatus('success');

            // Redirect to samples for all subscribers (new and existing)
            if (redirectToOnboarding) {
                setTimeout(() => {
                    router.push('/samples/scenario-1');
                }, 1000);
            } else {
                setEmail('');
                setTimeout(() => setStatus('idle'), 3000);
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'Something went wrong');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    if (compact) {
        return (
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 px-3 py-2 bg-theme-panel border border-theme-border rounded-lg text-theme-text placeholder-theme-muted text-sm focus:outline-none focus:border-accent-500 transition-colors"
                    disabled={status === 'loading' || status === 'success'}
                />
                <button
                    type="submit"
                    disabled={status === 'loading' || status === 'success'}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${status === 'success'
                        ? 'bg-emerald-500/20 text-emerald-500'
                        : 'bg-accent-600 text-white hover:bg-accent-500'
                        }`}
                >
                    {status === 'loading' ? '...' : status === 'success' ? '✓' : 'Join'}
                </button>
            </form>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="work@company.com"
                    className="flex-1 px-4 py-3 bg-theme-panel border border-theme-border rounded-lg text-theme-text placeholder-theme-muted focus:outline-none focus:border-accent-500 transition-colors"
                    disabled={status === 'loading' || status === 'success'}
                />
                <button
                    type="submit"
                    disabled={status === 'loading' || status === 'success'}
                    className={`px-6 py-3 font-semibold rounded-lg transition-all ${status === 'success'
                        ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                        : 'bg-accent-600 text-white hover:bg-accent-500'
                        }`}
                >
                    {status === 'loading' ? 'Joining...' : status === 'success' ? 'Redirecting...' : 'Get Started Free'}
                </button>
            </form>
            {status === 'error' && errorMessage && (
                <p className="mt-2 text-xs text-red-400 text-center sm:text-left">
                    {errorMessage}
                </p>
            )}
            <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-theme-muted">
                    First full scenario free. Upgrade anytime.
                </p>
                {!showCodeField && (
                    <button
                        type="button"
                        onClick={() => setShowCodeField(true)}
                        className="text-xs text-accent-500 hover:text-accent-400 transition"
                    >
                        Have an access code?
                    </button>
                )}
            </div>
            {showCodeField && (
                <div className="mt-3">
                    {redeemStatus === 'success' ? (
                        <p className="text-xs text-emerald-400">{redeemMessage}</p>
                    ) : (
                        <form onSubmit={handleRedeem} className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="text"
                                value={accessCode}
                                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                                placeholder="DAILY-XXXXXXXXXXXXXXXX"
                                className="flex-1 px-4 py-2.5 bg-theme-panel border border-theme-border rounded-lg text-theme-text font-mono text-sm placeholder-theme-muted focus:outline-none focus:border-accent-500 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={redeemStatus === 'loading' || !email.trim() || !accessCode.trim()}
                                className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-accent-600 text-white hover:bg-accent-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {redeemStatus === 'loading' ? 'Redeeming...' : 'Redeem'}
                            </button>
                        </form>
                    )}
                    {redeemStatus === 'error' && redeemMessage && (
                        <p className="mt-1.5 text-xs text-red-400">{redeemMessage}</p>
                    )}
                </div>
            )}
        </div>
    );
}
