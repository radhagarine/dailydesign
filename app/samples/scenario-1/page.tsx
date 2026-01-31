import DesignProblem from '@/components/DesignProblem';

export default function Scenario1() {
    return (
        <DesignProblem
            id="scenario-1"
            title="Designing a Distributed Rate Limiter"
            category="System Design & Architecture"
            difficulty="Senior"
            estimatedTime="30 min"
            summary="Design a scalable rate limiting system for a high-traffic API gateway handling 5 million requests per second."
            context={`You're interviewing for a Principal Engineer role at a company that operates a high-traffic API gateway. The gateway currently handles 5 million requests per second across 200+ microservices.

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
- Be operationally simple`}
            question="How would you design a distributed rate limiter for this API gateway? Walk me through your approach, key design decisions, and tradeoffs."
            guidingQuestions={[
                "How do you handle the latency vs. accuracy tradeoff at 5M RPS?",
                "What happens if your rate limiting service goes down?",
                "How will you distribute quotas across gateway instances?",
                "What data structure is most efficient for storing counters?",
                "How will you handle 'thundering herd' issues when quotas reset?"
            ]}
            pitfalls={[
                "Assuming a central Redis can handle 5M synchronous writes/sec",
                "Forgetting about network latency overhead (round-trip time)",
                "Ignoring failure modes (what if the rate limiter fails?)",
                "Not clarifying acceptable accuracy loss (is 5% over-limit ok?)",
                "Over-engineering with complex consensus algorithms (Paxos/Raft) for simple counting"
            ]}
            answers={[
                {
                    type: 'bad',
                    title: 'Bad Answer (Weak Signal)',
                    content: `I'd use Redis with a Lua script to implement rate limiting. We'd store counters in Redis with TTL and increment them on each request. If the counter exceeds the limit, we reject the request.

For distributed rate limiting, we'd have all gateway instances connect to a Redis cluster. We'd use the token bucket algorithm because it's the most accurate.

To handle 5M RPS, we'd scale Redis horizontally by sharding based on user ID. We'd also add caching to reduce Redis load.`,
                    diagram: `graph TD
    Client[Client] --> Gateway[API Gateway]
    Gateway -->|Sync Request| Redis[Redis Cluster]
    Redis -->|Counter++| Redis
    Redis -->|Current Count| Gateway
    Gateway -->|Allow/Deny| Client
    
    style Redis fill:#ffcccc,stroke:#ff0000`,
                    diagramTitle: "Synchronous Centralized Approach (Bottleneck)",
                    analysis: `This answer shows shallow thinking and raises several red flags for interviewers:

**Missing Critical Analysis:**
- No discussion of the fundamental tradeoff between accuracy and latency
- Doesn't acknowledge that synchronous Redis calls at 5M RPS would add significant latency
- No consideration of Redis as a single point of failure
- Assumes sharding solves scale without analyzing the actual bottleneck

**Premature Optimization:**
- Jumps to token bucket without explaining why it's better for this use case
- Suggests "caching" without specifying what to cache or how it helps

**Lack of Production Awareness:**
- Doesn't discuss monitoring, observability, or operational complexity
- No mention of graceful degradation or failure modes
- Ignores the "operationally simple" requirement`
                },
                {
                    type: 'good',
                    title: 'Good Answer (Senior Signal)',
                    content: `The core challenge here is the tradeoff between accuracy and latency. At 5M RPS, we can't afford synchronous calls to a central store for every request.

I'd propose a hybrid approach:
1. **Local rate limiting** with in-memory counters on each gateway instance
2. **Async synchronization** to a distributed store (Redis or similar) every 100-200ms
3. **Quota distribution** where each instance gets a portion of the global quota

For the algorithm, I'd start with a sliding window counter because it balances accuracy and memory usage better than token bucket at this scale.

To handle the multi-tier requirement (per-user, per-API, per-tenant), I'd use a hierarchical key structure in Redis: \`ratelimit: { tenant }:{ user }: { api }: { window }\`.

For failure handling, if Redis is unavailable, instances would fall back to local-only rate limiting with conservative limits to prevent abuse.`,
                    diagram: `graph TD
    Client[Client] --> Gateway[API Gateway]
    subgraph Node [Gateway Instance]
      Gateway --> LocalMem[Local Memory Counter]
    end
    LocalMem -.->|Async Sync 100ms| Redis[Redis Cluster]
    Redis -.->|Update Quota| LocalMem
    
    style LocalMem fill:#fff4e6,stroke:#ff9900
    style Redis fill:#e6f3ff,stroke:#0066cc`,
                    diagramTitle: "Hybrid Async Approach",
                    analysis: `This answer demonstrates solid senior-level thinking:

**Strengths:**
- Identifies the core latency vs. accuracy tradeoff
- Proposes a practical hybrid approach that addresses the performance constraint
- Considers failure modes and has a fallback strategy
- Thinks about the data model (hierarchical keys)

**Why It Falls Short for Principal:**
- Doesn't deeply analyze the quota distribution problem (what if one instance gets all the traffic?)
- The async sync approach could lead to over-limiting or under-limiting during traffic bursts
- Doesn't discuss how to handle quota rebalancing when instances scale up/down
- Missing discussion of observability and how to debug rate limiting issues in production`
                },
                {
                    type: 'best',
                    title: 'Best Answer (Principal Signal)',
                    content: `Let me start by clarifying the requirements and constraints, because the right design depends heavily on the acceptable accuracy vs. latency tradeoff.

**Key Question:** Is it acceptable to have 5-10% over-limit during traffic bursts, or do we need strict enforcement? This fundamentally changes the design.

Assuming some tolerance for over-limit, I'd propose a **quota-based approach with local enforcement and periodic reconciliation**:

**Architecture:**
1. **Quota Service**: Centralized service that allocates quotas to gateway instances
2. **Local Enforcement**: Each gateway instance enforces limits using in-memory counters
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
                    diagram: `graph TD
    Client[Client] --> Gateway[API Gateway]
    
    subgraph Instance [Gateway Instance]
      Gateway --> Matcher[Local Rule Matcher]
      Matcher --> Bucket[Token Bucket]
    end
    
    Bucket -.->|Request Batch| QuotaSvc[Quota Service]
    QuotaSvc -.->|Grant Tokens| Bucket
    QuotaSvc --> Store[Redis State Store]
    
    style Instance fill:#ecfdf5,stroke:#10b981
    style QuotaSvc fill:#f3e8ff,stroke:#7c3aed`,
                    diagramTitle: "Quota Service Architecture (Best Tradeoff)",
                    analysis: `This answer demonstrates principal-level thinking:

**Strategic Thinking:**
- Starts by clarifying requirements rather than jumping to a solution
- Explicitly states assumptions and their impact on design
- Considers the business context (some over-limiting is acceptable)

**System Design Excellence:**
- Proposes a design that directly addresses the latency constraint (zero overhead on request path)
- Explains the accuracy tradeoff with concrete bounds
- Considers failure modes and graceful degradation
- Thinks about horizontal scaling and operational simplicity

**Production Maturity:**
- Discusses observability, debugging, and testing upfront
- Includes a rollout strategy that de-risks the implementation`
                }
            ]}
            comparisonRows={[
                { aspect: 'Latency Overhead', bad: 'High (Network RTT per request)', good: 'Low (Local lookup + Async sync)', best: 'Zero (Local enforcement)' },
                { aspect: 'Accuracy', bad: 'High (Strict consistency)', good: 'Medium (Eventual consistency)', best: 'Tunable (Bounded error)' },
                { aspect: 'Scalability', bad: 'Poor (Redis hotspot)', good: 'Better (Reduced write load)', best: 'Excellent (Horizontally scalable)' },
                { aspect: 'Failure Handling', bad: 'SPOF (Fails open or closed)', good: 'Basic Fallback', best: 'Graceful Degradation (Last known quota)' },
                { aspect: 'Operational Complexity', bad: 'Medium (Redis Cluster)', good: 'High (Sync logic complexity)', best: 'Medium (Stateless Service)' }
            ]}
            rubricItems={[
                'Clarifies requirements and constraints before proposing a solution',
                'Explicitly discusses latency vs. accuracy tradeoffs',
                'Proposes a design that addresses the performance constraint',
                'Considers failure modes and graceful degradation',
                'Discusses observability and operational concerns upfront',
                'Mentions testing and rollout strategy',
                'Explains when to choose different approaches'
            ]}
            keyTakeaways={[
                'Always clarify requirements and constraints before proposing a solution. The "right" design depends on acceptable tradeoffs.',
                'At high scale, synchronous calls to shared state are often the bottleneck. Consider async approaches or local enforcement with periodic reconciliation.',
                'Graceful degradation is critical for production systems. Design for failure modes, not just happy paths.',
                'Operational simplicity is a feature, not an afterthought. Complex systems are harder to debug, monitor, and maintain.',
                'Start simple and add complexity incrementally. Validate each layer before building the next one.'
            ]}
            relatedChallenges={[
                { title: 'Designing a Distributed Counter', href: '/samples/scenario-2' },
                { title: 'Architecting a Global Leaderboard', href: '/samples/scenario-3' }
            ]}
        />
    );
}
