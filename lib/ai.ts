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

// ── Exported TypeScript interfaces (kept for component compatibility) ──

export interface FrameworkStepResponse {
    level: 'bad' | 'good' | 'best';
    icon: string;
    response: string;
    why_this_level: string;
    red_flags?: string[];
    strengths?: string[];
    what_is_missing?: string;
    principal_engineer_signals?: string[];
}

export interface ComparisonTable {
    criterion: string;
    interviewer_question?: string;
    responses: FrameworkStepResponse[];
}

export interface ComponentDecision {
    component: string;
    comparison_table: ComparisonTable;
}

export interface FrameworkStep {
    step_number: number;
    step_name: string;
    time_allocation: string;
    description: string;
    pause_prompt: string;
    comparison_table?: ComparisonTable;
    interviewer_response?: {
        clarifications: string[];
        additional_context: string;
    };
    calculations_breakdown?: {
        storage: { total_data: string; working_set: string; per_region: string };
        throughput: { global_qps: string; per_region_qps: string; cache_hit_qps: string; database_qps: string };
        bandwidth: { peak_bandwidth: string; per_region_bandwidth: string };
    };
    architecture_diagram_description?: string;
    component_decisions?: ComponentDecision[];
    other_failure_scenarios?: Array<{ scenario: string; impact: string; mitigation: string }>;
    key_takeaways: string[];
}

export interface InterviewScenario {
    metadata: {
        difficulty: string;
        estimated_time_minutes: number;
        topics: string[];
        generated_date: string;
    };
    problem: {
        title: string;
        statement: string;
        context: string;
        pause_prompt: string;
    };
    framework_steps: FrameworkStep[];
    interview_simulation: {
        title: string;
        description: string;
        scenario: {
            interviewer_question: string;
            pause_prompt: string;
            comparison_table: ComparisonTable;
        };
        key_takeaways: string[];
    };
    summary: {
        critical_concepts_covered: string[];
        patterns_demonstrated: string[];
        what_made_responses_best_level: string[];
    };
    reflection_prompts: {
        self_assessment: string[];
        practice_next: string[];
    };
}

// ── Trimmed prompt (JSON schema removed — Structured Outputs enforces it) ──

const INTERVIEW_CONTENT_PROMPT = `
You are an expert system design interviewer and principal engineer with 15+ years of experience conducting interviews at FAANG companies. Your task is to generate a complete 40-minute system design interview practice session.

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

## Structural Requirements
- Generate 4 framework steps: Clarify Requirements, Estimate Scale, High-Level Architecture, Failures & Bottlenecks
- Each step has a comparison_table with bad/good/best responses
- Step 2 must include calculations_breakdown with storage, throughput, bandwidth (specific numbers with units)
- Step 3 must include architecture_diagram_description and component_decisions
- Step 4 must include other_failure_scenarios
- Step 1 must include interviewer_response with clarifications
- Include interview_simulation with a dynamic requirements change scenario

### For Each Comparison Table
1. Bad Response: Write as if a mid-level engineer with 3-4 years experience who hasn't prepared is responding. Show common anti-patterns. Length: 1-2 paragraphs.
2. Good Response: Write as if a prepared senior engineer with solid fundamentals is responding. Show improvement over bad, but missing depth. Length: 3-4 paragraphs.
3. Best Response: Write as if a staff/principal engineer with 10+ years and interview preparation is responding. This should be 2-3x longer than good, showing structured thinking, trade-offs, and adaptability. Length: 5-7+ paragraphs with clear structure.

### Calculations Must Be
- Specific with units (TB, GB, MB/s, QPS)
- Show intermediate steps
- Consider real-world patterns (Pareto principle for hot/cold data, typical cache hit rates 70-90%, typical P99 latency targets)
- Derive infrastructure requirements from numbers

### Architecture Decisions Must
- Compare at least 2 alternatives
- Map requirements to decisions
- Discuss trade-offs explicitly
- Show when you'd choose differently

### Failure Scenarios Must
- Use timeline-based breakdown (immediate, detection/failover, recovery)
- Quantify impact (QPS changes, latency degradation)
- Propose multiple mitigations
- Consider cascading effects

Theme: {{THEME_TITLE}}
Focus Area: {{FOCUS_AREA}}
Problem Type: {{PROBLEM_TYPE}}
Difficulty: Principal
Date: {{GENERATED_DATE}}`;

// Additional context prompts for specific themes
const THEME_CONTEXT: Record<string, string> = {
    'scale': `Focus on systems that handle massive scale: 100M+ users, billions of events, petabyte-scale data.
Include specific numbers like "500K concurrent connections", "10TB daily data ingestion", "sub-50ms p99 latency requirement".
Consider: horizontal scaling, sharding strategies, caching layers, async processing, eventual consistency tradeoffs.
Example problems: Global CDN, Distributed Cache, Rate Limiter at Scale, Sharding Strategy for 100B Records.`,

    'performance': `Focus on performance bottlenecks, optimization decisions, and capacity planning.
Include specific metrics: latency percentiles (p50/p95/p99), throughput, CPU/memory utilization, query execution times.
Consider: profiling approaches, database optimization, caching strategies, connection pooling, resource contention.
Example problems: Database Query Optimization Under Load, Latency Spike Investigation, Memory Leak Diagnosis, Capacity Planning for 10x Growth.`,

    'reliability': `Focus on failure modes, incident response, chaos engineering, and building resilient systems.
Include specific failure scenarios: cascading failures, split-brain, data corruption, dependency outages.
Consider: circuit breakers, bulkheads, graceful degradation, disaster recovery, SLO/SLA tradeoffs.
Example problems: Cascading Failure Prevention, Incident Response Strategy, Disaster Recovery Planning, Monitoring and Alerting Design.`,

    'architecture': `Focus on architectural decisions and system evolution over time.
Include specific tradeoffs: monolith vs microservices, sync vs async, SQL vs NoSQL, build vs buy.
Consider: migration strategies, technical debt, organizational structure, team boundaries, backwards compatibility.
Example problems: Monolith to Microservices Migration, SQL vs NoSQL Decision, Sync vs Async Processing, Technical Debt Prioritization.`
};

export async function generateDailyScenario(
    strategy: { theme: Theme, problemType: ProblemType, focusArea: string },
    targetDate?: Date
): Promise<InterviewScenario> {
    const date = targetDate || new Date();
    const generatedDate = date.toISOString().split('T')[0];

    const systemPrompt = INTERVIEW_CONTENT_PROMPT
        .replace('{{THEME_TITLE}}', strategy.theme.title)
        .replace('{{FOCUS_AREA}}', strategy.focusArea)
        .replace('{{PROBLEM_TYPE}}', strategy.problemType)
        .replace('{{GENERATED_DATE}}', generatedDate);

    const themeContext = THEME_CONTEXT[strategy.theme.id] || '';
    const userMessage = `Generate a complete ${strategy.problemType === 'SYSTEM_DESIGN' ? 'system design' : 'tactical'} interview scenario.

Theme: ${strategy.theme.title}
Focus Area: ${strategy.focusArea}

${themeContext}

Important:
- The problem must be specific to "${strategy.focusArea}" within "${strategy.theme.title}"
- Include concrete numbers and metrics throughout
- Bad/good/best responses must be CLEARLY different in quality and depth
- Best responses should be 2-3x longer than good responses
- Bad answers should be things real candidates actually say`;

    console.log(`Generating [${strategy.problemType}] scenario for theme: ${strategy.theme.title} (${strategy.focusArea})`);

    try {
        const completion = await openai.chat.completions.parse({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ],
            model: 'gpt-4o-mini',
            response_format: zodResponseFormat(InterviewScenarioSchema, 'interview_scenario'),
            temperature: 0.75,
            max_tokens: 8000,
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
        console.error('AI generation failed:', error);
        throw error;
    }
}
