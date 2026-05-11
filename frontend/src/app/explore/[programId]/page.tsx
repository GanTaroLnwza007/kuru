"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import type { ProgramDetail } from "@/lib/api";
import { RICH_PROGRAMS, type YearVibeItem, type RichProgram } from "@/lib/program-rich";
import { RIASEC_DIMS, computeProgramMatch } from "@/lib/riasec";
import { useAppStore } from "@/lib/store";
import { Icon } from "@/components/ui/Icon";

// ── animated ring (match score) ────────────────────────────────
function MatchRing({ value, size = 120 }: { value: number; size?: number }) {
  const [v, setV] = useState(0);

  useEffect(() => {
    let rafId: number;
    const start = performance.now();
    const duration = 900;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setV(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value]);

  const stroke = size * 0.085;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--d-green-soft)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="var(--d-green)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ - (v / 100) * circ}
          style={{ transition: "stroke-dashoffset 60ms linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold tabular-nums leading-none text-ink" style={{ fontSize: size * 0.28 }}>
          {Math.round(v)}<span style={{ fontSize: size * 0.13, color: "var(--ink-3)" }}>%</span>
        </span>
        <span className="mt-1 text-ink-3" style={{ fontSize: size * 0.1 }}>match</span>
      </div>
    </div>
  );
}

// ── PLO bar ────────────────────────────────────────────────────
function PloBar({ name, score }: { name: string; score: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex-1 truncate text-xs text-ink-2">{name}</span>
      <div className="w-16 overflow-hidden rounded-full bg-dgreen-soft" style={{ height: 4 }}>
        <div className="h-full rounded-full bg-dgreen transition-all duration-700" style={{ width: `${score}%` }} />
      </div>
      <span className="w-6 text-right text-xs font-bold tabular-nums text-ink">{score}</span>
    </div>
  );
}

// ── Year-by-Year Vibe — Interactive tab switcher ──────────────
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
    <div className="overflow-hidden rounded-2xl border border-line-soft bg-surface shadow-sm">
      {/* tab row */}
      <div className="flex border-b border-line-soft">
        {years.map((yy, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            style={{
              flex: 1,
              padding: "14px 12px",
              textAlign: "center" as const,
              background: i === active ? "#fff" : "var(--kuru-surface-subtle)",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              borderBottom: `3px solid ${i === active ? "var(--d-green)" : "transparent"}`,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "background 200ms, border-color 200ms",
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 600, color: "var(--ink-3)", marginBottom: 2 }}>ปีที่ {yy.year}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: i === active ? "var(--ink)" : "var(--ink-2)" }}>{yy.mood}</div>
          </button>
        ))}
      </div>

      {/* panel */}
      <div key={active} className="kuru-slide-in grid sm:grid-cols-[1.2fr_1fr]">
        {/* left */}
        <div style={{ padding: "28px 32px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: pal.accent, letterSpacing: "0.1em", marginBottom: 8, textTransform: "uppercase" as const }}>
            {y.moodEn.toUpperCase()} · {pal.label.toUpperCase()}
          </div>
          <h3 style={{ fontSize: "clamp(22px,4vw,30px)", fontWeight: 800, color: "var(--ink)", lineHeight: 1.2, margin: 0, marginBottom: 12 }}>
            ปีที่ {y.year} — {y.mood}
          </h3>
          <p style={{ fontSize: 15, color: "var(--ink-2)", lineHeight: 1.65, margin: 0, marginBottom: 20 }}>{y.desc}</p>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
            {y.kw.map((k) => (
              <span
                key={k}
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "var(--ink)",
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: pal.bg,
                }}
              >
                {k}
              </span>
            ))}
          </div>
        </div>

        {/* right — big year number */}
        <div
          style={{
            background: `linear-gradient(135deg, ${pal.bg} 0%, ${pal.bg}aa 100%)`,
            padding: 32,
            position: "relative" as const,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 180,
          }}
        >
          <div style={{ textAlign: "center" as const, userSelect: "none" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: pal.accent, letterSpacing: "0.1em", marginBottom: 4 }}>ปีที่</div>
            <div style={{ fontSize: "clamp(80px,12vw,130px)", fontWeight: 900, color: "var(--ink)", lineHeight: 0.9, letterSpacing: "-0.05em" }}>
              {y.year}
            </div>
          </div>
          {/* heat bar */}
          <div style={{ position: "absolute" as const, bottom: 20, right: 20, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, color: "var(--ink-3)" }}>ความเข้ม</span>
            <div style={{ display: "flex", gap: 3 }}>
              {[0, 1, 2, 3, 4].map((j) => (
                <div
                  key={j}
                  style={{
                    width: 5,
                    height: 14,
                    borderRadius: 2,
                    background: j < Math.round(y.heat * 5) ? pal.accent : "var(--line-soft)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────
export default function ProgramDetailPage() {
  const params = useParams();
  const programId = params.programId as string;

  const riasecScores = useAppStore((s) => s.riasec.scores);

  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    apiClient
      .getProgramDetail(programId)
      .then((r) => setProgram(r.data))
      .catch(() => setIsNotFound(true))
      .finally(() => setIsLoading(false));
  }, [programId]);

  if (isLoading) {
    return (
      <div data-testid="explore-detail-shell" className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
        <div className="space-y-4">
          <div className="h-6 w-24 animate-pulse rounded-full bg-surface-subtle" />
          <div className="h-48 animate-pulse rounded-2xl bg-surface-subtle" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-surface-subtle" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isNotFound || !program) {
    return (
      <div data-testid="explore-detail-shell" className="mx-auto max-w-5xl px-4 pt-16 text-center sm:px-6">
        <p className="mb-2 text-4xl">🔍</p>
        <h1 className="mb-3 text-2xl font-extrabold tracking-tight text-ink">ไม่พบหลักสูตรนี้</h1>
        <p className="mb-6 text-ink-3">รหัสหลักสูตร &ldquo;{programId}&rdquo; ไม่มีในระบบ</p>
        <Link href="/explore" className="inline-flex h-11 items-center gap-2 rounded-2xl bg-dgreen px-6 text-sm font-bold text-white transition-colors hover:bg-dgreen-deep">
          ← กลับไปค้นหาหลักสูตร
        </Link>
      </div>
    );
  }

  const rich: RichProgram | undefined = RICH_PROGRAMS[program.slug] ?? RICH_PROGRAMS[program.id];
  const matchScore =
    rich && riasecScores
      ? computeProgramMatch(rich.riasec, riasecScores, rich.baseFit)
      : rich
      ? rich.baseFit
      : null;

  const suggestedQuestions = ["วิชาที่เรียนปี 1?", "มีฝึกงานต่างประเทศไหม?", "จบแล้วทำงานที่ไหน?", "ค่าเทอมขึ้นทุกปีไหม?"];

  return (
    <article className="mx-auto w-full max-w-5xl px-4 pb-20 pt-6 sm:px-6 sm:pt-10" data-testid="explore-detail-shell">
      {/* back */}
      <Link href="/explore" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-3 transition-colors hover:text-ink">
        <Icon name="arrow-left" size={16} />
        กลับไปค้นหา
      </Link>

      {/* ── HERO ── */}
      <div
        className="mb-8 rounded-2xl px-6 py-8 sm:px-8 sm:py-10"
        style={{ background: "linear-gradient(180deg, var(--d-green-soft) 0%, var(--kuru-surface-base) 100%)" }}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* left */}
          <div className="flex-1">
            <p className="mb-2 text-sm font-medium text-ink-3">
              {program.faculty_th} · วิทยาเขต {program.campus}
            </p>
            <h1
              className="mb-1 font-extrabold leading-tight text-ink"
              style={{ fontSize: "clamp(28px, 5vw, 48px)", letterSpacing: "-0.02em" }}
            >
              {program.name_th}
            </h1>
            <p className="mb-5 text-base text-ink-3">{program.name_en}</p>

            {rich && (
              <div className="mb-6 flex flex-wrap gap-2">
                {rich.riasec.map((dk) => {
                  const d = RIASEC_DIMS[dk];
                  return (
                    <span
                      key={dk}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
                      style={{ background: d.bg, color: d.color }}
                    >
                      <Icon name={d.icon} size={12} color={d.color} />
                      {d.th}
                    </span>
                  );
                })}
              </div>
            )}

            <Link
              href={`/chat?program_id=${program.id}&program_name=${encodeURIComponent(program.name_th)}`}
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-dgreen px-5 text-sm font-bold text-white transition-colors hover:bg-dgreen-deep"
              style={{ boxShadow: "0 1px 2px rgba(0,166,81,0.12), 0 8px 20px -8px rgba(0,166,81,0.32)" }}
            >
              <Icon name="sparkles" size={16} color="white" />
              ถาม KUru เกี่ยวกับคณะนี้
            </Link>
          </div>

          {/* match card */}
          {rich && (
            <div
              className="rounded-2xl border border-line-soft bg-surface p-5 sm:w-72"
              style={{ boxShadow: "0 1px 2px rgba(15,27,20,0.04), 0 8px 24px -8px rgba(15,27,20,0.08)" }}
            >
              <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-widest text-ink-3">PLO FIT SCORE</p>
              {matchScore !== null && (
                <div className="mb-3 flex justify-center">
                  <MatchRing value={matchScore} size={130} />
                </div>
              )}
              <p className="mb-4 text-center text-xs leading-relaxed text-ink-2">{rich.why}</p>
              <div className="space-y-2.5">
                {rich.plosRich.map((plo, i) => (
                  <PloBar key={i} name={plo.name} score={plo.score} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── YEAR-BY-YEAR VIBE ── */}
      {rich?.yearVibe && (
        <section className="mb-10">
          <div className="mb-4">
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-dgreen">Year by Year Vibe</p>
            <h2 className="text-xl font-bold text-ink">4 ปีที่นี่จะเป็นยังไง</h2>
            <p className="text-sm text-ink-3">แต่ละปีมีบรรยากาศต่างกัน — คลิกแท็บเพื่อดูรายละเอียด</p>
          </div>
          <YearVibeSwitcher years={rich.yearVibe} />
        </section>
      )}

      {/* ── CAREERS ── */}
      {rich?.careers && (
        <section className="mb-10">
          <div className="mb-4">
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-dgreen">หลังเรียนจบ</p>
            <h2 className="text-xl font-bold text-ink">อาชีพที่คุณจะเลือกได้</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rich.careers.map((c, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-line-soft bg-surface transition-shadow hover:shadow-md">
                <div className="h-1.5 w-full bg-dgreen" />
                <div className="p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-dgreen-soft">
                    <Icon name="briefcase" size={20} color="var(--d-green)" />
                  </div>
                  <p className="mb-1 text-sm font-bold text-ink">{c}</p>
                  <p className="text-xs text-ink-3">เริ่มต้น {rich.salary}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── TCAS + COST ── */}
      <section className="mb-10 grid gap-4 sm:grid-cols-2">
        {program.tcas_rounds.length > 0 && (
          <div className="rounded-2xl border border-line-soft bg-surface p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <Icon name="flag" size={20} color="var(--d-green)" />
              <h3 className="text-base font-bold text-ink">ข้อมูลการสมัคร TCAS</h3>
            </div>
            <div className="space-y-2">
              {program.tcas_rounds.map((round, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-surface-subtle px-3 py-2.5">
                  <span className="text-sm font-semibold text-ink">{round.round}</span>
                  <div className="text-right">
                    <span className="block text-xs text-ink-3">รับ {round.quota} คน</span>
                    {round.min_score !== null && (
                      <span className="text-xs text-ink-3">คะแนนขั้นต่ำ {round.min_score}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {rich && (
          <div className="rounded-2xl border border-line-soft bg-surface p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <Icon name="coins" size={20} color="var(--d-amber, #E8A93B)" />
              <h3 className="text-base font-bold text-ink">ค่าใช้จ่าย</h3>
            </div>
            <div className="space-y-3">
              {[
                ["ค่าเทอม", rich.cost],
                ["ตลอดหลักสูตร 4 ปี", `~ ${(parseInt(rich.cost.replace(/[^0-9]/g, "")) * 8).toLocaleString()} ฿`],
                ["จำนวนที่รับ", `${rich.seats} คน`],
                ["เงินเดือนเริ่มต้น", rich.salary],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-sm text-ink-3">{k}</span>
                  <span className="text-sm font-semibold text-ink">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── PLOs ── */}
      {program.plos.length > 0 && (
        <section className="mb-10">
          <h3 className="mb-3 text-base font-bold text-ink">ผลลัพธ์การเรียนรู้ (PLOs)</h3>
          <div className="space-y-2">
            {program.plos.map((plo, i) => (
              <div key={i} className="flex gap-3 rounded-xl border border-line-soft bg-surface px-4 py-3">
                <span className="mt-px flex-shrink-0 text-xs font-bold text-dgreen">{plo.code}</span>
                <span className="text-sm text-ink-2">{plo.description_th}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── ASK KURU CTA ── */}
      <section
        className="rounded-2xl p-6 sm:p-8"
        style={{ background: "linear-gradient(135deg, var(--d-green-soft) 0%, #E8F5ED 100%)" }}
      >
        <div className="mb-5 flex flex-wrap items-center gap-4">
          <div
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-surface"
            style={{ boxShadow: "0 1px 2px rgba(15,27,20,0.04), 0 4px 12px -4px rgba(0,0,0,0.08)" }}
          >
            <Icon name="sparkles" size={26} color="var(--d-green)" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold text-dgreen-deep">มีคำถามเกี่ยวกับคณะนี้?</p>
            <p className="text-sm text-dgreen-deep opacity-80">KUru อ่าน มคอ.2 มาแล้ว ตอบได้ทันที</p>
          </div>
          <Link
            href={`/chat?program_id=${program.id}&program_name=${encodeURIComponent(program.name_th)}`}
            className="flex h-10 items-center gap-2 rounded-2xl bg-dgreen-deep px-5 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            เริ่มถาม <Icon name="chat" size={15} color="white" />
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q) => (
            <Link
              key={q}
              href={`/chat?program_id=${program.id}&program_name=${encodeURIComponent(program.name_th)}&q=${encodeURIComponent(q)}`}
              className="rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-ink-2 transition-colors hover:bg-surface-subtle"
              style={{ border: "1px solid rgba(0,166,81,0.2)" }}
            >
              {q}
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
