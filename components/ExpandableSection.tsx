'use client';

import { useState, ReactNode } from 'react';

interface ExpandableSectionProps {
    title: string;
    children: ReactNode;
    defaultExpanded?: boolean;
    icon?: string;
}

export default function ExpandableSection({
    title,
    children,
    defaultExpanded = false,
    icon = '📋'
}: ExpandableSectionProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className="expandable-section">
            <button
                className="expandable-header"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
            >
                <div className="expandable-title">
                    <span className="expandable-icon">{icon}</span>
                    <span>{title}</span>
                </div>
                <svg
                    className={`expandable-chevron ${isExpanded ? 'expanded' : ''}`}
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                >
                    <path
                        d="M5 7.5L10 12.5L15 7.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            <div className={`expandable-content ${isExpanded ? 'expanded' : ''}`}>
                <div className="expandable-inner">
                    {children}
                </div>
            </div>
        </div>
    );
}
