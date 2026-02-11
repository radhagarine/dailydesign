'use client';

import { useState } from 'react';

export default function ManageSubscription() {
    const [isLoading, setIsLoading] = useState(false);
    const [showInput, setShowInput] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !email.includes('@')) {
            setError('Please enter a valid email');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to open portal');
            }

            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
            setIsLoading(false);
        }
    };

    if (!showInput) {
        return (
            <button
                onClick={() => { setShowInput(true); setError(''); }}
                className="text-sm text-gray-500 hover:text-gray-300 underline transition"
            >
                Manage Subscription
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="inline-flex items-center gap-2 flex-wrap">
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="px-3 py-1.5 bg-dark-900 border border-white/10 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-maroon-500 w-52"
                disabled={isLoading}
                autoFocus
            />
            <button
                type="submit"
                disabled={isLoading}
                className="px-3 py-1.5 bg-maroon-600 hover:bg-maroon-500 text-white text-sm rounded font-medium transition disabled:opacity-50"
            >
                {isLoading ? '...' : 'Go'}
            </button>
            <button
                type="button"
                onClick={() => { setShowInput(false); setEmail(''); setError(''); }}
                className="px-2 py-1.5 text-gray-500 hover:text-gray-300 text-sm transition"
            >
                Cancel
            </button>
            {error && <p className="text-red-400 text-xs w-full">{error}</p>}
        </form>
    );
}
