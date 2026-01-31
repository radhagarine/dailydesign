'use client';

import { useState } from 'react';

export default function NewsletterSignup() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setStatus('success');
        setEmail('');

        // Reset success message after 3 seconds
        setTimeout(() => setStatus('idle'), 3000);
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="work@company.com"
                    className="flex-1 px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--glass-border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                    disabled={status === 'loading' || status === 'success'}
                />
                <button
                    type="submit"
                    disabled={status === 'loading' || status === 'success'}
                    className={`px-6 py-3 font-semibold rounded-lg transition-all ${status === 'success'
                            ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                            : 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-secondary)]'
                        }`}
                >
                    {status === 'loading' ? 'Joining...' : status === 'success' ? 'Joined!' : 'Subscribe'}
                </button>
            </form>
            <p className="mt-3 text-xs text-[var(--text-tertiary)] text-center sm:text-left">
                Join 15,000+ engineers. One system design case study per week.
            </p>
        </div>
    );
}
