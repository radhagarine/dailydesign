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
    }
];

export function getDailyStrategy(date: Date = new Date()) {
    // 1. Determine Week Index (Simple epoch math)
    // Epoch week allows consistent rotation regardless of year boundaries
    const oneWeekMs = 1000 * 60 * 60 * 24 * 7;
    const epoch = new Date('2024-01-01T00:00:00Z').getTime(); // Reference point
    const current = date.getTime();
    const weekIndex = Math.floor((current - epoch) / oneWeekMs);

    // Rotate through the 4 themes
    const themeIndex = weekIndex % THEMES.length;
    const theme = THEMES[themeIndex];

    // 2. Determine Problem Type
    // Simple rule: Alternate days, or randomize. 
    // Let's do: Mon/Wed/Fri = Tactical (Type B), Tue/Thu/Sat = System Design (Type A), Sun = Random
    // 0 = Sun, 1 = Mon, ...
    const day = date.getUTCDay();
    let problemType: ProblemType = 'TACTICAL'; // Default

    if (day === 0) {
        // Deterministic: alternate Sundays based on week index (even weeks = SYSTEM_DESIGN)
        problemType = weekIndex % 2 === 0 ? 'SYSTEM_DESIGN' : 'TACTICAL';
    } else if (day % 2 === 0) {
        // Tue (2), Thu (4), Sat (6) -> System Design (More time to read?)
        problemType = 'SYSTEM_DESIGN';
    } else {
        // Mon (1), Wed (3), Fri (5) -> Tactical
        problemType = 'TACTICAL';
    }

    // 3. Pick a specific focus area for variety
    // Use (weekIndex * 7 + day) to avoid bias — day % length favors indices 0-1
    const focusArea = theme.focusAreas[(weekIndex * 7 + day) % theme.focusAreas.length];

    return {
        theme,
        problemType,
        focusArea
    };
}
