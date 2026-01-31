import DesignProblem from '@/components/DesignProblem';

export default function Scenario3() {
    return (
        <DesignProblem
            id="scenario-3"
            title="Debugging an API Performance Crisis"
            category="Scaling & Performance"
            difficulty="Principal"
            estimatedTime="45 min"
            summary="Lead the investigation and resolution of a critical production incident where P95 latency spiked 40x after a deployment."
            context={`You're interviewing for a Principal Engineer role at a fintech company. During the interview, they present you with a real production incident they recently experienced.

The Situation:
- A critical API endpoint (/api/transactions) suddenly started experiencing severe performance degradation
- P95 latency went from 200ms to 8 seconds over the course of 2 hours
- The endpoint serves transaction history for mobile and web clients
- Traffic volume is normal (no spike detected)
- The degradation started after a routine deployment
- The on-call team rolled back the deployment, but performance didn't improve
- Database CPU is at 40% (normal), application servers at 60% (normal)
- No errors in logs, just slow responses

The deployment that was rolled back included:
- A new feature to show transaction categories
- A bug fix for date filtering
- A dependency update (Rails 6.1 → 7.0)
- Database migration to add an index on transaction_category

The team is stuck. They've rolled back, but the problem persists. Users are complaining, and the business is losing money.`}
            question="How would you approach debugging this performance issue? Walk me through your process, what you'd investigate, and how you'd identify the root cause."
            guidingQuestions={[
                "What does 'rollback didn't fix it' imply about the root cause?",
                "If CPU/Memory are normal but latency is high, what resource are we waiting on?",
                "How could a database migration leave residual effects after a code rollback?",
                "What is your communication strategy while the system is burning?",
                "How do you validate a fix without risking further outage?"
            ]}
            pitfalls={[
                "Guessing random root causes without looking at evidence",
                "Ignoring the 'rollback didn't fix it' clue",
                "Focusing only on code (N+1 queries) rather than state (DB stats, locks)",
                "Forgetting to communicate with stakeholders during the incident",
                "Proposing a fix without a validation or rollback plan"
            ]}
            answers={[
                {
                    type: 'bad',
                    title: 'Bad Answer (Weak Signal)',
                    content: `I'd start by checking the database since that's usually the bottleneck. I'd look at slow query logs to see which queries are taking the longest.

Then I'd check if the new index is being used. Maybe the query planner isn't using it, so I'd run EXPLAIN on the queries to see the execution plan.

If the database looks fine, I'd check the application code for N+1 queries or inefficient loops. I'd also check if there's a memory leak causing garbage collection pressure.

I'd also look at external dependencies—maybe a third-party API is slow. I'd check the network latency and see if any external calls are timing out.`,
                    diagram: `graph TD
    Start[Start Investigation] --> DB{Check Database?}
    DB -->|Yes| SlowLogs[Check Slow Logs]
    DB -->|No| App{Check App?}
    SlowLogs --> Index[Check Index Usage]
    App --> N1[Check N+1 Queries]
    App --> Ext[Check External APIs]
    
    style Start fill:#ffcccc,stroke:#ff0000`,
                    diagramTitle: "Shotgun Debugging Approach",
                    analysis: `This answer shows a scattered approach and raises red flags:

**Red Flags:**
- **No Hypothesis:** It's a "checklist" approach rather than a scientific method. They're just guessing.
- **Ignored Critical Clue:** They missed that the rollback didn't work. Checking "N+1 queries" in the code makes no sense if we're running the *old* code again.
- **No Priorities:** Checking third-party APIs is valid, but unlikely given the context (DB migration).
- **No Incident Management:** No mention of mitigating user impact (caching, circuit breakers) while debugging.`
                },
                {
                    type: 'good',
                    title: 'Good Answer (Senior Signal)',
                    content: `The key clue here is that the rollback didn't fix the issue. This tells me the root cause is likely not in the application code that was deployed, but rather a side effect that persisted—likely a database state change.

**My Investigation Process:**

**1. Form a Hypothesis**
Given that a database migration added an index, my primary hypothesis is: the migration triggered a change in query plans (statistics update) or caused table bloat/locking that persisted.

**2. Validate the Hypothesis**
- **Query Plans:** Run \`EXPLAIN ANALYZE\` on the slow query. Is it doing a sequential scan instead of an index scan? 
- **Stats:** Check \`pg_stat_user_tables\` for last_analyze time.
- **Locks:** Check \`pg_locks\` for any lingering locks.

**3. Remediation**
If the stats are stale (causing bad plans), I'd run \`ANALYZE\` on the table. If it's a bad index, I'd drop it.`,
                    diagram: `graph TD
    Obs[Observation: Rollback Failed] --> Hyp[Hypothesis: Persistent State Change]
    Hyp --> Val1[Check DB Stats/bloat]
    Hyp --> Val2[Check Query Plans]
    
    Val2 -->|Found Bad Plan| Fix1[Run ANALYZE]
    Val2 -->|Found Bad Index| Fix2[Drop Index]
    
    style Obs fill:#fff4e6,stroke:#ff9900
    style Hyp fill:#e6f3ff,stroke:#0066cc`,
                    diagramTitle: "Hypothesis-Driven Debugging",
                    analysis: `This answer demonstrates solid senior-level debugging:

**Strengths:**
- **Deductive Reasoning:** Correctly interprets the "rollback failed" clue.
- **Database Internals:** Understands how migrations affect planner statistics.
- **Structured Approach:** Hypothesis → Validation → Fix.
- **Specifics:** Knows the specific charts/tables to check (pg_stat_user_tables).`
                },
                {
                    type: 'best',
                    title: 'Best Answer (Principal Signal)',
                    content: `This is an active production incident. My goals are: 1) Mitigate Impact, 2) Identify Root Cause, 3) Prevent Recurrence.

**Phase 1: Incident Command & Mitigation (First 10 mins)**
- **Communicate:** "Investigating DB performance issue. ETA 30m."
- **Mitigate:** Can we enable a read-replica fallback? Can we aggressive cache this endpoint? If not, can we degrade gracefully (show cached/stale data)?

**Phase 2: Root Cause Analysis**
**Clue:** Rollback failed + Migration involved index.
**Hypothesis:** The migration invalidated table statistics, causing Postgres to choose a bad query plan (e.g., Seq Scan) even after rollback. Or the new index is "poisoning" the planner.

**Validation:**
\` EXPLAIN ANALYZE SELECT ... \`
Look for: Usage of the *new* index (if it wasn't dropped) or a Seq Scan.

**Likely Fix:**
Postgres likely hasn't auto-analyzed the table yet.
Action: Run \`ANALYZE transactions;\` immediately.

**Phase 3: Prevention**
- **Process:** Add \`ANALYZE\` steps to migrations on large tables.
- **Observability:** Alert on query plan flips or P95 latency deviations, not just CPU.`,
                    diagram: `graph TD
    subgraph Incident_Response [Incident Response]
      Roles[Assign Incident Cmdr]
      Comms[Update Status Page]
      Mitigate[Enable Caching / Degradation]
    end
    
    subgraph Technical_Invest [Technical Investigation]
      Clue[Migration + Rollback Fail] --> Hyp[Hypothesis: Stale Stats]
      Hyp --> Verify[EXPLAIN ANALYZE]
      Verify --> Fix[ANALYZE Table]
    end
    
    Incident_Response --> Technical_Invest
    
    style Incident_Response fill:#f3e8ff,stroke:#7c3aed
    style Technical_Invest fill:#ecfdf5,stroke:#10b981`,
                    diagramTitle: "Incident Command + Technical Deep Dive",
                    analysis: `This answer demonstrates principal-level maturity:

**Strategic Thinking:**
- **Incident Command:** Prioritizes organizational control (communication, roles) before technical debugging.
- **Mitigation First:** Focuses on stopping the bleeding for users first.
- **Deep Technical Insight:** Identifies the subtle "stale statistics" issue that often plagues Postgres migrations.
- **Process Improvement:** Suggests concrete changes to preventing this class of error (auto-analyze).`
                }
            ]}
            comparisonRows={[
                { aspect: 'Process', bad: 'Ad-hoc / Random', good: 'Systematic (Hypothesis)', best: 'Incident Command Model' },
                { aspect: 'Priorities', bad: 'Finding the bug', good: 'Finding the root cause', best: 'Restoring service first' },
                { aspect: 'Technical Depth', bad: 'Surface (N+1, Logs)', good: 'Deep (Planner, Stats)', best: 'Expert (Planner internals)' },
                { aspect: 'Communication', bad: 'None / Ad-hoc', good: 'Technical updates', best: 'Stakeholder management' },
                { aspect: 'Prevention', bad: 'Fix the bug', good: 'Add monitoring', best: 'Improve migration process' }
            ]}
            rubricItems={[
                'Prioritizes restoring service/mitigation over debugging',
                'Demonstrates effective incident communication',
                'Forms hypotheses based on evidence (rollback clue)',
                'Understands database internals (stats, query planner)',
                'Have a validation plan before applying fixes',
                'Includes prevention/post-mortem steps'
            ]}
            keyTakeaways={[
                'In production incidents, "Fixing" != "Debugging". Restoration is priority #1.',
                'If a rollback doesn\'t fix it, it\'s State (DB/Cache/Config), not Code.',
                'Postgres Query Planners are sensitive to statistics changes. Always ANALYZE after large migrations.',
                'Incidents are organizational tests as much as technical ones. Clear communication is a required skill.',
                'Hypothesis-driven debugging saves time. Don\'t shotgun debug.'
            ]}
            relatedChallenges={[
                { title: 'Designing a Rate Limiter', href: '/samples/scenario-1' },
                { title: 'Optimizing Database Locks', href: '/samples/scenario-2' }
            ]}
        />
    );
}
