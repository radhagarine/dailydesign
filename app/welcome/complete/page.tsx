import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Setup Complete | Principal Engineer Interview Prep',
    description: 'Your account is ready. Start your interview preparation journey.'
};

export default function CompletePage() {
    return (
        <main className="min-h-screen bg-dark-900 text-white flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* Success Icon */}
                <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-green-900/30 flex items-center justify-center border border-green-900/50">
                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold mb-4">You are all set!</h1>
                <p className="text-gray-400 mb-8">
                    Your preferences have been saved. You will receive your first daily interview scenario in your inbox soon.
                </p>

                {/* What to expect */}
                <div className="bg-dark-800 border border-white/10 rounded-xl p-6 mb-8 text-left">
                    <h2 className="font-semibold mb-4">What to expect:</h2>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li className="flex gap-3">
                            <span className="text-maroon-500">→</span>
                            <span>Daily emails with a new interview scenario</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-maroon-500">→</span>
                            <span>Bad/Good/Best answer analysis to calibrate your thinking</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-maroon-500">→</span>
                            <span>Interviewer rubrics showing what signals to hit</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-maroon-500">→</span>
                            <span>Key takeaways you can apply in real interviews</span>
                        </li>
                    </ul>
                </div>

                {/* CTAs */}
                <div className="space-y-4">
                    <Link
                        href="/samples/scenario-1"
                        className="block w-full py-3 rounded-lg bg-maroon-600 hover:bg-maroon-500 transition text-white font-semibold"
                    >
                        Try Your First Scenario Now
                    </Link>
                    <Link
                        href="/archive"
                        className="block w-full py-3 rounded-lg border border-white/10 hover:bg-white/5 transition font-medium"
                    >
                        Browse All Scenarios
                    </Link>
                </div>

                {/* Tips */}
                <div className="mt-12 pt-8 border-t border-white/5">
                    <p className="text-gray-500 text-sm">
                        <strong className="text-gray-400">Pro tip:</strong> Block 30 minutes each day for focused practice.
                        Consistency beats intensity for interview preparation.
                    </p>
                </div>
            </div>
        </main>
    );
}
