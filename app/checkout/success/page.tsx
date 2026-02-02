'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        if (sessionId) {
            // In a production app, you might verify the session with the backend
            setStatus('success');
        } else {
            setStatus('error');
        }
    }, [sessionId]);

    if (status === 'loading') {
        return (
            <main className="min-h-screen bg-dark-900 text-white flex items-center justify-center">
                <div className="animate-pulse text-center">
                    <div className="h-20 w-20 bg-white/10 rounded-full mb-6 mx-auto" />
                    <div className="h-8 w-48 bg-white/10 rounded mb-4 mx-auto" />
                    <div className="h-4 w-64 bg-white/5 rounded mx-auto" />
                </div>
            </main>
        );
    }

    if (status === 'error') {
        return (
            <main className="min-h-screen bg-dark-900 text-white flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-yellow-900/30 flex items-center justify-center border border-yellow-900/50">
                        <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
                    <p className="text-gray-400 mb-8">
                        We could not verify your payment. If you were charged, please contact support.
                    </p>
                    <Link
                        href="/"
                        className="inline-block px-6 py-3 bg-maroon-600 hover:bg-maroon-500 rounded-lg font-semibold transition"
                    >
                        Return Home
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-dark-900 text-white flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* Success Icon */}
                <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-green-900/30 flex items-center justify-center border border-green-900/50">
                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold mb-4">Welcome to Principal Interview Prep!</h1>
                <p className="text-gray-400 mb-8">
                    Your subscription is now active. You will receive your first daily interview scenario in your inbox soon.
                </p>

                {/* What you get */}
                <div className="bg-dark-800 border border-white/10 rounded-xl p-6 mb-8 text-left">
                    <h2 className="font-semibold mb-4">Your subscription includes:</h2>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li className="flex gap-3">
                            <span className="text-green-500">✓</span>
                            <span>Daily interview scenarios at the Principal bar</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-green-500">✓</span>
                            <span>Bad/Good/Best answer analysis</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-green-500">✓</span>
                            <span>Interviewer rubrics and red flags</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-green-500">✓</span>
                            <span>Full archive access to past scenarios</span>
                        </li>
                    </ul>
                </div>

                {/* CTAs */}
                <div className="space-y-4">
                    <Link
                        href="/samples/scenario-1"
                        className="block w-full py-3 rounded-lg bg-maroon-600 hover:bg-maroon-500 transition text-white font-semibold"
                    >
                        Start Your First Scenario
                    </Link>
                    <Link
                        href="/archive"
                        className="block w-full py-3 rounded-lg border border-white/10 hover:bg-white/5 transition font-medium"
                    >
                        Browse the Archive
                    </Link>
                </div>

                {/* Receipt info */}
                <p className="mt-8 text-gray-600 text-sm">
                    A receipt has been sent to your email address.
                </p>
            </div>
        </main>
    );
}

function LoadingFallback() {
    return (
        <main className="min-h-screen bg-dark-900 text-white flex items-center justify-center">
            <div className="animate-pulse text-center">
                <div className="h-20 w-20 bg-white/10 rounded-full mb-6 mx-auto" />
                <div className="h-8 w-48 bg-white/10 rounded mb-4 mx-auto" />
            </div>
        </main>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <SuccessContent />
        </Suspense>
    );
}
