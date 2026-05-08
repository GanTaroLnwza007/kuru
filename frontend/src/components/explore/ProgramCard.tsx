import Link from "next/link";
import type { ProgramSummary } from "@/lib/api";

type Props = {
  program: ProgramSummary;
  ctaLabel: string;
};

export function ProgramCard({ program, ctaLabel }: Props) {
  return (
    <Link
      href={`/explore/${program.id}`}
      className="group block min-h-[44px] rounded-card border border-surface-subtle bg-surface p-4 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-text-primary group-hover:text-primary">
            {program.name_th}
          </h3>
          <p className="mt-0.5 text-xs text-text-secondary">{program.faculty_th}</p>
          <span className="mt-1 inline-block rounded-full bg-surface-subtle px-2 py-0.5 text-xs font-medium text-text-muted">
            {program.degree}
          </span>
        </div>
      </div>

      {program.year_by_year_vibe && (
        <p className="mt-2 line-clamp-1 text-sm text-text-muted">{program.year_by_year_vibe}</p>
      )}

      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
        {ctaLabel} →
      </span>
    </Link>
  );
}
