import DesignProblem from '@/components/DesignProblem';

export default function Scenario2() {
    return (
        <DesignProblem
            id="scenario-2"
            title="Microservices vs Monolith: The Split"
            category="Tradeoffs & Engineering Decisions"
            difficulty="Senior"
            estimatedTime="30 min"
            summary="Decide whether to break a monolithic Rails application into microservices for a rapidly scaling startup."
            context={`You are a Principal Engineer at a SaaS startup that has found product-market fit. The engineering team has grown from 10 to 50 engineers in the last year.

Current Architecture:
- Single monolithic Ruby on Rails application
- Postgres database (getting large, 2TB+)
- Redis for caching and background jobs (Sidekiq)
- Deployed on Kubernetes

The Problem:
- Deployments are slow (20+ minutes) and often break unrelated features
- Tests take 45 minutes to run in CI
- Different teams are stepping on each other's toes
- The database is becoming a bottleneck for some write-heavy features

The CTO is pushing to "move to microservices" to solve these velocity issues. She wants to split the app into 5-6 services immediately (Auth, Billing, Users, Notifications, Reporting, Core App).`}
            question="Do you agree with the CTO's plan? If yes, how would you execute it? If no, what would you propose instead? Walk me through your decision-making process."
            guidingQuestions={[
                "What are the actual bottlenecks (technical vs. organizational)?",
                "What is the operational cost of moving to microservices?",
                "Are there intermediate steps between monolith and microservices?",
                "How will you handle shared data and distributed transactions?",
                "How does team structure influence your architectural choice (Conway's Law)?"
            ]}
            pitfalls={[
                "Blindly agreeing to microservices without analyzing the costs",
                "Proposing a 'big bang' rewrite instead of incremental migration",
                "Ignoring the operational complexity (observability, deployment, networking)",
                "Not addressing the database coupling issue",
                "Failing to consider organizational solutions (modular monolith)"
            ]}
            answers={[
                {
                    type: 'bad',
                    title: 'Bad Answer (Weak Signal)',
                    content: `Yes, I agree with the CTO. Monoliths don't scale, so microservices are the natural next step. We should split the codebase by domain immediately.

I'd start by creating separate repos for Auth, Billing, and Users. We'll set up gRPC for communication between them to be fast. Each service will have its own database to ensure decoupling.

We can put a team on each service to speed up development. This will solve the deployment slowness because each team can deploy independently. To migrate, we'll just move the code and point the new services to the new databases.`,
                    diagram: `graph TD
    Client --> API_Gateway
    API_Gateway --> Auth[Auth Service]
    API_Gateway --> Billing[Billing Service]
    API_Gateway --> Users[Users Service]
    API_Gateway --> Core[Core App]
    
    Auth --> AuthDB[(Auth DB)]
    Billing --> BillingDB[(Billing DB)]
    Users --> UsersDB[(Users DB)]
    Core --> CoreDB[(Core DB)]
    
    style Auth fill:#ffcccc,stroke:#ff0000
    style Billing fill:#ffcccc,stroke:#ff0000
    style Users fill:#ffcccc,stroke:#ff0000`,
                    diagramTitle: "Big Bang Microservices (High Risk)",
                    analysis: `This answer is a classic 'resume-driven development' trap and raises major red flags:

**Red Flags:**
- **Big Bang Rewrite:** Proposing a simultaneous split is a recipe for disaster. It stops feature work and rarely succeeds.
- **Ignores Complexity:** Doesn't mention the massive operational overhead (tracing, circuit breakers, eventual consistency) required for gRPC/distributed systems.
- **Data Migration Naivety:** "Just move the code and point to new databases" ignores the difficulty of untangling shared data and foreign keys.
- **No Problem Analysis:** Accepts the hypothesis (microservices solve velocity) without validating if modularization could solve it cheaper.`
                },
                {
                    type: 'good',
                    title: 'Good Answer (Senior Signal)',
                    content: `I would caution against a full split immediately. Moving from a monolith to 6 microservices is a massive jump in complexity that could actually *slow down* the team further due to 'distributed monolith' issues.

Instead, I'd propose a **Modular Monolith** approach first:
1. **Analyze Boundaries:** Identify the seams in the code (Auth and Billing are usually good candidates for extraction).
2. **Enforce Boundaries:** Use tools like 'packwerk' (for Rails) to enforce module boundaries within the monolith. Stop allowing cross-module database joins.
3. **Extract One Service:** Pick *one* non-critical domain (e.g., Notifications) to extract first as a pilot.
4. **Optimize the Monolith:** Fix the CI/CD pipeline. 45 min tests suggest we need parallelization or better test hygiene, not necessarily microservices.

If we proved the pilot works and we still have velocity issues, then we can extract Billing or Auth.`,
                    diagram: `graph TD
    subgraph Monolith [Modular Monolith]
      Auth[Auth Module]
      Billing[Billing Module]
      Core[Core Module]
    end
    
    Auth -.->|Enforced Boundary| Billing
    Billing -.->|Enforced Boundary| Core
    
    Notifications[Notification Service]
    
    Monolith --> Notifications
    
    style Monolith fill:#e6f3ff,stroke:#0066cc
    style Notifications fill:#fff4e6,stroke:#ff9900`,
                    diagramTitle: "Modular Monolith + Pilot Service",
                    analysis: `This answer is pragmatic and shows senior-level maturity:

**Strengths:**
- **Risk Aversion:** Correctly identifies the risks of distributed systems.
- **Root Cause Analysis:** Suggests fixing CI/CD directly rather than re-architecting to fix it.
- **Incremental Approach:** "Modular Monolith" is often the right middle step.
- **Pilot Strategy:** Testing the waters with a non-critical service reduces blast radius.`
                },
                {
                    type: 'best',
                    title: 'Best Answer (Principal Signal)',
                    content: `My advice to the CTO would be: **"Adopt an evolutionary architecture, not a revolution."** The goal is velocity, not microservices. Microservices are a means, not an end, and they come with a "microservices premium" (latency, ops complexity, consistency challenges).

**My Strategic Plan:**

**Step 1: Stabilize & Decouple (Weeks 1-4)**
- **CI/CD Optimization:** Parallelize CI to drop build times from 45m to 10m. This buys us immediate goodwill and velocity.
- **Database Hygiene:** Identify cross-domain joins. Start refactoring code to treat modules as logical services (Modular Monolith).

**Step 2: The "Strangler Fig" Pattern (Months 2-6)**
- Don't rewrite. Identify the most decoupled, high-churn context (likely **Billing** or **Notifications**).
- Extract *only* that service.
- **Anti-Corruption Layer:** Build an interface in the monolith to talk to the new service so usage is transparent.
- **Dual Write/Read:** Migrate data carefully using double-writes before cutting over.

**Step 3: Team Reorganization (Conway's Law)**
- Align teams to these boundaries ("Billing Team," "Core Product Team").
- Give them ownership of their module/service *and* its deployment pipeline.

**Decision Criteria for Future Splits:**
Only extract a service if:
1. It scales independently (e.g., high read/write ratio difference).
2. It has a significantly different deployment lifecycle.
3. The team size forces it (communication overhead > coding time).`,
                    diagram: `graph TD
    Client --> Router[Router / Gateway]
    
    subgraph Legacy [Legacy Path]
      Monolith[Monolith Core]
      MonolithDB[(Shared DB)]
    end
    
    subgraph New [New Service Path]
      Billing[Billing Service]
      BillingDB[(Billing DB)]
    end
    
    Router -->|New Billing Routes| Billing
    Router -->|All other traffic| Monolith
    
    Monolith -.->|Anti-Corruption Layer| Billing
    
    style Legacy fill:#f3f4f6,stroke:#9ca3af,stroke-dasharray: 5 5
    style New fill:#ecfdf5,stroke:#10b981`,
                    diagramTitle: "Strangler Fig Pattern Migration",
                    analysis: `This answer demonstrates principal-level leadership:

**Strategic Thinking:**
- **Business Alignment:** Focuses on the goal (velocity), not the tech.
- **Process vs. Architecture:** Identifies that CI/CD optimization gives faster ROI than re-architecting.
- **Migration Patterns:** explicitly uses "Strangler Fig" pattern for safe migration.
- **Organizational Design:** Incorporates Conway's Law and team structure into the technical plan.
- **Decision Framework:** Provides clear criteria for *when* to stop splitting, preventing over-engineering.`
                }
            ]}
            comparisonRows={[
                { aspect: 'Migration Risk', bad: 'Extreme (Big Bang)', good: 'Low (Incremental)', best: 'Managed (Strangler Fig)' },
                { aspect: 'Velocity Impact', bad: 'Negative (Halt feature work)', good: 'Neutral/Positive', best: 'High Positive (Quick wins first)' },
                { aspect: 'Operational Cost', bad: 'High (Immediate complexity)', good: 'Medium (One service)', best: 'Optimized (Just-in-time)' },
                { aspect: 'Data Integrity', bad: 'Low (Split brain likely)', good: 'High (Shared DB mostly)', best: 'High (Dual-write migration)' },
                { aspect: 'Key Focus', bad: 'The Technology', good: 'The Architecture', best: 'The Business Outcome' }
            ]}
            rubricItems={[
                'Challenges the premise (velocity != microservices)',
                'Proposes incremental migration (Strangler Fig, Modular Monolith)',
                'Identifies operational complexity costs',
                'Addresses data migration strategies',
                'Suggests fixing the CI/CD pipeline first',
                'Considers team structure (Conway\'s Law)',
                'Provides decision criteria for extraction'
            ]}
            keyTakeaways={[
                'Microservices pay a high "premium" in operational complexity. Only pay it if you need independent scaling or deployment.',
                'Modular Monolith is usually the right default for startups until scaling issues force a split.',
                'Fix the feedback loop (CI/CD) first. Often, "architecture" problems are actually "process" problems.',
                'Use the Strangler Fig pattern to migrate safely. Never do a Big Bang rewrite.',
                'Data migration is the hardest part. Plan for it early (dual writes, backfills).'
            ]}
            relatedChallenges={[
                { title: 'Designing a Rolling Deployment System', href: '/samples/scenario-1' },
                { title: 'Database Sharding Strategy', href: '/samples/scenario-3' }
            ]}
        />
    );
}
