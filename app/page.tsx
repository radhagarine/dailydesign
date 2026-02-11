import Link from 'next/link';
import NewsletterSignup from '@/components/NewsletterSignup';
import PricingButton from '@/components/PricingButton';
import ManageSubscription from '@/components/ManageSubscription';
import AccessCodeRedeem from '@/components/AccessCodeRedeem';

const ChevronDown = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
);

export default function Home() {
    return (
        <main className="min-h-screen bg-dark-900 text-white selection:bg-accent-900 selection:text-accent-300">

            {/* 1. HERO */}
            <section className="relative pt-32 pb-20 border-b border-white/5 overflow-hidden">
                {/* Layered background: radial glow + grid pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent-900/30 via-dark-900 to-dark-900"></div>
                <div className="absolute inset-0 bg-grid-pattern"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent-500/8 blur-[120px] rounded-full"></div>

                <div className="container-wide text-center relative">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-900/30 border border-accent-700/30 mb-8 animate-fade-in-up">
                        <div className="w-2 h-2 rounded-full bg-accent-400 animate-glow-pulse"></div>
                        <span className="text-xs font-mono font-medium tracking-wide text-accent-300">NEW SCENARIOS DAILY</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up [animation-delay:100ms]">
                        Calibrate Your Answers<br />
                        <span className="text-gradient-accent">To the Principal Bar</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg text-slate-400 mb-10 leading-relaxed animate-fade-in-up [animation-delay:200ms]">
                        Compare bad, good, and best responses to real system design scenarios.
                        30 minutes a day. No interaction, no fluff—just calibration.
                    </p>

                    <div className="flex flex-col items-center animate-fade-in-up [animation-delay:300ms]">
                        <NewsletterSignup />
                        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center">
                            <Link href="#samples" className="text-sm text-accent-400 hover:text-accent-300 transition flex items-center gap-2 font-medium">
                                Try free samples <span aria-hidden="true">&rarr;</span>
                            </Link>
                            <span className="hidden sm:block text-slate-600">|</span>
                            <Link href="#how-it-works" className="text-sm text-slate-500 hover:text-white transition flex items-center gap-2">
                                See how it works <span aria-hidden="true">&rarr;</span>
                            </Link>
                        </div>
                    </div>

                    <div className="mt-16 pt-8 border-t border-white/5 max-w-2xl mx-auto">
                        <p className="text-sm text-slate-500">
                            Built for backend engineers with <strong className="text-slate-300">8-20+ years</strong> of experience targeting <strong className="text-slate-300">Staff &amp; Principal</strong> roles at top tech companies.
                        </p>
                    </div>
                </div>
            </section>

            {/* 2. THE SIGNAL — Bad vs Best */}
            <section className="py-24 bg-dark-900 relative">
                <div className="absolute inset-0 bg-grid-pattern opacity-50"></div>
                <div className="container-wide max-w-4xl relative">
                    <div className="text-center mb-12">
                        <div className="text-accent-400 font-mono text-xs mb-4 tracking-wider">THE PRINCIPAL GAP</div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            The difference isn&apos;t knowledge.<br />It&apos;s <span className="text-gradient-accent">judgment</span>.
                        </h2>
                        <p className="text-slate-400 max-w-xl mx-auto">
                            Most resources explain how systems work. Principal-level evaluation probes how you <em>think</em>—the quality of your tradeoffs under real constraints.
                        </p>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-accent-500/5 blur-3xl rounded-full"></div>
                        <div className="relative bg-dark-800 border border-accent-900/50 rounded-xl p-8 shadow-2xl glow-cyan">
                            <div className="flex justify-between items-center mb-6">
                                <div className="font-mono text-xs text-accent-400">SIGNAL CHECK</div>
                                <div className="px-2 py-0.5 bg-accent-900/40 text-accent-300 text-[10px] rounded border border-accent-800/50 font-mono">MESSAGING QUEUE DECISION</div>
                            </div>

                            <div className="space-y-6 font-mono text-sm">
                                <div className="p-4 bg-white/[0.03] rounded-lg border border-white/5 opacity-60">
                                    <strong className="text-red-400 block mb-2 text-xs tracking-wide">BAD ANSWER — WEAK SIGNAL</strong>
                                    <p className="text-slate-400">&ldquo;I&apos;d use Kafka here for the messaging queue because it scales well and is standard.&rdquo;</p>
                                </div>
                                <div className="p-4 bg-accent-900/15 rounded-lg border border-accent-700/20">
                                    <strong className="text-accent-400 block mb-2 text-xs tracking-wide">BEST ANSWER — PRINCIPAL SIGNAL</strong>
                                    <p className="text-slate-200">&ldquo;Given the strict ordering requirement but low throughput (100 TPS), Kafka adds unnecessary operational complexity. A simpler Postgres-backed job queue suffices for v1, minimizing maintenance overhead.&rdquo;</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 grid md:grid-cols-2 gap-8">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-lg bg-accent-900/30 flex items-center justify-center flex-shrink-0 text-accent-400 font-bold text-sm border border-accent-800/40 font-mono">01</div>
                            <div>
                                <h3 className="text-lg font-semibold mb-1">No &ldquo;One Right Answer&rdquo;</h3>
                                <p className="text-slate-500 text-sm">Navigate ambiguity, articulate assumptions, and defend engineering judgment when tradeoffs are unclear.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-lg bg-accent-900/30 flex items-center justify-center flex-shrink-0 text-accent-400 font-bold text-sm border border-accent-800/40 font-mono">02</div>
                            <div>
                                <h3 className="text-lg font-semibold mb-1">Production Reality</h3>
                                <p className="text-slate-500 text-sm">Reason about failure modes, scalability limits, and performance under constraints that textbooks skip.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. HOW IT WORKS */}
            <section id="how-it-works" className="py-24 bg-dark-800 border-y border-white/5 relative">
                <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
                <div className="container-wide max-w-4xl relative">
                    <div className="text-center mb-16">
                        <div className="text-accent-400 font-mono text-xs mb-4 tracking-wider">HOW IT WORKS</div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Four steps. 30 minutes. Every day.</h2>
                        <p className="text-slate-400">No typing, no gamification. Pure calibration against the Principal bar.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="group p-8 rounded-xl bg-dark-900 border border-white/5 hover:border-accent-800/50 transition-all hover:glow-cyan">
                            <div className="text-accent-400 font-mono text-xs mb-3 tracking-wider">STEP 1</div>
                            <h3 className="text-lg font-bold mb-2">Read the Scenario</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">A realistic system design problem with production constraints, team dynamics, and business context—not a sanitized textbook prompt.</p>
                        </div>

                        <div className="group p-8 rounded-xl bg-dark-900 border border-white/5 hover:border-accent-800/50 transition-all hover:glow-cyan">
                            <div className="text-violet-400 font-mono text-xs mb-3 tracking-wider">STEP 2</div>
                            <h3 className="text-lg font-bold mb-2">Form Your Own Answer</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">Pause and think through your approach before seeing ours. This active recall is what builds interview muscle memory.</p>
                        </div>

                        <div className="group p-8 rounded-xl bg-dark-900 border border-white/5 hover:border-accent-800/50 transition-all hover:glow-cyan">
                            <div className="text-accent-400 font-mono text-xs mb-3 tracking-wider">STEP 3</div>
                            <h3 className="text-lg font-bold mb-2">Compare Bad / Good / Best</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">See exactly why a &ldquo;Senior&rdquo; answer falls short of the &ldquo;Principal&rdquo; bar. Each criterion is broken down with the interviewer&apos;s rubric.</p>
                        </div>

                        <div className="group p-8 rounded-xl bg-dark-900 border border-white/5 hover:border-accent-800/50 transition-all hover:glow-cyan">
                            <div className="text-violet-400 font-mono text-xs mb-3 tracking-wider">STEP 4</div>
                            <h3 className="text-lg font-bold mb-2">Internalize the Gap</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">Reflection prompts and a mock interviewer dialogue help you absorb the patterns that distinguish principal-level thinking.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. FREE SAMPLES */}
            <section id="samples" className="py-24 bg-dark-900">
                <div className="container-wide">
                    <div className="text-center mb-16">
                        <div className="text-accent-400 font-mono text-xs mb-4 tracking-wider">TRY BEFORE YOU SUBSCRIBE</div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Free Sample Scenarios</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">Experience the full interview simulation format. These are real scenarios at the Principal bar—not watered-down teasers.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        <Link href="/samples/scenario-1" className="group p-6 rounded-xl bg-dark-800 border border-white/5 hover:border-violet-600/30 transition-all hover:-translate-y-1 hover:glow-violet">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-2 py-0.5 text-xs font-medium rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">System Design</span>
                                <span className="text-xs text-slate-500">30 min</span>
                            </div>
                            <h3 className="text-lg font-semibold mb-2 group-hover:text-accent-400 transition">Distributed Rate Limiter</h3>
                            <p className="text-slate-500 text-sm mb-4">Design a rate limiting system for 5M RPS with sub-5ms latency overhead.</p>
                            <span className="text-accent-400 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                Start scenario
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </span>
                        </Link>

                        <Link href="/samples/scenario-2" className="group p-6 rounded-xl bg-dark-800 border border-white/5 hover:border-accent-700/30 transition-all hover:-translate-y-1 hover:glow-cyan">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-2 py-0.5 text-xs font-medium rounded bg-accent-500/10 text-accent-400 border border-accent-500/20">Architecture</span>
                                <span className="text-xs text-slate-500">25 min</span>
                            </div>
                            <h3 className="text-lg font-semibold mb-2 group-hover:text-accent-400 transition">Microservices vs Monolith</h3>
                            <p className="text-slate-500 text-sm mb-4">Navigate the build vs. migrate decision with real constraints and team dynamics.</p>
                            <span className="text-accent-400 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                Start scenario
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </span>
                        </Link>

                        <Link href="/samples/scenario-3" className="group p-6 rounded-xl bg-dark-800 border border-white/5 hover:border-accent-700/30 transition-all hover:-translate-y-1 hover:glow-cyan">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-2 py-0.5 text-xs font-medium rounded bg-red-500/10 text-red-400 border border-red-500/20">Tactical</span>
                                <span className="text-xs text-slate-500">20 min</span>
                            </div>
                            <h3 className="text-lg font-semibold mb-2 group-hover:text-accent-400 transition">API Performance Crisis</h3>
                            <p className="text-slate-500 text-sm mb-4">Debug latency spikes in production with real metrics and time pressure.</p>
                            <span className="text-accent-400 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                Start scenario
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </span>
                        </Link>
                    </div>

                    <div className="text-center mt-10">
                        <Link href="/archive" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition text-sm">
                            Browse all scenarios in the archive
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </section>

            {/* 5. PRICING */}
            <section id="pricing" className="py-24 bg-dark-800 border-y border-white/5 relative">
                <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
                <div className="container-wide max-w-4xl relative">
                    <div className="text-center mb-16">
                        <div className="text-accent-400 font-mono text-xs mb-4 tracking-wider">SIMPLE PRICING</div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Invest in your next role.</h2>
                        <p className="text-slate-400">Less than one hour of interview prep coaching—delivered every day for a month.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Monthly */}
                        <div className="p-8 rounded-2xl bg-dark-900 border border-white/10 flex flex-col">
                            <h3 className="text-xl font-bold mb-2">Monthly</h3>
                            <div className="mb-2"><span className="text-4xl font-bold">$20</span><span className="text-slate-500">/mo</span></div>
                            <p className="text-slate-500 text-sm mb-6">Full access, cancel anytime</p>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex gap-3 text-slate-300 text-sm"><span className="text-accent-400">&#10003;</span> Daily Interview Scenarios</li>
                                <li className="flex gap-3 text-slate-300 text-sm"><span className="text-accent-400">&#10003;</span> Full Archive Access</li>
                                <li className="flex gap-3 text-slate-300 text-sm"><span className="text-accent-400">&#10003;</span> Bad/Good/Best Analysis</li>
                                <li className="flex gap-3 text-slate-300 text-sm"><span className="text-accent-400">&#10003;</span> Cancel Anytime</li>
                            </ul>
                            <PricingButton
                                plan="monthly"
                                className="w-full py-3 rounded-lg border border-white/10 hover:bg-white/5 hover:border-accent-800/50 transition font-semibold"
                            >
                                Start Monthly
                            </PricingButton>
                        </div>

                        {/* Annual */}
                        <div className="p-8 rounded-2xl bg-accent-900/10 border border-accent-700/30 flex flex-col relative overflow-hidden glow-cyan">
                            <div className="absolute top-0 right-0 bg-accent-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">BEST VALUE</div>
                            <h3 className="text-xl font-bold mb-2 text-white">Annual</h3>
                            <div className="mb-2"><span className="text-4xl font-bold">$180</span><span className="text-accent-300 text-sm opacity-80 font-normal ml-1">/year</span></div>
                            <p className="text-accent-300/70 text-sm mb-6">$15/mo &middot; Save 2 months</p>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex gap-3 text-white text-sm"><span className="text-accent-400">&#10003;</span> Everything in Monthly</li>
                                <li className="flex gap-3 text-white text-sm"><span className="text-accent-400">&#10003;</span> <strong>2 Months Free</strong></li>
                                <li className="flex gap-3 text-white text-sm"><span className="text-accent-400">&#10003;</span> Priority Feature Access</li>
                                <li className="flex gap-3 text-white text-sm"><span className="text-accent-400">&#10003;</span> Interview Prep Commitment</li>
                            </ul>
                            <PricingButton
                                plan="annual"
                                className="w-full py-3 rounded-lg bg-accent-600 hover:bg-accent-500 transition text-white font-semibold shadow-lg shadow-accent-900/50"
                            >
                                Start Annual
                            </PricingButton>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <p className="text-slate-500 text-sm mb-6">
                            7-day money-back guarantee. No questions asked.
                        </p>
                        <AccessCodeRedeem />
                    </div>
                </div>
            </section>

            {/* 6. FAQ */}
            <section className="py-24 bg-dark-900">
                <div className="container-wide max-w-2xl">
                    <h2 className="text-2xl font-bold mb-10 text-center">Common Questions</h2>

                    <div className="space-y-4">
                        <details className="group rounded-lg p-4 cursor-pointer border border-white/5 bg-dark-800/50 hover:border-accent-900/50 transition-colors">
                            <summary className="font-semibold flex justify-between items-center">
                                Is this for New Grads or Junior Engineers?
                                <span className="transition-transform group-open:rotate-180 text-slate-500"><ChevronDown /></span>
                            </summary>
                            <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                                <strong>No.</strong> This product explicitly assumes 8+ years of experience. We do not explain basic concepts. We focus on the nuanced tradeoffs expected at Staff/Principal levels in Big Tech.
                            </p>
                        </details>

                        <details className="group rounded-lg p-4 cursor-pointer border border-white/5 bg-dark-800/50 hover:border-accent-900/50 transition-colors">
                            <summary className="font-semibold flex justify-between items-center">
                                Does this include coding puzzles?
                                <span className="transition-transform group-open:rotate-180 text-slate-500"><ChevronDown /></span>
                            </summary>
                            <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                                No. We focus exclusively on System Design, Architecture, Tradeoffs, and Operational Reality (Reliability, Scaling, Failure Modes).
                            </p>
                        </details>

                        <details className="group rounded-lg p-4 cursor-pointer border border-white/5 bg-dark-800/50 hover:border-accent-900/50 transition-colors">
                            <summary className="font-semibold flex justify-between items-center">
                                How does the daily format work?
                                <span className="transition-transform group-open:rotate-180 text-slate-500"><ChevronDown /></span>
                            </summary>
                            <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                                Every day at 6 AM UTC, you receive a new scenario by email. Read the context, form your own answer, then reveal our Bad / Good / Best analysis to calibrate your thinking. Each scenario takes about 30 minutes.
                            </p>
                        </details>

                        <details className="group rounded-lg p-4 cursor-pointer border border-white/5 bg-dark-800/50 hover:border-accent-900/50 transition-colors">
                            <summary className="font-semibold flex justify-between items-center">
                                What happens after I subscribe?
                                <span className="transition-transform group-open:rotate-180 text-slate-500"><ChevronDown /></span>
                            </summary>
                            <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                                You&apos;ll receive a welcome email and your first scenario immediately. From then on, a new scenario lands in your inbox every morning. You also get full access to the archive of all past scenarios.
                            </p>
                        </details>

                        <details className="group rounded-lg p-4 cursor-pointer border border-white/5 bg-dark-800/50 hover:border-accent-900/50 transition-colors">
                            <summary className="font-semibold flex justify-between items-center">
                                Can I binge the archive instead of doing one per day?
                                <span className="transition-transform group-open:rotate-180 text-slate-500"><ChevronDown /></span>
                            </summary>
                            <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                                Yes. Paid subscribers have full archive access. That said, the daily cadence is intentional—spaced repetition builds deeper pattern recognition than cramming.
                            </p>
                        </details>

                        <details className="group rounded-lg p-4 cursor-pointer border border-white/5 bg-dark-800/50 hover:border-accent-900/50 transition-colors">
                            <summary className="font-semibold flex justify-between items-center">
                                How is this different from system design books?
                                <span className="transition-transform group-open:rotate-180 text-slate-500"><ChevronDown /></span>
                            </summary>
                            <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                                Books teach you how systems work. We show you how to <em>answer</em> about them at the Principal level. Every scenario includes a side-by-side comparison of what a weak, competent, and exceptional answer looks like—so you can calibrate where you stand.
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
                            <p className="text-slate-500 text-sm mb-6 max-w-md">
                                Daily system design challenges calibrated for Staff and Principal Engineer roles at top tech companies.
                            </p>
                            <NewsletterSignup compact redirectToOnboarding={false} />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold mb-4 text-white">Scenarios</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><Link href="/samples/scenario-1" className="hover:text-white transition">Rate Limiter Design</Link></li>
                                <li><Link href="/samples/scenario-2" className="hover:text-white transition">Microservices Decision</Link></li>
                                <li><Link href="/samples/scenario-3" className="hover:text-white transition">Performance Debugging</Link></li>
                                <li><Link href="/archive" className="hover:text-white transition">Browse Archive &rarr;</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold mb-4 text-white">Company</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                                <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
                                <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                                <li><a href="mailto:support@dailydesign.dev" className="hover:text-white transition">Contact</a></li>
                                <li><ManageSubscription /></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-slate-600 text-xs">&copy; 2026 DailyDesign. Not affiliated with any big tech company.</p>
                        <div className="flex gap-6 text-xs text-slate-500">
                            <span className="text-slate-600">DailyDesign</span>
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
}
