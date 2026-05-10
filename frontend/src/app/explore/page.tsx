"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import type { ProgramSummary } from "@/lib/api";
import { RICH_PROGRAMS } from "@/lib/program-rich";
import { RIASEC_DIMS, computeProgramMatch, type RiasecDim } from "@/lib/riasec";
import { useAppStore } from "@/lib/store";
import { Icon } from "@/components/ui/Icon";

// ── Match ring ──────────────────────────────────────────────────
function MatchRing({ value, size = 64, dark = false }: { value: number; size?: number; dark?: boolean }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 900);
      setV(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const sw = size * 0.075;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={dark ? "rgba(255,255,255,0.12)" : "var(--line-soft)"} strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={dark ? "var(--d-green-pop)" : "var(--d-green)"} strokeWidth={sw}
          strokeLinecap="round" strokeDasharray={circ}
          strokeDashoffset={circ - (v / 100) * circ}
          style={{ transition: "stroke-dashoffset 60ms linear" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span style={{
          fontWeight: 800, fontSize: size * 0.245, lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          color: dark ? "var(--d-green-pop)" : "var(--ink)",
        }}>
          {Math.round(v)}
        </span>
        <span style={{ fontSize: size * 0.14, color: dark ? "rgba(255,255,255,0.5)" : "var(--ink-3)", fontWeight: 700 }}>%</span>
      </div>
    </div>
  );
}

// ── Types ───────────────────────────────────────────────────────
type EnrichedProgram = ProgramSummary & {
  match: number | null;
  rich: (typeof RICH_PROGRAMS)[string] | undefined;
};

type SortKey = "match" | "seats" | "popular";

const RIASEC_FILTER_ORDER: RiasecDim[] = ["R", "I", "A", "S", "E", "C"];

const sortLabels: Record<SortKey, string> = {
  match: "เข้ากับคุณ",
  seats: "ที่นั่งมาก",
  popular: "ยอดนิยม",
};

// ── Featured card (dark, first slot) ───────────────────────────
function FeaturedCard({ program, rank, pinned, onPin }: { program: EnrichedProgram; rank: number; pinned: boolean; onPin: () => void }) {
  const { rich, match } = program;
  return (
    <div
      className="group relative flex flex-col gap-5 overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1"
      style={{ background: "var(--ink)", minHeight: 380, padding: "38px", boxShadow: "0 8px 24px rgba(15,27,20,0.25)" }}
    >
      {/* overlay gradients */}
      <div className="pointer-events-none absolute inset-0" style={{
        background: "radial-gradient(circle at 88% 12%, rgba(0,166,81,0.4), transparent 50%), radial-gradient(circle at 4% 96%, rgba(61,220,132,0.18), transparent 60%)",
      }} />
      {/* rank bg number */}
      <div className="pointer-events-none absolute select-none" style={{
        fontStyle: "italic", fontWeight: 600,
        fontSize: "clamp(180px,22vw,280px)",
        color: "rgba(255,255,255,0.04)",
        lineHeight: 1, top: -50, right: -10,
        fontVariantNumeric: "tabular-nums",
        transition: "color 300ms",
      }}>
        {String(rank).padStart(2, "0")}
      </div>

      {/* top row */}
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span style={{
              background: "rgba(61,220,132,0.16)", color: "var(--d-green-pop)",
              padding: "3px 10px", borderRadius: 999, fontSize: 10.5,
              fontWeight: 800, letterSpacing: "0.12em",
              border: "1px solid rgba(61,220,132,0.25)",
            }}>★ TOP MATCH</span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
              {program.faculty_th}
              <span style={{ color: "rgba(255,255,255,0.25)", margin: "0 5px" }}>·</span>
              ม.เกษตรศาสตร์
            </span>
          </div>
          <Link href={`/explore/${program.slug || program.id}`}>
            <h3 style={{
              fontWeight: 800, fontSize: "clamp(28px,4vw,44px)",
              lineHeight: 1.05, color: "#fff", letterSpacing: "-0.02em", marginBottom: 4,
            }}>
              {program.name_th}
            </h3>
          </Link>
          <p style={{ fontStyle: "italic", fontSize: 17, color: "rgba(255,255,255,0.45)" }}>
            {program.name_en}
          </p>
          {rich?.why && (
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, maxWidth: 460, marginTop: 8 }}>
              {rich.why}
            </p>
          )}
        </div>
        {match !== null && <MatchRing value={match} size={96} dark />}
      </div>

      {/* RIASEC tags */}
      {rich && (
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>RIASEC fit</span>
          <div className="flex flex-wrap gap-1.5">
            {rich.riasec.map((dk) => {
              const d = RIASEC_DIMS[dk];
              return (
                <span key={dk} className="inline-flex items-center gap-1 rounded-full text-xs font-bold"
                  style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.18)", padding: "4px 10px" }}>
                  <span className="rounded-full flex-shrink-0" style={{ width: 7, height: 7, background: d.color }} />
                  {dk} · {d.th}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* meta row */}
      <div className="relative z-10 mt-auto flex flex-wrap items-center justify-between gap-3 pt-4"
        style={{ borderTop: "1px dashed rgba(255,255,255,0.14)" }}>
        <div className="flex items-center gap-6">
          {match !== null && (
            <div>
              <p style={{ fontWeight: 800, fontSize: 17, color: "#fff", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{match}%</p>
              <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: "0.04em" }}>เข้ากับคุณ</p>
            </div>
          )}
          {rich && (
            <div>
              <p style={{ fontWeight: 800, fontSize: 17, color: "#fff", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{rich.seats}</p>
              <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: "0.04em" }}>ที่นั่ง</p>
            </div>
          )}
          {rich && (
            <div>
              <p style={{ fontWeight: 800, fontSize: 17, color: "#fff", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{rich.salary.split("–")[0].trim()}</p>
              <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: "0.04em" }}>เงินเดือนเริ่มต้น</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.preventDefault(); onPin(); }}
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-bold transition-all"
            style={pinned
              ? { background: "var(--d-green-pop)", color: "var(--ink)", border: "1px solid var(--d-green-pop)" }
              : { background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.18)" }}>
            <Icon name={pinned ? "heart-fill" : "heart"} size={13} color="currentColor" />
            {pinned ? "ปักหมุดแล้ว" : "ปักหมุด"}
          </button>
          <Link href={`/explore/${program.slug || program.id}`}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-all group-hover:bg-dgreen-pop group-hover:border-dgreen-pop group-hover:text-ink"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", color: "#fff" }}>
            <Icon name="arrow-right" size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Standard program card ───────────────────────────────────────
function ProgramCard({ program, rank, pinned, onPin }: { program: EnrichedProgram; rank: number; pinned: boolean; onPin: () => void }) {
  const { rich, match } = program;
  return (
    <div className="group relative flex flex-col gap-4 overflow-hidden rounded-3xl border bg-white transition-all duration-300 hover:-translate-y-1 hover:border-ink hover:shadow-xl"
      style={{ borderColor: "var(--line-soft)", minHeight: 280, padding: 26 }}>
      {/* rank bg */}
      <div className="pointer-events-none absolute top-3 right-5 select-none"
        style={{ fontStyle: "italic", fontWeight: 600, fontSize: 52, color: "var(--paper)", lineHeight: 1, fontVariantNumeric: "tabular-nums", transition: "color 300ms" }}>
        {String(rank).padStart(2, "0")}
      </div>

      {/* top row */}
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)" }}>
            {program.faculty_th}
            <span style={{ color: "var(--ink-4)", fontWeight: 400, margin: "0 4px" }}>·</span>
            ม.เกษตรศาสตร์
          </p>
          <Link href={`/explore/${program.slug || program.id}`} className="block">
            <h3 className="mt-2 font-black leading-tight text-ink transition-colors group-hover:text-dgreen"
              style={{ fontSize: 21, letterSpacing: "-0.02em" }}>
              {program.name_th}
            </h3>
          </Link>
          <p className="mt-1" style={{ fontStyle: "italic", fontSize: 14, color: "var(--ink-3)" }}>
            {program.name_en}
          </p>
        </div>
        {match !== null && <MatchRing value={match} size={64} />}
      </div>

      {/* RIASEC tags */}
      {rich && (
        <div className="relative z-10 flex flex-wrap gap-1.5">
          {rich.riasec.map((dk) => {
            const d = RIASEC_DIMS[dk];
            return (
              <span key={dk} className="inline-flex items-center gap-1 rounded-full text-[11px] font-bold"
                style={{ background: d.bg, color: d.color, padding: "3px 10px" }}>
                <span className="rounded-full flex-shrink-0" style={{ width: 6, height: 6, background: d.color }} />
                {d.th}
              </span>
            );
          })}
        </div>
      )}

      {/* meta row */}
      <div className="relative z-10 mt-auto flex flex-wrap items-center justify-between gap-2 pt-3"
        style={{ borderTop: "1px dashed var(--line)", marginTop: "auto" }}>
        <div className="flex items-center gap-5">
          {match !== null && (
            <div>
              <p style={{ fontWeight: 800, fontSize: 17, color: "var(--ink)", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{match}%</p>
              <p style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 600, letterSpacing: "0.04em" }}>เข้ากับคุณ</p>
            </div>
          )}
          {rich && (
            <div>
              <p style={{ fontWeight: 800, fontSize: 17, color: "var(--ink)", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{rich.seats}</p>
              <p style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 600, letterSpacing: "0.04em" }}>ที่นั่ง</p>
            </div>
          )}
          {rich && (
            <div>
              <p style={{ fontWeight: 800, fontSize: 15, color: "var(--ink)", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{rich.salary.split("–")[0].trim()}</p>
              <p style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 600, letterSpacing: "0.04em" }}>เริ่มต้น</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={(e) => { e.preventDefault(); onPin(); }}
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-bold transition-all"
            style={pinned
              ? { background: "var(--d-green)", color: "#fff", border: "1px solid var(--d-green)" }
              : { background: "var(--paper)", border: "1px solid var(--line)", color: "var(--ink-2)" }}>
            <Icon name={pinned ? "heart-fill" : "heart"} size={13} color="currentColor" />
            {pinned ? "ปักหมุดแล้ว" : "ปักหมุด"}
          </button>
          <Link href={`/explore/${program.slug || program.id}`}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-all group-hover:bg-ink group-hover:border-ink group-hover:text-white"
            style={{ border: "1px solid var(--line)", background: "#fff", color: "var(--ink-2)" }}>
            <Icon name="arrow-right" size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Compare modal ───────────────────────────────────────────────
function CompareModal({ programIds, programs, onClose }: { programIds: string[]; programs: ProgramSummary[]; onClose: () => void }) {
  const items = programs.filter((p) => programIds.includes(p.id));
  const rows = [
    { label: "คณะ", get: (p: ProgramSummary) => p.faculty_th, hi: false },
    { label: "วิทยาเขต", get: (p: ProgramSummary) => p.campus, hi: false },
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

// ─────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────
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
      const match = rich && riasecScores
        ? computeProgramMatch(rich.riasec, riasecScores, rich.baseFit)
        : rich ? rich.baseFit : null;
      return { ...p, match, rich } as EnrichedProgram;
    });

    if (riasecFilter) list = list.filter((p) => p.rich?.riasec.includes(riasecFilter));

    if (sortKey === "match") list.sort((a, b) => (b.match ?? 0) - (a.match ?? 0));
    else if (sortKey === "seats") list.sort((a, b) => (b.rich?.seats ?? 0) - (a.rich?.seats ?? 0));

    return list;
  }, [allPrograms, riasecFilter, sortKey, riasecScores]);

  const matchedCount = programs.filter((p) => p.match !== null && p.match >= 70).length;
  const riasecCode = riasecScores
    ? Object.entries(riasecScores).sort(([, a], [, b]) => b - a).slice(0, 3).map(([k]) => k).join("")
    : null;

  const isDefault = sortKey === "match" && !riasecFilter && !query;

  const togglePin = useCallback((id: string) => {
    setPinnedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev);
  }, []);

  const handleSearch = () => setQuery(inputValue.trim());
  const handleClearSearch = () => { setInputValue(""); setQuery(""); searchRef.current?.focus(); };

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────── */}
      <section style={{ background: "var(--ink)", position: "relative", overflow: "hidden" }}>
        <div className="pointer-events-none absolute inset-0" style={{
          background: "radial-gradient(circle at 80% 20%, rgba(0,166,81,0.35), transparent 55%), radial-gradient(circle at 0% 100%, rgba(61,220,132,0.12), transparent 60%)",
        }} />
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
          {/* breadcrumb */}
          <div className="mb-6 flex items-center gap-2" style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
            <Link href="/" className="transition-colors hover:text-white" style={{ color: "inherit" }}>Home</Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m9 6 6 6-6 6" /></svg>
            <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>Programs</span>
          </div>

          {/* hero grid: headline left + stat card right */}
          <div className="grid items-end gap-8 lg:grid-cols-[1.5fr_1fr]">
            {/* left */}
            <div>
              <h1 style={{ fontWeight: 800, fontSize: "clamp(48px,6vw,84px)", lineHeight: 0.95, letterSpacing: "-0.04em", color: "#fff", margin: "0 0 22px", textWrap: "balance" }}>
                เลือกคณะที่ใช่<span style={{ color: "var(--d-green-pop)", fontStyle: "italic" }}>.</span>
                <br />
                <span style={{ color: "var(--d-green-pop)", fontStyle: "italic", fontWeight: 600 }}>ไม่ต้อง</span>
                {" "}เดา
              </h1>
              <p style={{ fontSize: 18, lineHeight: 1.6, color: "rgba(255,255,255,0.6)", maxWidth: 540, margin: 0 }}>
                เรียงทั้ง {isLoading ? "—" : allPrograms.length} หลักสูตรของ{" "}
                <em style={{ fontStyle: "italic", color: "rgba(255,255,255,0.9)", fontWeight: 400 }}>ม.เกษตรศาสตร์</em>{" "}
                ตามบุคลิก RIASEC ของคุณ — ปักหมุดได้สูงสุด 3 หลักสูตรเพื่อนำไปเทียบกัน
              </p>
            </div>

            {/* right — stat card */}
            <div className="flex flex-col justify-between rounded-3xl"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", minHeight: 200, padding: "28px 32px", backdropFilter: "blur(12px)" }}>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 rounded-full text-[11px] font-bold uppercase"
                  style={{ background: "rgba(61,220,132,0.15)", color: "var(--d-green-pop)", border: "1px solid rgba(61,220,132,0.3)", padding: "5px 12px", letterSpacing: "0.12em" }}>
                  <span className="rounded-full" style={{ width: 6, height: 6, background: "var(--d-green-pop)", animation: "pulse-dot 1.6s ease-in-out infinite", display: "inline-block" }} />
                  LIVE · TCAS68
                </span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "0.08em" }}>
                  UPDATED {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-3">
                {[
                  { lbl: "หลักสูตร", v: isLoading ? "—" : String(allPrograms.length) },
                  { lbl: "เข้ากับคุณ", v: riasecScores ? `${matchedCount}` : "—", sub: riasecScores ? `/${allPrograms.length}` : "" },
                  { lbl: "RIASEC", v: riasecCode ?? "—", green: true },
                ].map((cell, i) => (
                  <div key={i} className={i > 0 ? "pl-4" : ""} style={i < 2 ? { borderRight: "1px solid rgba(255,255,255,0.14)", paddingRight: 16 } : {}}>
                    <p style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700, marginBottom: 6 }}>{cell.lbl}</p>
                    <p style={{ fontWeight: 800, fontSize: 36, letterSpacing: "-0.02em", lineHeight: 1, fontVariantNumeric: "tabular-nums", color: cell.green ? "var(--d-green-pop)" : "#fff" }}>
                      {cell.v}
                      {cell.sub && <span style={{ fontSize: "0.42em", fontStyle: "italic", fontWeight: 400, color: "var(--d-green-pop)", marginLeft: 4 }}>{cell.sub}</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEARCH SECTION ────────────────────────────────────── */}
      <section style={{ background: "var(--paper)", paddingBottom: 8, position: "relative", zIndex: 3 }}>
        <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
          {/* search bar */}
          <div className="flex items-center gap-2 rounded-3xl bg-white px-5 py-2.5"
            style={{ border: "1px solid var(--line)", boxShadow: "0 14px 36px -18px rgba(15,27,20,0.18), 0 1px 2px rgba(15,27,20,0.04)" }}>
            <svg className="flex-shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
              ref={searchRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="ค้นหา 'วิศวะ' 'เกษตร' 'สถาปัตย์' หรือพิมพ์ภาษาคนเลย..."
              className="min-h-0 flex-1 border-none bg-transparent outline-none"
              style={{ fontSize: 16.5, color: "var(--ink)", padding: "8px 0", minHeight: "auto" }}
            />
            {inputValue && (
              <button onClick={handleClearSearch} aria-label="ล้าง"
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-all hover:bg-surface-subtle"
                style={{ color: "var(--ink-3)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M6 6 18 18M6 18 18 6" />
                </svg>
              </button>
            )}
            <button onClick={handleSearch}
              className="flex-shrink-0 rounded-2xl px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-dgreen"
              style={{ background: "var(--ink)" }}>
              ค้นหา
            </button>
          </div>

          {/* RIASEC filter row */}
          <div className="flex flex-wrap items-center gap-2 py-4">
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)", marginRight: 6 }}>
              Filter · RIASEC
            </span>
            {RIASEC_FILTER_ORDER.map((dim) => {
              const d = RIASEC_DIMS[dim];
              const active = riasecFilter === dim;
              return (
                <button key={dim} onClick={() => setRiasecFilter(active ? "" : dim)}
                  className="flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-bold transition-all"
                  style={active
                    ? { background: d.color, color: "#fff", boxShadow: `0 2px 8px -2px ${d.color}80` }
                    : { background: "#fff", color: "var(--ink-2)", border: "1px solid var(--line)" }}>
                  <span className="rounded-full flex-shrink-0" style={{ width: 7, height: 7, background: active ? "rgba(255,255,255,0.8)" : d.color }} />
                  {dim} · {d.th}
                </button>
              );
            })}
            {(riasecFilter || query) && (
              <button onClick={() => { setRiasecFilter(""); handleClearSearch(); }}
                className="ml-auto text-xs font-bold underline underline-offset-2 transition-colors hover:text-ink"
                style={{ color: "var(--ink-3)" }}>
                ล้างตัวกรอง
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── PINNED STRIP ──────────────────────────────────────── */}
      {pinnedIds.length > 0 && (
        <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3.5"
            style={{ background: "var(--d-green-soft)", borderColor: "rgba(0,166,81,0.18)" }}>
            <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider" style={{ color: "var(--d-green-deep)" }}>
              <Icon name="heart-fill" size={13} color="var(--d-green)" />
              Pinned {pinnedIds.length}/3
            </span>
            <div className="flex flex-1 flex-wrap gap-2">
              {pinnedIds.map((id) => {
                const p = allPrograms.find((x) => x.id === id);
                if (!p) return null;
                return (
                  <span key={id} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink"
                    style={{ border: "1px solid rgba(0,166,81,0.2)" }}>
                    {p.name_th}
                    <button onClick={() => togglePin(id)} aria-label="remove"
                      className="flex h-5 w-5 items-center justify-center rounded-full transition-colors hover:bg-surface-subtle"
                      style={{ color: "var(--ink-4)" }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6 18 18M6 18 18 6" /></svg>
                    </button>
                  </span>
                );
              })}
            </div>
            <button onClick={() => setShowCompare(true)}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-dgreen-deep"
              style={{ background: "var(--d-green)" }}>
              เทียบกัน
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* ── RESULTS ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6" data-testid="explore-shell">
        {/* results head */}
        <div className="mb-7 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-widest" style={{ color: "var(--d-green)" }}>★ Curated for you</p>
            <h2 style={{ fontWeight: 800, fontSize: "clamp(28px,3.4vw,42px)", lineHeight: 1, letterSpacing: "-0.03em", margin: 0 }}>
              <span style={{ color: "var(--ink)" }}>{isLoading ? "…" : programs.length}</span>
              <span style={{ fontStyle: "italic", fontWeight: 400, color: "var(--ink-3)", margin: "0 8px" }}>—</span>
              <span style={{ fontWeight: 700, color: "var(--ink-3)", fontSize: "0.75em" }}>จาก {allPrograms.length} หลักสูตร</span>
            </h2>
          </div>
          {/* sort toggle */}
          <div className="flex rounded-full bg-white p-1" style={{ border: "1px solid var(--line)" }}>
            {(["match", "seats", "popular"] as SortKey[]).map((k) => (
              <button key={k} onClick={() => setSortKey(k)}
                className="rounded-full px-4 py-2.5 text-sm font-bold transition-all"
                style={sortKey === k
                  ? { background: "var(--ink)", color: "#fff" }
                  : { color: "var(--ink-3)" }}>
                {sortLabels[k]}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="mb-4 rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">{error}</p>}

        {/* card grid */}
        {isLoading ? (
          <div className="grid grid-cols-12 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className={`${i === 0 ? "col-span-12 lg:col-span-8" : "col-span-12 md:col-span-6 lg:col-span-4"} overflow-hidden rounded-3xl border border-line-soft bg-white`}>
                <div className="flex items-start gap-3 p-6">
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 animate-pulse rounded-full bg-surface-subtle" />
                    <div className="h-6 w-full animate-pulse rounded-full bg-surface-subtle" />
                    <div className="h-4 w-1/2 animate-pulse rounded-full bg-surface-subtle" />
                  </div>
                  <div className="h-16 w-16 flex-shrink-0 animate-pulse rounded-full bg-surface-subtle" />
                </div>
              </div>
            ))}
          </div>
        ) : programs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line p-16 text-center bg-white">
            <p style={{ fontStyle: "italic", fontSize: 72, color: "var(--ink-4)", lineHeight: 0.8 }}>∅</p>
            <h3 style={{ fontWeight: 800, fontSize: 26, letterSpacing: "-0.02em", margin: "16px 0 8px" }}>ยังไม่พบหลักสูตร</h3>
            <p style={{ color: "var(--ink-3)", fontSize: 15, maxWidth: 360, margin: "0 auto 20px" }}>
              ลองลบตัวกรองออก หรือค้นด้วยคำอื่นดูนะ — เช่น "เกษตร", "ออกแบบ", "ข้อมูล"
            </p>
            <button onClick={() => { setRiasecFilter(""); handleClearSearch(); }}
              className="rounded-full border px-6 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-ink hover:text-white"
              style={{ borderColor: "var(--line)" }}>
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-4">
            {programs.map((p, i) => {
              const spanClass = isDefault && i === 0
                ? "col-span-12 lg:col-span-8"
                : "col-span-12 md:col-span-6 lg:col-span-4";
              return (
                <div key={p.id} className={spanClass}>
                  {isDefault && i === 0 ? (
                    <FeaturedCard program={p} rank={i + 1} pinned={pinnedIds.includes(p.id)} onPin={() => togglePin(p.id)} />
                  ) : (
                    <ProgramCard program={p} rank={i + 1} pinned={pinnedIds.includes(p.id)} onPin={() => togglePin(p.id)} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* CTA strip */}
        {!isLoading && programs.length > 0 && (
          <div className="mt-12 overflow-hidden rounded-3xl"
            style={{ background: "linear-gradient(135deg, var(--d-peach-soft) 0%, var(--d-green-soft) 100%)", padding: "48px" }}>
            <div className="grid items-center gap-8 md:grid-cols-[1.2fr_auto]">
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-widest" style={{ color: "var(--d-green-deep)" }}>Need a deeper dive?</p>
                <h3 style={{ fontWeight: 800, fontSize: "clamp(22px,2.4vw,32px)", lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 8 }}>
                  ยังไม่แน่ใจว่า{" "}
                  <em style={{ fontStyle: "italic", color: "var(--d-green-deep)", fontWeight: 400 }}>คณะไหนใช่?</em>
                  <br />ลองคุยกับ KUru AI ดูสิ
                </h3>
                <p style={{ fontSize: 14.5, color: "var(--ink-2)", lineHeight: 1.55, maxWidth: 480 }}>
                  บอกความสนใจหรือเงื่อนไขของคุณเป็นภาษาคน — KUru จะช่วยกรอง วิเคราะห์ และตอบทุกข้อสงสัยเกี่ยวกับหลักสูตร, มคอ.2 และ TCAS
                </p>
              </div>
              <Link href="/chat"
                className="flex items-center gap-2 rounded-2xl px-7 py-4 text-sm font-bold text-white transition-colors hover:bg-dgreen-deep"
                style={{ background: "var(--d-green)", whiteSpace: "nowrap" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                ถาม KUru AI
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* ── COMPARE FAB ───────────────────────────────────────── */}
      {pinnedIds.length >= 2 && (
        <div
          className="fixed bottom-7 left-1/2 z-40 flex items-center gap-3 rounded-full px-5 py-3.5 text-white"
          style={{ transform: "translateX(-50%)", background: "var(--ink)", boxShadow: "0 20px 48px -12px rgba(15,27,20,0.5)", animation: "kuruFabIn 320ms cubic-bezier(.2,.7,.2,1)" }}>
          <span className="rounded-full px-2.5 py-0.5 text-sm font-black"
            style={{ background: "var(--d-green-pop)", color: "var(--ink)" }}>
            {pinnedIds.length}
          </span>
          <span className="text-sm font-semibold">หลักสูตรปักหมุดไว้ — เทียบเลยมั้ย?</span>
          <button onClick={() => setShowCompare(true)}
            className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-white/20"
            style={{ background: "rgba(255,255,255,0.1)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </button>
        </div>
      )}

      {showCompare && pinnedIds.length > 0 && (
        <CompareModal programIds={pinnedIds} programs={allPrograms} onClose={() => setShowCompare(false)} />
      )}
    </>
  );
}
