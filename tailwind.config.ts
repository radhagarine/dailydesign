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
                maroon: {
                    300: '#fca5a5',
                    400: '#f87171',
                    500: '#b91c1c',
                    600: '#991b1b', // Primary Maroon
                    700: '#7f1d1d',
                    800: '#450a0a', // Deepest
                    900: '#2a0505',
                },
                dark: {
                    900: '#050505', // Bg Primary
                    800: '#0a0a0a', // Bg Secondary
                    700: '#121212', // Bg Tertiary
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        },
    },
    plugins: [],
};
export default config;
