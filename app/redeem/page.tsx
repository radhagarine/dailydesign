'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function RedeemContent() {
    const searchParams = useSearchParams();
    const prefillCode = searchParams.get('code') || '';

    const [email, setEmail] = useState('');
    const [code, setCode] = useState(prefillCode.toUpperCase());
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleRedeem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !code.trim()) return;

        setStatus('loading');
        setMessage('');

        try {
            const response = await fetch('/api/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), code: code.trim() }),
            });
            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(data.message || 'Premium access activated!');
            } else {
                setStatus('error');
                setMessage(data.error || 'Failed to redeem code');
            }
        } catch {
            setStatus('error');
            setMessage('Something went wrong. Please try again.');
        }
    };

    const hasPrefilledCode = !!prefillCode;

    return (
        <main className="min-h-screen bg-theme-bg text-theme-text flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <Link href="/" className="text-accent-500 font-semibold text-sm hover:text-accent-400 transition">
                        DailyDesign
                    </Link>
                    <h1 className="text-2xl font-bold mt-4 mb-2">
                        {hasPrefilledCode ? 'Activate Premium Access' : 'Redeem Access Code'}
                    </h1>
                    <p className="text-theme-muted text-sm">
                        {hasPrefilledCode
                            ? 'Enter your email to activate your premium access.'
                            : 'Enter your email and access code to unlock premium content.'}
                    </p>
                </div>

                {status === 'success' ? (
                    <div className="p-6 rounded-lg border border-green-500/30 bg-green-900/20 text-center">
                        <p className="text-green-400 font-medium mb-4">{message}</p>
                        <Link
                            href="/archive"
                            className="inline-block px-6 py-3 rounded-lg bg-accent-600 hover:bg-accent-500 text-white font-semibold transition"
                        >
                            Browse the Archive
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleRedeem} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-theme-body mb-1">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full px-3 py-2 rounded-md bg-theme-bg border border-theme-border text-theme-text text-sm placeholder:text-theme-muted focus:outline-none focus:border-accent-500"
                            />
                        </div>

                        {hasPrefilledCode ? (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-accent-900/20 border border-accent-900/40">
                                <span className="text-xs text-theme-muted">Code:</span>
                                <span className="font-mono text-sm text-accent-400">{code}</span>
                            </div>
                        ) : (
                            <div>
                                <label htmlFor="code" className="block text-sm font-medium text-theme-body mb-1">
                                    Access Code
                                </label>
                                <input
                                    id="code"
                                    type="text"
                                    required
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    placeholder="DAILY-XXXXXXXXXXXXXXXX"
                                    className="w-full px-3 py-2 rounded-md bg-theme-bg border border-theme-border text-theme-text font-mono text-sm placeholder:text-theme-muted focus:outline-none focus:border-accent-500"
                                />
                            </div>
                        )}

                        {status === 'error' && message && (
                            <p className="text-sm text-red-400">{message}</p>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'loading' || !email.trim() || !code.trim()}
                            className="w-full py-3 rounded-lg bg-accent-600 hover:bg-accent-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition"
                        >
                            {status === 'loading' ? 'Activating...' : 'Activate Premium Access'}
                        </button>
                    </form>
                )}

                <div className="text-center mt-6">
                    <Link href="/" className="text-theme-muted hover:text-theme-body text-sm transition">
                        Back to home
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default function RedeemPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-theme-bg text-theme-text flex items-center justify-center">
                <div className="animate-pulse text-center">
                    <div className="h-8 w-48 bg-surface-inset rounded mb-4 mx-auto" />
                    <div className="h-4 w-64 bg-surface-faint rounded mx-auto" />
                </div>
            </main>
        }>
            <RedeemContent />
        </Suspense>
    );
}
