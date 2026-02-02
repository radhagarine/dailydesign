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
    const [email, setEmail] = useState('');
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
        setEmail('');
        setError('');
    };

    if (showEmailInput) {
        return (
            <div className="space-y-3">
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-maroon-500"
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
                            className="flex-1 py-3 rounded-lg border border-white/10 hover:bg-white/5 transition text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`flex-1 py-3 rounded-lg font-semibold transition ${
                                plan === 'annual'
                                    ? 'bg-maroon-600 hover:bg-maroon-500 text-white'
                                    : 'bg-white/10 hover:bg-white/20'
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
