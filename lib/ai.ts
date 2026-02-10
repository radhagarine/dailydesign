import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { Theme, ProblemType } from './content-strategy';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// ── Zod Schemas (OpenAI Structured Outputs requires all fields required + nullable for optional) ──

const FrameworkStepResponseSchema = z.object({
    level: z.enum(['bad', 'good', 'best']),
    icon: z.string(),
    response: z.string(),
    why_this_level: z.string(),
    red_flags: z.array(z.string()).nullable(),
    strengths: z.array(z.string()).nullable(),
    what_is_missing: z.string().nullable(),
    principal_engineer_signals: z.array(z.string()).nullable(),
});

const ComparisonTableSchema = z.object({
    criterion: z.string(),
    interviewer_question: z.string().nullable(),
    responses: z.array(FrameworkStepResponseSchema),
});

const ComponentDecisionSchema = z.object({
    component: z.string(),
    comparison_table: ComparisonTableSchema,
});

const FrameworkStepSchema = z.object({
    step_number: z.number(),
    step_name: z.string(),
    time_allocation: z.string(),
    description: z.string(),
    pause_prompt: z.string(),
    comparison_table: ComparisonTableSchema.nullable(),
    interviewer_response: z.object({
        clarifications: z.array(z.string()),
        additional_context: z.string(),
    }).nullable(),
    calculations_breakdown: z.object({
        storage: z.object({ total_data: z.string(), working_set: z.string(), per_region: z.string() }),
        throughput: z.object({ global_qps: z.string(), per_region_qps: z.string(), cache_hit_qps: z.string(), database_qps: z.string() }),
        bandwidth: z.object({ peak_bandwidth: z.string(), per_region_bandwidth: z.string() }),
    }).nullable(),
    architecture_diagram_description: z.string().nullable(),
    component_decisions: z.array(ComponentDecisionSchema).nullable(),
    other_failure_scenarios: z.array(z.object({
        scenario: z.string(),
        impact: z.string(),
        mitigation: z.string(),
    })).nullable(),
    key_takeaways: z.array(z.string()),
});

const InterviewScenarioSchema = z.object({
    metadata: z.object({
        difficulty: z.string(),
        estimated_time_minutes: z.number(),
        topics: z.array(z.string()),
        generated_date: z.string(),
    }),
    problem: z.object({
        title: z.string(),
        statement: z.string(),
        context: z.string(),
        pause_prompt: z.string(),
    }),
    framework_steps: z.array(FrameworkStepSchema),
    interview_simulation: z.object({
        title: z.string(),
        description: z.string(),
        scenario: z.object({
            interviewer_question: z.string(),
            pause_prompt: z.string(),
            comparison_table: ComparisonTableSchema,
        }),
        key_takeaways: z.array(z.string()),
    }),
    summary: z.object({
        critical_concepts_covered: z.array(z.string()),
        patterns_demonstrated: z.array(z.string()),
        what_made_responses_best_level: z.array(z.string()),
    }),
    reflection_prompts: z.object({
        self_assessment: z.array(z.string()),
        practice_next: z.array(z.string()),
    }),
});

// ── Exported TypeScript types (derived from Zod schemas — single source of truth) ──

export type FrameworkStepResponse = z.infer<typeof FrameworkStepResponseSchema>;
export type ComparisonTable = z.infer<typeof ComparisonTableSchema>;
export type ComponentDecision = z.infer<typeof ComponentDecisionSchema>;
export type FrameworkStep = z.infer<typeof FrameworkStepSchema>;
export type InterviewScenario = z.infer<typeof InterviewScenarioSchema>;

// ── Composable Prompt Parts ──

const SHARED_PREAMBLE = `You are an expert system design interviewer and principal engineer with 15+ years of experience conducting interviews at FAANG companies. Your task is to generate a complete 40-minute interview practice session.

## Your Expertise
- You've conducted 500+ system design interviews
- You understand what separates junior, senior, and principal engineer responses
- You know common failure modes and anti-patterns
- You can articulate nuanced trade-offs in distributed systems
- You think in terms of cascading failures, consistency models, and operational complexity

## Target Audience
- Backend/Infrastructure engineers with 8-20+ years of experience
- Currently at Senior level, targeting Staff/Principal roles
- Has real production experience at scale
- Familiar with distributed systems fundamentals
- Does NOT need basic explanations—they need calibration on judgment

## Quality Standards

### Bad Response Characteristics (What to Show as Anti-Patterns)
- Generic statements that could apply to any problem
- Tool name-dropping without justification ("use Redis because it's fast")
- No quantitative reasoning or calculations
- Ignores failure scenarios
- Jumps to solutions without clarifying requirements
- Vague language ("a lot", "probably", "should be fine")
- No trade-offs discussed

### Good Response Characteristics (Competent Senior Engineer)
- Shows calculations with units
- Names specific technologies with reasoning
- Considers alternatives
- Mentions trade-offs
- Asks clarifying questions
- Quantifies impact

### Best Response Characteristics (Principal Engineer Level)
- Structured frameworks (functional vs non-functional, decision matrices)
- Explicit assumptions stated upfront
- Multiple alternatives compared with pros/cons
- Quantifies impacts at multiple levels (user-facing latency, system QPS, cost)
- Considers cascading failures
- Shows adaptability (when to change approach)
- Includes monitoring/validation strategies
- Makes complexity trade-offs explicit
- Demonstrates experience-based intuition (cache hit rates, typical failure modes)

### For Each Comparison Table
1. Bad Response: Write as if a mid-level engineer with 3-4 years experience who hasn't prepared is responding. Show common anti-patterns. Length: 1-2 paragraphs.
2. Good Response: Write as if a prepared senior engineer with solid fundamentals is responding. Show improvement over bad, but missing depth. Length: 3-4 paragraphs.
3. Best Response: Write as if a staff/principal engineer with 10+ years and interview preparation is responding. This should be 2-3x longer than good, showing structured thinking, trade-offs, and adaptability. Length: 5-7+ paragraphs with clear structure.`;

const SYSTEM_DESIGN_STRUCTURE = `## Structural Requirements (System Design)
- Generate 4 framework steps: **Clarify Requirements**, **Estimate Scale**, **High-Level Architecture**, **Failures & Bottlenecks**
- Each step MUST have a comparison_table with bad/good/best responses
- **Step 1 (Clarify Requirements)** MUST include interviewer_response with clarifications and additional_context
- **Step 2 (Estimate Scale)** MUST include calculations_breakdown with specific numbers:
  - storage: total_data, working_set, per_region (with units like TB, GB)
  - throughput: global_qps, per_region_qps, cache_hit_qps, database_qps (with units)
  - bandwidth: peak_bandwidth, per_region_bandwidth (with units like GB/s, MB/s)
  - Show intermediate calculation steps in the best response
  - Use real-world patterns (Pareto principle for hot/cold data, typical cache hit rates 70-90%, P99 latency targets)
- **Step 3 (High-Level Architecture)** MUST include:
  - architecture_diagram_description: detailed text description of the architecture
  - component_decisions: at least 2 decisions, each comparing alternatives with trade-offs
- **Step 4 (Failures & Bottlenecks)** MUST include:
  - other_failure_scenarios: at least 3 failure scenarios with timeline-based breakdown (immediate impact, detection/failover, recovery)
  - Each scenario must quantify impact (QPS changes, latency degradation) and propose mitigations
  - Consider cascading effects across components
- Include interview_simulation with a dynamic requirements change scenario`;

const TACTICAL_STRUCTURE = `## Structural Requirements (Tactical / Incident Response)
- Generate 4 framework steps: **Situation Assessment**, **Root Cause Analysis**, **Resolution & Mitigation**, **Prevention & Process Improvement**
- Each step MUST have a comparison_table with bad/good/best responses
- **Step 1 (Situation Assessment)** MUST include interviewer_response with clarifications about the incident context
  - Focus on: blast radius estimation, severity classification, stakeholder communication
- **Step 2 (Root Cause Analysis)** MUST include:
  - other_failure_scenarios: at least 3 hypotheses with verification approach for each
  - Each hypothesis should describe: what evidence supports it, how to verify, expected vs actual behavior
  - calculations_breakdown should be null (tactical problems don't need scale math)
- **Step 3 (Resolution & Mitigation)** MUST include:
  - architecture_diagram_description: description of the resolution approach and system changes
  - Focus on: immediate mitigation vs permanent fix, rollback strategies, safe deployment
  - component_decisions: at least 2 decisions about resolution approach trade-offs
- **Step 4 (Prevention & Process Improvement)** MUST include:
  - Focus on: monitoring gaps, alerting improvements, runbook updates, process changes, blameless postmortem
  - other_failure_scenarios: at least 3 related scenarios that the same root cause could trigger
- Include interview_simulation with a scenario escalation (e.g., the fix didn't work, scope expanded)
- Emphasize: systematic debugging methodology, incident command structure, communication during outages`;

const FEW_SHOT_EXCERPT = `## Quality Anchor — What a Principal-Level "Best" Response Looks Like

Below is an excerpt from a hand-crafted best response for a CDN design problem. Use this as your quality benchmark — your "best" responses must match or exceed this level of specificity, structured reasoning, and depth:

---
**Best Response (Excerpt — Clarify Requirements step):**

"Before diving into design, I want to establish a clear decision framework. Let me break requirements into **functional** and **non-functional**, then prioritize.

**Functional Requirements (ordered by user impact):**
1. Static asset serving (images, JS, CSS) — this is 80%+ of CDN traffic
2. Dynamic content acceleration (API responses, personalized content)
3. Video streaming (HLS/DASH adaptive bitrate)
4. Edge compute capabilities (A/B testing, geolocation routing)

**Non-functional Requirements — I'll propose specific targets:**
- **Latency**: P50 < 20ms, P99 < 100ms for cache hits (based on 150ms human perception threshold)
- **Availability**: 99.99% (52 min downtime/year) — CDNs are on the critical path
- **Throughput**: Design for 10M+ RPS globally with 5x burst capacity
- **Consistency**: Eventual consistency with max 30s propagation for cache invalidation

**Key Clarifying Questions:**
1. What's our geographic distribution? If 60%+ traffic is US/EU, we can start with 40 PoPs vs 200+ for truly global
2. Cache invalidation model — time-based TTL only, or do we need instant purge (adds significant complexity)?
3. Do we need origin shielding? This changes our cache hierarchy from 2-tier to 3-tier

This framework lets me make **explicit trade-offs** later. For example, if we need instant purge, I'll propose a push-based invalidation system over polling, accepting higher operational complexity for correctness."

---
Use this as your minimum bar for "best" responses: structured frameworks, specific numbers with reasoning, explicit trade-offs, and anticipation of downstream design decisions.`;

// Additional context prompts for specific themes
const THEME_CONTEXT: Record<string, string> = {
    'scale': `Focus on systems that handle massive scale: 100M+ users, billions of events, petabyte-scale data.
Include specific numbers like "500K concurrent connections", "10TB daily data ingestion", "sub-50ms p99 latency requirement".
Consider: horizontal scaling, sharding strategies, caching layers, async processing, eventual consistency tradeoffs.`,

    'performance': `Focus on performance bottlenecks, optimization decisions, and capacity planning.
Include specific metrics: latency percentiles (p50/p95/p99), throughput, CPU/memory utilization, query execution times.
Consider: profiling approaches, database optimization, caching strategies, connection pooling, resource contention.`,

    'reliability': `Focus on failure modes, incident response, chaos engineering, and building resilient systems.
Include specific failure scenarios: cascading failures, split-brain, data corruption, dependency outages.
Consider: circuit breakers, bulkheads, graceful degradation, disaster recovery, SLO/SLA tradeoffs.`,

    'architecture': `Focus on architectural decisions and system evolution over time.
Include specific tradeoffs: monolith vs microservices, sync vs async, SQL vs NoSQL, build vs buy.
Consider: migration strategies, technical debt, organizational structure, team boundaries, backwards compatibility.`
};

// ── Focus Area Hints — per-area context for richer, more specific generation ──

const FOCUS_AREA_HINTS: Record<string, {
    problemSeeds: string[];
    technicalContext: string;
    keyTradeoffs: string[];
}> = {
    // Scale theme (5 focus areas)
    'Global CDN': {
        problemSeeds: [
            'Design a CDN that serves 50B requests/day across 200+ PoPs with sub-20ms P50 cache-hit latency',
            'Design a cache invalidation system for a CDN handling 1M purge requests/hour with <30s global propagation',
            'Design a multi-tier CDN with edge, regional, and origin shield layers for a streaming platform',
        ],
        technicalContext: 'Anycast routing, consistent hashing for cache distribution, TLS termination at edge, origin shielding, cache hierarchies (L1 edge / L2 regional / L3 origin shield), HTTP/3 and QUIC, stale-while-revalidate, cache stampede prevention (request coalescing), purge fanout patterns.',
        keyTradeoffs: [
            'Cache hit ratio vs freshness — longer TTLs improve hits but serve staler content',
            'PoP count vs operational complexity — more PoPs reduce latency but increase deployment/monitoring burden',
            'Push vs pull invalidation — push gives faster propagation but requires reliable fanout infrastructure',
        ],
    },
    'Sharding': {
        problemSeeds: [
            'Design a sharding strategy for a social graph with 2B users where hot users have 10M+ followers',
            'Migrate a 50TB single-instance PostgreSQL database to a sharded architecture with zero downtime',
            'Design a re-sharding system that can rebalance data across shards without service disruption',
        ],
        technicalContext: 'Hash-based vs range-based partitioning, consistent hashing with virtual nodes, shard-local indexes vs global secondary indexes, cross-shard queries and scatter-gather, hot shard detection and splitting, shard proxy layers (Vitess, ProxySQL), dual-write migration patterns.',
        keyTradeoffs: [
            'Shard key cardinality vs query patterns — high cardinality distributes evenly but complicates range queries',
            'Data locality vs even distribution — co-locating related data reduces cross-shard joins but creates hotspots',
            'Logical sharding vs physical sharding — logical is simpler to rebalance but adds routing complexity',
        ],
    },
    'Multi-region': {
        problemSeeds: [
            'Design a multi-region payment processing system that maintains ACID guarantees across 5 geographic regions',
            'Design a conflict resolution strategy for a multi-region collaborative editing system with 100ms inter-region latency',
            'Design a multi-region failover system that achieves <30s RTO for a financial trading platform',
        ],
        technicalContext: 'CRDTs for conflict-free replication, consensus protocols (Raft, Paxos, EPaxos), region-aware routing, active-active vs active-passive replication, cross-region latency budgets (~50-150ms), data sovereignty/GDPR compliance, split-brain detection and resolution, regional circuit breakers.',
        keyTradeoffs: [
            'Consistency vs latency — synchronous cross-region writes guarantee consistency but add 100-300ms latency',
            'Active-active vs active-passive — active-active improves latency but requires conflict resolution',
            'Data sovereignty vs operational simplicity — per-region data residency adds routing complexity',
        ],
    },
    'Rate Limiting': {
        problemSeeds: [
            'Design a distributed rate limiter for an API gateway handling 5M requests/second across 20 data centers',
            'Design a multi-tier rate limiting system with per-user, per-IP, and global limits with graceful degradation',
            'Design a rate limiting system that distinguishes between legitimate burst traffic and abuse at 1M+ RPS',
        ],
        technicalContext: 'Token bucket, sliding window log, sliding window counter, leaky bucket algorithms. Distributed counters (Redis MULTI/EXEC, local + sync), race conditions in distributed counting, sticky sessions vs shared state, rate limit headers (X-RateLimit-*), 429 retry-after, hierarchical limits.',
        keyTradeoffs: [
            'Accuracy vs performance — centralized counting is precise but adds latency; local counting is fast but allows bursts',
            'Fairness vs throughput — strict per-user limits protect fairness but reduce overall system throughput',
            'Fixed window vs sliding window — fixed is simpler but allows 2x burst at window boundaries',
        ],
    },
    'Distributed Cache': {
        problemSeeds: [
            'Design a distributed caching layer for an e-commerce platform serving 200K QPS with 99.9% cache hit ratio',
            'Design a cache warming and invalidation strategy for a product catalog with 500M SKUs and real-time price updates',
            'Design a multi-tier caching architecture (L1 in-process, L2 distributed) for a search engine with sub-10ms P99',
        ],
        technicalContext: 'Cache-aside, read-through, write-through, write-behind patterns. Consistent hashing, cache stampede/thundering herd prevention (singleflight, probabilistic early expiry), memcached vs Redis cluster, near-cache (in-process) vs remote cache, serialization overhead, hot key detection and replication.',
        keyTradeoffs: [
            'Memory cost vs hit ratio — caching more data improves hits but increases infrastructure cost',
            'Consistency vs performance — write-through ensures consistency but doubles write latency',
            'Cache granularity — fine-grained entries are flexible but increase metadata overhead; coarse-grained reduces lookups but wastes bandwidth on partial updates',
        ],
    },

    // Performance theme (5 focus areas)
    'Query Optimization': {
        problemSeeds: [
            'Optimize a reporting query that scans 2B rows and currently takes 45 minutes, target: under 30 seconds',
            'Design an indexing strategy for a multi-tenant SaaS database with 10K tenants and wildly different query patterns',
            'Diagnose and fix a query that performs well in staging (100K rows) but degrades catastrophically in production (500M rows)',
        ],
        technicalContext: 'Query execution plans (EXPLAIN ANALYZE), index types (B-tree, hash, GIN, GiST, BRIN), covering indexes, partial indexes, index-only scans, query planner statistics, join algorithms (nested loop, hash join, merge join), materialized views, partitioning (range, list, hash), query parameterization and plan caching.',
        keyTradeoffs: [
            'Read performance vs write overhead — more indexes speed reads but slow writes and increase storage',
            'Normalization vs denormalization — normalized data prevents anomalies but requires expensive joins',
            'Real-time vs precomputed — materialized views give fast reads but introduce staleness and refresh cost',
        ],
    },
    'Latency Analysis': {
        problemSeeds: [
            'Investigate a P99 latency spike from 50ms to 2s that only affects 1% of users but generates 30% of revenue',
            'Design a latency budget allocation system for a microservices architecture with 15 services in the critical path',
            'Diagnose why a service has bimodal latency distribution (P50=5ms, P99=500ms) and propose fixes',
        ],
        technicalContext: 'Distributed tracing (Jaeger, Zipkin), latency percentiles vs averages, tail latency amplification, coordinated omission, GC pauses, connection pool exhaustion, head-of-line blocking, bufferbloat, Amdahl\'s law for latency optimization, Little\'s law (L = λW), queueing theory basics.',
        keyTradeoffs: [
            'P50 vs P99 optimization — optimizing for median may worsen tail; tail optimization may increase average',
            'Caching vs consistency — aggressive caching reduces latency but increases stale-read risk',
            'Parallelism vs complexity — parallel fan-out reduces latency but complicates error handling and increases resource usage',
        ],
    },
    'Memory Leaks': {
        problemSeeds: [
            'Diagnose a slow memory leak in a Java service that causes OOM crashes every 72 hours in production',
            'Design a memory management strategy for a service processing 1M events/sec with strict 4GB heap constraints',
            'Investigate why a Node.js service gradually increases from 200MB to 8GB RSS over a week despite stable traffic',
        ],
        technicalContext: 'Heap dumps and analysis (MAT, jmap), GC algorithms (G1, ZGC, Shenandoah), GC tuning, off-heap memory (direct buffers, mmap), memory-mapped files, object pooling, weak/soft/phantom references, finalization, native memory tracking, RSS vs heap vs virtual memory, memory profiling tools (async-profiler, pprof).',
        keyTradeoffs: [
            'GC pause time vs throughput — low-pause collectors (ZGC) sacrifice throughput for predictable latency',
            'Object pooling vs allocation rate — pooling reduces GC pressure but increases code complexity and risks pool exhaustion',
            'Eager vs lazy cleanup — eager cleanup prevents leaks but may free resources still needed; lazy risks accumulation',
        ],
    },
    'Capacity Planning': {
        problemSeeds: [
            'Plan capacity for a Black Friday event expecting 20x normal traffic with a 4-week lead time and fixed infrastructure budget',
            'Design an auto-scaling strategy for a ML inference service with bursty traffic (10x spikes lasting 2-5 minutes)',
            'Create a 12-month capacity plan for a rapidly growing startup going from 1M to 50M DAU',
        ],
        technicalContext: 'Load testing (k6, Gatling, Locust), utilization targets (70% CPU steady-state), queueing theory for capacity buffers, auto-scaling policies (target tracking, step, predictive), right-sizing vs over-provisioning, spot/preemptible instances, resource reservation, capacity modeling (regression, simulation).',
        keyTradeoffs: [
            'Over-provisioning vs cost — spare capacity improves reliability but wastes money; tight provisioning risks outages',
            'Vertical vs horizontal scaling — vertical is simpler but has ceiling; horizontal is unlimited but adds distributed complexity',
            'Reserved vs on-demand — reserved is cheaper for baseline but wastes if traffic drops; on-demand is flexible but expensive',
        ],
    },
    'Network Congestion': {
        problemSeeds: [
            'Diagnose intermittent request timeouts affecting 5% of cross-AZ traffic in a microservices mesh with 200 services',
            'Design a traffic management strategy for a video platform that saturates 40Gbps links during peak hours',
            'Design a backpressure and flow control system for a high-throughput event pipeline processing 2M events/sec',
        ],
        technicalContext: 'TCP congestion control (BBR, CUBIC), connection pooling and multiplexing (HTTP/2, gRPC), service mesh traffic management (Istio, Envoy), circuit breakers, bulkheads, backpressure (reactive streams), DNS-based load balancing, ECMP, network observability (packet capture, flow logs), MTU/jumbo frames.',
        keyTradeoffs: [
            'Connection pooling vs resource usage — more connections improve throughput but consume file descriptors and memory',
            'Retry storms vs availability — retries improve individual request success but can amplify congestion',
            'Compression vs CPU — compressing payloads reduces bandwidth but increases latency from CPU overhead',
        ],
    },

    // Reliability theme (5 focus areas)
    'Cascading Failures': {
        problemSeeds: [
            'Design a system to prevent and contain cascading failures in a 50-service microservices architecture handling 500K RPS',
            'Post-mortem: a cache node failure caused a cascading failure that took down the entire checkout flow for 45 minutes — redesign to prevent recurrence',
            'Design a load shedding strategy that gracefully degrades a social media feed from personalized to trending to static during overload',
        ],
        technicalContext: 'Circuit breakers (Hystrix patterns, half-open state), bulkhead isolation, load shedding (priority queues, admission control), retry budgets (vs retry storms), deadline propagation, graceful degradation patterns, dependency health scoring, blast radius containment, failure domain isolation.',
        keyTradeoffs: [
            'Isolation vs resource efficiency — stricter bulkheads contain failures but waste resources during normal operation',
            'Fast-fail vs retry — failing fast prevents pile-up but reduces individual request success rate',
            'Graceful degradation vs user experience — shedding features maintains availability but degrades perceived quality',
        ],
    },
    'Circuit Breakers': {
        problemSeeds: [
            'Design a circuit breaker system for a payment gateway that must handle both transient and persistent downstream failures',
            'Design an adaptive circuit breaker that adjusts thresholds based on real-time error rate trends rather than fixed thresholds',
            'Implement circuit breakers across a service mesh with 100 services — design the configuration, monitoring, and coordination strategy',
        ],
        technicalContext: 'Three-state model (closed, open, half-open), failure counting (consecutive vs rate-based), timeout management, fallback strategies (cache, default, queue), health check probes, circuit breaker coordination across replicas, Sentinel pattern, bulkhead + circuit breaker composition.',
        keyTradeoffs: [
            'Sensitivity vs stability — low thresholds catch failures fast but may trigger on normal variance; high thresholds delay detection',
            'Per-host vs per-service breakers — per-host isolates individual bad instances but increases state management',
            'Synchronous fallback vs async queue — sync fallback is immediate but limited; async queuing can retry later but adds complexity',
        ],
    },
    'Disaster Recovery': {
        problemSeeds: [
            'Design a disaster recovery strategy for a financial platform with RPO<1min and RTO<5min across 3 geographic regions',
            'Design a data recovery system for a multi-TB database after a botched schema migration corrupts 30% of records',
            'Plan and execute a DR drill for a complex microservices platform — design the runbook, success criteria, and automation',
        ],
        technicalContext: 'RPO/RTO targets, backup strategies (full, incremental, differential), point-in-time recovery, cross-region replication (sync vs async), pilot light vs warm standby vs hot standby, chaos engineering (Chaos Monkey, Gremlin), DR runbooks, automated failover vs manual, split-brain prevention, data reconciliation after failback.',
        keyTradeoffs: [
            'RPO/RTO vs cost — lower recovery targets require more expensive replication and standby infrastructure',
            'Automated vs manual failover — automated is faster but risks false positives triggering unnecessary failovers',
            'Consistency vs availability during failover — waiting for data sync ensures no loss but extends downtime',
        ],
    },
    'Incident Response': {
        problemSeeds: [
            'Design an incident response process for a platform serving 100M users where a 5-minute outage costs $500K in revenue',
            'You\'re the on-call engineer and paged at 3 AM: payment processing is failing for 20% of transactions — walk through your response',
            'Design an incident command structure and communication strategy for a multi-team organization with 50 services',
        ],
        technicalContext: 'Incident severity levels (SEV1-4), incident commander role, communication channels (war room, status page, stakeholder updates), mean time to detect/acknowledge/resolve (MTTD/MTTA/MTTR), on-call rotation design, runbooks, blameless postmortems, SLO burn rate alerts, error budgets.',
        keyTradeoffs: [
            'Speed of response vs accuracy of diagnosis — quick mitigations may mask root cause; thorough investigation delays resolution',
            'Communication overhead vs coordination — too many people in war room slows decision-making; too few misses expertise',
            'Permanent fix vs hot-fix — shipping a proper fix takes longer but prevents recurrence; hot-fixes may introduce new issues',
        ],
    },
    'Monitoring': {
        problemSeeds: [
            'Design a monitoring and alerting strategy for a 200-service microservices platform that reduces alert fatigue while catching real issues',
            'Design an anomaly detection system for infrastructure metrics that distinguishes between normal seasonal patterns and genuine anomalies',
            'Design an observability stack (metrics, logs, traces) for a Kubernetes platform with 5000 pods across 3 clusters',
        ],
        technicalContext: 'Three pillars of observability (metrics, logs, traces), RED method (Rate, Errors, Duration), USE method (Utilization, Saturation, Errors), SLI/SLO/SLA, error budgets and burn rate, Prometheus/Grafana, distributed tracing (OpenTelemetry), structured logging, cardinality management, alert routing (PagerDuty, OpsGenie).',
        keyTradeoffs: [
            'Alert sensitivity vs fatigue — more alerts catch issues faster but cause on-call burnout from false positives',
            'Metric cardinality vs granularity — high-cardinality labels give precise debugging but explode storage and query cost',
            'Sampling rate vs visibility — sampling reduces cost but may miss rare errors affecting small user populations',
        ],
    },

    // Architecture theme (4 existing + 2 new = 6 focus areas)
    'Monolith vs Microservices': {
        problemSeeds: [
            'Plan a migration strategy for a 500K-line monolith to microservices for a company growing from 20 to 200 engineers',
            'Design the service boundaries for an e-commerce platform currently in a monolith — identify the first 5 services to extract and why',
            'Evaluate whether a startup with 8 engineers should adopt microservices or stay with a modular monolith — make the case for each',
        ],
        technicalContext: 'Domain-driven design for service boundaries, strangler fig pattern, branch by abstraction, anti-corruption layers, distributed transactions (saga pattern), service mesh, API gateway, independent deployability, Conway\'s law, modular monolith as middle ground.',
        keyTradeoffs: [
            'Team autonomy vs operational complexity — microservices enable independent deployment but require sophisticated infrastructure',
            'Data isolation vs cross-service queries — separate databases enforce boundaries but make reporting and joins difficult',
            'Migration risk vs velocity — gradual strangler migration is safer but slower; big-bang rewrites are faster but riskier',
        ],
    },
    'Sync vs Async': {
        problemSeeds: [
            'Design a hybrid sync/async order processing pipeline for an e-commerce platform handling 50K orders/hour with strict consistency requirements',
            'Migrate a synchronous REST-based notification system to an event-driven architecture without breaking existing consumers',
            'Design an async workflow engine for a financial compliance system where every step must be auditable and exactly-once',
        ],
        technicalContext: 'Message brokers (Kafka, RabbitMQ, SQS), event sourcing, CQRS, saga pattern for distributed transactions, idempotency keys, dead letter queues, exactly-once vs at-least-once delivery, backpressure, consumer groups, event schema evolution (Avro, Protobuf), outbox pattern.',
        keyTradeoffs: [
            'Latency vs throughput — synchronous gives immediate feedback but limits throughput; async scales better but adds delay',
            'Consistency vs availability — sync transactions guarantee consistency but couple services; async decouples but introduces eventual consistency',
            'Simplicity vs resilience — sync is easier to reason about but creates tight coupling; async is resilient but harder to debug',
        ],
    },
    'Consistency vs Availability': {
        problemSeeds: [
            'Design a distributed shopping cart that maintains user state across regions with appropriate consistency guarantees',
            'Design a consistency model for a collaborative document editor that supports 1000 concurrent editors per document',
            'Design a banking ledger system that must handle cross-region transfers with strong consistency while maintaining 99.99% availability',
        ],
        technicalContext: 'CAP theorem, PACELC, linearizability, sequential consistency, causal consistency, eventual consistency, vector clocks, last-writer-wins, CRDTs, quorum reads/writes (R+W>N), Raft/Paxos consensus, read-your-writes consistency, tunable consistency (Cassandra), session guarantees.',
        keyTradeoffs: [
            'Strong consistency vs write latency — linearizable writes require consensus across replicas, adding round-trip latency',
            'Availability vs correctness — accepting writes during partition improves availability but risks conflicting updates',
            'User experience vs system complexity — read-your-writes consistency satisfies most users but requires session affinity or metadata propagation',
        ],
    },
    'Migration Strategy': {
        problemSeeds: [
            'Plan a zero-downtime migration from a legacy Oracle database to PostgreSQL for a system processing 100K transactions/day',
            'Design a migration strategy for moving from a self-hosted Kubernetes cluster to a managed cloud service with 200 microservices',
            'Migrate a real-time bidding system from on-premise to cloud while maintaining <10ms P99 bid response latency',
        ],
        technicalContext: 'Strangler fig pattern, blue-green deployment, canary releases, feature flags, dual-write with reconciliation, shadow traffic/dark launching, database migration tools (pgloader, DMS), backward-compatible schema changes, expand-contract pattern, rollback strategies, data validation and reconciliation.',
        keyTradeoffs: [
            'Migration speed vs risk — big-bang is faster but riskier; incremental is safer but extends the dual-system maintenance period',
            'Dual-write consistency vs simplicity — dual-writing ensures data parity but introduces complexity and potential divergence',
            'Feature parity vs iterative improvement — matching 100% of legacy features delays launch; shipping MVP risks user disruption',
        ],
    },
    'Event-Driven Architecture': {
        problemSeeds: [
            'Design an event-driven architecture for a logistics platform tracking 10M package movements/day across 50 microservices',
            'Design an event sourcing system for a financial trading platform where every state change must be auditable and replayable',
            'Migrate a request-response order fulfillment system to an event-driven architecture while maintaining sub-second order confirmation',
        ],
        technicalContext: 'Event sourcing, CQRS, event store (EventStoreDB, Kafka as event log), projections/read models, event schema registry (Confluent), saga/choreography vs orchestration, idempotent consumers, exactly-once semantics, event versioning and upcasting, dead letter topics, event replay and reprocessing.',
        keyTradeoffs: [
            'Event granularity — fine-grained events are flexible but increase volume and processing cost; coarse events are simpler but less composable',
            'Choreography vs orchestration — choreography is decoupled but hard to trace; orchestration is visible but creates a central coordinator',
            'Event store retention vs storage cost — keeping full history enables replay and audit but grows storage linearly over time',
        ],
    },
    'API Design & Evolution': {
        problemSeeds: [
            'Design a versioning and deprecation strategy for a public API with 10K consumers and a 2-year backward compatibility commitment',
            'Design an API gateway that supports GraphQL, REST, and gRPC consumers while maintaining a single internal service mesh',
            'Design a rate-limited, paginated API for a data export platform that must handle queries returning 10M+ records',
        ],
        technicalContext: 'REST maturity model, GraphQL (federation, schema stitching), gRPC and Protocol Buffers, API versioning (URL path, header, content negotiation), backward compatibility rules, OpenAPI/Swagger, API gateway patterns, pagination strategies (offset, cursor, keyset), HATEOAS, idempotency keys, API deprecation lifecycle.',
        keyTradeoffs: [
            'Flexibility vs performance — GraphQL gives clients flexibility but complicates caching and enables expensive queries',
            'Backward compatibility vs evolution speed — strict compatibility slows iteration; breaking changes lose consumer trust',
            'Thin vs thick API gateway — thin gateways are simple but push logic to services; thick gateways centralize concerns but become bottlenecks',
        ],
    },
};

export async function generateDailyScenario(
    strategy: { theme: Theme, problemType: ProblemType, focusArea: string },
    targetDate?: Date
): Promise<InterviewScenario> {
    const date = targetDate || new Date();
    const generatedDate = date.toISOString().split('T')[0];

    // Compose system prompt from parts based on problem type
    const structuralRequirements = strategy.problemType === 'SYSTEM_DESIGN'
        ? SYSTEM_DESIGN_STRUCTURE
        : TACTICAL_STRUCTURE;

    const metadata = `Theme: ${strategy.theme.title}
Focus Area: ${strategy.focusArea}
Problem Type: ${strategy.problemType}
Difficulty: Principal
Date: ${generatedDate}`;

    const systemPrompt = [SHARED_PREAMBLE, structuralRequirements, FEW_SHOT_EXCERPT, metadata].join('\n\n');

    // Build enriched user message with theme context and focus area hints
    const themeContext = THEME_CONTEXT[strategy.theme.id] || '';
    const hints = FOCUS_AREA_HINTS[strategy.focusArea];
    const focusAreaSection = hints
        ? `Focus Area Technical Context: ${hints.technicalContext}
Key Tradeoffs to Explore: ${hints.keyTradeoffs.map((t, i) => `${i + 1}. ${t}`).join('\n')}
Possible Problem Angles (choose one or invent a novel variant): ${hints.problemSeeds.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
        : '';

    const userMessage = `Generate a complete ${strategy.problemType === 'SYSTEM_DESIGN' ? 'system design' : 'tactical/incident response'} interview scenario.

Theme: ${strategy.theme.title}
Focus Area: ${strategy.focusArea}

${themeContext}

${focusAreaSection}

Important:
- The problem must be specific to "${strategy.focusArea}" within "${strategy.theme.title}"
- Include concrete numbers and metrics throughout
- Bad/good/best responses must be CLEARLY different in quality and depth
- Best responses should be 2-3x longer than good responses with markdown formatting (bold, bullet lists, numbered steps)
- Bad answers should be things real candidates actually say
- All nullable fields that are specified as MUST in the structural requirements must be populated (not null)`;

    console.log(`Generating [${strategy.problemType}] scenario for theme: ${strategy.theme.title} (${strategy.focusArea})`);

    const MAX_RETRIES = 3;
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const completion = await openai.chat.completions.parse({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                model: 'gpt-4o',
                response_format: zodResponseFormat(InterviewScenarioSchema, 'interview_scenario'),
                temperature: 0.5,
                max_tokens: 16000,
            });

            const message = completion.choices[0].message;
            if (message.refusal) {
                throw new Error(`Model refused to generate: ${message.refusal}`);
            }
            if (!message.parsed) {
                throw new Error('No parsed content in response');
            }

            return message.parsed as InterviewScenario;
        } catch (error) {
            lastError = error;
            const isRetryable = error instanceof Error && (
                error.message.includes('timeout') ||
                error.message.includes('rate_limit') ||
                error.message.includes('overloaded') ||
                error.message.includes('500') ||
                error.message.includes('502') ||
                error.message.includes('503') ||
                error.message.includes('529')
            );

            if (!isRetryable || attempt === MAX_RETRIES) {
                console.error(`AI generation failed (attempt ${attempt}/${MAX_RETRIES}):`, error);
                throw error;
            }

            const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
            console.warn(`AI generation attempt ${attempt} failed, retrying in ${delayMs}ms...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    throw lastError;
}
