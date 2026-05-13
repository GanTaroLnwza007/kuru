"use client";

import { useEffect, useState, useReducer, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import type { ProgramSummary } from "@/lib/api";
import { RICH_PROGRAMS } from "@/lib/program-rich";
import { computeProgramMatch, type RiasecDim } from "@/lib/riasec";
import { useAppStore } from "@/lib/store";

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
        <span style={{ fontWeight: 800, fontSize: size * 0.245, lineHeight: 1, fontVariantNumeric: "tabular-nums", color: dark ? "var(--d-green-pop)" : "var(--ink)" }}>
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

// Exact colors from kuru-system.css
const RIASEC_COLORS: Record<RiasecDim, { color: string; bg: string; th: string }> = {
  R: { color: "#B85B2E", bg: "#FFF1E6", th: "ลงมือทำ" },
  I: { color: "#2A5C86", bg: "#EAF3FB", th: "นักวิเคราะห์" },
  A: { color: "#7A5FBF", bg: "#F1ECFB", th: "ศิลปิน" },
  S: { color: "#C04D5C", bg: "#FCEBEE", th: "ช่วยเหลือ" },
  E: { color: "#D49419", bg: "#FFF6E2", th: "นักริเริ่ม" },
  C: { color: "#006D35", bg: "#E6F5EC", th: "ระเบียบ" },
};

// ── Reusable button primitives ──────────────────────────────────

// .btn.btn-primary.btn-sm (h:40, smaller text)
const BtnPrimarySm = ({ children, onClick, style = {} }: { children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties }) => (
  <button
    onClick={onClick}
    style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      height: 40, padding: "0 16px", borderRadius: 999,
      fontWeight: 700, fontSize: 13.5, whiteSpace: "nowrap",
      background: "var(--ink)", color: "#fff", border: "none",
      boxShadow: "0 8px 24px -8px rgba(10,31,20,.5)",
      transition: "transform 220ms cubic-bezier(.2,.7,.2,1), box-shadow 220ms",
      cursor: "pointer", minHeight: 0, minWidth: 0,
      ...style,
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ""; }}
  >
    {children}
  </button>
);

// .pin-btn style
function PinBtn({ pinned, onClick, dark = false }: { pinned: boolean; onClick: () => void; dark?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const base: React.CSSProperties = dark
    ? { background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.18)", color: "#fff" }
    : { background: "var(--paper)", borderColor: "var(--line)", color: "var(--ink-2)" };
  const pinnedStyle: React.CSSProperties = dark
    ? { background: "var(--d-green-pop)", borderColor: "var(--d-green-pop)", color: "var(--ink)" }
    : { background: "var(--d-green)", borderColor: "var(--d-green)", color: "#fff" };
  const hoverStyle: React.CSSProperties = pinned
    ? (dark ? {} : { background: "var(--d-green-deep)", borderColor: "var(--d-green-deep)" })
    : (dark ? { background: "rgba(255,255,255,0.16)" } : { background: "#fff", borderColor: "var(--ink-3)", color: "var(--ink)" });

  return (
    <button
      onClick={(e) => { e.preventDefault(); onClick(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        height: 34, padding: "0 12px", borderRadius: 999,
        border: "1px solid", fontSize: 12.5, fontWeight: 700,
        transition: "all 180ms", cursor: "pointer",
        minHeight: 0, minWidth: 0,
        ...(pinned ? pinnedStyle : base),
        ...(hovered ? hoverStyle : {}),
      }}
    >
      {/* pin icon */}
      <svg width="13" height="13" viewBox="0 0 24 24" fill={pinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 17v5" /><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
      </svg>
      {pinned ? "ปักหมุดแล้ว" : "ปักหมุด"}
    </button>
  );
}

// .arrow-go button — circles, rotates on card hover
function ArrowGo({ href, dark = false, hovered = false }: { href: string; dark?: boolean; hovered?: boolean }) {
  const base: React.CSSProperties = dark
    ? { background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.18)", color: "#fff" }
    : { background: "#fff", borderColor: "var(--line)", color: "var(--ink-2)" };
  const hoveredStyle: React.CSSProperties = dark
    ? { background: "var(--d-green-pop)", borderColor: "var(--d-green-pop)", color: "var(--ink)" }
    : { background: "var(--ink)", borderColor: "var(--ink)", color: "#fff" };

  return (
    <Link href={href} style={{
      width: 36, height: 36, borderRadius: "50%", border: "1px solid",
      display: "grid", placeItems: "center",
      transition: "all 280ms cubic-bezier(.2,.7,.2,1)",
      transform: hovered ? "rotate(-45deg)" : "none",
      ...(hovered ? hoveredStyle : base),
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </Link>
  );
}

// ── Featured card (dark, first slot) ───────────────────────────
function FeaturedCard({ program, rank, pinned, onPin }: { program: EnrichedProgram; rank: number; pinned: boolean; onPin: () => void }) {
  const [hovered, setHovered] = useState(false);
  const { rich, match } = program;
  const href = `/explore/${program.slug || program.id}`;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", display: "flex", flexDirection: "column", gap: 20,
        overflow: "hidden", borderRadius: 24, padding: 38, minHeight: 380,
        background: "var(--ink)", color: "#fff", border: "none", cursor: "pointer",
        transition: "all 320ms cubic-bezier(.2,.7,.2,1)",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? "0 36px 72px -20px rgba(15,27,20,.5)" : "none",
      }}
    >
      {/* radial gradient overlay */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(circle at 88% 12%, rgba(0,166,81,0.4), transparent 50%), radial-gradient(circle at 4% 96%, rgba(61,220,132,0.18), transparent 60%)" }} />

      {/* rank bg number */}
      <div style={{
        position: "absolute", top: -50, right: -10,
        fontStyle: "italic", fontWeight: 600,
        fontSize: "clamp(180px,22vw,280px)",
        color: hovered ? "rgba(0,166,81,0.18)" : "rgba(255,255,255,0.05)",
        lineHeight: 1, fontVariantNumeric: "tabular-nums",
        pointerEvents: "none", userSelect: "none",
        transition: "color 320ms",
      }}>
        {String(rank).padStart(2, "0")}
      </div>

      {/* faculty row */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{
          background: "rgba(61,220,132,0.16)", color: "var(--d-green-pop)",
          padding: "3px 9px", borderRadius: 999, fontSize: 10.5,
          fontWeight: 800, letterSpacing: "0.12em", border: "1px solid rgba(61,220,132,0.25)",
        }}>★ TOP MATCH</span>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>
          {program.faculty_th}
          <span style={{ color: "rgba(255,255,255,0.3)", margin: "0 5px" }}>·</span>
          ม.เกษตรศาสตร์
        </span>
      </div>

      {/* name row + ring */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link href={href}>
            <div style={{ fontWeight: 800, fontSize: "clamp(30px,4vw,46px)", lineHeight: 1.05, color: "#fff", letterSpacing: "-0.02em" }}>
              {program.name_th}
            </div>
          </Link>
          <div style={{ fontStyle: "italic", fontSize: 17, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
            {program.name_en}
          </div>
          {rich?.why && (
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, maxWidth: 460, marginTop: 6 }}>
              {rich.why}
            </p>
          )}
        </div>
        {match !== null && <MatchRing value={match} size={96} dark />}
      </div>

      {/* RIASEC tags */}
      {rich && (
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>RIASEC fit</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {rich.riasec.map((dk) => (
              <span key={dk} style={{
                background: "rgba(255,255,255,0.1)", color: "#fff",
                border: "1px solid rgba(255,255,255,0.18)",
                display: "inline-flex", alignItems: "center", gap: 4,
                fontSize: 11.5, fontWeight: 700, padding: "4px 10px", borderRadius: 999,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: RIASEC_COLORS[dk].color, flexShrink: 0, display: "inline-block" }} />
                {dk} · {RIASEC_COLORS[dk].th}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* meta row */}
      <div style={{
        position: "relative", zIndex: 1, marginTop: "auto",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10,
        paddingTop: 14, borderTop: "1px dashed rgba(255,255,255,0.14)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {match !== null && (
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, color: "#fff", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{match}%</div>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: "0.04em" }}>เข้ากับคุณ</div>
            </div>
          )}
          {rich && (
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, color: "#fff", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{rich.seats}</div>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: "0.04em" }}>ที่นั่ง</div>
            </div>
          )}
          {rich && (
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, color: "#fff", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{rich.salary.split("–")[0].trim()}</div>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: "0.04em" }}>เริ่มต้น (ประมาณ)</div>
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <PinBtn pinned={pinned} onClick={onPin} dark />
          <ArrowGo href={href} dark hovered={hovered} />
        </div>
      </div>
    </div>
  );
}

// ── Standard program card ───────────────────────────────────────
function ProgramCard({ program, rank, pinned, onPin }: { program: EnrichedProgram; rank: number; pinned: boolean; onPin: () => void }) {
  const [hovered, setHovered] = useState(false);
  const { rich, match } = program;
  const href = `/explore/${program.slug || program.id}`;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", display: "flex", flexDirection: "column", gap: 16,
        overflow: "hidden", borderRadius: 24, padding: 26, minHeight: 280,
        background: "#fff", border: "1px solid",
        borderColor: hovered ? "var(--ink)" : "var(--line-soft)",
        cursor: "pointer",
        transition: "all 320ms cubic-bezier(.2,.7,.2,1)",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? "0 28px 56px -20px rgba(15,27,20,.16)" : "none",
      }}
    >
      {/* rank bg number */}
      <div style={{
        position: "absolute", top: 14, right: 22,
        fontStyle: "italic", fontWeight: 600, fontSize: 56,
        color: hovered ? "var(--d-green-soft)" : "var(--paper)",
        lineHeight: 1, fontVariantNumeric: "tabular-nums",
        pointerEvents: "none", userSelect: "none",
        transition: "color 320ms",
      }}>
        {String(rank).padStart(2, "0")}
      </div>

      {/* row1: faculty + ring */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
          {/* .faculty style */}
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)", display: "inline-flex", alignItems: "center", gap: 6 }}>
            {program.faculty_th}
            <span style={{ color: "var(--ink-4)", fontWeight: 400 }}>·</span>
            ม.เกษตรศาสตร์
          </div>
          {/* .pname style */}
          <Link href={href}>
            <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.02em", color: "var(--ink)", marginTop: 10 }}>
              {program.name_th}
            </div>
          </Link>
          {/* .pname-en style */}
          <div style={{ fontStyle: "italic", fontSize: 14, color: "var(--ink-3)", marginTop: 4 }}>
            {program.name_en}
          </div>
        </div>
        {match !== null && <MatchRing value={match} size={64} />}
      </div>

      {/* RIASEC tags — .gtag style with RIASEC-specific bg/color */}
      {rich && (
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {rich.riasec.map((dk) => {
            const rc = RIASEC_COLORS[dk];
            return (
              <span key={dk} style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                fontSize: 11.5, fontWeight: 700, padding: "4px 10px", borderRadius: 999,
                background: rc.bg, color: rc.color,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: rc.color, flexShrink: 0, display: "inline-block" }} />
                {dk} · {rc.th}
              </span>
            );
          })}
        </div>
      )}

      {/* meta row — .meta-row style */}
      <div style={{
        position: "relative", zIndex: 1, marginTop: "auto",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
        paddingTop: 14, borderTop: "1px dashed var(--line)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {match !== null && (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontWeight: 800, color: "var(--ink)", fontSize: 17, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em", lineHeight: 1 }}>{match}%</span>
              <span style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 600, letterSpacing: "0.04em" }}>เข้ากับคุณ</span>
            </div>
          )}
          {rich && (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontWeight: 800, color: "var(--ink)", fontSize: 17, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em", lineHeight: 1 }}>{rich.seats}</span>
              <span style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 600, letterSpacing: "0.04em" }}>ที่นั่ง</span>
            </div>
          )}
          {rich && (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontWeight: 800, color: "var(--ink)", fontSize: 17, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em", lineHeight: 1 }}>{rich.salary.split("–")[0].trim()}</span>
              <span style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 600, letterSpacing: "0.04em" }}>เริ่มต้น (ประมาณ)</span>
            </div>
          )}
        </div>
        {/* .meta-actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <PinBtn pinned={pinned} onClick={onPin} />
          <ArrowGo href={href} hovered={hovered} />
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
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{ background: "rgba(10,31,20,0.4)" }}>
      <div onClick={(e) => e.stopPropagation()} className="kuru-slide-in max-h-[90vh] w-full max-w-3xl overflow-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", color: "var(--d-green)", textTransform: "uppercase", marginBottom: 4 }}>เปรียบเทียบ</p>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>{items.length} หลักสูตร เคียงข้างกัน</h2>
          </div>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--line)",
            background: "var(--paper)", color: "var(--ink-2)", display: "grid", placeItems: "center",
            cursor: "pointer", minHeight: 0, minWidth: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6 18 18M6 18 18 6" /></svg>
          </button>
        </div>
        <div className="overflow-auto rounded-2xl border" style={{ borderColor: "var(--line-soft)" }}>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr style={{ background: "var(--paper)" }}>
                <th className="px-4 py-3 text-left" style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-3)" }} />
                {items.map((p) => <th key={p.id} className="px-4 py-3 text-left" style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)", minWidth: 140 }}>{p.name_th}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} style={{ borderTop: "1px solid var(--line-soft)" }}>
                  <td className="px-4 py-3" style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-3)" }}>{row.label}</td>
                  {items.map((p) => (
                    <td key={p.id} className="px-4 py-3" style={{ fontSize: 14, color: row.hi ? "var(--d-green)" : "var(--ink)", fontWeight: row.hi ? 700 : 500 }}>
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
type FetchAction =
  | { type: "start" }
  | { type: "success" }
  | { type: "error"; message: string };

function fetchReducer(
  _prev: { isLoading: boolean; error: string | null },
  action: FetchAction,
): { isLoading: boolean; error: string | null } {
  if (action.type === "start") return { isLoading: true, error: null };
  if (action.type === "success") return { isLoading: false, error: null };
  return { isLoading: false, error: action.message };
}

export default function ExplorePage() {
  const riasecScores = useAppStore((s) => s.riasec.scores);

  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [allPrograms, setAllPrograms] = useState<ProgramSummary[]>([]);
  const [{ isLoading, error }, dispatchFetch] = useReducer(fetchReducer, { isLoading: true, error: null });

  const [riasecFilter, setRiasecFilter] = useState<RiasecDim | "">("");
  const [sortKey, setSortKey] = useState<SortKey>("match");
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    dispatchFetch({ type: "start" });
    apiClient.searchPrograms({ q: query }).then((r) => {
      if (!cancelled) {
        setAllPrograms(r.data.results);
        dispatchFetch({ type: "success" });
      }
    }).catch(() => {
      if (!cancelled) dispatchFetch({ type: "error", message: "โหลดข้อมูลไม่สำเร็จ" });
    });
    return () => { cancelled = true; };
  }, [query]);

  const programs = useMemo(() => {
    let list = allPrograms.map((p) => {
      const rich = RICH_PROGRAMS[p.slug] ?? RICH_PROGRAMS[p.id];
      const match = rich && riasecScores
        ? computeProgramMatch(rich.riasec, riasecScores, rich.baseFit)
        : null;
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
  const isDirty = !!riasecFilter || !!query;

  const togglePin = useCallback((id: string) => {
    setPinnedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev);
  }, []);

  const handleSearch = () => setQuery(inputValue.trim());
  const handleClearSearch = () => { setInputValue(""); setQuery(""); searchRef.current?.focus(); };
  const handleResetAll = () => { setRiasecFilter(""); setInputValue(""); setQuery(""); };

  const sortLabels: Record<SortKey, string> = { match: "เข้ากับคุณ", seats: "ที่นั่งมาก", popular: "ยอดนิยม" };

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────── */}
      <section style={{ position: "relative", overflow: "hidden", background: "var(--ink)" }}>
        {/* green radial mesh */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 700px 500px at 88% 18%, rgba(0,166,81,.3) 0%, transparent 60%), radial-gradient(ellipse 500px 500px at 4% 96%, rgba(61,220,132,.12) 0%, transparent 60%)",
        }} />
        {/* diagonal lines texture */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
          background: "repeating-linear-gradient(135deg, transparent 0 80px, rgba(255,255,255,.025) 80px 81px)",
        }} />

        <div className="mx-auto max-w-[1320px] px-8 pt-16 pb-9" style={{ position: "relative", zIndex: 2 }}>
          {/* breadcrumb */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 24 }}>
            <Link href="/" style={{ color: "inherit" }} onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = "#fff")} onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = "")}>Home</Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: "rgba(255,255,255,0.25)" }}><path d="m9 6 6 6-6 6" /></svg>
            <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>Programs</span>
          </div>

          {/* hero grid */}
          <div className="grid items-end gap-14 lg:grid-cols-[1.5fr_1fr]">
            {/* left: headline + lead */}
            <div>
              <h1 style={{ fontWeight: 800, fontSize: "clamp(48px,6vw,84px)", lineHeight: 0.95, letterSpacing: "-0.04em", color: "#fff", margin: "0 0 22px", textWrap: "balance" }}>
                เลือกคณะที่ใช่
                <span style={{ fontStyle: "italic", fontWeight: 400, color: "var(--d-green-pop)" }}>.</span>
                <br />
                <span style={{ fontStyle: "italic", fontWeight: 600, color: "var(--d-green-pop)" }}>ไม่ต้อง</span>
                {" "}เดา
              </h1>
              <p style={{ fontSize: 18, lineHeight: 1.6, color: "rgba(255,255,255,0.6)", maxWidth: 540, margin: 0 }}>
                เรียงทั้ง {isLoading ? "—" : allPrograms.length} หลักสูตรของ{" "}
                <em style={{ fontStyle: "italic", color: "rgba(255,255,255,0.9)", fontWeight: 400 }}>ม.เกษตรศาสตร์</em>{" "}
                ตามบุคลิก RIASEC ของคุณ — ปักหมุดได้สูงสุด 3 หลักสูตรเพื่อนำไปเทียบกัน
              </p>
            </div>

            {/* right: stat-strip */}
            <div style={{
              background: "rgba(10,31,20,0.7)", borderRadius: 28, padding: "28px 32px", color: "#fff",
              position: "relative", overflow: "hidden", minHeight: 200,
              display: "flex", flexDirection: "column", justifyContent: "space-between",
              border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)",
            }}>
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(circle at 80% 20%, rgba(0,166,81,.45), transparent 55%), radial-gradient(circle at 0% 100%, rgba(61,220,132,.18), transparent 60%)" }} />
              <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 12px", borderRadius: 999, background: "rgba(61,220,132,0.15)", border: "1px solid rgba(61,220,132,0.3)", color: "var(--d-green-pop)", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--d-green-pop)", animation: "pulse-dot 1.6s ease-in-out infinite", display: "inline-block" }} />
                  LIVE · TCAS68
                </span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 700, letterSpacing: "0.08em" }}>
                  UPDATED {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}
                </span>
              </div>
              <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "repeat(3,1fr)" }}>
                {[
                  { lbl: "หลักสูตร", v: isLoading ? "—" : String(allPrograms.length), sub: "" },
                  { lbl: "เข้ากับคุณ", v: riasecScores ? String(matchedCount) : "—", sub: riasecScores ? `/${allPrograms.length}` : "" },
                  { lbl: "RIASEC", v: riasecCode ?? "—", sub: "" },
                ].map((cell, i) => (
                  <div key={i} style={{
                    paddingRight: i < 2 ? 16 : 0,
                    paddingLeft: i > 0 ? 16 : 0,
                    borderRight: i < 2 ? "1px solid rgba(255,255,255,0.14)" : "none",
                  }}>
                    <div style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", fontWeight: 700 }}>{cell.lbl}</div>
                    <div style={{ fontWeight: 800, fontSize: 38, letterSpacing: "-0.02em", marginTop: 6, lineHeight: 1, fontVariantNumeric: "tabular-nums", color: i === 2 ? "var(--d-green-pop)" : "#fff" }}>
                      {cell.v}
                      {cell.sub && <span style={{ fontStyle: "italic", fontWeight: 400, fontSize: "0.42em", color: "var(--d-green-pop)", marginLeft: 4 }}>{cell.sub}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEARCH SECTION ────────────────────────────────────── */}
      <section style={{ paddingBottom: 8, position: "relative", zIndex: 3, background: "var(--paper)" }}>
        <div className="mx-auto max-w-[1320px] px-8 pt-6">
          {/* search bar — .search-bar style */}
          <div style={{
            display: "flex", gap: 10, alignItems: "center",
            background: "#fff", border: "1px solid",
            borderColor: searchFocused ? "var(--ink)" : "var(--line)",
            borderRadius: 22, padding: "10px 10px 10px 22px",
            boxShadow: searchFocused
              ? "0 18px 44px -16px rgba(15,27,20,.24), 0 0 0 4px rgba(0,166,81,.1)"
              : "0 14px 36px -18px rgba(15,27,20,.18), 0 1px 2px rgba(15,27,20,.04)",
            transition: "all 240ms",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
              ref={searchRef}
              aria-label="ค้นหาหลักสูตร"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="ค้นหา 'วิศวะ' 'เกษตร' 'สถาปัตย์' หรือพิมพ์ภาษาคนเลย..."
              style={{
                flex: 1, border: "none", outline: "none", fontSize: 16.5,
                background: "transparent", color: "var(--ink)", padding: "8px 0",
                fontFamily: "inherit", minHeight: 0,
              }}
            />
            {inputValue && (
              <button
                onClick={handleClearSearch}
                aria-label="ล้าง"
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  display: "grid", placeItems: "center",
                  color: "var(--ink-3)", transition: "all 180ms",
                  cursor: "pointer", border: "none", background: "none",
                  minHeight: 0, minWidth: 0,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--paper)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--ink)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = ""; (e.currentTarget as HTMLButtonElement).style.color = "var(--ink-3)"; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6 18 18M6 18 18 6" /></svg>
              </button>
            )}
            {/* .btn.btn-primary.btn-sm */}
            <BtnPrimarySm onClick={handleSearch}>ค้นหา</BtnPrimarySm>
          </div>

          {/* filter row — .filter-row style */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 18, alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)", marginRight: 6 }}>Filter · RIASEC</span>
            {RIASEC_FILTER_ORDER.map((dim) => {
              const rc = RIASEC_COLORS[dim];
              const active = riasecFilter === dim;
              return (
                <ChipBtn key={dim} active={active} onClick={() => setRiasecFilter(active ? "" : dim)}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: active ? "rgba(255,255,255,0.8)" : rc.color, flexShrink: 0, display: "inline-block" }} />
                  {dim} · {rc.th}
                </ChipBtn>
              );
            })}
            {isDirty && (
              <button
                onClick={handleResetAll}
                style={{ marginLeft: "auto", fontSize: 12.5, fontWeight: 700, color: "var(--ink-3)", textDecoration: "underline", textUnderlineOffset: 3, border: "none", background: "none", cursor: "pointer", minHeight: 0, minWidth: 0 }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "var(--ink)")}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "var(--ink-3)")}
              >ล้างตัวกรอง</button>
            )}
          </div>
        </div>
      </section>

      {/* ── PINNED STRIP ──────────────────────────────────────── */}
      {pinnedIds.length > 0 && (
        <div className="mx-auto max-w-[1320px] px-8 pt-4">
          {/* .pinned-strip */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "14px 18px", background: "var(--d-green-soft)", border: "1px solid rgba(0,166,81,0.18)", borderRadius: 18, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 800, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--d-green-deep)", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17v5l-1-1.5L10 22v-5" /><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" /></svg>
              Pinned {pinnedIds.length}/3
            </span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 1 }}>
              {pinnedIds.map((id) => {
                const p = allPrograms.find((x) => x.id === id);
                if (!p) return null;
                return (
                  <span key={id} style={{ background: "#fff", padding: "7px 8px 7px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4, border: "1px solid rgba(0,166,81,0.2)", color: "var(--ink)" }}>
                    {p.name_th}
                    <button onClick={() => togglePin(id)} aria-label="remove" style={{ width: 22, height: 22, borderRadius: "50%", display: "grid", placeItems: "center", color: "var(--ink-4)", border: "none", background: "none", cursor: "pointer", minHeight: 0, minWidth: 0, transition: "all 180ms" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--paper)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--ink)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = ""; (e.currentTarget as HTMLButtonElement).style.color = "var(--ink-4)"; }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6 18 18M6 18 18 6" /></svg>
                    </button>
                  </span>
                );
              })}
            </div>
            <BtnPrimarySm onClick={() => setShowCompare(true)}>
              เทียบกัน
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
            </BtnPrimarySm>
          </div>
        </div>
      )}

      {/* ── RESULTS ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1320px] px-8 pt-8 pb-24" data-testid="explore-shell">
        {/* results-head */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 28, gap: 16, flexWrap: "wrap" }}>
          <div>
            {/* .kicker */}
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", color: "var(--d-green)", textTransform: "uppercase", marginBottom: 10 }}>★ Curated for you</div>
            {/* .results-title */}
            <h2 style={{ fontWeight: 800, fontSize: "clamp(28px,3.4vw,42px)", lineHeight: 1, letterSpacing: "-0.03em", margin: 0 }}>
              <span style={{ color: "var(--ink)" }}>{isLoading ? "…" : programs.length}</span>
              <span style={{ fontStyle: "italic", fontWeight: 400, color: "var(--ink-3)", margin: "0 6px" }}>— จาก</span>
              <span style={{ color: "var(--ink-3)", fontWeight: 700 }}>{allPrograms.length} หลักสูตร</span>
            </h2>
          </div>
          {/* .sort-toggle */}
          <div style={{ display: "flex", background: "#fff", border: "1px solid var(--line)", borderRadius: 999, padding: 4 }}>
            {(["match", "seats", "popular"] as SortKey[]).map((k) => (
              <button key={k} onClick={() => setSortKey(k)}
                style={{
                  padding: "9px 18px", borderRadius: 999, fontWeight: 700, fontSize: 13,
                  color: sortKey === k ? "#fff" : "var(--ink-3)",
                  background: sortKey === k ? "var(--ink)" : "transparent",
                  border: "none", cursor: "pointer", transition: "all 200ms",
                  minHeight: 0, minWidth: 0,
                }}
                onMouseEnter={e => { if (sortKey !== k) (e.currentTarget as HTMLButtonElement).style.color = "var(--ink)"; }}
                onMouseLeave={e => { if (sortKey !== k) (e.currentTarget as HTMLButtonElement).style.color = "var(--ink-3)"; }}
              >
                {sortLabels[k]}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="mb-4 rounded-2xl p-4 text-sm" style={{ background: "rgba(186,26,26,0.05)", border: "1px solid rgba(186,26,26,0.3)", color: "var(--kuru-status-danger)" }}>{error}</p>}

        {/* card grid — 12-col matching handoff */}
        {isLoading ? (
          <div className="grid grid-cols-12 gap-[18px]">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className={i === 0 ? "col-span-12 lg:col-span-8" : "col-span-12 md:col-span-6 lg:col-span-4"}
                style={{ borderRadius: 24, border: "1px solid var(--line-soft)", background: "#fff", padding: 26, minHeight: 280 }}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 animate-pulse rounded-full" style={{ background: "var(--line-soft)" }} />
                    <div className="h-6 w-full animate-pulse rounded-full" style={{ background: "var(--line-soft)" }} />
                    <div className="h-4 w-1/2 animate-pulse rounded-full" style={{ background: "var(--line-soft)" }} />
                  </div>
                  <div className="animate-pulse rounded-full flex-shrink-0" style={{ width: 64, height: 64, background: "var(--line-soft)" }} />
                </div>
              </div>
            ))}
          </div>
        ) : programs.length === 0 ? (
          // .empty-card
          <div style={{ textAlign: "center", padding: "72px 32px", background: "#fff", border: "1px dashed var(--line)", borderRadius: 28 }}>
            <div style={{ fontStyle: "italic", fontSize: 96, color: "var(--ink-4)", lineHeight: 0.8 }}>∅</div>
            <h3 style={{ fontWeight: 800, fontSize: 28, letterSpacing: "-0.02em", margin: "16px 0 10px" }}>ยังไม่พบหลักสูตร</h3>
            <p style={{ color: "var(--ink-3)", fontSize: 15, margin: "0 auto 20px", maxWidth: 380 }}>ลองลบตัวกรองออก หรือค้นด้วยคำอื่นดูนะ — เช่น &quot;เกษตร&quot;, &quot;ออกแบบ&quot;, &quot;ข้อมูล&quot;</p>
            <button onClick={handleResetAll} style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              height: 50, padding: "0 22px", borderRadius: 999,
              fontWeight: 700, fontSize: 15,
              background: "rgba(255,255,255,0.7)", color: "var(--ink)",
              border: "1px solid var(--line)", backdropFilter: "blur(8px)",
              cursor: "pointer", transition: "all 220ms", minHeight: 0, minWidth: 0,
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#fff"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--ink)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.7)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--line)"; }}
            >ล้างตัวกรองทั้งหมด</button>
          </div>
        ) : (
          // .grid (12-col, gap 18px)
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12,1fr)", gap: 18 }}>
            {programs.map((p, i) => {
              const isFeatured = isDefault && i === 0;
              // span-8 for featured, span-4 for rest (responsive handled by max-width queries)
              const colSpan = isFeatured ? "span 8 / span 8" : "span 4 / span 4";
              return (
                <div key={p.id} style={{ gridColumn: colSpan }}>
                  {isFeatured ? (
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
          <div style={{ marginTop: 48 }}>
            {/* .ex-cta */}
            <div style={{
              background: "linear-gradient(135deg, var(--d-peach-soft) 0%, var(--d-green-soft) 100%)",
              borderRadius: 32, padding: 48,
              display: "grid", gridTemplateColumns: "1.2fr auto", gap: 32, alignItems: "center",
            }}>
              <div>
                {/* .kicker */}
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", color: "var(--d-green-deep)", textTransform: "uppercase", marginBottom: 10 }}>Need a deeper dive?</div>
                {/* .ex-cta-h */}
                <h3 style={{ fontWeight: 800, fontSize: "clamp(24px,2.4vw,34px)", lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 8 }}>
                  ยังไม่แน่ใจว่า{" "}
                  <em style={{ fontStyle: "italic", color: "var(--d-green-deep)", fontWeight: 400 }}>คณะไหนใช่?</em>
                  <br />ลองคุยกับ KUru AI ดูสิ
                </h3>
                {/* .ex-cta-d */}
                <p style={{ fontSize: 14.5, color: "var(--ink-2)", lineHeight: 1.55, maxWidth: 480 }}>
                  บอกความสนใจหรือเงื่อนไขของคุณเป็นภาษาคน — KUru จะช่วยกรอง วิเคราะห์ และตอบทุกข้อสงสัยเกี่ยวกับหลักสูตร, มคอ.2 และ TCAS
                </p>
              </div>
              {/* .btn.btn-primary.btn-big */}
              <Link href="/chat" style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                height: 60, padding: "0 28px", borderRadius: 999,
                fontWeight: 700, fontSize: 16, whiteSpace: "nowrap",
                background: "var(--d-green)", color: "#fff",
                boxShadow: "0 8px 24px -8px rgba(0,166,81,.5)",
                transition: "background 220ms, transform 220ms",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--d-green-deep)"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--d-green)"; (e.currentTarget as HTMLAnchorElement).style.transform = ""; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                ถาม KUru AI
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* ── COMPARE FAB ───────────────────────────────────────── */}
      {pinnedIds.length >= 2 && (
        <div
          style={{
            position: "fixed", bottom: 28, left: "50%",
            transform: "translate(-50%, 0)",
            background: "var(--ink)", color: "#fff", borderRadius: 999,
            padding: "14px 22px",
            boxShadow: "0 20px 48px -12px rgba(15,27,20,.5)",
            display: "flex", alignItems: "center", gap: 14,
            zIndex: 40, fontWeight: 600, fontSize: 14,
            animation: "kuruFabIn 320ms cubic-bezier(.2,.7,.2,1)",
          }}
        >
          <span style={{ background: "var(--d-green-pop)", color: "var(--ink)", borderRadius: 999, padding: "3px 10px", fontWeight: 800, fontVariantNumeric: "tabular-nums", fontSize: 13 }}>
            {pinnedIds.length}
          </span>
          <span>หลักสูตรปักหมุดไว้ — เทียบเลยมั้ย?</span>
          <button onClick={() => setShowCompare(true)} style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "grid", placeItems: "center", border: "none", cursor: "pointer", color: "#fff", minHeight: 0, minWidth: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
          </button>
        </div>
      )}

      {showCompare && pinnedIds.length > 0 && (
        <CompareModal programIds={pinnedIds} programs={allPrograms} onClose={() => setShowCompare(false)} />
      )}
    </>
  );
}

// ── Chip button (.chip style) ────────────────────────────────────
function ChipBtn({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: 32, padding: "0 14px", borderRadius: 999,
        background: active ? "var(--ink)" : "#fff",
        color: active ? "#fff" : "var(--ink-2)",
        borderWidth: 1, borderStyle: "solid",
        borderColor: active ? "var(--ink)" : (!active && hovered ? "var(--ink)" : "var(--line)"),
        fontSize: 13, fontWeight: 600, fontFamily: "inherit",
        display: "inline-flex", alignItems: "center", gap: 6,
        transition: "all 180ms", cursor: "pointer",
        transform: !active && hovered ? "translateY(-1px)" : "none",
        minHeight: 0, minWidth: 0,
      }}
    >
      {children}
    </button>
  );
}
