import Link from 'next/link';
import Badge from './Badge';

interface ScenarioTeaserProps {
  title: string;
  metadata: {
    difficulty: string;
    estimated_time_minutes: number;
    topics: string[];
  };
  problem: {
    title: string;
    statement: string;
    context: string;
    pause_prompt: string;
  };
  theme: string;
  problemType: string;
}

export default function ScenarioTeaser({
  title,
  metadata,
  problem,
  theme,
  problemType,
}: ScenarioTeaserProps) {
  return (
    <div className="min-h-screen bg-theme-bg text-theme-text">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-theme-muted hover:text-theme-text transition"
          >
            &larr; Back to DailyDesign
          </Link>
        </div>

        {/* Metadata badges */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-accent-900/30 text-accent-400 border border-accent-800/50 text-xs font-semibold uppercase tracking-wider">
            {problemType.replace('_', ' ')}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-inset text-theme-muted border border-theme-border text-xs">
            {metadata.difficulty}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-inset text-theme-muted border border-theme-border text-xs">
            {metadata.estimated_time_minutes} min
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>

        {/* Topics */}
        <div className="flex flex-wrap gap-2 mb-8">
          {metadata.topics.map((topic) => (
            <Badge key={topic} type="neutral">
              {topic}
            </Badge>
          ))}
        </div>

        {/* Problem statement */}
        <div className="bg-theme-panel rounded-lg border border-theme-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-theme-text mb-3">The Scenario</h2>
          <p className="text-theme-body leading-relaxed mb-4">{problem.statement}</p>
          <p className="text-theme-muted leading-relaxed">{problem.context}</p>
        </div>

        {/* Pause prompt (the question) */}
        <div className="bg-accent-900/20 border border-accent-800/40 rounded-lg p-6 mb-8">
          <p className="text-accent-300 font-medium italic">{problem.pause_prompt}</p>
        </div>

        {/* Paywall */}
        <div className="relative">
          {/* Blurred placeholder */}
          <div className="select-none pointer-events-none" aria-hidden="true">
            <div className="bg-theme-panel rounded-lg border border-theme-border p-6 blur-sm opacity-40">
              <div className="h-4 bg-surface-inset rounded w-3/4 mb-3" />
              <div className="h-4 bg-surface-inset rounded w-full mb-3" />
              <div className="h-4 bg-surface-inset rounded w-5/6 mb-3" />
              <div className="h-4 bg-surface-inset rounded w-2/3 mb-6" />
              <div className="grid grid-cols-3 gap-4">
                <div className="h-24 bg-red-500/10 rounded" />
                <div className="h-24 bg-blue-500/10 rounded" />
                <div className="h-24 bg-green-500/10 rounded" />
              </div>
            </div>
          </div>

          {/* Overlay CTA */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-theme-panel/95 backdrop-blur-sm border border-theme-border rounded-xl p-8 max-w-md text-center shadow-2xl">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent-900/40 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-accent-400"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-theme-text mb-2">
                Full Analysis Locked
              </h3>
              <p className="text-theme-muted text-sm mb-6">
                Subscribe to unlock the complete bad/good/best answer comparison, framework steps, interview simulation, and reflection prompts.
              </p>
              <Link
                href="/#pricing"
                className="inline-block px-6 py-3 bg-accent-700 hover:bg-accent-600 text-white font-semibold rounded-lg transition mb-3 w-full"
              >
                Subscribe to Unlock
              </Link>
              <p className="text-theme-muted text-xs mt-4">
                Already subscribed? Check your email for the access link.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
