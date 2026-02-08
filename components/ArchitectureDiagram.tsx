'use client';

import { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';

interface ArchitectureDiagramProps {
    diagram: string;
    title?: string;
}

export default function ArchitectureDiagram({ diagram, title }: ArchitectureDiagramProps) {
    const diagramRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && diagramRef.current) {
            // Dynamically import mermaid only on client side
            import('mermaid').then((mermaid) => {
                mermaid.default.initialize({
                    startOnLoad: true,
                    theme: 'dark',
                    themeVariables: {
                        primaryColor: '#6366f1',
                        primaryTextColor: '#e0e7ff',
                        primaryBorderColor: '#818cf8',
                        lineColor: '#818cf8',
                        secondaryColor: '#8b5cf6',
                        tertiaryColor: '#1e293b',
                        background: '#0f172a',
                        mainBkg: '#1e293b',
                        secondBkg: '#334155',
                        textColor: '#e2e8f0',
                        fontSize: '14px'
                    }
                });

                // Render the diagram
                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                mermaid.default.render(id, diagram).then(({ svg }) => {
                    if (diagramRef.current) {
                        diagramRef.current.innerHTML = DOMPurify.sanitize(svg, {
                            USE_PROFILES: { svg: true, svgFilters: true },
                            ADD_TAGS: ['foreignObject'],
                        });
                    }
                });
            });
        }
    }, [diagram]);

    return (
        <div className="architecture-diagram">
            {title && <h4 className="diagram-title">{title}</h4>}
            <div ref={diagramRef} className="diagram-container" />
        </div>
    );
}
