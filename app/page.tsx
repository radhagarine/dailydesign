import Link from 'next/link';
import NewsletterSignup from '@/components/NewsletterSignup';
import PricingButton from '@/components/PricingButton';

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
                        <span className="text-xs font-mono font-medium tracking-wide text-gray-300">DAILYDESIGN</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up [animation-delay:100ms]">
                        System Design<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">For Software Engineers</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg text-gray-400 mb-10 leading-relaxed animate-fade-in-up [animation-delay:200ms]">
                        Spend 30 minutes a day. Train to think, answer, and decide at a Principal Engineer bar—without interaction, fluff, or wasted time.
                    </p>

                    <div className="flex flex-col items-center animate-fade-in-up [animation-delay:300ms]">
                        <NewsletterSignup />
                        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center">
                            <Link href="#samples" className="text-sm text-maroon-400 hover:text-maroon-300 transition flex items-center gap-2 font-medium">
                                Try free samples <span aria-hidden="true">→</span>
                            </Link>
                            <span className="hidden sm:block text-gray-600">|</span>
                            <Link href="#course-content" className="text-sm text-gray-500 hover:text-white transition flex items-center gap-2">
                                See how it works <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    </div>

                    <div className="mt-16 pt-8 border-t border-white/5 max-w-4xl mx-auto flex flex-col items-center">
                        <p className="text-sm text-gray-500 mb-6 font-mono">CALIBRATED FOR ENGINEERING LEADERS AT</p>
                        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale mix-blend-screen text-xs font-mono tracking-widest text-gray-500">
                            <span>UBER</span>
                            <span>STRIPE</span>
                            <span>NETFLIX</span>
                            <span>AIRBNB</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. THE PROBLEM (The Gap) */}
            <section className="py-24 bg-dark-900">
                <div className="container-wide">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="text-maroon-500 font-mono text-xs mb-4">THE PRINCIPAL GAP</div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Why traditional prep breaks down<br />at the Senior+ level</h2>
                            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                                Most resources explain how systems work. Principal-level evaluation probes how you <i>think</i>.<br />
                                The role isn’t about finding the “right” answer—it’s about the quality of your tradeoffs under real constraints.
                            </p>

                            <div className="mb-8 p-4 bg-maroon-900/10 border border-maroon-900/30 rounded-lg">
                                <p className="text-maroon-200 text-sm italic">
                                    "Calibrate your thinking through progressive answer quality—from common failure patterns to Principal-level depth and judgment."
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-maroon-900/30 flex items-center justify-center flex-shrink-0 text-maroon-500 font-bold border border-maroon-900/50">01</div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">No “One Right Answer”</h3>
                                        <p className="text-gray-500">Move past polished diagrams. Learn to navigate ambiguity, articulate assumptions, and defend your engineering judgment when tradeoffs are unclear and stakes are real.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-maroon-900/30 flex items-center justify-center flex-shrink-0 text-maroon-500 font-bold border border-maroon-900/50">02</div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Production Reality</h3>
                                        <p className="text-gray-500">Go beyond happy-path designs. Reason about failure modes, scalability limits, reliability tradeoffs, and performance under real-world constraints.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-maroon-600/10 blur-3xl rounded-full"></div>
                            <div className="relative bg-dark-800 border border-white/10 rounded-xl p-8 shadow-2xl">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="font-mono text-xs text-maroon-500">BAD_VS_BEST_ANSWER.TXT</div>
                                    <div className="px-2 py-0.5 bg-maroon-900/40 text-maroon-400 text-[10px] rounded border border-maroon-900/50">SIGNAL CHECK</div>
                                </div>

                                <div className="space-y-6 font-mono text-sm">
                                    <div className="p-4 bg-white/5 rounded border border-white/5 opacity-50">
                                        <strong className="text-red-400 block mb-2 text-xs">❌ BAD ANSWER (WEAK SIGNAL)</strong>
                                        <p className="text-gray-400">"I'd use Kafka here for the messaging queue because it scales well and is standard."</p>
                                    </div>
                                    <div className="p-4 bg-maroon-900/20 rounded border border-maroon-500/20">
                                        <strong className="text-maroon-400 block mb-2 text-xs">✅ BEST ANSWER (PRINCIPAL SIGNAL)</strong>
                                        <p className="text-gray-300">"Given the strict ordering requirement but low throughput (100 TPS), Kafka adds unnecessary operational complexity. A simpler Postgres-backed job queue suffices for v1, minimizing maintenance overhead."</p>
                                    </div>
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
                        <div className="text-maroon-500 font-mono text-xs mb-4">CORE PHILOSOPHY</div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Observe. Compare. Calibrate.<br />Zero Fluff.</h2>
                        <p className="text-gray-400">No typing, no performative gamification. Pure calibration against the Principal bar.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-xl bg-dark-900 border border-white/5 hover:border-maroon-900/50 transition-colors">
                            <h3 className="text-lg font-bold mb-3">Context & Constraints</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">Every day, receive a realistic system scenario.</p>
                        </div>

                        <div className="p-8 rounded-xl bg-dark-900 border border-white/5 hover:border-maroon-900/50 transition-colors">
                            <h3 className="text-lg font-bold mb-3">Bad vs. Good vs. Best</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">Don't guess. See exactly why a "Senior" answer fails the "Principal" bar. Internalize the gap in judgment.</p>
                        </div>

                        <div className="p-8 rounded-xl bg-dark-900 border border-white/5 hover:border-maroon-900/50 transition-colors">
                            <h3 className="text-lg font-bold mb-3">Interviewer Rubric</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">Understand the strong signals and red flags.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. FREE SAMPLES */}
            <section id="samples" className="py-24 bg-dark-900">
                <div className="container-wide">
                    <div className="text-center mb-16">
                        <div className="text-maroon-500 font-mono text-xs mb-4">TRY BEFORE YOU SUBSCRIBE</div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Free Sample Scenarios</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">Experience the full interview simulation format. These are real scenarios at the Principal bar—not watered-down teasers.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        <Link href="/samples/scenario-1" className="group p-6 rounded-xl bg-dark-800 border border-white/5 hover:border-maroon-900/50 transition-all hover:-translate-y-1">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-2 py-0.5 text-xs font-medium rounded bg-purple-900/30 text-purple-400 border border-purple-900/50">System Design</span>
                                <span className="text-xs text-gray-500">30 min</span>
                            </div>
                            <h3 className="text-lg font-semibold mb-2 group-hover:text-maroon-400 transition">Distributed Rate Limiter</h3>
                            <p className="text-gray-500 text-sm mb-4">Design a rate limiting system for 5M RPS with sub-5ms latency overhead.</p>
                            <span className="text-maroon-400 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                Start scenario
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </span>
                        </Link>

                        <Link href="/samples/scenario-2" className="group p-6 rounded-xl bg-dark-800 border border-white/5 hover:border-maroon-900/50 transition-all hover:-translate-y-1">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-900/30 text-blue-400 border border-blue-900/50">Architecture</span>
                                <span className="text-xs text-gray-500">25 min</span>
                            </div>
                            <h3 className="text-lg font-semibold mb-2 group-hover:text-maroon-400 transition">Microservices vs Monolith</h3>
                            <p className="text-gray-500 text-sm mb-4">Navigate the build vs. migrate decision with real constraints and team dynamics.</p>
                            <span className="text-maroon-400 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                Start scenario
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </span>
                        </Link>

                        <Link href="/samples/scenario-3" className="group p-6 rounded-xl bg-dark-800 border border-white/5 hover:border-maroon-900/50 transition-all hover:-translate-y-1">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-2 py-0.5 text-xs font-medium rounded bg-red-900/30 text-red-400 border border-red-900/50">Tactical</span>
                                <span className="text-xs text-gray-500">20 min</span>
                            </div>
                            <h3 className="text-lg font-semibold mb-2 group-hover:text-maroon-400 transition">API Performance Crisis</h3>
                            <p className="text-gray-500 text-sm mb-4">Debug latency spikes in production with real metrics and time pressure.</p>
                            <span className="text-maroon-400 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                Start scenario
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </span>
                        </Link>
                    </div>

                    <div className="text-center mt-10">
                        <Link href="/archive" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition text-sm">
                            Browse all scenarios in the archive
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </section>

            {/* 5. PRICING */}
            <section id="pricing" className="py-24 bg-dark-800 border-y border-white/5">
                <div className="container-wide max-w-4xl">
                    <div className="text-center mb-16">
                        <div className="text-maroon-500 font-mono text-xs mb-4">SIMPLE PRICING</div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Invest in your career.</h2>
                        <p className="text-gray-400">Ideally suited for Backend Engineers with 8-20+ years of experience targeting Staff/Principal roles.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Monthly */}
                        <div className="p-8 rounded-2xl bg-dark-900 border border-white/10 flex flex-col">
                            <h3 className="text-xl font-bold mb-2">Monthly</h3>
                            <div className="mb-2"><span className="text-4xl font-bold">$20</span><span className="text-gray-500">/mo</span></div>
                            <p className="text-gray-500 text-sm mb-6">Less than the cost of a failed interview prep book</p>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex gap-3 text-gray-300 text-sm"><span className="text-maroon-500">✓</span> Daily Interview Scenarios</li>
                                <li className="flex gap-3 text-gray-300 text-sm"><span className="text-maroon-500">✓</span> Full Archive Access</li>
                                <li className="flex gap-3 text-gray-300 text-sm"><span className="text-maroon-500">✓</span> Bad/Good/Best Analysis</li>
                                <li className="flex gap-3 text-gray-300 text-sm"><span className="text-maroon-500">✓</span> Cancel Anytime</li>
                            </ul>
                            <PricingButton
                                plan="monthly"
                                className="w-full py-3 rounded-lg border border-white/10 hover:bg-white/5 transition font-semibold"
                            >
                                Start Monthly
                            </PricingButton>
                        </div>

                        {/* Annual */}
                        <div className="p-8 rounded-2xl bg-maroon-900/10 border border-maroon-600/50 flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-maroon-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">BEST VALUE</div>
                            <h3 className="text-xl font-bold mb-2 text-white">Annual</h3>
                            <div className="mb-2"><span className="text-4xl font-bold">$180</span><span className="text-maroon-200 text-sm opacity-80 font-normal ml-1">/year</span></div>
                            <p className="text-maroon-200 text-sm mb-6">$15/mo • Save 2 months</p>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex gap-3 text-white text-sm"><span className="text-maroon-400">✓</span> Everything in Monthly</li>
                                <li className="flex gap-3 text-white text-sm"><span className="text-maroon-400">✓</span> <strong>2 Months Free</strong></li>
                                <li className="flex gap-3 text-white text-sm"><span className="text-maroon-400">✓</span> Priority Feature Access</li>
                                <li className="flex gap-3 text-white text-sm"><span className="text-maroon-400">✓</span> Interview Prep Commitment</li>
                            </ul>
                            <PricingButton
                                plan="annual"
                                className="w-full py-3 rounded-lg bg-maroon-600 hover:bg-maroon-500 transition text-white font-semibold shadow-lg shadow-maroon-900/50"
                            >
                                Start Annual
                            </PricingButton>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <p className="text-gray-500 text-sm">
                            Potential ROI: A $50K+ salary increase from landing a Principal role.
                            <br />
                            <span className="text-gray-600">7-day money-back guarantee. No questions asked.</span>
                        </p>
                    </div>
                </div>
            </section>

            {/* 6. FAQ */}
            <section className="py-24 bg-dark-900">
                <div className="container-wide max-w-2xl">
                    <h2 className="text-2xl font-bold mb-10 text-center">Common Questions</h2>

                    <div className="space-y-4">
                        <details className="group bg-dark-900 rounded-lg p-4 cursor-pointer border border-white/5">
                            <summary className="font-semibold flex justify-between items-center">
                                Is this for New Grads or Junior Engineers?
                                <span className="transition-transform group-open:rotate-180"><ChevronDown /></span>
                            </summary>
                            <p className="mt-3 text-gray-400 text-sm leading-relaxed">
                                **No.** This product explicitly assumes 8+ years of experience. We do not explain basic concepts. We focus on the nuanced tradeoffs expected at Staff/Principal levels in Big Tech.
                            </p>
                        </details>

                        <details className="group bg-dark-900 rounded-lg p-4 cursor-pointer border border-white/5">
                            <summary className="font-semibold flex justify-between items-center">
                                Does this include coding puzzles?
                                <span className="transition-transform group-open:rotate-180"><ChevronDown /></span>
                            </summary>
                            <p className="mt-3 text-gray-400 text-sm leading-relaxed">
                                No. We focus exclusively on System Design, Architecture, Tradeoffs, and Operational Reality (Reliability, Scaling, Failure Modes).
                            </p>
                        </details>

                        <details className="group bg-dark-900 rounded-lg p-4 cursor-pointer border border-white/5">
                            <summary className="font-semibold flex justify-between items-center">
                                How does the daily format work?
                                <span className="transition-transform group-open:rotate-180"><ChevronDown /></span>
                            </summary>
                            <p className="mt-3 text-gray-400 text-sm leading-relaxed">
                                Every day, we unlock one new calibration scenario. You read the context, form your own answer, and then reveal our "Bad vs. Good vs. Best" analysis to calibrate your thinking.
                            </p>
                        </details>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-16 bg-dark-900 border-t border-white/5">
                <div className="container-wide">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="md:col-span-2">
                            <div className="text-lg font-bold mb-4 text-white">DailyDesign</div>
                            <p className="text-gray-500 text-sm mb-6 max-w-md">
                                Daily system design challenges calibrated for Staff and Principal Engineer roles at top tech companies.
                            </p>
                            <NewsletterSignup compact redirectToOnboarding={false} />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold mb-4 text-white">Scenarios</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><Link href="/samples/scenario-1" className="hover:text-white transition">Rate Limiter Design</Link></li>
                                <li><Link href="/samples/scenario-2" className="hover:text-white transition">Microservices Decision</Link></li>
                                <li><Link href="/samples/scenario-3" className="hover:text-white transition">Performance Debugging</Link></li>
                                <li><Link href="/archive" className="hover:text-white transition">Browse Archive →</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold mb-4 text-white">Company</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                                <li><a href="mailto:support@example.com" className="hover:text-white transition">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-600 text-xs">© 2026 DailyDesign. Not affiliated with any big tech company.</p>
                        <div className="flex gap-6 text-xs text-gray-500">
                            <a href="#" className="hover:text-white transition">Twitter</a>
                            <a href="#" className="hover:text-white transition">LinkedIn</a>
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
}
