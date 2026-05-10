"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import type { ProgramSummary } from "@/lib/api";
import { RICH_PROGRAMS } from "@/lib/program-rich";
import { RIASEC_DIMS, computeProgramMatch, type RiasecDim } from "@/lib/riasec";
import { useAppStore } from "@/lib/store";
import { Icon } from "@/components/ui/Icon";

// ── Animated circular match ring ───────────────────────────────
function MatchRing({ value, size = 72 }: { value: number; size?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 700);
      setV(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const stroke = size * 0.1;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,166,81,0.15)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="var(--d-green)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ - (v / 100) * circ}
          style={{ transition: "stroke-dashoffset 60ms linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black tabular-nums leading-none text-ink" style={{ fontSize: size * 0.26 }}>
          {Math.round(v)}
        </span>
        <span style={{ fontSize: size * 0.14, color: "var(--ink-3)", fontWeight: 500 }}>%</span>
      </div>
    </div>
  );
}

// ── Program card (handoff design) ───────────────────────────────
function ProgramCard({
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

  return (
    <div className="group relative flex flex-col rounded-2xl border border-line-soft bg-surface transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
      {/* top row: faculty / campus + ring */}
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-0">
        <div className="min-w-0">
          <p className="text-xs text-ink-3 truncate">
            {program.faculty_th} · ม.เกษตรศาสตร์
          </p>
        </div>
        {match !== null && <MatchRing value={match} size={64} />}
      </div>

      {/* program names */}
      <div className="px-5 pb-0 pt-2">
        <Link
          href={`/explore/${program.slug || program.id}`}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dgreen rounded-lg"
        >
          <h3 className="text-lg font-black leading-tight text-ink transition-colors group-hover:text-dgreen" style={{ letterSpacing: "-0.01em" }}>
            {program.name_th}
          </h3>
        </Link>
        <p className="mt-0.5 text-sm italic text-ink-3">{program.name_en}</p>
      </div>

      {/* RIASEC pills */}
      {rich && (
        <div className="flex flex-wrap gap-1.5 px-5 pt-3">
          {rich.riasec.map((dk) => {
            const d = RIASEC_DIMS[dk];
            return (
              <span
                key={dk}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                style={{ background: d.bg, color: d.color }}
              >
                <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                {d.th}
              </span>
            );
          })}
        </div>
      )}

      {/* stats row */}
      <div className="mt-4 grid grid-cols-3 divide-x divide-line-soft border-t border-line-soft">
        {match !== null && (
          <div className="px-4 py-3">
            <p className="text-sm font-black tabular-nums text-ink">{match}%</p>
            <p className="text-[10px] font-medium text-ink-3">เข้ากับคุณ</p>
          </div>
        )}
        {rich && (
          <div className="px-4 py-3">
            <p className="text-sm font-black tabular-nums text-ink">{rich.seats}</p>
            <p className="text-[10px] font-medium text-ink-3">ที่นั่ง</p>
          </div>
        )}
        {rich && (
          <div className="px-4 py-3 min-w-0">
            <p className="text-xs font-bold text-ink truncate">{rich.salary.split("–")[0].trim()}</p>
            <p className="text-[10px] font-medium text-ink-3">เริ่มต้น</p>
          </div>
        )}
        {/* fallback column if no rich data */}
        {!match && !rich && (
          <div className="col-span-3 px-4 py-3">
            <p className="text-xs text-ink-3">{program.campus}</p>
          </div>
        )}
      </div>

      {/* action row */}
      <div className="flex items-center gap-2 px-5 py-3 border-t border-line-soft">
        <button
          onClick={(e) => { e.preventDefault(); onPin(); }}
          className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-line text-xs font-semibold text-ink-2 transition-all hover:border-dgreen hover:text-dgreen"
          style={pinned ? { background: "var(--d-green-soft)", borderColor: "var(--d-green)", color: "var(--d-green-deep)" } : {}}
        >
          <Icon name={pinned ? "heart-fill" : "heart"} size={13} color={pinned ? "var(--d-green)" : "currentColor"} />
          {pinned ? "ปักหมุดแล้ว" : "ปักหมุด"}
        </button>
        <Link
          href={`/explore/${program.slug || program.id}`}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-line text-ink-2 transition-all hover:border-ink hover:bg-ink hover:text-white"
        >
          <Icon name="arrow-right" size={15} />
        </Link>
      </div>
    </div>
  );
}

// ── Compare modal ───────────────────────────────────────────────
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
                {items.map((p) => <th key={p.id} className="px-4 py-3 text-left text-sm font-bold text-ink" style={{ minWidth: 140 }}>{p.name_th}</th>)}
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

// ── Pinned bar ──────────────────────────────────────────────────
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
type SortKey = "match" | "seats" | "popular";

const RIASEC_FILTER_ORDER: RiasecDim[] = ["R", "I", "A", "S", "E", "C"];

export default function ExplorePage() {
  const riasecScores = useAppStore((s) => s.riasec.scores);

  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [allPrograms, setAllPrograms] = useState<ProgramSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [riasecFilter, setRiasecFilter] = useState<RiasecDim | "">("");
  const [sortKey, setSortKey] = useState<SortKey>("match");
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    apiClient.searchPrograms({ q: query }).then((r) => {
      if (!cancelled) setAllPrograms(r.data.results);
    }).catch(() => {
      if (!cancelled) setError("โหลดข้อมูลไม่สำเร็จ");
    }).finally(() => {
      if (!cancelled) setIsLoading(false);
    });
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

    if (riasecFilter) {
      list = list.filter((p) => p.rich?.riasec.includes(riasecFilter));
    }

    if (sortKey === "match") list.sort((a, b) => (b.match ?? 0) - (a.match ?? 0));
    else if (sortKey === "seats") list.sort((a, b) => (b.rich?.seats ?? 0) - (a.rich?.seats ?? 0));
    // "popular" — no data, keep original order

    return list;
  }, [allPrograms, riasecFilter, sortKey, riasecScores]);

  const matchedCount = programs.filter((p) => p.match !== null && p.match >= 70).length;
  const riasecCode = riasecScores
    ? Object.entries(riasecScores).sort(([, a], [, b]) => b - a).slice(0, 3).map(([k]) => k).join("")
    : null;

  const togglePin = useCallback((id: string) => {
    setPinnedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }, []);

  const handleSearch = () => setQuery(inputValue);

  const sortLabels: Record<SortKey, string> = {
    match: "เข้ากับคุณ",
    seats: "ที่นั่งมาก",
    popular: "ยอดนิยม",
  };

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(160deg, #0A2B15 0%, #0F3D1F 35%, #1a4a27 55%, var(--paper) 85%)",
          paddingBottom: 0,
        }}
      >
        <div className="mx-auto max-w-6xl px-4 pt-6 sm:pt-8 sm:px-6">
          {/* breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-xs font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            <Icon name="arrow-right" size={12} color="rgba(255,255,255,0.3)" />
            <span style={{ color: "rgba(255,255,255,0.85)" }}>Programs</span>
          </div>

          {/* headline + stats card */}
          <div className="flex flex-col gap-6 pb-10 sm:flex-row sm:items-start sm:justify-between">
            {/* left — headline */}
            <div className="max-w-xl">
              <h1
                className="mb-4 leading-none text-white"
                style={{ fontSize: "clamp(44px, 7vw, 80px)", fontWeight: 900, letterSpacing: "-0.03em" }}
              >
                เลือกคณะที่ใช่
                <span style={{ color: "var(--d-green-pop)" }}>.</span>
                <br />
                <em
                  className="not-italic"
                  style={{
                    fontStyle: "italic",
                    color: "var(--d-green-pop)",
                    fontFamily: "var(--font-serif, 'Source Serif 4', Georgia, serif)",
                  }}
                >
                  ไม่ต้อง
                </em>
                {" "}เดา
              </h1>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 16, lineHeight: 1.65, maxWidth: 480 }}>
                เรียงทั้ง {allPrograms.length || "—"} หลักสูตรของ{" "}
                <strong style={{ color: "rgba(255,255,255,0.9)" }}>ม.เกษตรศาสตร์</strong>{" "}
                ตามบุคลิก RIASEC ของคุณ — ปักหมุดได้สูงสุด 3 หลักสูตรเพื่อนำไปเทียบกัน
              </p>
            </div>

            {/* right — stats card */}
            <div
              className="flex-shrink-0 rounded-2xl p-5"
              style={{
                background: "#0A1F10",
                border: "1px solid rgba(0,166,81,0.2)",
                minWidth: 260,
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              <div className="mb-4 flex items-center justify-between">
                <span
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
                  style={{ background: "rgba(0,166,81,0.2)", color: "var(--d-green-pop)" }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-dgreen-pop" />
                  LIVE · TCAS68
                </span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>
                  UPDATED {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>หลักสูตร</p>
                  <p style={{ fontSize: 32, fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-0.02em" }}>
                    {isLoading ? "—" : allPrograms.length}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>เข้ากับคุณ</p>
                  <p style={{ fontSize: 32, fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-0.02em" }}>
                    {riasecScores ? (
                      <>
                        {matchedCount}
                        <span style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>
                          /{allPrograms.length}
                        </span>
                      </>
                    ) : <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.35)" }}>—</span>}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>RIASEC</p>
                  <p style={{ fontSize: 24, fontWeight: 900, color: "var(--d-green-pop)", lineHeight: 1, letterSpacing: "0.04em" }}>
                    {riasecCode ?? "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── search bar ── */}
          <div
            className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-2"
            style={{
              boxShadow: "0 1px 2px rgba(15,27,20,0.06), 0 12px 32px -8px rgba(15,27,20,0.15)",
              border: "1px solid var(--line-soft)",
            }}
          >
            <Icon name="search" size={18} color="var(--ink-3)" />
            <input
              ref={searchRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="ค้นหา 'วิศวะ' 'เกษตร' 'สถาปัตย์' หรือพิมพ์ภาษาคนเลย..."
              className="min-h-0 flex-1 border-none bg-transparent text-sm text-ink outline-none placeholder:text-ink-4"
              style={{ minHeight: "auto", padding: "10px 0" }}
            />
            <button
              onClick={handleSearch}
              className="flex-shrink-0 rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-dgreen"
            >
              ค้นหา
            </button>
          </div>

          {/* ── RIASEC filter chips ── */}
          <div className="flex flex-wrap items-center gap-2 py-4">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
              FILTER · RIASEC
            </span>
            {RIASEC_FILTER_ORDER.map((dim) => {
              const d = RIASEC_DIMS[dim];
              const active = riasecFilter === dim;
              return (
                <button
                  key={dim}
                  onClick={() => setRiasecFilter(active ? "" : dim)}
                  className="flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-bold transition-all"
                  style={
                    active
                      ? { background: d.color, color: "#fff", boxShadow: `0 2px 8px -2px ${d.color}80` }
                      : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }
                  }
                >
                  <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: active ? "rgba(255,255,255,0.8)" : d.color }} />
                  {dim} · {d.th}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── RESULTS ──────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-6xl px-4 pb-28 sm:px-6" data-testid="explore-shell">
        {/* section header + sort tabs */}
        <div className="flex flex-wrap items-end justify-between gap-4 py-6">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-dgreen">
              ★ Curated for you
            </p>
            <p className="text-2xl font-black text-ink" style={{ letterSpacing: "-0.02em" }}>
              {isLoading ? "…" : programs.length}
              <span className="font-normal text-ink-3"> — จาก {allPrograms.length} หลักสูตร</span>
            </p>
          </div>
          {/* sort tabs */}
          <div className="flex items-center gap-1 rounded-2xl bg-surface-subtle p-1">
            {(["match", "seats", "popular"] as SortKey[]).map((k) => (
              <button
                key={k}
                onClick={() => setSortKey(k)}
                className="rounded-xl px-4 py-2 text-sm font-semibold transition-all"
                style={
                  sortKey === k
                    ? { background: "var(--ink)", color: "#fff", boxShadow: "0 2px 8px -2px rgba(15,27,20,0.3)" }
                    : { color: "var(--ink-2)" }
                }
              >
                {sortLabels[k]}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">{error}</p>
        )}

        {/* grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-line-soft bg-surface">
                <div className="flex items-start gap-3 p-5">
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 animate-pulse rounded-full bg-surface-subtle" />
                    <div className="h-5 w-full animate-pulse rounded-full bg-surface-subtle" />
                    <div className="h-4 w-1/2 animate-pulse rounded-full bg-surface-subtle" />
                  </div>
                  <div className="h-16 w-16 flex-shrink-0 animate-pulse rounded-full bg-surface-subtle" />
                </div>
                <div className="grid grid-cols-3 divide-x divide-line-soft border-t border-line-soft">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="p-3">
                      <div className="mb-1 h-4 w-10 animate-pulse rounded-full bg-surface-subtle" />
                      <div className="h-3 w-12 animate-pulse rounded-full bg-surface-subtle" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : programs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line p-12 text-center">
            <p className="mb-2 text-2xl">🔍</p>
            <p className="text-sm font-semibold text-ink">ไม่พบหลักสูตรที่ตรงกัน</p>
            <p className="mt-1 text-xs text-ink-3">ลองพิมพ์คำค้นใหม่ หรือเคลียร์ตัวกรอง RIASEC</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((p) => (
              <ProgramCard
                key={p.id}
                program={p}
                match={p.match}
                pinned={pinnedIds.includes(p.id)}
                onPin={() => togglePin(p.id)}
              />
            ))}
          </div>
        )}
      </div>

      {pinnedIds.length > 0 && (
        <PinnedBar pinnedIds={pinnedIds} onClear={() => setPinnedIds([])} onCompare={() => setShowCompare(true)} />
      )}
      {showCompare && pinnedIds.length > 0 && (
        <CompareModal programIds={pinnedIds} programs={allPrograms} onClose={() => setShowCompare(false)} />
      )}
    </>
  );
}
