'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

type UnsubscribeState = 'loading' | 'success' | 'already' | 'error' | 'invalid';

function UnsubscribeContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [state, setState] = useState<UnsubscribeState>('loading');
    const [email, setEmail] = useState<string>('');

    useEffect(() => {
        if (!token) {
            setState('invalid');
            return;
        }

        const unsubscribe = async () => {
            try {
                const response = await fetch(`/api/unsubscribe?token=${encodeURIComponent(token)}`);
                const data = await response.json();

                if (response.ok) {
                    setEmail(data.email || '');
                    setState(data.message === 'Already unsubscribed' ? 'already' : 'success');
                } else if (response.status === 404) {
                    setState('invalid');
                } else {
                    setState('error');
                }
            } catch {
                setState('error');
            }
        };

        unsubscribe();
    }, [token]);

    return (
        <main className="min-h-screen bg-dark-900 text-white flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {state === 'loading' && (
                    <div className="animate-pulse">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/10" />
                        <div className="h-8 bg-white/10 rounded mb-4" />
                        <div className="h-4 bg-white/5 rounded w-3/4 mx-auto" />
                    </div>
                )}

                {state === 'success' && (
                    <>
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-900/30 flex items-center justify-center border border-green-900/50">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold mb-4">Successfully Unsubscribed</h1>
                        <p className="text-gray-400 mb-2">
                            {email && <span className="text-white font-mono text-sm">{email}</span>}
                        </p>
                        <p className="text-gray-500 mb-8">
                            You will not receive any more daily interview simulations from us.
                        </p>
                        <p className="text-gray-600 text-sm mb-8">
                            Changed your mind? You can always re-subscribe on our homepage.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-maroon-400 hover:text-maroon-300 transition"
                        >
                            <span>Back to homepage</span>
                            <span aria-hidden="true">→</span>
                        </Link>
                    </>
                )}

                {state === 'already' && (
                    <>
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-900/30 flex items-center justify-center border border-blue-900/50">
                            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold mb-4">Already Unsubscribed</h1>
                        <p className="text-gray-400 mb-2">
                            {email && <span className="text-white font-mono text-sm">{email}</span>}
                        </p>
                        <p className="text-gray-500 mb-8">
                            This email was already removed from our mailing list.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-maroon-400 hover:text-maroon-300 transition"
                        >
                            <span>Back to homepage</span>
                            <span aria-hidden="true">→</span>
                        </Link>
                    </>
                )}

                {state === 'invalid' && (
                    <>
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-yellow-900/30 flex items-center justify-center border border-yellow-900/50">
                            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold mb-4">Invalid Unsubscribe Link</h1>
                        <p className="text-gray-500 mb-8">
                            This unsubscribe link is invalid or has expired. If you are having trouble unsubscribing, please contact support.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-maroon-400 hover:text-maroon-300 transition"
                        >
                            <span>Back to homepage</span>
                            <span aria-hidden="true">→</span>
                        </Link>
                    </>
                )}

                {state === 'error' && (
                    <>
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-900/30 flex items-center justify-center border border-red-900/50">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold mb-4">Something Went Wrong</h1>
                        <p className="text-gray-500 mb-8">
                            We could not process your unsubscribe request. Please try again later or contact support.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-maroon-400 hover:text-maroon-300 transition"
                        >
                            <span>Back to homepage</span>
                            <span aria-hidden="true">→</span>
                        </Link>
                    </>
                )}
            </div>
        </main>
    );
}

function LoadingFallback() {
    return (
        <main className="min-h-screen bg-dark-900 text-white flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center animate-pulse">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/10" />
                <div className="h-8 bg-white/10 rounded mb-4" />
                <div className="h-4 bg-white/5 rounded w-3/4 mx-auto" />
            </div>
        </main>
    );
}

export default function UnsubscribePage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <UnsubscribeContent />
        </Suspense>
    );
}
