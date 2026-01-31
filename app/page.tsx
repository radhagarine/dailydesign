'use client';

import React from 'react';
import Link from 'next/link';

// Chevron Icons for FAQ
const ChevronDown = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
);

export default function Home() {
    return (
        <main className="min-h-screen bg-dark-900 text-white selection:bg-maroon-900 selection:text-white">

            {/* 1. HERO SECTION */}
            <section className="relative pt-32 pb-20 border-b border-white/5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-maroon-900/20 via-dark-900 to-dark-900">
                <div className="container-wide text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in-up">
                        <div className="w-2 h-2 rounded-full bg-maroon-500 animate-pulse"></div>
                        <span className="text-xs font-mono font-medium tracking-wide text-gray-300">FOR PRINCIPAL ENGINEERS & ARCHITECTS</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up [animation-delay:100ms]">
                        Master System Design <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Without The Fluff.</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg text-gray-400 mb-10 leading-relaxed animate-fade-in-up [animation-delay:200ms]">
                        Stop memorizing diagrams. Learn the operational realities, failure modes, and trade-offs that senior interviewers actually test for.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up [animation-delay:300ms]">
                        <Link href="#pricing" className="btn-primary px-8 py-4 rounded-lg font-semibold text-sm tracking-wide">
                            START SIMULATION
                        </Link>
                        <Link href="#course-content" className="btn-secondary px-8 py-4 rounded-lg font-semibold text-sm tracking-wide">
                            VIEW CURRICULUM
                        </Link>
                    </div>

                    <div className="mt-16 pt-8 border-t border-white/5 max-w-4xl mx-auto flex flex-col items-center">
                        <p className="text-sm text-gray-500 mb-6 font-mono">TRUSTED BY ENGINEERS FROM</p>
                        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale mix-blend-screen">
                            {/* Text logos for social proof - minimal/clean */}
                            <span className="text-xl font-bold font-sans">UBER</span>
                            <span className="text-xl font-bold font-sans">STRIPE</span>
                            <span className="text-xl font-bold font-sans">NETFLIX</span>
                            <span className="text-xl font-bold font-sans">AIRBNB</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. THE PROBLEM (The Gap) */}
            <section className="py-24 bg-dark-900">
                <div className="container-wide">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Why you're failing <br />senior interviews.</h2>
                            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                                Most prep material focuses on "happy path" architecture. But Principal Engineers aren't hired to draw boxes; they're hired to prevent catastrophic failures.
                            </p>

                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-maroon-900/30 flex items-center justify-center flex-shrink-0 text-maroon-500 font-bold border border-maroon-900/50">01</div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Surface Level Answers</h3>
                                        <p className="text-gray-500">Saying "Use a Cache" without discussing eviction policies, thundering herds, or consistency models.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-maroon-900/30 flex items-center justify-center flex-shrink-0 text-maroon-500 font-bold border border-maroon-900/50">02</div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Ignoring "Day 2" Ops</h3>
                                        <p className="text-gray-500">Failing to address observability, deployment strategies, and cost optimization.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-maroon-600/10 blur-3xl rounded-full"></div>
                            <div className="relative bg-dark-800 border border-white/10 rounded-xl p-8 shadow-2xl">
                                <div className="font-mono text-xs text-maroon-500 mb-4">INTERVIEW_FEEDBACK.TXT</div>
                                <div className="space-y-4 font-mono text-sm text-gray-300">
                                    <p>> candidate proposed Kafka but couldn't explain how to handle poison pill messages.</p>
                                    <p>> strong on theory, weak on operational reality.</p>
                                    <p className="text-red-400">> REJECT / LEVEL_DOWN</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. THE SOLUTION (Features) */}
            <section id="course-content" className="py-24 bg-dark-800 border-y border-white/5">
                <div className="container-wide">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">A Different Approach</h2>
                        <p className="text-gray-400">We simulate the messy, ambiguous, and constrained reality of actual engineering leadership.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-xl bg-dark-900 border border-white/5 hover:border-maroon-900/50 transition-colors">
                            <div className="w-10 h-10 bg-maroon-900/20 text-maroon-500 rounded-lg flex items-center justify-center mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Interactive Simulations</h3>
                            <p className="text-gray-500 leading-relaxed">Don't just read. Design systems in real-time with evolving constraints and "Production Incidents".</p>
                        </div>

                        <div className="p-8 rounded-xl bg-dark-900 border border-white/5 hover:border-maroon-900/50 transition-colors">
                            <div className="w-10 h-10 bg-maroon-900/20 text-maroon-500 rounded-lg flex items-center justify-center mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M12 13v-1" /><path d="M12 17v-1" /></svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Deep Dive Case Studies</h3>
                            <p className="text-gray-500 leading-relaxed">Detailed breakdowns of complex systems (Uber, Stripe, Zoom) focusing on the "why", not just the "how".</p>
                        </div>

                        <div className="p-8 rounded-xl bg-dark-900 border border-white/5 hover:border-maroon-900/50 transition-colors">
                            <div className="w-10 h-10 bg-maroon-900/20 text-maroon-500 rounded-lg flex items-center justify-center mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="16" /></svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Career Strategy</h3>
                            <p className="text-gray-500 leading-relaxed">Beyond code. Learn how to lead teams, manage stakeholders, and drive technical strategy.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. PRICING */}
            <section id="pricing" className="py-24 bg-dark-900">
                <div className="container-wide max-w-4xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
                        <p className="text-gray-400">Invest in your career. Most Senior Engineers see a $30k+ raise after promoting.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Monthly */}
                        <div className="p-8 rounded-2xl bg-dark-800 border border-white/5 flex flex-col">
                            <h3 className="text-xl font-bold mb-2">Monthly</h3>
                            <div className="mb-6"><span className="text-4xl font-bold">$20</span><span className="text-gray-500">/mo</span></div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex gap-3 text-gray-300 text-sm"><span className="text-maroon-500">✓</span> Full Access to Simulations</li>
                                <li className="flex gap-3 text-gray-300 text-sm"><span className="text-maroon-500">✓</span> New Case Studies Weekly</li>
                                <li className="flex gap-3 text-gray-300 text-sm"><span className="text-maroon-500">✓</span> Community Discord</li>
                            </ul>
                            <button className="w-full py-3 rounded-lg border border-white/10 hover:bg-white/5 transition font-semibold">Start Monthly</button>
                        </div>

                        {/* Annual */}
                        <div className="p-8 rounded-2xl bg-maroon-900/10 border border-maroon-600/50 flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-maroon-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">BEST VALUE</div>
                            <h3 className="text-xl font-bold mb-2 text-white">Annual</h3>
                            <div className="mb-6"><span className="text-4xl font-bold">$180</span><span className="text-maroon-200 text-sm opacity-80 font-normal ml-1">/year</span></div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex gap-3 text-white text-sm"><span className="text-maroon-400">✓</span> All Monthly Features</li>
                                <li className="flex gap-3 text-white text-sm"><span className="text-maroon-400">✓</span> <strong>3 Months Free</strong></li>
                                <li className="flex gap-3 text-white text-sm"><span className="text-maroon-400">✓</span> Priority Support</li>
                            </ul>
                            <button className="w-full py-3 rounded-lg bg-maroon-600 hover:bg-maroon-500 transition text-white font-semibold shadow-lg shadow-maroon-900/50">Start Annual</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. FAQ */}
            <section className="py-24 bg-dark-800 border-t border-white/5">
                <div className="container-wide max-w-2xl">
                    <h2 className="text-2xl font-bold mb-10 text-center">Frequently Asked Questions</h2>

                    <div className="space-y-4">
                        <details className="group bg-dark-900 rounded-lg p-4 cursor-pointer border border-white/5">
                            <summary className="font-semibold flex justify-between items-center">
                                Is this suitable for Junior Engineers?
                                <span className="transition-transform group-open:rotate-180"><ChevronDown /></span>
                            </summary>
                            <p className="mt-3 text-gray-400 text-sm leading-relaxed">
                                Ideally, no. This material assumes you have 3-5 years of experience and understand basic concepts (Load Balancers, SQL vs NoSQL). We focus on advanced trade-offs.
                            </p>
                        </details>

                        <details className="group bg-dark-900 rounded-lg p-4 cursor-pointer border border-white/5">
                            <summary className="font-semibold flex justify-between items-center">
                                Do you offer refunds?
                                <span className="transition-transform group-open:rotate-180"><ChevronDown /></span>
                            </summary>
                            <p className="mt-3 text-gray-400 text-sm leading-relaxed">
                                Yes. If you're not satisfied within 7 days, we'll refund your subscription. No questions asked.
                            </p>
                        </details>

                        <details className="group bg-dark-900 rounded-lg p-4 cursor-pointer border border-white/5">
                            <summary className="font-semibold flex justify-between items-center">
                                How often is content updated?
                                <span className="transition-transform group-open:rotate-180"><ChevronDown /></span>
                            </summary>
                            <p className="mt-3 text-gray-400 text-sm leading-relaxed">
                                We release one new detailed case study or simulation scenario every week.
                            </p>
                        </details>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-12 bg-dark-900 border-t border-white/5 text-center">
                <div className="container-wide">
                    <div className="text-sm font-semibold mb-4 text-white">PRINCIPAL INTERVIEW PREP</div>
                    <p className="text-gray-500 text-xs mb-8">© 2026. All rights reserved.</p>
                    <div className="flex justify-center gap-6 text-xs text-gray-400">
                        <a href="#" className="hover:text-white transition">Twitter</a>
                        <a href="#" className="hover:text-white transition">LinkedIn</a>
                        <a href="#" className="hover:text-white transition">Terms</a>
                        <a href="#" className="hover:text-white transition">Privacy</a>
                    </div>
                </div>
            </footer>
        </main>
    );
}
