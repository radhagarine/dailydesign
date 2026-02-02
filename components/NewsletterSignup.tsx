'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface NewsletterSignupProps {
    redirectToOnboarding?: boolean;
    compact?: boolean;
}

export default function NewsletterSignup({ redirectToOnboarding = true, compact = false }: NewsletterSignupProps) {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        setErrorMessage('');

        try {
            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Subscription failed');
            }

            setStatus('success');

            // Redirect to onboarding for new subscribers
            if (redirectToOnboarding && data.isNew && data.token) {
                setTimeout(() => {
                    router.push(`/welcome?email=${encodeURIComponent(email)}&token=${data.token}`);
                }, 500);
            } else if (redirectToOnboarding && !data.isNew) {
                // Already subscribed - show success and redirect to samples
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
                    className="flex-1 px-3 py-2 bg-dark-800 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-maroon-500 transition-colors"
                    disabled={status === 'loading' || status === 'success'}
                />
                <button
                    type="submit"
                    disabled={status === 'loading' || status === 'success'}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${status === 'success'
                        ? 'bg-emerald-500/20 text-emerald-500'
                        : 'bg-maroon-600 text-white hover:bg-maroon-500'
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
                    className="flex-1 px-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-maroon-500 transition-colors"
                    disabled={status === 'loading' || status === 'success'}
                />
                <button
                    type="submit"
                    disabled={status === 'loading' || status === 'success'}
                    className={`px-6 py-3 font-semibold rounded-lg transition-all ${status === 'success'
                        ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                        : 'bg-maroon-600 text-white hover:bg-maroon-500'
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
            <p className="mt-3 text-xs text-gray-500 text-center sm:text-left">
                Free daily scenarios.
            </p>
        </div>
    );
}
