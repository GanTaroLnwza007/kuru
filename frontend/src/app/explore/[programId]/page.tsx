"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import type { ProgramDetail } from "@/lib/api";
import { RICH_PROGRAMS, type YearVibeItem, type RichProgram } from "@/lib/program-rich";
import { RIASEC_DIMS, computeProgramMatch } from "@/lib/riasec";
import { useAppStore } from "@/lib/store";
import { Icon } from "@/components/ui/Icon";

// ── Design tokens ────────────────────────────────────────────────
const C = {
  ink: "#0A1F14", ink2: "#2E3D34", ink3: "#6B7770", ink4: "#9CA59F",
  paper: "#FAFAF6", line: "#E8EAE2", lineSoft: "#F0F2EB",
  green: "#00A651", greenDeep: "#006D35", greenSoft: "#E6F5EC", greenPop: "#3DDC84",
  amber: "#E8A93B", amberSoft: "#FFF6E2",
  sky: "#2A5C86", skySoft: "#EAF3FB",
  peachSoft: "#FFF1E6", rust: "#B85B2E",
};

// ── Animated match ring ─────────────────────────────────────────
function MatchRing({ value, size = 160, dark = false }: { value: number; size?: number; dark?: boolean }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let rafId: number;
    const start = performance.now();
    const duration = 1000;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setV(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value]);

  const sw = size * 0.063;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const trackColor = dark ? "rgba(255,255,255,.1)" : C.greenSoft;
  const fillColor = dark ? C.greenPop : C.green;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={fillColor} strokeWidth={sw}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ - (v / 100) * circ}
          style={{ transition: "stroke-dashoffset 60ms linear" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: size * 0.32, lineHeight: 1, color: dark ? "#fff" : C.ink, fontVariantNumeric: "tabular-nums" }}>
          {Math.round(v)}<span style={{ fontSize: size * 0.14, color: dark ? "rgba(255,255,255,.55)" : C.ink3 }}>%</span>
        </span>
        <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: size * 0.09, color: dark ? "rgba(255,255,255,.55)" : C.ink3, marginTop: 4 }}>match</span>
      </div>
    </div>
  );
}

// ── Year-by-Year Vibe — Timeline layout ─────────────────────────
const SEASON_GRAD: Record<string, [string, string]> = {
  spring: ["#E6F5EC", "#D8EEDD"],
  summer: ["#FFF6E2", "#FCEAC2"],
  autumn: ["#FFF1E6", "#FFE3D0"],
  winter: ["#EAF3FB", "#DCEAF6"],
};

function YearVibeTimeline({ years }: { years: YearVibeItem[] }) {
  const pal = SEASON_PALETTE;
  return (
    <div className="pgm-vibe-timeline" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, position: "relative" }}>
      {/* dashed connector */}
      <div aria-hidden className="pgm-vibe-connector" style={{ position: "absolute", top: 28, left: "8%", right: "8%", height: 2, background: `repeating-linear-gradient(90deg, ${C.line}, ${C.line} 4px, transparent 4px, transparent 8px)`, zIndex: 0 }} />
      {years.map((y, i) => {
        const [g1, g2] = SEASON_GRAD[y.season];
        const p = pal[y.season];
        return (
          <div key={i} style={{ position: "relative", zIndex: 1, overflow: "hidden", borderRadius: 24, border: `1px solid ${C.lineSoft}`, background: "#fff", transition: "all 300ms cubic-bezier(.2,.7,.2,1)" }} className="pgm-vibe-card">
            <div style={{ height: 80, background: `linear-gradient(135deg, ${g1} 0%, ${g2} 100%)`, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 14, left: 16, fontSize: 10, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: p.accent, opacity: .8 }}>ปีที่</div>
              <div aria-hidden style={{ position: "absolute", bottom: -10, right: 10, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 64, lineHeight: .85, letterSpacing: "-.04em", color: p.accent, opacity: .18, userSelect: "none" }}>{y.year}</div>
            </div>
            <div style={{ padding: "16px 18px" }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: "-.01em", color: C.ink, marginBottom: 2 }}>{y.mood}</div>
              <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 13, color: C.ink3, marginBottom: 10 }}>{y.moodEn} mode</div>
              <div style={{ fontSize: 13, color: C.ink2, lineHeight: 1.55, marginBottom: 12 }}>{y.desc}</div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: C.ink3, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 5 }}>ความเข้มข้น</div>
                <div style={{ height: 6, background: C.lineSoft, borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${y.heat * 100}%`, background: `linear-gradient(90deg, ${p.accent}, ${p.bg})`, borderRadius: 999, transition: "width .8s ease-out" }} />
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {y.kw.map((k) => <span key={k} style={{ height: 24, padding: "0 9px", borderRadius: 999, background: C.paper, border: `1px solid ${C.lineSoft}`, fontSize: 11, fontWeight: 600, color: C.ink2, display: "inline-flex", alignItems: "center" }}>{k}</span>)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Year-by-Year Vibe — Cards (stacked) layout ──────────────────
function YearVibeCards({ years }: { years: YearVibeItem[] }) {
  const SEASON_LABELS: Record<string, string> = { spring: "ฤดูใบไม้ผลิ", summer: "ฤดูร้อน", autumn: "ใบไม้ร่วง", winter: "ฤดูหนาว" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {years.map((y, i) => {
        const p = SEASON_PALETTE[y.season];
        return (
          <div key={i} className="pgm-stacked-card" style={{ overflow: "hidden", borderRadius: 22, border: `1px solid ${C.lineSoft}`, background: "#fff", display: "grid", gridTemplateColumns: "200px 1fr", transition: "all 280ms" }}>
            <div style={{ background: `linear-gradient(135deg, ${p.bg} 0%, ${p.bg}dd 100%)`, padding: 28, position: "relative", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div aria-hidden style={{ position: "absolute", bottom: -10, right: 10, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 80, lineHeight: .85, letterSpacing: "-.04em", color: p.accent, opacity: .12, userSelect: "none" }}>{y.year}</div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: p.accent, marginBottom: 6, position: "relative", zIndex: 1 }}>ปีที่ {y.year}</div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 20, color: p.accent, position: "relative", zIndex: 1 }}>{y.mood}</div>
              <div style={{ position: "absolute", bottom: 18, left: 28, fontSize: 12, color: p.accent, opacity: .7 }}>{SEASON_LABELS[y.season]}</div>
            </div>
            <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 22, fontWeight: 600, color: p.accent }}>{y.moodEn} <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontStyle: "normal", fontSize: ".7em", color: C.ink3 }}>Mode</span></div>
              <div style={{ fontSize: 14.5, color: C.ink2, lineHeight: 1.6 }}>{y.desc}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                {y.kw.map((k) => <span key={k} style={{ height: 24, padding: "0 9px", borderRadius: 999, background: p.bg, fontSize: 12, fontWeight: 600, color: C.ink, display: "inline-flex", alignItems: "center" }}>{k}</span>)}
                <div style={{ marginLeft: "auto", display: "flex", gap: 3 }}>
                  {[0,1,2,3,4].map((j) => <div key={j} style={{ width: 5, height: 14, borderRadius: 2, background: j < Math.round(y.heat * 5) ? p.accent : C.lineSoft }} />)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Year-by-Year Vibe — tab switcher ────────────────────────────
const SEASON_PALETTE: Record<YearVibeItem["season"], { bg: string; accent: string; label: string }> = {
  spring: { bg: "#E6F5EC", accent: "#7A9E7E", label: "ฤดูใบไม้ผลิ" },
  summer: { bg: "#FFF6E2", accent: "#E8A93B", label: "ฤดูร้อน" },
  autumn: { bg: "#FFF1E6", accent: "#FFB088", label: "ใบไม้ร่วง" },
  winter: { bg: "#EAF3FB", accent: "#7BB7E8", label: "ฤดูหนาว" },
};

function YearVibeSwitcher({ years }: { years: YearVibeItem[] }) {
  const [active, setActive] = useState(0);
  const y = years[active];
  const pal = SEASON_PALETTE[y.season];

  return (
    <div style={{ overflow: "hidden", borderRadius: 24, border: `1px solid ${C.lineSoft}`, background: "#fff" }}>
      {/* tab row */}
      <div style={{ display: "flex", borderBottom: `1px solid ${C.lineSoft}` }}>
        {years.map((yy, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            flex: 1, padding: "18px 10px", textAlign: "center",
            background: i === active ? "#fff" : C.paper,
            border: "none", borderBottom: `3px solid ${i === active ? C.green : "transparent"}`,
            cursor: "pointer", fontFamily: "inherit", transition: "all 200ms",
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.ink3, letterSpacing: ".08em", marginBottom: 4 }}>ปีที่ {yy.year}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: i === active ? C.ink : C.ink2 }}>{yy.mood}</div>
          </button>
        ))}
      </div>

      {/* panel */}
      <div key={active} className="pgm-vibe-panel" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", animation: "kuruSlideIn 240ms ease-out" }}>
        <div style={{ padding: "32px 36px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: pal.accent, letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 8 }}>
            {y.moodEn.toUpperCase()} · {pal.label.toUpperCase()}
          </div>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(22px,3.5vw,32px)", letterSpacing: "-.02em", lineHeight: 1.2, color: C.ink, margin: "0 0 12px" }}>
            ปีที่ {y.year} — {y.mood}
          </h3>
          <p style={{ fontSize: 15.5, color: C.ink2, lineHeight: 1.65, margin: "0 0 20px" }}>{y.desc}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {y.kw.map((k) => (
              <span key={k} style={{ fontSize: 12.5, fontWeight: 600, color: C.ink, padding: "6px 12px", borderRadius: 999, background: pal.bg }}>
                {k}
              </span>
            ))}
          </div>
        </div>

        <div style={{ background: `linear-gradient(135deg, ${pal.bg} 0%, ${pal.bg}aa 100%)`, padding: 32, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200 }}>
          <div aria-hidden style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(100px,14vw,180px)", lineHeight: .85, letterSpacing: "-.05em", color: pal.accent, opacity: .12, userSelect: "none" }}>
            {y.year}
          </div>
          <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 28, letterSpacing: "-.02em", color: pal.accent }}>{y.mood}</div>
            <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 16, color: pal.accent, opacity: .8, marginTop: 4 }}>{y.moodEn}</div>
            <div style={{ fontSize: 12, color: pal.accent, opacity: .65, marginTop: 10 }}>ความเข้มข้น {Math.round(y.heat * 100)}%</div>
          </div>
          <div style={{ position: "absolute", bottom: 20, right: 20, display: "flex", gap: 3 }}>
            {[0,1,2,3,4].map((j) => (
              <div key={j} style={{ width: 5, height: 14, borderRadius: 2, background: j < Math.round(y.heat * 5) ? pal.accent : C.lineSoft }} />
            ))}
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 640px) { .pgm-vibe-panel { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

// ── Career card ──────────────────────────────────────────────────
const CAREER_PALETTES = [
  { bg: C.greenSoft, color: C.green },
  { bg: C.skySoft, color: C.sky },
  { bg: C.amberSoft, color: C.amber },
  { bg: "#F1ECFB", color: "#7A5FBF" },
  { bg: "#FCEBEE", color: "#C04D5C" },
  { bg: C.peachSoft, color: C.rust },
];

function CareerCard({ name, salary, idx }: { name: string; salary: string; idx: number }) {
  const pal = CAREER_PALETTES[idx % CAREER_PALETTES.length];
  return (
    <div className="pgm-career-card" style={{ padding: 22, background: "#fff", border: `1px solid ${C.lineSoft}`, borderRadius: 20, transition: "all 260ms" }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: pal.bg, color: pal.color, display: "grid", placeItems: "center", marginBottom: 12 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
        </svg>
      </div>
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 4 }}>{name}</div>
      <div style={{ fontSize: 12.5, color: C.ink3 }}>เริ่มต้น {salary}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────
type TabId = "vibe" | "careers" | "tcas";

export default function ProgramDetailPage() {
  const params = useParams();
  const programId = params.programId as string;
  const riasecScores = useAppStore((s) => s.riasec.scores);

  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [tab, setTab] = useState<TabId>("vibe");
  const [vibeLayout, setVibeLayout] = useState<"timeline" | "cards" | "switcher">("timeline");
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    apiClient.getProgramDetail(programId)
      .then((r) => setProgram(r.data))
      .catch(() => setIsNotFound(true))
      .finally(() => setIsLoading(false));
  }, [programId]);

  if (isLoading) {
    return (
      <div data-testid="explore-detail-shell" className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
        <div className="space-y-4">
          <div className="h-6 w-24 animate-pulse rounded-full bg-line-soft" />
          <div className="h-64 animate-pulse rounded-2xl bg-line-soft" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-line-soft" />)}
          </div>
        </div>
      </div>
    );
  }

  if (isNotFound || !program) {
    return (
      <div data-testid="explore-detail-shell" className="mx-auto max-w-5xl px-4 pt-16 text-center sm:px-6">
        <p className="mb-2 text-4xl">🔍</p>
        <h1 className="mb-3 font-display text-2xl font-extrabold tracking-tight text-ink">ไม่พบหลักสูตรนี้</h1>
        <p className="mb-6 text-ink-3">รหัสหลักสูตร &ldquo;{programId}&rdquo; ไม่มีในระบบ</p>
        <Link href="/explore" className="inline-flex h-11 items-center gap-2 rounded-full bg-dgreen px-6 font-display text-sm font-bold text-white transition-colors hover:bg-dgreen-deep">
          ← กลับไปค้นหาหลักสูตร
        </Link>
      </div>
    );
  }

  const rich: RichProgram | undefined = RICH_PROGRAMS[program.slug] ?? RICH_PROGRAMS[program.id];
  const matchScore = rich && riasecScores
    ? computeProgramMatch(rich.riasec, riasecScores, rich.baseFit)
    : rich ? rich.baseFit : null;

  const TABS: { id: TabId; label: string }[] = [
    { id: "vibe", label: "Year-by-Year Vibe" },
    { id: "careers", label: "อาชีพหลังจบ" },
    { id: "tcas", label: "TCAS + ค่าใช้จ่าย" },
  ];

  const suggestedQuestions = ["วิชาที่เรียนปี 1?", "มีฝึกงานต่างประเทศไหม?", "จบแล้วทำงานที่ไหน?", "ค่าเทอมขึ้นทุกปีไหม?"];

  return (
    <article data-testid="explore-detail-shell">
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <div style={{ position: "relative", padding: "48px 0 0", overflow: "hidden" }}>
        {/* bg-mesh */}
        <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", background: "radial-gradient(ellipse 700px 500px at 88% 18%, rgba(0,166,81,.18) 0%, transparent 60%), radial-gradient(ellipse 500px 400px at 12% 80%, rgba(244,182,140,.14) 0%, transparent 60%)" }} />
        {/* bg-lines */}
        <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", background: "repeating-linear-gradient(135deg, transparent 0 80px, rgba(10,31,20,.022) 80px 81px)" }} />

        <div style={{ position: "relative", zIndex: 2, maxWidth: 1100, margin: "0 auto", padding: "0 clamp(1rem, 2.4vw, 2rem)" }}>
          {/* breadcrumb */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: C.ink3, marginBottom: 24, flexWrap: "wrap" }}>
            <Link href="/" style={{ color: C.ink3, textDecoration: "none" }}>Home</Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m9 6 6 6-6 6"/></svg>
            <Link href="/explore" style={{ color: C.ink3, textDecoration: "none" }}>Programs</Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m9 6 6 6-6 6"/></svg>
            <span style={{ color: C.ink2, fontWeight: 600 }}>{program.name_th}</span>
          </div>

          {/* 2-col hero grid */}
          <div className="pgm-hero-grid" style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: 48, alignItems: "start" }}>
            {/* LEFT */}
            <div>
              {/* faculty */}
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 700, color: C.ink3, letterSpacing: ".06em", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 18 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 9 12 4l10 5-10 5z"/><path d="M6 11v5c0 1 3 2 6 2s6-1 6-2v-5"/></svg>
                {program.faculty_th} · วิทยาเขต {program.campus}
              </div>

              {/* program name */}
              <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(40px, 5.5vw, 76px)", lineHeight: .95, letterSpacing: "-.04em", color: C.ink, margin: 0, textWrap: "balance" }}>
                {program.name_th}
              </h1>
              <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: 400, fontSize: "clamp(16px, 2.2vw, 24px)", color: C.ink3, marginTop: 10 }}>
                {program.name_en}
              </div>

              {/* RIASEC tags */}
              {rich && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20 }}>
                  {rich.riasec.map((dk) => {
                    const d = RIASEC_DIMS[dk];
                    return (
                      <span key={dk} style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 12px", borderRadius: 999, background: d.bg, color: d.color, fontSize: 12.5, fontWeight: 700 }}>
                        <Icon name={d.icon} size={13} color={d.color} /> {d.th}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* actions */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 28 }}>
                <Link
                  href={`/chat?program_id=${program.id}&program_name=${encodeURIComponent(program.name_th)}`}
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 52, padding: "0 24px", borderRadius: 999, background: C.green, color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 16px -6px rgba(0,166,81,.55)", transition: "all 200ms" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>
                  ถาม KUru เกี่ยวกับคณะนี้
                </Link>
                <Link
                  href="/explore"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 52, padding: "0 20px", borderRadius: 999, background: "rgba(255,255,255,.8)", border: `1px solid ${C.line}`, color: C.ink, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 700, textDecoration: "none", transition: "all 200ms" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
                  กลับไปค้นหา
                </Link>
                <button
                  type="button"
                  onClick={() => setPinned((v) => !v)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 52, padding: "0 20px", borderRadius: 999, background: pinned ? C.green : "rgba(255,255,255,.8)", border: `1px solid ${pinned ? C.green : C.line}`, color: pinned ? "#fff" : C.ink, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "all 220ms" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
                  {pinned ? "ปักหมุดแล้ว" : "ปักหมุด"}
                </button>
              </div>

              {/* quick stats */}
              <div className="pgm-quick-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, padding: "28px 0 0", borderTop: `1px solid ${C.lineSoft}`, marginTop: 32 }}>
                {[
                  { val: matchScore !== null ? `${matchScore}` : "—", unit: "%", label: "Match Score", valColor: C.green },
                  { val: rich ? `${rich.seats}` : "—", unit: "", label: "ที่นั่ง/ปี", valColor: C.ink },
                  { val: program.tcas_rounds[0]?.min_score?.toLocaleString() ?? "—", unit: "", label: "คะแนนต่ำสุด", valColor: C.ink },
                  { val: rich?.cost ?? "—", unit: "", label: "ค่าเทอม (฿)", valColor: C.ink },
                ].map(({ val, unit, label, valColor }) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(22px, 2.8vw, 32px)", letterSpacing: "-.02em", fontVariantNumeric: "tabular-nums", color: valColor }}>
                      {val}<span style={{ fontSize: ".5em", color: C.ink3 }}>{unit}</span>
                    </div>
                    <div style={{ fontSize: 12, color: C.ink3, marginTop: 4, fontWeight: 600 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — dark score card */}
            {rich && (
              <div style={{ background: C.ink, color: "#fff", borderRadius: 28, padding: 32, position: "relative", overflow: "hidden" }}>
                {/* radial gradient overlay */}
                <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 88% 8%, rgba(0,166,81,.45), transparent 52%)", pointerEvents: "none" }} />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(255,255,255,.5)", marginBottom: 4 }}>
                    PLO FIT SCORE
                  </div>
                  {matchScore !== null && (
                    <div style={{ display: "flex", justifyContent: "center", margin: "16px 0" }}>
                      <MatchRing value={matchScore} size={160} dark />
                    </div>
                  )}
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,.7)", textAlign: "center", lineHeight: 1.55, marginBottom: 18 }}>
                    {rich.why}
                  </p>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,.12)", paddingTop: 16 }}>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(255,255,255,.5)", marginBottom: 12 }}>
                      Program Learning Outcomes
                    </div>
                    {rich.plosRich.map((plo, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < rich.plosRich.length - 1 ? "1px solid rgba(255,255,255,.1)" : "none" }}>
                        <span style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,.8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{plo.name}</span>
                        <div style={{ width: 80, height: 4, background: "rgba(255,255,255,.12)", borderRadius: 999, overflow: "hidden", flexShrink: 0 }}>
                          <div style={{ height: "100%", width: `${plo.score}%`, background: `linear-gradient(90deg, ${C.green}, ${C.greenPop})`, borderRadius: 999 }} />
                        </div>
                        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 14, color: C.greenPop, fontVariantNumeric: "tabular-nums", width: 28, textAlign: "right" }}>{plo.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── TABS + CONTENT ──────────────────────────────────────── */}
      <div style={{ paddingBottom: 80 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(1rem, 2.4vw, 2rem)" }}>
          {/* tab bar */}
          <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${C.lineSoft}`, margin: "40px 0 40px", overflowX: "auto" }}>
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: "16px 22px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 700,
                color: tab === t.id ? C.ink : C.ink3,
                background: "none", border: "none", borderBottom: `2px solid ${tab === t.id ? C.ink : "transparent"}`,
                cursor: "pointer", whiteSpace: "nowrap", transition: "all 200ms",
              }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Year-by-Year Vibe ─────────────────────────────── */}
          {tab === "vibe" && (
            <div>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 24 }}>
                <div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", color: C.green, marginBottom: 8 }}>
                    ★ Year-by-Year Vibe
                  </div>
                  <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(28px,3.2vw,40px)", lineHeight: .98, letterSpacing: "-.03em", color: C.ink, margin: 0 }}>
                    4 ปีที่นี่จะ<em style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: 400, color: C.green }}>เป็นยังไง</em>
                  </h2>
                  <p style={{ fontSize: 14, color: C.ink3, marginTop: 8 }}>แต่ละปีมีบรรยากาศต่างกัน — คลิกแท็บเพื่อดูรายละเอียด</p>
                </div>
                {/* Layout toggle */}
                <div style={{ display: "flex", gap: 6 }}>
                  {([
                    { id: "timeline", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/></svg>, label: "Timeline" },
                    { id: "cards",    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>, label: "Cards" },
                    { id: "switcher", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>, label: "Switcher" },
                  ] as { id: "timeline"|"cards"|"switcher"; icon: React.ReactNode; label: string }[]).map((btn) => (
                    <button key={btn.id} type="button" onClick={() => setVibeLayout(btn.id)} style={{
                      height: 34, padding: "0 14px", borderRadius: 999,
                      border: `1px solid ${vibeLayout === btn.id ? C.ink : C.line}`,
                      background: vibeLayout === btn.id ? C.ink : "#fff",
                      color: vibeLayout === btn.id ? "#fff" : C.ink3,
                      fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12.5, fontWeight: 700,
                      display: "inline-flex", alignItems: "center", gap: 6,
                      cursor: "pointer", transition: "all 180ms",
                    }}>
                      {btn.icon} {btn.label}
                    </button>
                  ))}
                </div>
              </div>
              {rich?.yearVibe ? (
                <>
                  {vibeLayout === "timeline" && <YearVibeTimeline years={rich.yearVibe} />}
                  {vibeLayout === "cards"    && <YearVibeCards years={rich.yearVibe} />}
                  {vibeLayout === "switcher" && <YearVibeSwitcher years={rich.yearVibe} />}
                </>
              ) : (
                <div style={{ padding: "48px 0", textAlign: "center", color: C.ink3, fontSize: 14 }}>ยังไม่มีข้อมูล Year-by-Year Vibe สำหรับหลักสูตรนี้</div>
              )}
            </div>
          )}

          {/* ── Careers ──────────────────────────────────────────── */}
          {tab === "careers" && (
            <div>
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", color: C.green, marginBottom: 8 }}>
                  ★ หลังเรียนจบ
                </div>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(28px,3.2vw,40px)", lineHeight: .98, letterSpacing: "-.03em", color: C.ink, margin: 0 }}>
                  อาชีพที่<em style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: 400, color: C.green }}>คุณจะเลือกได้</em>
                </h2>
              </div>
              {rich?.careers ? (
                <>
                  <div className="pgm-career-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                    {rich.careers.map((c, i) => <CareerCard key={i} name={c} salary={rich.salary} idx={i} />)}
                  </div>
                  <div style={{ marginTop: 24, padding: "20px 24px", background: C.greenSoft, borderRadius: 18, display: "flex", alignItems: "center", gap: 12 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round"><path d="m13 2 3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6z"/></svg>
                    <span style={{ fontSize: 14, color: C.greenDeep }}>อัตราการได้งานภายใน 6 เดือน <strong>92%</strong> — เฉลี่ยเงินเดือนปีแรก <strong>{rich.salary}</strong></span>
                  </div>
                </>
              ) : (
                <div style={{ padding: "48px 0", textAlign: "center", color: C.ink3, fontSize: 14 }}>ยังไม่มีข้อมูลอาชีพสำหรับหลักสูตรนี้</div>
              )}
            </div>
          )}

          {/* ── TCAS + Cost ──────────────────────────────────────── */}
          {tab === "tcas" && (
            <div>
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", color: C.green, marginBottom: 8 }}>
                  ★ ข้อมูลการสมัคร
                </div>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(28px,3.2vw,40px)", lineHeight: .98, letterSpacing: "-.03em", color: C.ink, margin: 0 }}>
                  TCAS + <em style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: 400, color: C.green }}>ค่าใช้จ่าย</em>
                </h2>
              </div>
              <div className="pgm-tcas-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                {/* TCAS rounds */}
                {program.tcas_rounds.length > 0 && (
                  <div style={{ background: "#fff", border: `1px solid ${C.lineSoft}`, borderRadius: 22, padding: 26 }}>
                    <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: "-.01em", marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                      TCAS — ข้อมูลการรับ
                    </h4>
                    {program.tcas_rounds.map((round, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 0", borderBottom: i < program.tcas_rounds.length - 1 ? `1px dashed ${C.line}` : "none", fontSize: 14 }}>
                        <span style={{ color: C.ink3 }}>{round.round}</span>
                        <span style={{ fontWeight: 700, color: C.ink, textAlign: "right" }}>
                          รับ {round.quota} คน {round.min_score !== null ? `· ขั้นต่ำ ${round.min_score}` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {/* Cost */}
                {rich && (
                  <div style={{ background: "#fff", border: `1px solid ${C.lineSoft}`, borderRadius: 22, padding: 26 }}>
                    <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: "-.01em", marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                      ค่าใช้จ่าย
                    </h4>
                    {[
                      ["ค่าเทอม", rich.cost],
                      ["ตลอดหลักสูตร 4 ปี (ประมาณ)", `~ ${(parseInt(rich.cost.replace(/[^0-9]/g, "")) * 8).toLocaleString()} ฿`],
                      ["จำนวนที่รับ", `${rich.seats} คน`],
                      ["ทุนการศึกษา", "15+ แหล่ง"],
                      ["หอพักในมหาวิทยาลัย", "4,000–8,000 ฿/เทอม"],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 0", borderBottom: k !== "หอพักในมหาวิทยาลัย" ? `1px dashed ${C.line}` : "none", fontSize: 14 }}>
                        <span style={{ color: C.ink3 }}>{k}</span>
                        <span style={{ fontWeight: 700, color: C.ink, textAlign: "right" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                )}
                {/* PLOs from API */}
                {program.plos.length > 0 && (
                  <div style={{ gridColumn: "span 2", background: "#fff", border: `1px solid ${C.lineSoft}`, borderRadius: 22, padding: 26 }}>
                    <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: "-.01em", marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.sky} strokeWidth="2" strokeLinecap="round"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/></svg>
                      ผลลัพธ์การเรียนรู้ (PLOs)
                    </h4>
                    {program.plos.map((plo, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i < program.plos.length - 1 ? `1px dashed ${C.line}` : "none", fontSize: 14 }}>
                        <span style={{ flexShrink: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 12, color: C.green, minWidth: 40 }}>{plo.code}</span>
                        <span style={{ color: C.ink2, lineHeight: 1.55 }}>{plo.description_th}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ASK KURU CTA ──────────────────────────────────────── */}
          <div style={{ marginTop: 48 }}>
            <div style={{ background: `linear-gradient(135deg, ${C.greenSoft} 0%, ${C.peachSoft} 100%)`, borderRadius: 28, padding: "40px 40px", display: "grid", gridTemplateColumns: "1fr auto", gap: 28, alignItems: "center", position: "relative", overflow: "hidden" }}>
              <div aria-hidden style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(135deg, transparent 0 80px, rgba(10,31,20,.016) 80px 81px)" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-.02em", marginBottom: 8, textWrap: "balance" }}>
                  มีคำถามเกี่ยวกับ<br/><em style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: 400, color: C.greenDeep }}>คณะนี้?</em> ถาม KUru ได้เลย
                </h3>
                <p style={{ fontSize: 14, color: C.ink2, lineHeight: 1.55, maxWidth: 460 }}>KUru อ่าน มคอ.2 มาแล้ว ตอบได้ทันที ตั้งแต่วิชาที่เรียน จนถึงโอกาสฝึกงาน</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
                  {suggestedQuestions.map((q) => (
                    <Link key={q} href={`/chat?program_id=${program.id}&program_name=${encodeURIComponent(program.name_th)}&q=${encodeURIComponent(q)}`}
                      style={{ height: 32, padding: "0 12px", borderRadius: 999, background: "#fff", border: `1px solid ${C.line}`, fontSize: 12.5, fontWeight: 600, color: C.ink2, textDecoration: "none", display: "inline-flex", alignItems: "center", transition: "all 180ms" }}>
                      {q}
                    </Link>
                  ))}
                </div>
              </div>
              <div style={{ position: "relative", zIndex: 1, flexShrink: 0 }}>
                <Link
                  href={`/chat?program_id=${program.id}&program_name=${encodeURIComponent(program.name_th)}`}
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 52, padding: "0 24px", borderRadius: 999, background: C.greenDeep, color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap", boxShadow: "0 4px 16px -6px rgba(0,109,53,.5)" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  เริ่มถาม
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1000px) { .pgm-hero-grid { grid-template-columns: 1fr !important; gap: 28px !important; } }
        @media (max-width: 768px) { .pgm-vibe-timeline { grid-template-columns: 1fr 1fr !important; } .pgm-vibe-connector { display: none !important; } }
        @media (max-width: 480px) { .pgm-vibe-timeline { grid-template-columns: 1fr !important; } }
        @media (max-width: 640px) { .pgm-stacked-card { grid-template-columns: 1fr !important; } }
        .pgm-vibe-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px -16px rgba(15,27,20,.16); border-color: var(--ink, #0A1F14) !important; }
        .pgm-stacked-card:hover { border-color: var(--ink, #0A1F14) !important; transform: translateX(4px); }
        @media (max-width: 640px) { .pgm-quick-stats { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 768px) { .pgm-career-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 480px) { .pgm-career-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 680px) { .pgm-tcas-grid { grid-template-columns: 1fr !important; } .pgm-tcas-grid [style*="span 2"] { grid-column: span 1 !important; } }
        @media (max-width: 640px) { .pgm-ask-grid { grid-template-columns: 1fr !important; padding: 28px 22px !important; } }
        .pgm-career-card:hover { border-color: var(--ink, #0A1F14) !important; transform: translateY(-2px); }
      `}</style>
    </article>
  );
}
