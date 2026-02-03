import InterviewScenario from '@/components/InterviewScenario';

const scenarioData = {
    metadata: {
        difficulty: "Senior",
        estimated_time_minutes: 30,
        topics: ["Microservices", "Monolith", "Architecture Decision", "Conway's Law", "Migration Strategy"],
        generated_date: "2026-01-16"
    },
    problem: {
        title: "Microservices vs Monolith: The Split",
        statement: "Decide whether to break a monolithic Rails application into microservices for a rapidly scaling startup.",
        context: `You are a Principal Engineer at a SaaS startup that has found product-market fit. The engineering team has grown from 10 to 50 engineers in the last year.

**Current Architecture:**
- Single monolithic Ruby on Rails application
- Postgres database (getting large, 2TB+)
- Redis for caching and background jobs (Sidekiq)
- Deployed on Kubernetes

**The Problem:**
- Deployments are slow (20+ minutes) and often break unrelated features
- Tests take 45 minutes to run in CI
- Different teams are stepping on each other's toes
- The database is becoming a bottleneck for some write-heavy features

The CTO is pushing to "move to microservices" to solve these velocity issues. She wants to split the app into 5-6 services immediately (Auth, Billing, Users, Notifications, Reporting, Core App).`,
        pause_prompt: "Before responding, consider: What are the actual bottlenecks here? Are they technical or organizational?"
    },
    framework_steps: [
        {
            step_number: 1,
            step_name: "Problem Analysis",
            time_allocation: "5 min",
            description: "Before proposing solutions, analyze whether microservices actually solve the stated problems.",
            pause_prompt: "Do you agree with the CTO's diagnosis? What questions would you ask?",
            comparison_table: {
                criterion: "Problem Analysis",
                interviewer_question: "Do you agree with the CTO's plan to move to microservices?",
                responses: [
                    {
                        level: "bad" as const,
                        icon: "❌",
                        response: `Yes, I agree with the CTO. Monoliths don't scale, so microservices are the natural next step. We should split the codebase by domain immediately.

I'd start by creating separate repos for Auth, Billing, and Users. We'll set up gRPC for communication between them to be fast. Each service will have its own database to ensure decoupling.`,
                        why_this_level: "Blindly accepts the premise without analyzing if microservices actually solve the stated problems.",
                        red_flags: [
                            "Doesn't question whether microservices solve deployment slowness",
                            "Ignores operational complexity of distributed systems",
                            "Big bang approach is high risk",
                            "No analysis of actual bottlenecks"
                        ]
                    },
                    {
                        level: "good" as const,
                        icon: "✓",
                        response: `I would caution against a full split immediately. Moving from a monolith to 6 microservices is a massive jump in complexity that could actually *slow down* the team further.

Let me analyze the actual problems:
- 20-minute deploys: This is likely a CI/CD issue, not architecture
- 45-minute tests: Parallelization or test hygiene issue
- Teams stepping on toes: Could be solved with module boundaries

Before committing to microservices, I'd want to know: Have we tried enforcing module boundaries in the monolith?`,
                        why_this_level: "Good skepticism but doesn't provide a complete alternative strategy.",
                        strengths: [
                            "Questions the premise",
                            "Identifies root cause analysis gaps",
                            "Recognizes operational complexity"
                        ],
                        what_is_missing: "Doesn't provide a concrete alternative plan or decision framework."
                    },
                    {
                        level: "best" as const,
                        icon: "⭐",
                        response: `My advice to the CTO would be: **"The goal is velocity, not microservices."** Microservices are a means, not an end.

Let me break down the problems:

1. **20-min deploys** → This is a build/deploy pipeline problem. Microservices might make this *worse* (now you have 6 things to deploy).

2. **45-min tests** → Parallelization, test selection, or flaky test cleanup would fix this faster than re-architecting.

3. **Teams stepping on toes** → This is an organizational problem. Conway's Law works both ways—we can enforce boundaries in code first.

4. **Database bottleneck** → *This* is the one legitimate scaling concern. But we should identify *which* tables need splitting, not split everything.

**My recommendation**: Adopt an evolutionary architecture. Let's get quick wins first (CI/CD), then make targeted extractions.`,
                        why_this_level: "Systematically analyzes each problem and connects technical decisions to business outcomes.",
                        strengths: [
                            "Focuses on the goal (velocity), not the solution (microservices)",
                            "Breaks down each problem individually",
                            "Identifies which problems microservices actually solve",
                            "Proposes evolutionary approach"
                        ],
                        principal_engineer_signals: [
                            "Challenges assumptions respectfully",
                            "Connects technical decisions to business outcomes",
                            "Thinks about organizational dynamics"
                        ]
                    }
                ]
            },
            key_takeaways: [
                "Always question whether the proposed solution addresses the actual problem",
                "Microservices add complexity—only pay that cost if you need independent scaling or deployment",
                "Many 'architecture' problems are actually process or organizational problems"
            ]
        },
        {
            step_number: 2,
            step_name: "Migration Strategy",
            time_allocation: "15 min",
            description: "If extraction is needed, design a safe migration path that doesn't halt feature development.",
            pause_prompt: "How would you migrate without stopping feature work or risking data integrity?",
            comparison_table: {
                criterion: "Migration Approach",
                interviewer_question: "Okay, let's say we do need to extract some services. How would you approach it?",
                responses: [
                    {
                        level: "bad" as const,
                        icon: "❌",
                        response: `We'll create separate repos for each service and move the relevant code. Each service gets its own database for clean separation.

We can put a team on each service to speed up development. To migrate, we'll just move the code and point the new services to the new databases.`,
                        why_this_level: "Proposes a 'big bang' migration that ignores data coupling and operational complexity.",
                        red_flags: [
                            "Big bang rewrite rarely succeeds",
                            "'Just move the code' ignores foreign key relationships",
                            "No strategy for handling in-flight requests during migration",
                            "Underestimates data migration complexity"
                        ]
                    },
                    {
                        level: "good" as const,
                        icon: "✓",
                        response: `I'd propose a **Modular Monolith** approach first:

1. **Enforce Boundaries**: Use tools like 'packwerk' (for Rails) to enforce module boundaries within the monolith
2. **Stop Cross-Module Joins**: Refactor code to use APIs between modules
3. **Extract One Service**: Pick one non-critical domain (e.g., Notifications) as a pilot
4. **Learn and Iterate**: If the pilot succeeds and we still need more extraction, continue

This de-risks the migration while preserving the option to extract later.`,
                        why_this_level: "Good incremental approach but missing details on data migration and rollback.",
                        strengths: [
                            "Modular Monolith as intermediate step",
                            "Pilot approach reduces risk",
                            "Recognizes value of preserving options"
                        ],
                        what_is_missing: "How do you migrate data? What's the rollback plan? How do you handle the transition period?"
                    },
                    {
                        level: "best" as const,
                        icon: "⭐",
                        response: `I'd use the **Strangler Fig Pattern** for safe, incremental migration:

**Phase 1: Stabilize (Weeks 1-4)**
- Fix CI/CD to drop build times from 45m to 10m—immediate velocity win
- Identify module boundaries in code using static analysis
- Stop allowing new cross-module database joins

**Phase 2: Extract First Service (Months 2-4)**
- Pick the most decoupled, high-churn context (likely Notifications or Billing)
- Build an **Anti-Corruption Layer** in the monolith—all calls go through an interface
- **Dual-write strategy**: Write to both old tables and new service, read from old
- Backfill historical data to new service
- Switch reads to new service, verify consistency
- Remove dual-writes, deprecate old code

**Phase 3: Team Alignment (Ongoing)**
- Align teams to service boundaries (Conway's Law)
- Each team owns their service AND its deployment pipeline

**Decision Criteria for Future Extractions:**
Only extract if:
1. It needs to scale independently
2. It has a different deployment lifecycle
3. Team communication overhead exceeds coding time`,
                        why_this_level: "Comprehensive strategy with specific phases, data migration approach, and decision framework.",
                        strengths: [
                            "Strangler Fig pattern for safe migration",
                            "Specific phases with timelines",
                            "Dual-write strategy for data safety",
                            "Clear criteria for when to stop extracting"
                        ],
                        principal_engineer_signals: [
                            "Thinks about organizational change alongside technical change",
                            "Provides decision framework, not just one-time advice",
                            "Considers rollback and verification at each step"
                        ]
                    }
                ]
            },
            key_takeaways: [
                "Use the Strangler Fig pattern for incremental migration—never do big bang rewrites",
                "Data migration is the hardest part—plan for dual-writes and verification",
                "Provide decision criteria for when to stop, not just when to start"
            ]
        },
        {
            step_number: 3,
            step_name: "Operational Considerations",
            time_allocation: "10 min",
            description: "Microservices require significant operational investment. Address the hidden costs.",
            pause_prompt: "What operational challenges will the team face with microservices?",
            comparison_table: {
                criterion: "Operational Planning",
                interviewer_question: "What operational challenges should we prepare for?",
                responses: [
                    {
                        level: "bad" as const,
                        icon: "❌",
                        response: "We'll need to set up gRPC for service communication and maybe add some monitoring. Kubernetes handles most of the operational complexity for us.",
                        why_this_level: "Drastically underestimates operational complexity of distributed systems.",
                        red_flags: [
                            "Kubernetes doesn't solve distributed systems problems",
                            "No mention of observability (tracing, metrics, logs)",
                            "Ignores network reliability, circuit breakers, retries",
                            "No discussion of debugging distributed transactions"
                        ]
                    },
                    {
                        level: "good" as const,
                        icon: "✓",
                        response: `We'll need to invest in operational tooling:

- **Observability**: Distributed tracing (Jaeger/Zipkin), centralized logging, service dashboards
- **Resilience**: Circuit breakers, retries with backoff, bulkheads
- **Deployment**: Blue-green deployments, feature flags for safe rollouts
- **Testing**: Contract testing between services

This is significant investment, which is why I'd start with just one extracted service.`,
                        why_this_level: "Good awareness of operational needs but missing organizational readiness.",
                        strengths: [
                            "Identifies key operational requirements",
                            "Mentions contract testing",
                            "Acknowledges investment required"
                        ],
                        what_is_missing: "Who will build and maintain this? What's the on-call impact? How do we debug production issues?"
                    },
                    {
                        level: "best" as const,
                        icon: "⭐",
                        response: `Microservices require paying a **"distributed systems tax"**. Here's what we need:

**Observability (Non-negotiable)**
- Distributed tracing with correlation IDs across all services
- Centralized logging with structured format
- Service-level dashboards showing latency percentiles, error rates, throughput
- Dependency maps showing service relationships

**Resilience Patterns**
- Circuit breakers to prevent cascade failures
- Timeouts and retries with exponential backoff
- Graceful degradation (what happens when Billing is down?)

**Organizational Readiness**
- On-call rotation changes: Who gets paged for cross-service issues?
- Runbooks for common failure modes
- Chaos engineering to verify resilience (start simple: "what if Redis is slow?")

**Debugging Production**
- Before extracting, I'd ensure we can answer: "Why was request X slow?"
- This requires request-level tracing, not just service-level metrics

**My recommendation**: Don't extract until we have basic observability in the monolith. If we can't debug the monolith, we definitely can't debug 6 services.`,
                        why_this_level: "Comprehensive operational planning including organizational readiness and prerequisites.",
                        strengths: [
                            "Identifies observability as prerequisite, not afterthought",
                            "Considers organizational impact (on-call, runbooks)",
                            "Practical advice: debug monolith first",
                            "Mentions chaos engineering for validation"
                        ],
                        principal_engineer_signals: [
                            "Thinks about organizational readiness, not just technical readiness",
                            "Sets prerequisites before allowing extraction",
                            "Considers the debugging experience"
                        ]
                    }
                ]
            },
            key_takeaways: [
                "Microservices require significant operational investment—budget for it",
                "Observability is a prerequisite, not an afterthought",
                "If you can't debug the monolith, you can't debug microservices"
            ]
        }
    ],
    interview_simulation: {
        title: "Curveball: The CTO Insists",
        description: "The interviewer tests how you handle pushback from leadership.",
        scenario: {
            interviewer_question: "The CTO has already committed to the board that we'll have microservices in 6 months. How do you handle this?",
            pause_prompt: "How do you balance technical judgment with organizational constraints?",
            comparison_table: {
                criterion: "Handling Leadership Pushback",
                responses: [
                    {
                        level: "bad" as const,
                        icon: "❌",
                        response: "If the CTO has decided, then we need to execute. I'll create a project plan to split all 6 services in 6 months. We'll need to stop feature work temporarily.",
                        why_this_level: "Abandons technical judgment and doesn't advocate for a better approach.",
                        red_flags: [
                            "Complete capitulation without negotiation",
                            "Stopping feature work is rarely acceptable",
                            "6 services in 6 months is extremely aggressive"
                        ]
                    },
                    {
                        level: "good" as const,
                        icon: "✓",
                        response: "I'd push back respectfully by presenting the risks. If the CTO still insists, I'd propose extracting 1-2 services in 6 months instead of all 6, and ensure we have proper observability first.",
                        why_this_level: "Good negotiation but missing the reframe that could satisfy both parties.",
                        strengths: [
                            "Advocates for reduced scope",
                            "Identifies observability as prerequisite"
                        ],
                        what_is_missing: "How do you make the CTO successful while managing risk? What's the narrative for the board?"
                    },
                    {
                        level: "best" as const,
                        icon: "⭐",
                        response: `I'd have a direct conversation with the CTO to understand the underlying goal. "Microservices in 6 months" is probably a proxy for "faster delivery velocity" or "improved reliability."

**My approach:**

1. **Reframe the commitment**: Propose to the board: "We're modernizing our architecture to support 10x growth." This is true and doesn't lock us into a specific implementation.

2. **Deliver visible wins**: In 6 months, we can absolutely have:
   - Modular architecture with enforced boundaries
   - 1-2 extracted services (Notifications, maybe Billing)
   - 5x faster CI/CD
   - Clear roadmap for future extractions

3. **Manage expectations**: Explain to the CTO that extracting all 6 services in 6 months would likely *decrease* velocity due to the learning curve.

4. **Align incentives**: Show how the incremental approach actually gets to the same destination with lower risk.

If the CTO still insists on all 6 services, I'd document my concerns, propose a phased approach within the 6-month window, and ensure we have rollback plans for each extraction.`,
                        why_this_level: "Finds a path that satisfies business constraints while managing technical risk.",
                        strengths: [
                            "Seeks to understand underlying goal",
                            "Reframes the commitment constructively",
                            "Proposes concrete deliverables",
                            "Documents disagreement professionally"
                        ],
                        principal_engineer_signals: [
                            "Navigates organizational dynamics skillfully",
                            "Finds win-win solutions",
                            "Knows when to disagree and commit"
                        ]
                    }
                ]
            }
        },
        key_takeaways: [
            "Understand the underlying goal behind technical mandates",
            "Reframe constraints rather than fighting them directly",
            "Document disagreements professionally, then commit to the decision"
        ]
    },
    summary: {
        critical_concepts_covered: [
            "Monolith vs Microservices tradeoffs",
            "Strangler Fig migration pattern",
            "Modular Monolith as intermediate step",
            "Conway's Law and organizational design",
            "Distributed systems operational complexity"
        ],
        patterns_demonstrated: [
            "Strangler Fig Pattern",
            "Anti-Corruption Layer",
            "Modular Monolith",
            "Dual-write migration",
            "Circuit breaker pattern"
        ],
        what_made_responses_best_level: [
            "Questioning whether microservices solve the actual problems",
            "Proposing evolutionary architecture instead of big bang",
            "Providing decision frameworks for when to extract",
            "Considering organizational readiness alongside technical readiness",
            "Navigating leadership constraints constructively"
        ]
    },
    reflection_prompts: {
        self_assessment: [
            "Did I question whether microservices actually solve the stated problems?",
            "Could I explain the operational costs of distributed systems?",
            "Did I propose an incremental migration strategy?",
            "Did I consider organizational dynamics (Conway's Law, team structure)?"
        ],
        practice_next: [
            "Design a database sharding strategy for a growing application",
            "Design a feature flag system for safe deployments",
            "Design an observability platform for microservices"
        ]
    }
};

export default function Scenario2() {
    return (
        <InterviewScenario
            slug="sample-scenario-2"
            scenario={scenarioData}
            theme="architecture"
            problemType="SYSTEM_DESIGN"
            focusArea="Architecture Tradeoffs"
            generatedAt={new Date("2026-01-16")}
        />
    );
}
