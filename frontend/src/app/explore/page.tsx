"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import type { ProgramSummary } from "@/lib/api";
import { RICH_PROGRAMS } from "@/lib/program-rich";
import { RIASEC_DIMS, computeProgramMatch } from "@/lib/riasec";
import { useAppStore } from "@/lib/store";
import { ProgramSearchBar } from "@/components/explore/ProgramSearchBar";
import { Icon } from "@/components/ui/Icon";

// ── colour helpers ─────────────────────────────────────────────
const CATEGORY_CHIPS = [
  { label: "ทั้งหมด", key: "" },
  { label: "วิศวกรรมศาสตร์", key: "วิศวกรรม" },
  { label: "วิทยาศาสตร์", key: "วิทยาศาสตร์" },
  { label: "เกษตร / สิ่งแวดล้อม", key: "เกษตร" },
  { label: "สังคมศาสตร์ / บริหาร", key: "สังคม" },
  { label: "วิทย์สุขภาพ", key: "สัตว" },
];

// ── program card ───────────────────────────────────────────────
function ExplorerCard({
  program,
  match,
  pinned,
  onPin,
}: {
  program: ProgramSummary;
  match: number | null;
  pinned: boolean;
  onPin: () => void;
}) {
  const rich = RICH_PROGRAMS[program.id];

  return (
    <div className="group relative flex flex-col rounded-2xl border border-line-soft bg-surface shadow-sm transition-shadow hover:shadow-md">
      <Link
        href={`/explore/${program.id}`}
        className="flex flex-1 flex-col p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dgreen rounded-2xl"
      >
        {/* header row */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink group-hover:text-dgreen">
              {program.name_th}
            </p>
            <p className="mt-0.5 text-xs text-ink-3">{program.faculty_th}</p>
          </div>
          {match !== null && (
            <span
              className="flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-black"
              style={{ background: "var(--d-green-soft)", color: "var(--d-green-deep)" }}
            >
              {match}%
            </span>
          )}
        </div>

        {/* RIASEC dim tags */}
        {rich && (
          <div className="mb-2.5 flex flex-wrap gap-1">
            {rich.riasec.map((dk) => (
              <span
                key={dk}
                className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{
                  background: RIASEC_DIMS[dk].color + "1A",
                  color: RIASEC_DIMS[dk].color,
                }}
              >
                {RIASEC_DIMS[dk].th}
              </span>
            ))}
          </div>
        )}

        {/* vibe */}
        {program.year_by_year_vibe && (
          <p className="mb-2.5 line-clamp-2 text-xs leading-relaxed text-ink-3">
            {program.year_by_year_vibe}
          </p>
        )}

        {/* footer */}
        <div className="mt-auto flex items-center justify-between pt-2">
          {rich && (
            <p className="text-xs font-semibold text-dgreen">
              {rich.salary}
            </p>
          )}
          <span className="ml-auto text-xs font-semibold text-dgreen">
            ดูรายละเอียด →
          </span>
        </div>
      </Link>

      {/* pin button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          onPin();
        }}
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-surface-subtle"
        aria-label={pinned ? "ถอนหมุด" : "ปักหมุด"}
      >
        <Icon
          name={pinned ? "heart-fill" : "heart"}
          size={16}
          color={pinned ? "var(--d-green)" : "var(--ink-4)"}
        />
      </button>
    </div>
  );
}

// ── compare modal ──────────────────────────────────────────────
function CompareModal({
  programIds,
  programs,
  onClose,
}: {
  programIds: string[];
  programs: ProgramSummary[];
  onClose: () => void;
}) {
  const items = programs.filter((p) => programIds.includes(p.id));

  const rows = [
    { label: "คณะ", get: (p: ProgramSummary) => p.faculty_th },
    {
      label: "ค่าเทอม",
      get: (p: ProgramSummary) => RICH_PROGRAMS[p.id]?.cost ?? "—",
    },
    {
      label: "เงินเดือนเริ่มต้น",
      get: (p: ProgramSummary) => RICH_PROGRAMS[p.id]?.salary ?? "—",
    },
    {
      label: "อาชีพ",
      get: (p: ProgramSummary) =>
        (RICH_PROGRAMS[p.id]?.careers ?? []).slice(0, 2).join(", "),
    },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-surface p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-dgreen">
              เปรียบเทียบ
            </p>
            <h2 className="text-xl font-black text-ink">{items.length} หลักสูตร เคียงข้างกัน</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-subtle text-ink-2 hover:bg-line-soft"
          >
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="overflow-auto rounded-2xl border border-line-soft">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-surface-subtle">
                <th className="px-4 py-3 text-left text-xs font-semibold text-ink-3" />
                {items.map((p) => (
                  <th
                    key={p.id}
                    className="px-4 py-3 text-left text-sm font-bold text-ink"
                    style={{ minWidth: 140 }}
                  >
                    {p.name_th}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-line-soft">
                  <td className="px-4 py-3 text-xs font-semibold text-ink-3">{row.label}</td>
                  {items.map((p) => (
                    <td key={p.id} className="px-4 py-3 text-sm font-medium text-ink">
                      {row.get(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── pinned bar ─────────────────────────────────────────────────
function PinnedBar({
  pinnedIds,
  onClear,
  onCompare,
}: {
  pinnedIds: string[];
  onClear: () => void;
  onCompare: () => void;
}) {
  return (
    <div className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-ink px-3 py-2.5 text-white shadow-2xl">
      <Icon name="heart-fill" size={16} color="var(--d-green)" />
      <span className="text-sm font-bold">ปักหมุด {pinnedIds.length} หลักสูตร</span>
      <button
        onClick={onClear}
        className="rounded-xl bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
      >
        ล้าง
      </button>
      <button
        onClick={onCompare}
        className="flex items-center gap-1.5 rounded-xl bg-dgreen px-3 py-1.5 text-xs font-bold text-white hover:bg-dgreen-deep"
      >
        เปรียบเทียบ <Icon name="arrow-right" size={13} color="white" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────
type SortKey = "match" | "cost" | "faculty";

export default function ExplorePage() {
  const riasecScores = useAppStore((s) => s.riasec.scores);

  const [query, setQuery] = useState("");
  const [allPrograms, setAllPrograms] = useState<ProgramSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categoryFilter, setCategoryFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [costFilter, setCostFilter] = useState<"all" | "lt15" | "gt15">("all");
  const [sortKey, setSortKey] = useState<SortKey>("match");

  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const r = await apiClient.searchPrograms({ q: query });
        if (!cancelled) setAllPrograms(r.data.results);
      } catch {
        if (!cancelled) setError("โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [query]);

  const programs = useMemo(() => {
    let list = allPrograms.map((p) => {
      const rich = RICH_PROGRAMS[p.id];
      const match =
        rich && riasecScores
          ? computeProgramMatch(rich.riasec, riasecScores, rich.baseFit)
          : rich
          ? rich.baseFit
          : null;
      return { ...p, match, rich };
    });

    // category filter (fuzzy on faculty)
    if (categoryFilter) {
      list = list.filter(
        (p) =>
          p.faculty_th.includes(categoryFilter) ||
          p.faculty_en.toLowerCase().includes(categoryFilter.toLowerCase()),
      );
    }

    // cost filter
    if (costFilter === "lt15") {
      list = list.filter((p) => {
        const c = parseInt((p.rich?.cost ?? "").replace(/[^0-9]/g, ""));
        return !isNaN(c) && c < 15500;
      });
    } else if (costFilter === "gt15") {
      list = list.filter((p) => {
        const c = parseInt((p.rich?.cost ?? "").replace(/[^0-9]/g, ""));
        return !isNaN(c) && c >= 15500;
      });
    }

    // sort
    if (sortKey === "match") {
      list.sort((a, b) => (b.match ?? 0) - (a.match ?? 0));
    } else if (sortKey === "cost") {
      list.sort((a, b) => {
        const ca = parseInt((a.rich?.cost ?? "0").replace(/[^0-9]/g, ""));
        const cb = parseInt((b.rich?.cost ?? "0").replace(/[^0-9]/g, ""));
        return ca - cb;
      });
    } else if (sortKey === "faculty") {
      list.sort((a, b) => a.faculty_th.localeCompare(b.faculty_th, "th"));
    }

    return list;
  }, [allPrograms, categoryFilter, costFilter, sortKey, riasecScores]);

  const togglePin = useCallback((id: string) => {
    setPinnedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  return (
    <>
      <section
        className="mx-auto w-full max-w-6xl px-4 pb-28 sm:px-6"
        data-testid="explore-shell"
      >
        {/* header */}
        <div className="pb-6 pt-6 sm:pt-10">
          <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-dgreen">
            ค้นหาคณะ · {allPrograms.length} หลักสูตร
          </p>
          <h1 className="mb-4 text-2xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
            ลองพิมพ์สิ่งที่คุณสนใจ<br className="hidden sm:block" />
            เป็นภาษาธรรมชาติได้เลย
          </h1>

          {/* search */}
          <div className="mb-3 flex gap-2">
            <div className="flex-1">
              <ProgramSearchBar
                placeholder="เช่น 'อยากเรียนเทคโนโลยีกับเกษตร', 'คณะที่ทำงานต่างประเทศได้'"
                onSearch={setQuery}
              />
            </div>
            <button
              onClick={() => setShowFilters((s) => !s)}
              className={`flex h-12 items-center gap-1.5 rounded-card border px-4 text-sm font-semibold transition-colors ${
                showFilters
                  ? "border-ink bg-ink text-white"
                  : "border-line-soft bg-surface text-ink-2 hover:border-line"
              }`}
            >
              <Icon name="filter" size={15} color={showFilters ? "white" : "currentColor"} />
              ตัวกรอง
            </button>
          </div>

          {/* category chips */}
          <div className="flex flex-wrap gap-2">
            {CATEGORY_CHIPS.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategoryFilter(c.key)}
                className={`h-9 rounded-full px-4 text-sm font-semibold transition-all ${
                  categoryFilter === c.key
                    ? "bg-dgreen text-white shadow-sm"
                    : "border border-line bg-surface text-ink-2 hover:border-dgreen-soft"
                }`}
                style={
                  categoryFilter === c.key
                    ? { boxShadow: "0 2px 8px -2px rgba(0,166,81,0.4)" }
                    : {}
                }
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* filter panel */}
          {showFilters && (
            <div className="mt-3 rounded-2xl border border-line-soft bg-surface p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs text-ink-3">ค่าเทอม</p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ["all", "ทั้งหมด"],
                        ["lt15", "< 15,500"],
                        ["gt15", "≥ 15,500"],
                      ] as [typeof costFilter, string][]
                    ).map(([v, l]) => (
                      <button
                        key={v}
                        onClick={() => setCostFilter(v)}
                        className={`h-8 rounded-full px-3.5 text-xs font-semibold transition-all ${
                          costFilter === v
                            ? "bg-dgreen text-white"
                            : "border border-line bg-surface text-ink-2 hover:border-dgreen-soft"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs text-ink-3">เรียงตาม</p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ["match", "ความเข้ากัน"],
                        ["cost", "ค่าเทอม"],
                        ["faculty", "คณะ"],
                      ] as [SortKey, string][]
                    ).map(([v, l]) => (
                      <button
                        key={v}
                        onClick={() => setSortKey(v)}
                        className={`h-8 rounded-full px-3.5 text-xs font-semibold transition-all ${
                          sortKey === v
                            ? "bg-dgreen text-white"
                            : "border border-line bg-surface text-ink-2 hover:border-dgreen-soft"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIASEC hint */}
        {riasecScores && (
          <div
            className="mb-4 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold"
            style={{ background: "var(--d-green-soft)", color: "var(--d-green-deep)" }}
          >
            <Icon name="sparkles" size={15} color="var(--d-green)" />
            จัดเรียงตามผล RIASEC ของคุณแล้ว
          </div>
        )}

        {/* result count */}
        {!isLoading && (
          <p className="mb-3 text-sm text-ink-3">
            พบ <strong className="text-ink">{programs.length}</strong> หลักสูตร
          </p>
        )}

        {/* error */}
        {error && (
          <p className="mb-4 rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
            {error}
          </p>
        )}

        {/* grid */}
        {isLoading ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-busy>
            {Array.from({ length: 9 }).map((_, i) => (
              <li key={i} className="h-36 animate-pulse rounded-2xl bg-surface-subtle" />
            ))}
          </ul>
        ) : programs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line-soft p-10 text-center">
            <p className="text-sm text-ink-3">ไม่พบโปรแกรมที่ตรงกัน ลองพิมพ์คำค้นใหม่</p>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((p) => (
              <li key={p.id}>
                <ExplorerCard
                  program={p}
                  match={p.match}
                  pinned={pinnedIds.includes(p.id)}
                  onPin={() => togglePin(p.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* pinned bar */}
      {pinnedIds.length > 0 && (
        <PinnedBar
          pinnedIds={pinnedIds}
          onClear={() => setPinnedIds([])}
          onCompare={() => setShowCompare(true)}
        />
      )}

      {/* compare modal */}
      {showCompare && pinnedIds.length > 0 && (
        <CompareModal
          programIds={pinnedIds}
          programs={allPrograms}
          onClose={() => setShowCompare(false)}
        />
      )}
    </>
  );
}
