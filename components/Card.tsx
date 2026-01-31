import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
}

export default function Card({ children, className = '', hover = false }: CardProps) {
    const hoverClass = hover ? 'hover:scale-[1.02] hover:shadow-xl hover:shadow-[var(--accent-primary)]/20 cursor-pointer' : '';

    return (
        <div className={`glass-strong rounded-xl p-6 transition-all duration-300 ${hoverClass} ${className}`}>
            {children}
        </div>
    );
}
