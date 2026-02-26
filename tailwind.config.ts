import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: 'class',
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                /* ── Semantic theme tokens (CSS-variable driven) ── */
                'theme-bg': 'var(--bg-primary)',
                'theme-panel': 'var(--bg-secondary)',
                'theme-inset': 'var(--bg-tertiary)',
                'theme-text': 'var(--text-primary)',
                'theme-body': 'var(--text-secondary)',
                'theme-muted': 'var(--text-tertiary)',
                'theme-border': 'var(--border-default)',
                'theme-border-s': 'var(--border-subtle)',
                'theme-border-strong': 'var(--border-strong)',
                'surface-inset': 'var(--surface-inset)',
                'surface-faint': 'var(--surface-faint)',

                /* ── Existing palette tokens (kept for signal colors) ── */
                accent: {
                    300: '#67e8f9',
                    400: '#22d3ee',
                    500: '#06b6d4',
                    600: '#0891b2',
                    700: '#0e7490',
                    800: '#155e75',
                    900: '#083344',
                },
                violet: {
                    400: '#a78bfa',
                    500: '#8b5cf6',
                    600: '#7c3aed',
                    900: '#1e1040',
                },
                dark: {
                    900: '#030712',
                    800: '#0a0f1a',
                    700: '#111827',
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
                'glow-pulse': 'glowPulse 3s ease-in-out infinite',
                'border-rotate': 'borderRotate 4s linear infinite',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                glowPulse: {
                    '0%, 100%': { opacity: '0.4' },
                    '50%': { opacity: '1' },
                },
                borderRotate: {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' },
                },
            },
        },
    },
    plugins: [],
};
export default config;
