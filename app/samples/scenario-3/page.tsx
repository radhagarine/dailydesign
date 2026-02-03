import InterviewScenario from '@/components/InterviewScenario';

const scenarioData = {
    metadata: {
        difficulty: "Principal",
        estimated_time_minutes: 45,
        topics: ["Incident Response", "Database Performance", "Query Optimization", "Lock Contention", "Connection Pool Management", "Production Debugging", "Postgres Internals"],
        generated_date: "2026-01-17"
    },
    problem: {
        title: "Debugging an API Performance Crisis",
        statement: "Lead the investigation and resolution of a critical production incident where P95 latency spiked 40x after a deployment.",
        context: `You're interviewing for a Principal Engineer role at a fintech company. During the interview, they present you with a real production incident they recently experienced.

**The Situation:**
- A critical API endpoint (/api/transactions) suddenly started experiencing severe performance degradation
- P95 latency went from 200ms to 8 seconds, degrading gradually over 2 hours as the connection pool saturated
- The endpoint serves transaction history for mobile and web clients (queries by user_id with optional category filters)
- Traffic volume is normal (no spike detected)
- The degradation started after a routine deployment
- The on-call team rolled back the **application code**, but the database migration was NOT rolled back (the new index remains)
- Database CPU is at 40% (normal), but **I/O wait is elevated at 35%** and **active connections are at 95% of pool capacity**
- No errors in logs, just slow responses (requests are queuing, not failing)

**The deployment that was rolled back included:**
- A new feature to filter/display transactions by category (adds a WHERE clause on transaction_category)
- A bug fix for date filtering (changed date range query logic)
- A dependency update (Rails 6.1 → 7.0) - a major version upgrade
- Database migration to add an index on transaction_category (on a 2TB+ transactions table)

**Critical Detail:** The index creation on the 2TB table took 45 minutes to complete during the deployment window. The new feature's queries use this index via the category filter.

The team is stuck. They've rolled back the code, but the problem persists. Users are complaining, and the business is losing money.`,
        pause_prompt: "The key clue here is that the rollback didn't fix the issue. What does this tell you about where to look?"
    },
    framework_steps: [
        {
            step_number: 1,
            step_name: "Incident Assessment",
            time_allocation: "5 min",
            description: "Before diving into technical debugging, establish incident command and assess the situation.",
            pause_prompt: "What's your first action when you arrive at this incident?",
            comparison_table: {
                criterion: "Initial Response",
                interviewer_question: "You've just been pulled into this incident. What do you do first?",
                responses: [
                    {
                        level: "bad" as const,
                        icon: "❌",
                        response: `I'd start by checking the database since that's usually the bottleneck. I'd look at slow query logs to see which queries are taking the longest.

Then I'd check if the new index is being used. Maybe the query planner isn't using it, so I'd run EXPLAIN on the queries to see the execution plan.`,
                        why_this_level: "Jumps straight into debugging without establishing context or mitigating impact.",
                        red_flags: [
                            "No incident command structure",
                            "No communication to stakeholders",
                            "No attempt to mitigate user impact first",
                            "Shotgun debugging approach"
                        ]
                    },
                    {
                        level: "good" as const,
                        icon: "✓",
                        response: `First, I'd gather context: Who's already working on this? What have they tried? What's the business impact?

Then I'd start systematic debugging based on the clues. The fact that rollback didn't fix it tells me we're looking at a state change, not a code change—likely database-related.`,
                        why_this_level: "Good context gathering but missing incident structure and mitigation.",
                        strengths: [
                            "Gathers context before acting",
                            "Identifies the 'rollback didn't fix it' clue",
                            "Recognizes state vs. code distinction"
                        ],
                        what_is_missing: "No stakeholder communication, no mitigation strategy, no incident command structure."
                    },
                    {
                        level: "best" as const,
                        icon: "⭐",
                        response: `This is an active production incident. My first actions are about **control**, not **debugging**:

**Immediate Actions (First 5 minutes):**

1. **Establish Incident Command**
   - Who's the current incident commander? If no one, I'll take that role.
   - Who's working on what? Avoid duplicate effort.

2. **Communicate**
   - Update status page: "We're investigating degraded performance on transaction history"
   - Set expectations: "ETA for update: 30 minutes"

3. **Assess Mitigation Options**
   - Can we enable caching on this endpoint temporarily?
   - Can we serve stale data with a warning?
   - Can we rate-limit to protect the database?

**Only after mitigation is in place** do I shift to root cause analysis.`,
                        why_this_level: "Prioritizes incident management and mitigation before technical debugging.",
                        strengths: [
                            "Establishes incident command structure",
                            "Communicates with stakeholders immediately",
                            "Seeks mitigation before debugging",
                            "Sets clear expectations"
                        ],
                        principal_engineer_signals: [
                            "Understands incidents are organizational, not just technical",
                            "Prioritizes user impact over finding the bug",
                            "Takes leadership naturally"
                        ]
                    }
                ]
            },
            key_takeaways: [
                "In production incidents, restoration is priority #1, debugging is #2",
                "Establish incident command before diving into technical work",
                "Communicate early and set expectations"
            ]
        },
        {
            step_number: 2,
            step_name: "Root Cause Investigation",
            time_allocation: "20 min",
            description: "Use the available clues to form and test hypotheses about the root cause. Multiple factors could be at play—systematically investigate each.",
            pause_prompt: "The code rollback didn't fix it, but the database migration wasn't rolled back. What are your hypotheses?",
            comparison_table: {
                criterion: "Debugging Approach",
                interviewer_question: "What's your hypothesis for why the rollback didn't fix the performance issue?",
                responses: [
                    {
                        level: "bad" as const,
                        icon: "❌",
                        response: `Maybe the rollback didn't complete properly. I'd check if we're actually running the old code.

If that's fine, I'd check for N+1 queries or inefficient loops. I'd also check if there's a memory leak causing garbage collection pressure.

I'd also look at external dependencies—maybe a third-party API is slow.`,
                        why_this_level: "Ignores the key clues and suggests checking things that don't explain the symptoms.",
                        red_flags: [
                            "Doesn't engage with the 'code rollback but not migration' clue",
                            "Checking N+1 queries makes no sense if we're running old code",
                            "Ignores the elevated I/O wait and connection pool saturation",
                            "Random guessing instead of deduction"
                        ]
                    },
                    {
                        level: "good" as const,
                        icon: "✓",
                        response: `The key clue is that code rollback didn't fix it, but the migration wasn't rolled back. This tells me the root cause is **persistent state**, not application code.

**My Hypothesis:**
The database migration added an index on a 2TB table, which triggered Postgres to update table statistics. This may have caused the query planner to choose a different (worse) execution plan. Rolling back the code doesn't reset these statistics or remove the index.

**Validation:**
- Run \`EXPLAIN ANALYZE\` on the slow query
- Check if it's doing a sequential scan instead of index scan
- Check \`pg_stat_user_tables\` for last analyze time`,
                        why_this_level: "Good hypothesis formation but missing investigation of other deployment components.",
                        strengths: [
                            "Correctly interprets the 'code rollback but migration stayed' clue",
                            "Understands database statistics and query planner",
                            "Forms a specific, testable hypothesis"
                        ],
                        what_is_missing: "Doesn't investigate Rails 7.0 upgrade impact, date filtering bug fix, or check for lock contention. Doesn't explain the connection pool saturation."
                    },
                    {
                        level: "best" as const,
                        icon: "⭐",
                        response: `**Key Observations:**
- Code rolled back, but **migration wasn't** (index still exists)
- I/O wait elevated (35%) + connection pool at 95% = queries are waiting, not working
- Gradual 2-hour degradation suggests cascading effect (not instant breakage)

**Multiple Hypotheses to Investigate:**

**Hypothesis 1: Lock Contention from Index Creation**
The 45-minute index creation on a 2TB table may have created lock queue buildup. Even after completion, accumulated waiting queries can cascade.

**Check:**
\`\`\`sql
SELECT pid, state, wait_event_type, wait_event, query
FROM pg_stat_activity WHERE state != 'idle';

SELECT blocked.pid, blocked.query, blocking.pid, blocking.query
FROM pg_locks blocked_locks
JOIN pg_stat_activity blocked ON blocked.pid = blocked_locks.pid
JOIN pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
JOIN pg_stat_activity blocking ON blocking.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
\`\`\`

**Hypothesis 2: Query Plan Regression**
The new index may have poisoned the query planner. With stale statistics on a new index, Postgres might estimate wrong row counts.

**Check:**
\`\`\`sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM transactions WHERE user_id = 123 AND transaction_category = 'groceries';
\`\`\`
Look for: actual vs estimated rows mismatch, sequential scans on large tables.

**Hypothesis 3: Rails 7.0 Query Generation Change**
Rails 7.0 is a major upgrade. Even with code rollback, if configuration or middleware changed, query generation might differ. **But wait—if we rolled back, we should be on Rails 6.1 again.** Verify with \`Rails.version\` in console.

**Hypothesis 4: Date Filtering Bug Fix Side Effects**
The "bug fix" might have changed query patterns. **But this was rolled back.** Still worth checking if cached query plans from the new code persist.

**Most Likely Scenario:**
The elevated I/O wait + connection pool saturation points to **lock contention cascading into connection exhaustion**. The index creation locked tables, queries queued up, connection pool filled, and even after index creation finished, the backlog persisted.

**Remediation Order:**
1. First: Check \`pg_stat_activity\` for blocked queries
2. If locks found: Identify and terminate blocking sessions carefully
3. If no locks: Run \`ANALYZE transactions;\` to refresh statistics
4. Monitor connection pool—may need to bounce app servers to clear stale connections`,
                        why_this_level: "Systematically investigates all deployment components, connects symptoms (I/O wait, connection pool) to hypotheses, and provides prioritized remediation.",
                        strengths: [
                            "Investigates ALL deployment components, not just the index",
                            "Connects I/O wait and connection pool to lock contention hypothesis",
                            "Explains the gradual 2-hour degradation mechanism",
                            "Provides prioritized remediation steps"
                        ],
                        principal_engineer_signals: [
                            "Considers multiple hypotheses before fixing",
                            "Explains WHY symptoms match the hypothesis",
                            "Addresses Rails upgrade even if unlikely",
                            "Understands cascading failure patterns"
                        ]
                    }
                ]
            },
            key_takeaways: [
                "If code rollback doesn't fix it, investigate persistent state (DB, cache, config)",
                "Connection pool saturation + I/O wait often indicates lock contention",
                "Investigate ALL changes in a deployment, not just the obvious ones",
                "Gradual degradation suggests cascading effects, not instant breakage"
            ]
        },
        {
            step_number: 3,
            step_name: "Resolution & Prevention",
            time_allocation: "15 min",
            description: "Apply the appropriate fix based on diagnosis and establish measures to prevent recurrence.",
            pause_prompt: "Based on your diagnosis, what's the fix? And how do you prevent this class of issue?",
            comparison_table: {
                criterion: "Prevention Strategy",
                interviewer_question: "You've identified the root cause. How do we fix it and prevent it from happening again?",
                responses: [
                    {
                        level: "bad" as const,
                        icon: "❌",
                        response: "We should add better monitoring to catch this sooner. I'd set up alerts for P95 latency so we know when things are slow.",
                        why_this_level: "Only addresses detection, not prevention. Doesn't provide a fix.",
                        red_flags: [
                            "Monitoring is reactive, not preventive",
                            "Doesn't actually fix the current issue",
                            "Will have the same issue next time"
                        ]
                    },
                    {
                        level: "good" as const,
                        icon: "✓",
                        response: `**Immediate Fix:**
Run \`ANALYZE transactions;\` to refresh statistics, then monitor for improvement.

**Prevention:**
1. **Run ANALYZE after index creation** on large tables
2. **Test migrations on production-sized data** in staging
3. **Add monitoring** for query plan changes or latency spikes
4. **Document this incident** so future engineers know the pattern`,
                        why_this_level: "Provides a fix but assumes statistics was the root cause. Missing practical constraints.",
                        strengths: [
                            "Has an immediate fix",
                            "Addresses the migration process",
                            "Documents for future reference"
                        ],
                        what_is_missing: "Doesn't address if lock contention was the cause. 'Test on production-sized data' is impractical with 2TB—needs more nuance."
                    },
                    {
                        level: "best" as const,
                        icon: "⭐",
                        response: `**Resolution Depends on Diagnosis:**

**Path A: If Lock Contention (connection pool saturated, queries blocked):**
1. Identify blocking sessions: \`SELECT * FROM pg_stat_activity WHERE wait_event_type = 'Lock'\`
2. Terminate long-running blocking queries carefully (check they're safe to kill)
3. Bounce app servers to clear stale connections from the pool
4. Monitor connection pool recovery

**Path B: If Query Plan Regression (bad statistics, wrong index choice):**
1. Run \`ANALYZE transactions;\` to refresh statistics
2. Verify plan improvement with EXPLAIN ANALYZE
3. If the new index is causing bad plans, consider: \`DROP INDEX idx_transaction_category;\`
4. Re-create with \`CREATE INDEX CONCURRENTLY\` during low-traffic window

**Prevention Strategy:**

1. **Migration Safety for Large Tables (>100M rows):**
   - Always use \`CREATE INDEX CONCURRENTLY\` (avoids blocking writes)
   - Run ANALYZE immediately after index creation
   - Include these in migration checklist—PR cannot merge without answering

2. **Connection Pool Monitoring:**
   - Alert at 80% pool utilization, page at 95%
   - This incident would have been caught 30 minutes earlier

3. **Query Plan Regression Detection:**
   - Use \`pg_stat_statements\` to track mean_exec_time for critical queries
   - Alert if mean_exec_time increases >3x from baseline
   - Consider tools like pganalyze or Datadog for automated plan tracking

4. **Major Dependency Upgrades (Rails 6→7) Require:**
   - Separate deployment from other changes
   - Query audit: compare generated SQL before/after
   - Don't bundle with migrations or feature changes

5. **Realistic Testing (Acknowledging 2TB Constraint):**
   - Full 2TB clone is expensive/slow, so use targeted approach:
   - Clone the specific table to staging with representative data distribution
   - Test critical query plans against the index
   - Use \`EXPLAIN\` without \`ANALYZE\` to check plans without full execution

**Post-Incident:**
- Blameless post-mortem with timeline
- Update runbook: "Large table migration checklist"
- Add connection pool dashboard to incident response screens`,
                        why_this_level: "Provides two resolution paths based on diagnosis, acknowledges practical constraints, and gives actionable prevention.",
                        strengths: [
                            "Two resolution paths matching the two main hypotheses",
                            "Acknowledges 2TB testing constraint with practical alternative",
                            "Addresses connection pool monitoring (would have caught this earlier)",
                            "Separates major dependency upgrades from other changes"
                        ],
                        principal_engineer_signals: [
                            "Matches fix to diagnosis, not one-size-fits-all",
                            "Acknowledges real-world constraints (2TB testing)",
                            "Addresses multiple failure modes systematically",
                            "Prevents future bundled high-risk deployments"
                        ]
                    }
                ]
            },
            other_failure_scenarios: [
                {
                    scenario: "Lock contention cascade",
                    impact: "Long-running queries block others, connection pool fills, gradual degradation over hours",
                    mitigation: "Use CONCURRENTLY for indexes, monitor active connections, set statement_timeout"
                },
                {
                    scenario: "Index bloat after heavy deletes",
                    impact: "Index scans become slower than sequential scans",
                    mitigation: "Schedule REINDEX for tables with high churn"
                },
                {
                    scenario: "Connection pool exhaustion",
                    impact: "Requests queue waiting for connections, latency spikes with normal CPU",
                    mitigation: "Monitor connection pool utilization, alert at 80%, investigate I/O wait correlation"
                }
            ],
            key_takeaways: [
                "Match your fix to your diagnosis—don't apply generic solutions",
                "Large table migrations need special handling (CONCURRENTLY, ANALYZE, monitoring)",
                "Connection pool monitoring catches cascading failures earlier",
                "Don't bundle major dependency upgrades with other risky changes"
            ]
        }
    ],
    interview_simulation: {
        title: "Curveball: It's Happening Again",
        description: "The interviewer tests your ability to handle compounding incidents.",
        scenario: {
            interviewer_question: "While you're fixing this, another alert fires: the Billing service is now timing out. What do you do?",
            pause_prompt: "How do you handle multiple simultaneous incidents? What's your prioritization framework?",
            comparison_table: {
                criterion: "Handling Multiple Incidents",
                responses: [
                    {
                        level: "bad" as const,
                        icon: "❌",
                        response: "I'd quickly check if Billing is related to the same issue. If it's also hitting the transactions table, it's probably the same root cause. I'd try to fix both at once.",
                        why_this_level: "Assumes correlation without evidence and tries to do too much at once.",
                        red_flags: [
                            "Assumes incidents are related without checking",
                            "Trying to handle both alone is a recipe for mistakes",
                            "No delegation or prioritization"
                        ]
                    },
                    {
                        level: "good" as const,
                        icon: "✓",
                        response: `First, I'd check if they're related—does Billing depend on the transactions endpoint? If yes, fixing our current issue might fix both.

If they're independent, I'd ask: Which has higher business impact? Billing failures might block revenue, so that could be higher priority. I'd communicate the situation to stakeholders and ask for help triaging.`,
                        why_this_level: "Good prioritization thinking but missing delegation and incident structure.",
                        strengths: [
                            "Checks for dependency/correlation",
                            "Considers business impact for prioritization",
                            "Asks for help"
                        ],
                        what_is_missing: "Doesn't establish parallel incident handling or clear delegation."
                    },
                    {
                        level: "best" as const,
                        icon: "⭐",
                        response: `Multiple simultaneous alerts require explicit incident management:

**Immediate Actions:**

1. **Don't context switch** - I stay on the current incident (transactions)
2. **Delegate** - Ask the on-call engineer or another senior to take point on Billing
3. **Check correlation** - Quick look: Does Billing call the transactions API? If yes, they might be the same incident.

**If Independent:**
- Two separate incident channels (transactions-incident, billing-incident)
- Assign incident commanders to each
- I'll provide 2-minute status updates to both but focus on one

**Prioritization Framework:**
- **Blast radius**: How many users affected?
- **Revenue impact**: Is money actively being lost?
- **Recovery difficulty**: Which is easier to mitigate?

**Communication:**
Update stakeholders: "We're now tracking two separate incidents. [Person A] is leading billing, I'm leading transactions. Will provide updates every 15 minutes on both."

**Key principle**: Depth beats breadth in incidents. Better to fix one thing well than thrash between two.`,
                        why_this_level: "Clear incident structure with delegation, prioritization framework, and communication.",
                        strengths: [
                            "Doesn't try to do everything alone",
                            "Clear prioritization framework",
                            "Establishes parallel incident handling",
                            "Explicit communication strategy"
                        ],
                        principal_engineer_signals: [
                            "Scales incident response through delegation",
                            "Prioritizes based on business impact",
                            "Maintains focus under pressure"
                        ]
                    }
                ]
            }
        },
        key_takeaways: [
            "Don't try to handle multiple incidents alone—delegate",
            "Check if incidents are correlated before assuming they're independent",
            "Depth beats breadth—better to fix one thing well than thrash between two"
        ]
    },
    summary: {
        critical_concepts_covered: [
            "Incident command structure",
            "Postgres query planner, statistics, and lock contention",
            "Multi-hypothesis debugging (investigating all deployment components)",
            "Mitigation vs. debugging prioritization",
            "Cascading failure patterns (locks → connection pool → latency)",
            "Major dependency upgrade risks (Rails 6→7)"
        ],
        patterns_demonstrated: [
            "Incident Command System",
            "Multi-hypothesis debugging with symptom correlation",
            "Query plan analysis and lock investigation",
            "Safe migration practices for large tables (CONCURRENTLY, ANALYZE)",
            "Connection pool monitoring as early warning system"
        ],
        what_made_responses_best_level: [
            "Prioritizing user impact and mitigation over debugging",
            "Investigating ALL deployment components, not just the obvious one",
            "Connecting symptoms (I/O wait, connection pool) to root cause hypotheses",
            "Providing two resolution paths based on diagnosis",
            "Acknowledging practical constraints (2TB testing challenge)"
        ]
    },
    reflection_prompts: {
        self_assessment: [
            "Did I prioritize mitigation before debugging?",
            "Did I investigate ALL components of the deployment (feature, bug fix, Rails upgrade, migration)?",
            "Could I explain why code rollback doesn't fix database state issues?",
            "Did I connect the symptoms (I/O wait, connection pool) to my hypotheses?",
            "Did I provide resolution paths for multiple possible root causes?"
        ],
        practice_next: [
            "Design a query performance monitoring system with plan regression detection",
            "Design a database migration safety framework for tables >100M rows",
            "Design an incident management system that handles multiple simultaneous incidents"
        ]
    }
};

export default function Scenario3() {
    return (
        <InterviewScenario
            slug="sample-scenario-3"
            scenario={scenarioData}
            theme="reliability"
            problemType="TACTICAL"
            focusArea="Incident Response"
            generatedAt={new Date("2026-01-17")}
        />
    );
}
