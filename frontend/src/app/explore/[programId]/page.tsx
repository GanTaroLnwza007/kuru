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
function MatchRing({
  value,
  size = 120,
}: {
  value: number;
  size?: number;
}) {
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
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)", display: "block" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--d-green-soft)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--d-green)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - (v / 100) * circ}
          style={{ transition: "stroke-dashoffset 60ms linear" }}
        />
      </svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
      >
        <span
          className="font-bold tabular-nums leading-none text-ink"
          style={{ fontSize: size * 0.28 }}
        >
          {Math.round(v)}
          <span style={{ fontSize: size * 0.13, color: "var(--ink-3)" }}>%</span>
        </span>
        <span className="mt-1 text-ink-3" style={{ fontSize: size * 0.1 }}>
          match
        </span>
      </div>
    </div>
  );
}

// ── year vibe timeline card ────────────────────────────────────
const SEASON_GRAD: Record<YearVibeItem["season"], [string, string]> = {
  spring: ["#E6F5EC", "#D8EEDD"],
  summer: ["#FFF6E2", "#FCEAC2"],
  autumn: ["#FFF1E6", "#FFE3D0"],
  winter: ["#EAF3FB", "#DCEAF6"],
};

function YearCard({ year }: { year: YearVibeItem }) {
  const [bg1, bg2] = SEASON_GRAD[year.season];
  return (
    <div className="overflow-hidden rounded-2xl border border-line-soft bg-surface shadow-sm">
      {/* coloured top */}
      <div
        className="relative flex h-24 items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${bg1} 0%, ${bg2} 100%)` }}
      >
        <span
          className="select-none text-6xl font-black opacity-15"
          style={{ letterSpacing: "-0.04em", color: "var(--ink)" }}
        >
          YEAR
        </span>
        <span
          className="absolute right-3 top-3 text-4xl font-black leading-none"
          style={{ color: "var(--ink)", letterSpacing: "-0.04em" }}
        >
          {year.year}
        </span>
        <span className="absolute left-3 top-3 text-xs font-bold text-ink-2">ปีที่</span>
      </div>
      {/* body */}
      <div className="p-4">
        <p className="mb-0.5 text-[10px] text-ink-3">โหมดปีนี้</p>
        <p className="mb-2 text-base font-black text-ink">
          {year.mood}{" "}
          <span className="text-xs font-medium text-ink-3">· {year.moodEn}</span>
        </p>
        <p className="mb-3 text-xs leading-relaxed text-ink-2">{year.desc}</p>
        {/* heat bar */}
        <div className="mb-2">
          <p className="mb-1 text-[10px] text-ink-3">ความเข้มข้น</p>
          <div className="h-1.5 overflow-hidden rounded-full bg-dgreen-soft">
            <div
              className="h-full rounded-full bg-dgreen transition-all duration-700"
              style={{ width: `${year.heat * 100}%` }}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {year.kw.map((k) => (
            <span
              key={k}
              className="rounded-full bg-surface-subtle px-2 py-0.5 text-[10px] font-semibold text-ink-2"
            >
              {k}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── PLO bar ────────────────────────────────────────────────────
function PloBar({ name, score }: { name: string; score: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex-1 text-sm text-ink-2 truncate">{name}</span>
      <div className="w-20 overflow-hidden rounded-full bg-dgreen-soft" style={{ height: 4 }}>
        <div
          className="h-full rounded-full bg-dgreen transition-all duration-700"
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="w-7 text-right text-sm font-bold tabular-nums text-ink">{score}</span>
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
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface-subtle" />
          ))}
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
        <Link
          href="/explore"
          className="inline-flex h-11 items-center gap-2 rounded-2xl bg-dgreen px-6 text-sm font-bold text-white transition-colors hover:bg-dgreen-deep"
        >
          ← กลับไปค้นหาหลักสูตร
        </Link>
      </div>
    );
  }

  const rich: RichProgram | undefined = RICH_PROGRAMS[program.id];

  const matchScore =
    rich && riasecScores
      ? computeProgramMatch(rich.riasec, riasecScores, rich.baseFit)
      : rich
      ? rich.baseFit
      : null;

  const suggestedQuestions = [
    "วิชาที่เรียนปี 1?",
    "มีฝึกงานต่างประเทศไหม?",
    "จบแล้วทำงานที่ไหน?",
    "ค่าเทอมขึ้นทุกปีไหม?",
  ];

  return (
    <article
      className="mx-auto w-full max-w-5xl px-4 pb-20 pt-6 sm:px-6 sm:pt-10"
      data-testid="explore-detail-shell"
    >
      {/* back */}
      <Link
        href="/explore"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-3 hover:text-ink"
      >
        <Icon name="arrow-left" size={16} />
        กลับไปค้นหา
      </Link>

      {/* ── HERO ── */}
      <div
        className="mb-6 rounded-2xl px-5 py-7 sm:px-8 sm:py-10"
        style={{ background: "linear-gradient(180deg, var(--d-green-soft) 0%, var(--kuru-surface-base) 100%)" }}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* left */}
          <div className="flex-1">
            {/* faculty + campus */}
            <p className="mb-2 text-sm text-ink-3">
              {program.faculty_th} · วิทยาเขต {program.campus}
            </p>
            <h1 className="mb-1 text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
              {program.name_th}
            </h1>
            <p className="mb-4 text-base text-ink-3">{program.name_en}</p>

            {/* RIASEC dim tags */}
            {rich && (
              <div className="mb-5 flex flex-wrap gap-2">
                {rich.riasec.map((dk) => {
                  const d = RIASEC_DIMS[dk];
                  return (
                    <span
                      key={dk}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
                      style={{ background: d.color + "1A", color: d.color }}
                    >
                      <Icon name={d.icon} size={12} color={d.color} />
                      {d.th}
                    </span>
                  );
                })}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/chat?program_id=${program.id}&program_name=${encodeURIComponent(program.name_th)}`}
                className="flex h-11 items-center gap-2 rounded-2xl bg-dgreen px-5 text-sm font-bold text-white shadow-md transition-colors hover:bg-dgreen-deep"
                style={{ boxShadow: "0 1px 2px rgba(0,166,81,0.12), 0 8px 20px -8px rgba(0,166,81,0.32)" }}
              >
                <Icon name="sparkles" size={16} color="white" />
                ถาม KUru
              </Link>
            </div>
          </div>

          {/* match card */}
          {rich && (
            <div className="rounded-2xl border border-line-soft bg-surface p-5 sm:w-72">
              <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-widest text-ink-3">
                PLO FIT SCORE
              </p>
              <div className="mb-3 flex justify-center">
                {matchScore !== null && <MatchRing value={matchScore} size={130} />}
              </div>
              <p className="mb-3 text-center text-xs leading-relaxed text-ink-2">
                {rich.why}
              </p>
              <div className="space-y-2">
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
        <section className="mb-8">
          <div className="mb-4">
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-dgreen">
              Year by Year Vibe
            </p>
            <h2 className="text-xl font-bold text-ink">4 ปีที่นี่จะเป็นยังไง</h2>
            <p className="text-sm text-ink-3">
              แต่ละปีมีบรรยากาศต่างกัน — เลื่อนดูได้ตามใจ
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {rich.yearVibe.map((y) => (
              <YearCard key={y.year} year={y} />
            ))}
          </div>
        </section>
      )}

      {/* ── CAREERS ── */}
      {rich?.careers && (
        <section className="mb-8">
          <div className="mb-4">
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-dgreen">
              หลังเรียนจบ
            </p>
            <h2 className="text-xl font-bold text-ink">อาชีพที่คุณจะเลือกได้</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rich.careers.map((c, i) => (
              <div
                key={i}
                className="rounded-2xl border border-line-soft bg-surface p-4"
              >
                <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-dgreen-soft text-dgreen">
                  <Icon name="briefcase" size={18} color="var(--d-green)" />
                </div>
                <p className="text-sm font-bold text-ink">{c}</p>
                <p className="mt-0.5 text-xs text-ink-3">เริ่มต้น {rich.salary}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── TCAS + COST ── */}
      <section className="mb-8 grid gap-4 sm:grid-cols-2">
        {/* TCAS */}
        {program.tcas_rounds.length > 0 && (
          <div className="rounded-2xl border border-line-soft bg-surface p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <Icon name="flag" size={20} color="var(--d-green)" />
              <h3 className="text-base font-bold text-ink">ข้อมูลการสมัคร TCAS</h3>
            </div>
            <div className="space-y-3">
              {program.tcas_rounds.map((round, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-surface-subtle px-3 py-2.5"
                >
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

        {/* Cost */}
        {rich && (
          <div className="rounded-2xl border border-line-soft bg-surface p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <Icon name="coins" size={20} color="var(--d-amber, #E8A93B)" />
              <h3 className="text-base font-bold text-ink">ค่าใช้จ่าย</h3>
            </div>
            <div className="space-y-3">
              {[
                ["ค่าเทอม", rich.cost],
                [
                  "ตลอดหลักสูตร 4 ปี",
                  `~ ${(parseInt(rich.cost.replace(/[^0-9]/g, "")) * 8).toLocaleString()} ฿`,
                ],
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
        <section className="mb-8">
          <h3 className="mb-3 text-base font-bold text-ink">ผลลัพธ์การเรียนรู้ (PLOs)</h3>
          <div className="space-y-2">
            {program.plos.map((plo, i) => (
              <div
                key={i}
                className="flex gap-3 rounded-xl border border-line-soft bg-surface px-4 py-3"
              >
                <span className="mt-px flex-shrink-0 text-xs font-bold text-dgreen">
                  {plo.code}
                </span>
                <span className="text-sm text-ink-2">{plo.description_th}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── ASK KURU CTA ── */}
      <section
        className="rounded-2xl p-5 sm:p-7"
        style={{ background: "linear-gradient(135deg, var(--d-green-soft) 0%, #E8F5ED 100%)" }}
      >
        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface shadow-sm text-dgreen">
            <Icon name="sparkles" size={26} color="var(--d-green)" />
          </div>
          <div>
            <p className="text-base font-bold text-dgreen-deep">มีคำถามเกี่ยวกับคณะนี้?</p>
            <p className="text-sm text-dgreen-deep opacity-80">
              KUru อ่าน มคอ.2 มาแล้ว ตอบได้ทันที
            </p>
          </div>
          <Link
            href={`/chat?program_id=${program.id}&program_name=${encodeURIComponent(program.name_th)}`}
            className="ml-auto flex h-10 items-center gap-2 rounded-2xl bg-dgreen-deep px-4 text-sm font-bold text-white transition-colors hover:opacity-90"
          >
            เริ่มถาม <Icon name="chat" size={15} color="white" />
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q) => (
            <Link
              key={q}
              href={`/chat?program_id=${program.id}&program_name=${encodeURIComponent(program.name_th)}&q=${encodeURIComponent(q)}`}
              className="rounded-full border border-dgreen/20 bg-surface px-3 py-1.5 text-xs font-medium text-ink-2 hover:border-dgreen/40"
            >
              {q}
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
