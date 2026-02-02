import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    type: 'bad' | 'good' | 'best' | 'neutral';
}

export default function Badge({ children, type }: BadgeProps) {
    const styles = {
        bad: 'bg-red-500/20 text-red-400 border-red-500/50',
        good: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
        best: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
        neutral: 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    };

    const icons: Record<string, string | null> = {
        bad: '❌',
        good: '✅',
        best: '⭐',
        neutral: null
    };

    return (
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold text-sm ${styles[type]}`}>
            {icons[type] && <span>{icons[type]}</span>}
            {children}
        </span>
    );
}
