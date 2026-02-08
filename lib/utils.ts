export function getBaseUrl(): string {
    if (process.env.NEXT_PUBLIC_BASE_URL) {
        return process.env.NEXT_PUBLIC_BASE_URL;
    }
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    return 'http://localhost:3000';
}

export const THEME_LABELS: Record<string, string> = {
    'scale': 'Designing at Massive Scale',
    'performance': 'Performance & Capacity',
    'reliability': 'Reliability & Incidents',
    'architecture': 'Architecture Tradeoffs',
};

export function getThemeLabel(theme: string): string {
    return THEME_LABELS[theme] || theme;
}
