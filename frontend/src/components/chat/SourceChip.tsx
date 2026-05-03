import type { SourceChunk } from "@/lib/api";

type Props = {
  source: SourceChunk;
};

const MAX_EXCERPT = 40;

export function SourceChip({ source }: Props) {
  const excerpt =
    source.excerpt.length > MAX_EXCERPT
      ? source.excerpt.slice(0, MAX_EXCERPT) + "…"
      : source.excerpt;

  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-surface-subtle bg-surface px-3 py-1 text-xs text-text-secondary">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-3 w-3 shrink-0 text-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 10h18M3 6h18M3 14h10"
        />
      </svg>
      <span className="font-medium text-text-muted">{source.table}</span>
      <span className="text-text-secondary">{excerpt}</span>
    </span>
  );
}
