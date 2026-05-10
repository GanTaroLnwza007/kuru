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

function programPalette(colorHex?: string): { bg1: string; bg2: string; fg: string } {
  if (!colorHex) return { bg1: "#E6F5EC", bg2: "#D6EDDF", fg: "#006D35" };
  return { bg1: colorHex + "22", bg2: colorHex + "11", fg: colorHex };
}

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
  const rich = RICH_PROGRAMS[program.slug ?? ""] ?? RICH_PROGRAMS[program.id];
  const palette = programPalette(rich?.colorHex);
  const initial = program.name_th?.[0] ?? "ก";

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-line-soft bg-surface shadow-sm"
      style={{ transition: "transform 220ms ease-out, box-shadow 240ms ease-out" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 2px 4px rgba(15,27,20,0.04), 0 20px 40px -12px rgba(15,27,20,0.14)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "";
      }}
    >
      {/* coloured header strip */}
      <div
        className="relative flex h-20 items-center justify-center overflow-hidden select-none"
        style={{
          background: `repeating-linear-gradient(135deg, ${palette.bg1}, ${palette.bg1} 10px, ${palette.bg2} 10px, ${palette.bg2} 20px)`,
        }}
      >
        <span
          className="text-7xl font-black leading-none opacity-20"
          style={{ color: palette.fg, letterSpacing: "-0.04em" }}
        >
          {initial}
        </span>
        {match !== null && (
          <span
            className="absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-black"
            style={{ background: "#fff", color: "var(--d-green)", boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}
          >
            {match}%
          </span>
        )}
      </div>

      <Link
        href={`/explore/${program.slug || program.id}`}
        className="flex flex-1 flex-col p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dgreen"
      >
        <div className="mb-2.5">
          <p className="text-sm font-bold leading-snug text-ink transition-colors group-hover:text-dgreen">
            {program.name_th}
          </p>
          <p className="mt-0.5 text-xs text-ink-3">{program.faculty_th}</p>
        </div>

        {rich && (
          <div className="mb-2.5 flex flex-wrap gap-1">
            {rich.riasec.map((dk) => {
              const d = RIASEC_DIMS[dk];
              return (
                <span
                  key={dk}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ background: d.bg, color: d.color }}
                >
                  <Icon name={d.icon} size={9} color={d.color} strokeWidth={2} />
                  {d.th}
                </span>
              );
            })}
          </div>
        )}

        {program.year_by_year_vibe && (
          <p className="mb-2.5 line-clamp-2 text-xs leading-relaxed text-ink-3">
            {program.year_by_year_vibe}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-line-soft pt-2.5">
          {rich ? (
            <p className="text-xs font-semibold text-ink-2">{rich.salary}</p>
          ) : (
            <span />
          )}
          <span className="flex items-center gap-1 text-xs font-bold text-dgreen">
            ดูรายละเอียด
            <Icon name="arrow-right" size={12} color="var(--d-green)" />
          </span>
        </div>
      </Link>

      {/* pin button */}
      <button
        onClick={(e) => { e.preventDefault(); onPin(); }}
        className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-all hover:scale-110 hover:bg-white"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}
        aria-label={pinned ? "ถอนหมุด" : "ปักหมุด"}
      >
        <Icon
          name={pinned ? "heart-fill" : "heart"}
          size={14}
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
    { label: "คณะ", get: (p: ProgramSummary) => p.faculty_th, hi: false },
    { label: "ค่าเทอม", get: (p: ProgramSummary) => (RICH_PROGRAMS[p.slug ?? ""] ?? RICH_PROGRAMS[p.id])?.cost ?? "—", hi: false },
    { label: "เงินเดือนเริ่มต้น", get: (p: ProgramSummary) => (RICH_PROGRAMS[p.slug ?? ""] ?? RICH_PROGRAMS[p.id])?.salary ?? "—", hi: true },
    { label: "อาชีพ", get: (p: ProgramSummary) => ((RICH_PROGRAMS[p.slug ?? ""] ?? RICH_PROGRAMS[p.id])?.careers ?? []).slice(0, 2).join(", "), hi: false },
  ];

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
      <div onClick={(e) => e.stopPropagation()} className="kuru-slide-in max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-surface p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-dgreen">เปรียบเทียบ</p>
            <h2 className="text-xl font-black text-ink">{items.length} หลักสูตร เคียงข้างกัน</h2>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-subtle text-ink-2 transition-colors hover:bg-line-soft">
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="overflow-auto rounded-2xl border border-line-soft">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-surface-subtle">
                <th className="px-4 py-3 text-left text-xs font-semibold text-ink-3" />
                {items.map((p) => (
                  <th key={p.id} className="px-4 py-3 text-left text-sm font-bold text-ink" style={{ minWidth: 140 }}>{p.name_th}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-line-soft">
                  <td className="px-4 py-3 text-xs font-semibold text-ink-3">{row.label}</td>
                  {items.map((p) => (
                    <td key={p.id} className="px-4 py-3 text-sm" style={{ color: row.hi ? "var(--d-green)" : "var(--ink)", fontWeight: row.hi ? 700 : 500 }}>
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
function PinnedBar({ pinnedIds, onClear, onCompare }: { pinnedIds: string[]; onClear: () => void; onCompare: () => void }) {
  return (
    <div
      className="fixed bottom-4 left-1/2 z-30 flex items-center gap-3 rounded-2xl bg-ink px-3 py-2.5 text-white"
      style={{ transform: "translateX(-50%)", animation: "kuruFabIn 320ms ease-out", boxShadow: "0 12px 32px -8px rgba(15,27,20,0.45)" }}
    >
      <Icon name="heart-fill" size={16} color="var(--d-green)" />
      <span className="text-sm font-bold">ปักหมุด {pinnedIds.length} หลักสูตร</span>
      <button onClick={onClear} className="rounded-xl bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20">ล้าง</button>
      <button onClick={onCompare} className="flex items-center gap-1.5 rounded-xl bg-dgreen px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-dgreen-deep">
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
    return () => { cancelled = true; };
  }, [query]);

  const programs = useMemo(() => {
    let list = allPrograms.map((p) => {
      const rich = RICH_PROGRAMS[p.slug ?? ""] ?? RICH_PROGRAMS[p.id];
      const match =
        rich && riasecScores
          ? computeProgramMatch(rich.riasec, riasecScores, rich.baseFit)
          : rich
          ? rich.baseFit
          : null;
      return { ...p, match, rich };
    });

    if (categoryFilter) {
      list = list.filter(
        (p) => p.faculty_th.includes(categoryFilter) || p.faculty_en.toLowerCase().includes(categoryFilter.toLowerCase()),
      );
    }

    if (costFilter === "lt15") {
      list = list.filter((p) => { const c = parseInt((p.rich?.cost ?? "").replace(/[^0-9]/g, "")); return !isNaN(c) && c < 15500; });
    } else if (costFilter === "gt15") {
      list = list.filter((p) => { const c = parseInt((p.rich?.cost ?? "").replace(/[^0-9]/g, "")); return !isNaN(c) && c >= 15500; });
    }

    if (sortKey === "match") list.sort((a, b) => (b.match ?? 0) - (a.match ?? 0));
    else if (sortKey === "cost") {
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
    setPinnedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }, []);

  const chipStyle = (active: boolean) => active
    ? { background: "var(--d-green)", color: "#fff", border: "1px solid var(--d-green)", boxShadow: "0 2px 8px -2px rgba(0,166,81,0.4)" }
    : { background: "#fff", color: "var(--ink-2)", border: "1px solid var(--line)" };

  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-4 pb-28 sm:px-6" data-testid="explore-shell">
        {/* header */}
        <div className="pb-6 pt-6 sm:pt-10">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-dgreen">
            ค้นหาคณะ · {allPrograms.length} หลักสูตร
          </p>
          <h1 className="mb-5 text-2xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
            ลองพิมพ์สิ่งที่คุณสนใจ
            <br className="hidden sm:block" />
            เป็นภาษาธรรมชาติได้เลย
          </h1>

          {/* search card */}
          <div
            className="mb-3 flex items-center gap-2 rounded-2xl border border-line-soft bg-surface p-2"
            style={{ boxShadow: "0 1px 2px rgba(15,27,20,0.04), 0 8px 24px -8px rgba(15,27,20,0.08)" }}
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: "var(--d-green-soft)" }}>
              <Icon name="search" size={18} color="var(--d-green)" />
            </div>
            <div className="min-w-0 flex-1">
              <ProgramSearchBar
                placeholder="เช่น 'อยากเรียนเทคโนโลยีกับเกษตร', 'คณะที่ทำงานต่างประเทศได้'"
                onSearch={setQuery}
              />
            </div>
            <button
              onClick={() => setShowFilters((s) => !s)}
              className="flex h-10 flex-shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold transition-all"
              style={showFilters ? { background: "var(--ink)", color: "#fff" } : { background: "var(--kuru-surface-subtle)", color: "var(--ink-2)" }}
            >
              <Icon name="filter" size={14} color={showFilters ? "white" : "currentColor"} />
              <span className="hidden sm:inline">ตัวกรอง</span>
            </button>
          </div>

          {/* category chips */}
          <div className="flex flex-wrap gap-2">
            {CATEGORY_CHIPS.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategoryFilter(c.key)}
                className="h-9 rounded-full px-4 text-sm font-semibold transition-all"
                style={chipStyle(categoryFilter === c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* filter panel */}
          {showFilters && (
            <div className="kuru-slide-in mt-3 rounded-2xl border border-line-soft bg-surface p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold text-ink-3">ค่าเทอม</p>
                  <div className="flex flex-wrap gap-2">
                    {([["all", "ทั้งหมด"], ["lt15", "< 15,500"], ["gt15", "≥ 15,500"]] as [typeof costFilter, string][]).map(([v, l]) => (
                      <button key={v} onClick={() => setCostFilter(v)} className="h-8 rounded-full px-3.5 text-xs font-semibold transition-all" style={chipStyle(costFilter === v)}>{l}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold text-ink-3">เรียงตาม</p>
                  <div className="flex flex-wrap gap-2">
                    {([["match", "ความเข้ากัน"], ["cost", "ค่าเทอม"], ["faculty", "คณะ"]] as [SortKey, string][]).map(([v, l]) => (
                      <button key={v} onClick={() => setSortKey(v)} className="h-8 rounded-full px-3.5 text-xs font-semibold transition-all" style={chipStyle(sortKey === v)}>{l}</button>
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
            className="mb-4 flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold"
            style={{ background: "var(--d-green-soft)", color: "var(--d-green-deep)", border: "1px solid rgba(0,166,81,0.15)" }}
          >
            <Icon name="sparkles" size={16} color="var(--d-green)" />
            จัดเรียงตามผล RIASEC ของคุณแล้ว — คณะที่เข้ากับคุณมากที่สุดอยู่บนสุด
          </div>
        )}

        {/* result count */}
        {!isLoading && (
          <p className="mb-4 text-sm text-ink-3">
            พบ <strong className="text-ink">{programs.length}</strong> หลักสูตร
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">{error}</p>
        )}

        {/* grid */}
        {isLoading ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy>
            {Array.from({ length: 9 }).map((_, i) => (
              <li key={i} className="overflow-hidden rounded-2xl border border-line-soft bg-surface">
                <div className="h-20 animate-pulse bg-surface-subtle" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-3/4 animate-pulse rounded-full bg-surface-subtle" />
                  <div className="h-3 w-1/2 animate-pulse rounded-full bg-surface-subtle" />
                  <div className="h-3 w-full animate-pulse rounded-full bg-surface-subtle" />
                </div>
              </li>
            ))}
          </ul>
        ) : programs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line p-12 text-center">
            <p className="mb-2 text-2xl">🔍</p>
            <p className="text-sm font-semibold text-ink">ไม่พบหลักสูตรที่ตรงกัน</p>
            <p className="mt-1 text-xs text-ink-3">ลองพิมพ์คำค้นใหม่ หรือเคลียร์ตัวกรอง</p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      {pinnedIds.length > 0 && (
        <PinnedBar pinnedIds={pinnedIds} onClear={() => setPinnedIds([])} onCompare={() => setShowCompare(true)} />
      )}

      {showCompare && pinnedIds.length > 0 && (
        <CompareModal programIds={pinnedIds} programs={allPrograms} onClose={() => setShowCompare(false)} />
      )}
    </>
  );
}
