'use client';

import ReactMarkdown from 'react-markdown';

export default function MarkdownContent({ content, className = '' }: { content: string; className?: string }) {
    return (
        <div className={`leading-relaxed ${className}`}>
            <ReactMarkdown
                components={{
                    p: ({ children }) => <p className="text-theme-body mb-3 last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong className="text-theme-text font-semibold">{children}</strong>,
                    em: ({ children }) => <em className="text-theme-body">{children}</em>,
                    ul: ({ children }) => <ul className="list-disc list-outside ml-5 space-y-1 mb-3 text-theme-body">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-outside ml-5 space-y-1 mb-3 text-theme-body">{children}</ol>,
                    li: ({ children }) => <li className="text-theme-body pl-1">{children}</li>,
                    code: ({ children }) => <code className="bg-theme-inset px-1.5 py-0.5 rounded text-accent-300 font-mono text-xs">{children}</code>,
                    h1: ({ children }) => <h1 className="text-xl font-bold text-theme-text mb-3 mt-4">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-bold text-theme-text mb-2 mt-4">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-semibold text-theme-text mb-2 mt-3">{children}</h3>,
                    h4: ({ children }) => <h4 className="text-sm font-semibold text-theme-text mb-2 mt-2">{children}</h4>,
                    blockquote: ({ children }) => <blockquote className="border-l-2 border-accent-500 pl-4 my-3 text-theme-muted italic">{children}</blockquote>,
                    hr: () => <hr className="border-theme-border my-4" />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
