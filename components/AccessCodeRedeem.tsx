'use client';

import { useState } from 'react';

export default function AccessCodeRedeem() {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleRedeem = async () => {
        if (!email.trim() || !code.trim()) {
            setStatus('error');
            setMessage('Please enter both your email and access code.');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            const response = await fetch('/api/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
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

    if (status === 'success') {
        return (
            <div className="text-center">
                <div className="inline-block p-4 rounded-lg border border-green-500/30 bg-green-900/20">
                    <p className="text-sm text-green-400">{message}</p>
                </div>
            </div>
        );
    }

    if (!isOpen) {
        return (
            <div className="text-center">
                <button
                    onClick={() => setIsOpen(true)}
                    className="text-slate-500 hover:text-accent-400 text-sm transition"
                >
                    Have an access code? Redeem it here.
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto p-5 rounded-xl border border-white/10 bg-dark-800/80">
            <p className="text-sm font-medium text-gray-300 mb-4">Redeem access code</p>
            <div className="space-y-3">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-3 py-2 rounded-md bg-dark-900 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-accent-500"
                />
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="DAILY-XXXXXX"
                    className="w-full px-3 py-2 rounded-md bg-dark-900 border border-white/10 text-white font-mono text-sm placeholder:text-gray-600 focus:outline-none focus:border-accent-500"
                />
                <button
                    onClick={handleRedeem}
                    disabled={status === 'loading' || !email.trim() || !code.trim()}
                    className="w-full py-2 rounded-md bg-accent-600 hover:bg-accent-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition"
                >
                    {status === 'loading' ? 'Redeeming...' : 'Redeem Code'}
                </button>
            </div>
            {status === 'error' && message && (
                <p className="mt-3 text-sm text-red-400">{message}</p>
            )}
        </div>
    );
}
