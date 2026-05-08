import type { ChatSourceChunk } from "@/lib/api/schemas.generated";

type Props = {
  source: ChatSourceChunk;
};

export function SourceChip({ source }: Props) {
  const pct = Math.round(source.similarity * 100);
  const name = source.source_file.replace(/\.[^/.]+$/, "");
  const display = name.length > 28 ? name.slice(0, 28) + "…" : name;

  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1 text-xs text-ink-3">
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
      <span className="font-medium text-ink-2">{display}</span>
      <span className="text-ink-4">{pct}%</span>
    </span>
  );
}
