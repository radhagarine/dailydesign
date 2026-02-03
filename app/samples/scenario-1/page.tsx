import InterviewScenario from '@/components/InterviewScenario';

const scenarioData = {
    metadata: {
        difficulty: "Senior",
        estimated_time_minutes: 30,
        topics: ["Rate Limiting", "Distributed Systems", "High Availability", "Caching", "Consistency vs Availability"],
        generated_date: "2026-01-15"
    },
    problem: {
        title: "Designing a Distributed Rate Limiter",
        statement: "Design a scalable rate limiting system for a high-traffic API gateway handling 5 million requests per second.",
        context: `You're interviewing for a Principal Engineer role at a company that operates a high-traffic API gateway. The gateway currently handles 5 million requests per second across 200+ microservices.

The current rate limiting solution is causing problems:
- Rate limits are enforced per-instance, not globally
- During traffic spikes, some users get blocked while others bypass limits
- The team has tried Redis-based solutions but hit performance bottlenecks
- Business wants per-user, per-API, and per-tenant rate limiting with different tiers

The interviewer wants to understand how you'd design a distributed rate limiter that can:
- Handle 5M+ RPS with <5ms latency overhead
- Provide accurate global rate limiting
- Scale horizontally
- Support multiple rate limiting strategies (fixed window, sliding window, token bucket)
- Be operationally simple`,
        pause_prompt: "Before proceeding, take a moment to think about the core tradeoffs between accuracy and latency at this scale."
    },
    framework_steps: [
        {
            step_number: 1,
            step_name: "Requirements Clarification",
            time_allocation: "5 min",
            description: "You know the scale (5M RPS) and latency target (<5ms). But production systems have nuances not in the initial brief. Principal engineers probe for hidden requirements and tradeoffs that fundamentally change the design.",
            pause_prompt: "What deeper questions would you ask beyond the stated requirements?",
            comparison_table: {
                criterion: "Probing for Hidden Requirements",
                interviewer_question: "Given these requirements, what else would you need to know before designing?",
                responses: [
                    {
                        level: "bad" as const,
                        icon: "❌",
                        response: "The requirements seem clear. I'd use Redis with a Lua script to implement rate limiting. We'd store counters in Redis with TTL and increment them on each request. If the counter exceeds the limit, we reject the request.",
                        why_this_level: "Accepts requirements at face value and jumps directly to implementation.",
                        red_flags: [
                            "Doesn't probe for hidden requirements or edge cases",
                            "Assumes synchronous Redis calls at 5M RPS is viable",
                            "Misses critical tradeoffs that affect architecture"
                        ]
                    },
                    {
                        level: "good" as const,
                        icon: "✓",
                        response: "Given the 5M RPS and <5ms latency targets, I'd want to clarify: Is some over-limiting acceptable during traffic bursts? What are the SLAs for different customer tiers? How should we handle rate limiter failures—fail open or closed?",
                        why_this_level: "Asks relevant clarifying questions but doesn't deeply explore how answers change the design.",
                        strengths: [
                            "Acknowledges stated requirements",
                            "Identifies failure mode question",
                            "Thinks about tiered SLAs"
                        ],
                        what_is_missing: "Doesn't quantify the accuracy vs latency tradeoff or explain how different answers lead to different architectures."
                    },
                    {
                        level: "best" as const,
                        icon: "⭐",
                        response: `Given the stated requirements, the **critical hidden question** is: Is it acceptable to have 5-10% over-limit during traffic bursts, or do we need strict enforcement?

This fundamentally changes the architecture:
- **Strict enforcement** → synchronous coordination (uses some of that 5ms budget)
- **Tolerance acceptable** → local enforcement with periodic sync (near-zero latency)

I'd also probe:
- **Failure mode preference**: Fail open (risk backend overload) or fail closed (risk blocking legitimate users)?
- **Tier isolation**: Do enterprise customers need guaranteed capacity separate from others?
- **Burst handling**: Should we allow temporary bursts with "credit" systems, or hard cutoffs?

Each answer narrows down the solution space significantly.`,
                        why_this_level: "Identifies the key hidden tradeoff and explicitly connects each question to architectural decisions.",
                        strengths: [
                            "Identifies the critical hidden requirement (accuracy tolerance)",
                            "Shows how each answer changes the design",
                            "Considers business context (enterprise isolation)"
                        ],
                        principal_engineer_signals: [
                            "Looks beyond stated requirements for hidden constraints",
                            "Connects questions to architectural implications",
                            "Prioritizes questions by impact on design"
                        ]
                    }
                ]
            },
            key_takeaways: [
                "Stated requirements are never complete—probe for hidden constraints",
                "The best clarifying questions reveal tradeoffs that change the architecture",
                "Explain how different answers would lead to different designs"
            ]
        },
        {
            step_number: 2,
            step_name: "High-Level Architecture",
            time_allocation: "10 min",
            description: "Design the core architecture that addresses the latency and scale requirements.",
            pause_prompt: "How would you architect a system that adds near-zero latency while maintaining global accuracy?",
            comparison_table: {
                criterion: "Architecture Design",
                interviewer_question: "Walk me through your high-level architecture.",
                responses: [
                    {
                        level: "bad" as const,
                        icon: "❌",
                        response: `For distributed rate limiting, we'd have all gateway instances connect to a Redis cluster. We'd use the token bucket algorithm because it's the most accurate.

To handle 5M RPS, we'd scale Redis horizontally by sharding based on user ID. We'd also add caching to reduce Redis load.`,
                        why_this_level: "Proposes a solution that won't meet the latency requirements at scale.",
                        red_flags: [
                            "Synchronous Redis calls add network RTT to every request",
                            "Redis cluster at 5M writes/sec is extremely challenging",
                            "Vague about how 'caching' helps with rate limiting",
                            "Single point of failure"
                        ]
                    },
                    {
                        level: "good" as const,
                        icon: "✓",
                        response: `I'd propose a hybrid approach:

1. **Local rate limiting** with in-memory counters on each gateway instance
2. **Async synchronization** to Redis every 100-200ms
3. **Quota distribution** where each instance gets a portion of the global quota

For the algorithm, I'd use sliding window counters for balance between accuracy and memory.

For failure handling, if Redis is unavailable, instances fall back to local-only limiting with conservative limits.`,
                        why_this_level: "Good practical approach but doesn't deeply analyze the quota distribution problem.",
                        strengths: [
                            "Hybrid approach addresses latency concerns",
                            "Considers async synchronization",
                            "Has a fallback strategy"
                        ],
                        what_is_missing: "Doesn't address: What if one instance gets all the traffic? How do quotas rebalance when instances scale?"
                    },
                    {
                        level: "best" as const,
                        icon: "⭐",
                        response: `Assuming some tolerance for over-limit, I'd propose a **quota-based approach with local enforcement**:

**Architecture:**
1. **Quota Service**: Centralized service that allocates quotas to gateway instances
2. **Local Enforcement**: Each gateway enforces limits using in-memory counters
3. **Periodic Sync**: Instances report usage and request new quotas every 1-5 seconds

**Why This Works:**
- Zero latency overhead on the request path (local memory lookup)
- Scales horizontally—more instances = more quota distribution
- Graceful degradation—if quota service is down, instances use last-known quotas
- Operationally simple—quota service is stateless, can be replicated

**Handling the Accuracy Tradeoff:**
- Each instance gets a quota slice (e.g., 1000 req/sec for a user with 10K limit across 10 instances)
- Over-limiting is bounded: worst case is (num_instances × quota_slice) - global_limit
- We can tune the sync interval: shorter = more accurate but more overhead`,
                        why_this_level: "Provides a complete architecture with clear reasoning and bounded error analysis.",
                        strengths: [
                            "Zero latency on request path",
                            "Clear explanation of why it works",
                            "Quantified accuracy bounds",
                            "Addresses operational simplicity"
                        ],
                        principal_engineer_signals: [
                            "Thinks about worst-case bounds",
                            "Considers operational complexity",
                            "Explains tuning knobs for different tradeoffs"
                        ]
                    }
                ]
            },
            key_takeaways: [
                "At high scale, synchronous calls to shared state are often the bottleneck",
                "Consider async approaches or local enforcement with periodic reconciliation",
                "Always analyze the worst-case bounds of your approach"
            ]
        },
        {
            step_number: 3,
            step_name: "Failure Modes & Operational Concerns",
            time_allocation: "10 min",
            description: "Production systems must handle failures gracefully. Discuss how your design degrades under various failure scenarios.",
            pause_prompt: "What happens when components of your rate limiting system fail?",
            comparison_table: {
                criterion: "Failure Handling",
                interviewer_question: "What happens if your quota service goes down? What about network partitions?",
                responses: [
                    {
                        level: "bad" as const,
                        icon: "❌",
                        response: "If Redis goes down, we'd fail open and allow all traffic through. We'd set up monitoring to alert us when this happens so we can fix it quickly.",
                        why_this_level: "Fails to consider the implications of failing open at scale.",
                        red_flags: [
                            "Failing open at 5M RPS could overwhelm downstream services",
                            "Reactive approach (wait for alerts) is too slow",
                            "No discussion of partial failures or degraded modes"
                        ]
                    },
                    {
                        level: "good" as const,
                        icon: "✓",
                        response: `I'd implement multiple layers of fallback:

1. **Quota service down**: Use last-known quotas with a decay factor
2. **Network partition**: Local instances continue with isolated quotas
3. **Instance restart**: Bootstrap from quota service or use conservative defaults

We'd also have circuit breakers to prevent cascading failures.`,
                        why_this_level: "Good fallback strategy but doesn't quantify the impact or discuss recovery.",
                        strengths: [
                            "Multiple fallback layers",
                            "Considers network partitions",
                            "Mentions circuit breakers"
                        ],
                        what_is_missing: "What's the impact on customers during degraded mode? How do we recover without causing spikes?"
                    },
                    {
                        level: "best" as const,
                        icon: "⭐",
                        response: `**Failure Scenarios & Mitigations:**

1. **Quota Service Down**
   - Use cached quotas with TTL (e.g., 5 minutes)
   - Apply a safety factor (80% of cached quota) to prevent over-allocation
   - Alert on degraded mode, but don't page unless >10 min

2. **Network Partition**
   - Each partition operates independently with its allocated quotas
   - On heal, reconcile usage asynchronously (no thundering herd)
   - Accept temporary over-limit during partition (bounded by partition duration)

3. **Traffic Shift (all traffic to one instance)**
   - Implement quota stealing: instance can request emergency quota from neighbors
   - Fallback: rate limit at instance level to protect downstream

**Key Principle**: Prefer slightly over-limiting to catastrophic downstream failure. The cost of blocking a few extra requests is far less than overwhelming the backend.

**Observability**:
- Track quota utilization per instance
- Alert on asymmetric distribution
- Dashboard showing current mode (normal/degraded/emergency)`,
                        why_this_level: "Comprehensive failure analysis with clear priorities and observability.",
                        strengths: [
                            "Specific mitigations for each failure mode",
                            "Clear philosophy (prefer over-limit to backend failure)",
                            "Includes observability requirements",
                            "Considers recovery scenarios"
                        ],
                        principal_engineer_signals: [
                            "Thinks about blast radius of failures",
                            "Prioritizes based on business impact",
                            "Builds in observability from the start"
                        ]
                    }
                ]
            },
            other_failure_scenarios: [
                {
                    scenario: "Thundering herd on quota reset",
                    impact: "Spike in traffic when quotas reset at window boundaries",
                    mitigation: "Use sliding windows or jittered reset times per user"
                },
                {
                    scenario: "Hot key (single user with massive traffic)",
                    impact: "One user's traffic skews quota distribution",
                    mitigation: "Detect hot keys and route to dedicated quota pool"
                }
            ],
            key_takeaways: [
                "Design for graceful degradation, not just happy path",
                "Quantify the impact of each failure mode",
                "Build observability into the design from the start"
            ]
        }
    ],
    interview_simulation: {
        title: "Curveball: Strict Consistency Requirement",
        description: "The interviewer changes the requirements to test your adaptability.",
        scenario: {
            interviewer_question: "Actually, for our enterprise tier, we need strict rate limiting with zero over-limit tolerance. How would you modify your design?",
            pause_prompt: "Think about how you'd adapt your architecture for strict consistency. What tradeoffs would you accept?",
            comparison_table: {
                criterion: "Adapting to New Requirements",
                responses: [
                    {
                        level: "bad" as const,
                        icon: "❌",
                        response: "We'd just use Redis with synchronous calls for enterprise customers. The latency hit is acceptable for them since they're paying more.",
                        why_this_level: "Doesn't quantify the latency impact or consider alternatives.",
                        red_flags: [
                            "Assumes enterprise customers accept higher latency without asking",
                            "Synchronous Redis at scale is still problematic",
                            "No discussion of how to isolate enterprise from regular traffic"
                        ]
                    },
                    {
                        level: "good" as const,
                        icon: "✓",
                        response: "For strict consistency, I'd use a two-tier approach: local pre-check with synchronous confirmation for requests near the limit. This minimizes sync calls while guaranteeing no over-limit.",
                        why_this_level: "Good optimization but doesn't fully address the tradeoffs.",
                        strengths: [
                            "Hybrid approach reduces sync calls",
                            "Focuses on edge cases (near limit)"
                        ],
                        what_is_missing: "How do you define 'near the limit'? What's the latency impact? How do you handle the transition?"
                    },
                    {
                        level: "best" as const,
                        icon: "⭐",
                        response: `For strict enforcement, I'd recommend a **reservation-based model**:

**How It Works:**
1. Gateway reserves quota in batches (e.g., 100 requests)
2. Local enforcement against reserved quota (fast path)
3. When reservation depleted, synchronously request more
4. If sync fails, reject the request (fail closed for enterprise)

**Latency Analysis:**
- 99% of requests: local check only (~0.1ms)
- 1% of requests: sync reservation (~5-10ms)
- Average overhead: ~0.15ms

**Tradeoff**: We're trading some quota efficiency (unused reservations) for latency. For enterprise customers paying premium, this is acceptable.

**Isolation**: Enterprise traffic goes through dedicated gateway instances with their own quota pools, preventing noisy neighbor issues.`,
                        why_this_level: "Provides a complete solution with quantified tradeoffs and isolation strategy.",
                        strengths: [
                            "Concrete latency numbers",
                            "Clear tradeoff analysis",
                            "Addresses isolation concerns"
                        ],
                        principal_engineer_signals: [
                            "Adapts architecture to new requirements cleanly",
                            "Quantifies the impact of changes",
                            "Considers multi-tenant isolation"
                        ]
                    }
                ]
            }
        },
        key_takeaways: [
            "Be prepared to adapt your design when requirements change",
            "Quantify the impact of architectural changes",
            "Consider how different customer tiers might need different solutions"
        ]
    },
    summary: {
        critical_concepts_covered: [
            "Distributed rate limiting patterns",
            "Consistency vs availability tradeoffs",
            "Local enforcement with global coordination",
            "Graceful degradation",
            "Multi-tenant isolation"
        ],
        patterns_demonstrated: [
            "Quota-based resource allocation",
            "Hybrid sync/async architectures",
            "Reservation-based consistency",
            "Circuit breaker pattern",
            "Graceful degradation under failure"
        ],
        what_made_responses_best_level: [
            "Clarifying requirements before proposing solutions",
            "Quantifying tradeoffs with concrete numbers",
            "Considering failure modes and their business impact",
            "Building observability into the design",
            "Adapting cleanly when requirements change"
        ]
    },
    reflection_prompts: {
        self_assessment: [
            "Did I clarify the accuracy vs latency tradeoff before proposing a solution?",
            "Could I explain the worst-case bounds of my approach?",
            "Did I consider how the system behaves under various failure modes?",
            "Would my design be operationally simple to run in production?"
        ],
        practice_next: [
            "Design a distributed counter system for analytics",
            "Design a global leaderboard with real-time updates",
            "Design a circuit breaker service for microservices"
        ]
    }
};

export default function Scenario1() {
    return (
        <InterviewScenario
            slug="sample-scenario-1"
            scenario={scenarioData}
            theme="scale"
            problemType="SYSTEM_DESIGN"
            focusArea="Distributed Systems"
            generatedAt={new Date("2026-01-15")}
        />
    );
}
