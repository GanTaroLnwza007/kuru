import type { SourceChunk } from "@/lib/api";
import { SourceChip } from "./SourceChip";

type Props = {
  sources: SourceChunk[];
  label: string;
};

export function SourceCitationList({ sources, label }: Props) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-2">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">{label}</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {sources.map((source, i) => (
          <SourceChip key={`${source.table}-${source.row_id}-${i}`} source={source} />
        ))}
      </div>
    </div>
  );
}
