export type Theme = {
    id: string;
    title: string;
    description: string;
    focusAreas: string[];
};

export type ProblemType = 'SYSTEM_DESIGN' | 'TACTICAL';

export const THEMES: Theme[] = [
    {
        id: 'scale',
        title: 'Designing at Massive Scale',
        description: 'Focus on architectures that support 100M+ users, high throughput, and global distribution.',
        focusAreas: ['Global CDN', 'Sharding', 'Multi-region', 'Rate Limiting', 'Distributed Cache']
    },
    {
        id: 'performance',
        title: 'Performance Bottlenecks & Capacity Planning',
        description: 'Deep dives into latency, CPU saturation, database query optimization, and resource estimation.',
        focusAreas: ['Query Optimization', 'Latency Analysis', 'Memory Leaks', 'Capacity Planning', 'Network Congestion']
    },
    {
        id: 'reliability',
        title: 'Reliability, Failures & Incidents',
        description: 'Handling outages, cascading failures, chaos engineering, and incident response.',
        focusAreas: ['Cascading Failures', 'Circuit Breakers', 'Disaster Recovery', 'Incident Response', 'Monitoring']
    },
    {
        id: 'architecture',
        title: 'Architecture Tradeoffs & Evolution',
        description: 'Making hard choices between technologies (SQL vs NoSQL) and managing system evolution.',
        focusAreas: ['Monolith vs Microservices', 'Sync vs Async', 'Consistency vs Availability', 'Migration Strategy', 'Event-Driven Architecture', 'API Design & Evolution']
    },
    {
        id: 'product',
        title: 'Product System Design',
        description: 'End-to-end design of real-world products — the classic "Design X" problems that dominate FAANG interviews.',
        focusAreas: ['Video Streaming', 'Social Platform', 'Messaging & Chat', 'Ride Sharing & Geo', 'Search & Discovery', 'E-Commerce Platform']
    },
    {
        id: 'genai',
        title: 'GenAI & AI Engineering',
        description: 'Design and operate production AI/ML systems — LLM serving, RAG pipelines, model evaluation, and AI-native architectures.',
        focusAreas: [
            'LLM Serving & Inference',
            'RAG & Knowledge Systems',
            'Local LLM & Edge AI',
            'AI Agent Orchestration',
            'LLM Observability & Monitoring',
            'Real-Time ML & Streaming Models'
        ]
    }
];

export function getDailyStrategy(date: Date = new Date()) {
    const epoch = new Date('2024-01-01T00:00:00Z').getTime(); // Reference point
    const current = date.getTime();
    const daysSinceEpoch = Math.floor((current - epoch) / (1000 * 60 * 60 * 24));

    // 1. Rotate theme daily (6-day cycle) for even spread across all themes
    const themeIndex = daysSinceEpoch % THEMES.length;
    const theme = THEMES[themeIndex];

    // 2. Determine Problem Type
    // Mon/Wed/Fri = Tactical, Tue/Thu/Sat = System Design, Sun = alternating
    const day = date.getUTCDay();
    let problemType: ProblemType = 'TACTICAL';

    if (day === 0) {
        problemType = daysSinceEpoch % 2 === 0 ? 'SYSTEM_DESIGN' : 'TACTICAL';
    } else if (day % 2 === 0) {
        problemType = 'SYSTEM_DESIGN';
    } else {
        problemType = 'TACTICAL';
    }

    // 3. Pick a specific focus area — rotate within each theme using daysSinceEpoch
    const focusArea = theme.focusAreas[Math.floor(daysSinceEpoch / THEMES.length) % theme.focusAreas.length];

    return {
        theme,
        problemType,
        focusArea
    };
}
