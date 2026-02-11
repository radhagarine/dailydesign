import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                accent: {
                    300: '#67e8f9', // Light cyan — subtle highlights
                    400: '#22d3ee', // Cyan — links, interactive text
                    500: '#06b6d4', // Primary — buttons, key highlights
                    600: '#0891b2', // Hover state
                    700: '#0e7490', // Deeper interactive
                    800: '#155e75', // Subtle backgrounds
                    900: '#083344', // Dark tints
                },
                violet: {
                    400: '#a78bfa', // Secondary text accents
                    500: '#8b5cf6', // Gradient endpoints
                    600: '#7c3aed', // Button alternatives
                    900: '#1e1040', // Subtle bg tints
                },
                dark: {
                    900: '#030712', // Bg Primary — blue-tinted black
                    800: '#0a0f1a', // Bg Secondary
                    700: '#111827', // Bg Tertiary
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
