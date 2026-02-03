import InterviewScenario from '@/components/InterviewScenario';

const scenarioData = {
    metadata: {
        difficulty: "Principal",
        estimated_time_minutes: 45,
        topics: ["Incident Response", "Database Performance", "Query Optimization", "Production Debugging", "Postgres Internals"],
        generated_date: "2026-01-17"
    },
    problem: {
        title: "Debugging an API Performance Crisis",
        statement: "Lead the investigation and resolution of a critical production incident where P95 latency spiked 40x after a deployment.",
        context: `You're interviewing for a Principal Engineer role at a fintech company. During the interview, they present you with a real production incident they recently experienced.

**The Situation:**
- A critical API endpoint (/api/transactions) suddenly started experiencing severe performance degradation
- P95 latency went from 200ms to 8 seconds over the course of 2 hours
- The endpoint serves transaction history for mobile and web clients
- Traffic volume is normal (no spike detected)
- The degradation started after a routine deployment
- The on-call team rolled back the deployment, but performance didn't improve
- Database CPU is at 40% (normal), application servers at 60% (normal)
- No errors in logs, just slow responses

**The deployment that was rolled back included:**
- A new feature to show transaction categories
- A bug fix for date filtering
- A dependency update (Rails 6.1 → 7.0)
- Database migration to add an index on transaction_category

The team is stuck. They've rolled back, but the problem persists. Users are complaining, and the business is losing money.`,
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
            description: "Use the available clues to form and test hypotheses about the root cause.",
            pause_prompt: "The rollback didn't fix it. What does this tell you about where to look?",
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
                        why_this_level: "Ignores the key clue and suggests checking things that don't explain the symptoms.",
                        red_flags: [
                            "Doesn't engage with the 'rollback failed' clue",
                            "Checking N+1 queries makes no sense if we're running old code",
                            "No hypothesis formation, just a checklist",
                            "Random guessing instead of deduction"
                        ]
                    },
                    {
                        level: "good" as const,
                        icon: "✓",
                        response: `The key clue is that rollback didn't fix it. This tells me the root cause is **persistent state**, not code.

**My Hypothesis:**
The database migration added an index, which triggered Postgres to update table statistics. This may have caused the query planner to choose a different (worse) execution plan. Rolling back the code doesn't reset these statistics.

**Validation:**
- Run \`EXPLAIN ANALYZE\` on the slow query
- Check if it's doing a sequential scan instead of index scan
- Check \`pg_stat_user_tables\` for last analyze time`,
                        why_this_level: "Good hypothesis formation but missing remediation strategy and validation approach.",
                        strengths: [
                            "Correctly interprets the 'rollback failed' clue",
                            "Understands database statistics and query planner",
                            "Forms a specific, testable hypothesis"
                        ],
                        what_is_missing: "What's the fix if hypothesis is correct? How do we validate the fix safely?"
                    },
                    {
                        level: "best" as const,
                        icon: "⭐",
                        response: `**Key Observation:** Rollback failed + database migration involved.

**Hypothesis:** The migration to add an index triggered a statistics update or plan cache invalidation. Postgres is now choosing a suboptimal query plan (likely a sequential scan or nested loop where it used to do an index scan or hash join). Rolling back the code doesn't roll back:
- Table statistics
- The new index (if it wasn't dropped in rollback)
- Query plan cache state

**Validation Approach:**

1. **Capture the current plan:**
\`\`\`sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM transactions WHERE user_id = 123 ...
\`\`\`

2. **Compare to expected:**
- Is it using the expected index?
- Are there any sequential scans on large tables?
- What's the actual vs. estimated row count? (Huge mismatch = stale stats)

3. **Check statistics freshness:**
\`\`\`sql
SELECT relname, last_analyze, last_autoanalyze
FROM pg_stat_user_tables
WHERE relname = 'transactions';
\`\`\`

**Likely Fix:**
If statistics are stale: \`ANALYZE transactions;\`
If the new index is poisoning plans: Consider dropping it and re-adding with proper CONCURRENTLY option.

**Validation Before Applying:**
Test the ANALYZE on a read replica first, verify the plan improves, then apply to primary.`,
                        why_this_level: "Complete diagnosis with specific queries, expected outcomes, and safe validation approach.",
                        strengths: [
                            "Detailed hypothesis with specific mechanism",
                            "Exact SQL queries to validate",
                            "Knows what 'good' looks like in the output",
                            "Safe validation approach (test on replica first)"
                        ],
                        principal_engineer_signals: [
                            "Deep database internals knowledge",
                            "Thinks about validation and rollback",
                            "Provides copy-paste ready queries"
                        ]
                    }
                ]
            },
            key_takeaways: [
                "If rollback doesn't fix it, it's state (DB/cache/config), not code",
                "Postgres query planners are sensitive to statistics changes",
                "Always validate fixes safely before applying to production"
            ]
        },
        {
            step_number: 3,
            step_name: "Resolution & Prevention",
            time_allocation: "15 min",
            description: "Apply the fix safely and establish measures to prevent recurrence.",
            pause_prompt: "How do you prevent this class of issue from happening again?",
            comparison_table: {
                criterion: "Prevention Strategy",
                interviewer_question: "The ANALYZE fixed the issue. How do we prevent this from happening again?",
                responses: [
                    {
                        level: "bad" as const,
                        icon: "❌",
                        response: "We should add better monitoring to catch this sooner. I'd set up alerts for P95 latency so we know when things are slow.",
                        why_this_level: "Only addresses detection, not prevention. Doesn't fix the root cause.",
                        red_flags: [
                            "Monitoring is reactive, not preventive",
                            "Doesn't address the migration process",
                            "Will have the same issue next time"
                        ]
                    },
                    {
                        level: "good" as const,
                        icon: "✓",
                        response: `We should update our migration process:

1. **Run ANALYZE after index creation** on large tables
2. **Test migrations on production-sized data** in staging
3. **Add monitoring** for query plan changes or latency spikes
4. **Document this incident** so future engineers know the pattern`,
                        why_this_level: "Good process improvements but missing proactive detection and broader thinking.",
                        strengths: [
                            "Addresses the migration process",
                            "Mentions testing with production-sized data",
                            "Documents for future reference"
                        ],
                        what_is_missing: "How do we catch this before it hits production? What about query plan regression testing?"
                    },
                    {
                        level: "best" as const,
                        icon: "⭐",
                        response: `**Immediate Process Changes:**

1. **Migration Checklist Update:**
   - For any migration touching large tables (>1M rows), require explicit ANALYZE step
   - Add to PR template: "Does this migration need ANALYZE? [Yes/No/NA]"

2. **Canary Deployments for Migrations:**
   - Run migrations against a replica first
   - Compare query plans before/after for critical queries
   - Alert if plan changes (seq scan → index scan is fine, reverse is not)

**Observability Improvements:**

3. **Query Plan Monitoring:**
   - Track \`pg_stat_statements\` for top queries
   - Alert on significant changes in mean_time or rows_processed
   - Dashboard showing "query plan fingerprints" for critical endpoints

4. **Latency Attribution:**
   - Add tracing that shows: "200ms in DB, 10ms in app, 5ms in serialization"
   - Would have immediately pointed to DB as the culprit

**Post-Incident:**

5. **Blameless Post-Mortem:**
   - Timeline of events
   - What went well (rollback was quick)
   - What didn't go well (rollback didn't include ANALYZE)
   - Action items with owners and due dates

6. **Runbook Update:**
   - Add "migration-related performance degradation" runbook
   - Include the specific EXPLAIN queries we used today`,
                        why_this_level: "Comprehensive prevention strategy addressing process, observability, and organizational learning.",
                        strengths: [
                            "Proactive detection (canary migrations)",
                            "Query plan monitoring as observability",
                            "Blameless post-mortem process",
                            "Runbook for future incidents"
                        ],
                        principal_engineer_signals: [
                            "Thinks about systemic prevention, not just this bug",
                            "Builds organizational learning into the response",
                            "Creates artifacts (runbooks, checklists) that scale"
                        ]
                    }
                ]
            },
            other_failure_scenarios: [
                {
                    scenario: "Index bloat after heavy deletes",
                    impact: "Index scans become slower than sequential scans",
                    mitigation: "Schedule REINDEX for tables with high churn"
                },
                {
                    scenario: "Connection pool exhaustion",
                    impact: "Requests queue waiting for connections, latency spikes",
                    mitigation: "Monitor connection pool utilization, alert at 80%"
                }
            ],
            key_takeaways: [
                "Prevention is better than detection—fix the process, not just the bug",
                "Query plan monitoring is essential for database-heavy applications",
                "Post-mortems should produce artifacts (runbooks, checklists) that scale"
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
            "Postgres query planner and statistics",
            "Hypothesis-driven debugging",
            "Mitigation vs. debugging prioritization",
            "Blameless post-mortems"
        ],
        patterns_demonstrated: [
            "Incident Command System",
            "Hypothesis-driven debugging",
            "Query plan analysis",
            "Canary deployments for migrations",
            "Runbook-driven operations"
        ],
        what_made_responses_best_level: [
            "Prioritizing user impact and mitigation over debugging",
            "Using deductive reasoning from the 'rollback failed' clue",
            "Deep knowledge of database internals",
            "Establishing process improvements, not just fixes",
            "Clear communication throughout the incident"
        ]
    },
    reflection_prompts: {
        self_assessment: [
            "Did I prioritize mitigation before debugging?",
            "Did I form a hypothesis based on the evidence before investigating?",
            "Could I explain why rollback doesn't reset database statistics?",
            "Did I think about preventing this class of issue, not just this specific bug?"
        ],
        practice_next: [
            "Design a query performance monitoring system",
            "Design a database migration safety framework",
            "Design an incident management system for a growing team"
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
