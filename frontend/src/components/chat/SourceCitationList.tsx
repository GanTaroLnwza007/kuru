import type { ChatSourceChunk } from "@/lib/api/schemas.generated";
import { SourceChip } from "./SourceChip";

type Props = {
  sources: ChatSourceChunk[];
  label: string;
};

export function SourceCitationList({ sources, label }: Props) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-2">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-ink-4">{label}</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {sources.map((source, i) => (
          <SourceChip key={`${source.source_file}-${i}`} source={source} />
        ))}
      </div>
    </div>
  );
}
