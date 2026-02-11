'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ArchiveAccessGate() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Check your inbox! We sent you an access link.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong');
      }
    } catch {
      setStatus('error');
      setMessage('Failed to send. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent-900/20 border border-accent-900/50 flex items-center justify-center">
          <svg className="w-8 h-8 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-3">Subscriber-Only Archive</h1>
        <p className="text-gray-400 mb-8">
          Enter your email to get an access link. If you arrived from an email, your access should be set automatically.
        </p>

        {status === 'success' ? (
          <div className="p-4 rounded-lg border border-green-500/30 bg-green-900/20">
            <p className="text-green-400">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-accent-500 transition"
            />
            <button
              type="submit"
              disabled={status === 'loading' || !email.trim()}
              className="w-full py-3 rounded-lg bg-accent-600 hover:bg-accent-500 disabled:opacity-50 disabled:cursor-not-allowed transition text-white font-semibold"
            >
              {status === 'loading' ? 'Sending...' : 'Send Access Link'}
            </button>
            {status === 'error' && message && (
              <p className="text-red-400 text-sm">{message}</p>
            )}
          </form>
        )}

        <div className="mt-8">
          <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm transition">
            Not a subscriber? Sign up here
          </Link>
        </div>
      </div>
    </div>
  );
}
