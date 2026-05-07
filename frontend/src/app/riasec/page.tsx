"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  RIASEC_DIMS,
  RIASEC_QUESTIONS,
  computeRiasecScores,
  getTop3Code,
  computeProgramMatch,
  type RiasecDim,
  type RiasecScores,
  type AnswerRecord,
} from "@/lib/riasec";
import { RICH_PROGRAMS } from "@/lib/program-rich";
import { MOCK_PROGRAM_NAMES } from "@/lib/api/mock-data";
import { useAppStore } from "@/lib/store";
import { RadarChart } from "@/components/riasec/RadarChart";
import { Icon } from "@/components/ui/Icon";

// ── tiny progress bar ──────────────────────────────────────────
function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line-soft">
      <div
        className="h-full rounded-full bg-dgreen transition-all duration-700 ease-out"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

// ── score bar (used in results) ────────────────────────────────
function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: color + "22" }}>
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${value}%`, background: color }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// INTRO SCREEN
// ─────────────────────────────────────────────────────────────
function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-dgreen">
        ทดสอบ · 3-5 นาที · 24 ข้อ
      </p>
      <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
        ตอบจากใจคุณก็พอ<br />
        ไม่มีคำตอบที่ถูกหรือผิด
      </h1>
      <p className="mb-8 text-base leading-relaxed text-ink-2 sm:text-lg">
        KUru ใช้ RIASEC — ทฤษฎีบุคลิกอาชีพของ John Holland ที่นักจิตวิทยาทั่วโลกใช้กว่า 60 ปี
        เราจะค่อย ๆ ถามด้วยคำถามที่หลากหลาย ตอบโดยใช้สัญชาตญาณแรกได้เลย
      </p>

      <div className="mb-8 space-y-3">
        {(Object.values(RIASEC_DIMS) as (typeof RIASEC_DIMS)[RiasecDim][]).map((d) => (
          <div
            key={d.key}
            className="flex items-center gap-4 rounded-2xl border border-line-soft bg-surface p-4"
          >
            <div
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl"
              style={{ background: d.color + "22", color: d.color }}
            >
              <Icon name={d.icon} size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-ink">
                <span style={{ color: d.color }} className="mr-2">
                  {d.key}
                </span>
                {d.th}
              </p>
              <p className="mt-0.5 text-xs text-ink-3">{d.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-dgreen text-base font-bold text-white shadow-lg transition-transform hover:bg-dgreen-deep active:scale-[0.98]"
        style={{ boxShadow: "0 1px 2px rgba(0,166,81,0.12), 0 12px 28px -10px rgba(0,166,81,0.32)" }}
      >
        <Icon name="play" size={18} color="white" />
        เริ่มทดสอบ
      </button>
      <p className="mt-4 text-center text-xs text-ink-4">
        🔒 ข้อมูลของคุณปลอดภัย ไม่ใช้กับใครเด็ดขาด
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// QUIZ SCREEN
// ─────────────────────────────────────────────────────────────
type QuizAnswer = AnswerRecord;

function SliderQuestion({
  onAnswer,
  dim,
}: {
  onAnswer: (a: QuizAnswer) => void;
  dim: RiasecDim;
}) {
  const [val, setVal] = useState(50);
  const labels = ["ไม่ใช่ฉันเลย", "ค่อนข้างไม่ใช่", "ตรงกลาง", "ค่อนข้างใช่", "ใช่ฉันเลย!"];
  const idx = Math.min(4, Math.floor(val / 20.01));

  return (
    <div className="px-1">
      <p
        className="mb-6 h-7 text-center text-lg font-bold text-dgreen transition-all duration-200"
      >
        {labels[idx]}
      </p>
      <div className="relative mb-8 h-14 px-3">
        {/* track */}
        <div
          className="absolute inset-x-3 top-6 h-2 rounded-full"
          style={{ background: "var(--d-green-soft)" }}
        />
        {/* fill */}
        <div
          className="absolute top-6 h-2 rounded-full transition-all duration-75"
          style={{
            left: "0.75rem",
            width: `calc(${val}% - 24px * ${val / 100})`,
            background: "var(--d-green)",
          }}
        />
        {/* thumb */}
        <div
          className="pointer-events-none absolute top-3.5 h-7 w-7 rounded-full bg-white shadow-md transition-all duration-75"
          style={{
            left: `calc(${val}% - 16px * ${val / 50 - 1})`,
            border: "3px solid var(--d-green)",
          }}
        />
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={val}
          onChange={(e) => setVal(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          style={{ WebkitAppearance: "none", appearance: "none" }}
        />
      </div>
      <div className="mb-6 flex justify-between text-xs text-ink-4">
        <span>{labels[0]}</span>
        <span>{labels[4]}</span>
      </div>
      <button
        onClick={() => onAnswer({ dim, val: (val - 50) / 25 })}
        className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-dgreen font-bold text-white transition-transform hover:bg-dgreen-deep active:scale-[0.98]"
        style={{ height: 52, boxShadow: "0 1px 2px rgba(0,166,81,0.12), 0 12px 28px -10px rgba(0,166,81,0.32)" }}
      >
        ยืนยันคำตอบ
        <Icon name="arrow-right" size={18} color="white" />
      </button>
    </div>
  );
}

function QuizScreen({
  onComplete,
  onExit,
}: {
  onComplete: (scores: RiasecScores) => void;
  onExit: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(QuizAnswer | null)[]>(
    Array(RIASEC_QUESTIONS.length).fill(null),
  );
  const total = RIASEC_QUESTIONS.length;
  const q = RIASEC_QUESTIONS[idx];
  const dim = RIASEC_DIMS[q.dim];
  const progress = (idx / total) * 100;
  const messages = ["คุณทำได้ดี", "ค่อย ๆ คิดได้นะ", "อีกนิดเดียวเอง", "เก่งมากเลย"];
  const encouragement = messages[Math.min(messages.length - 1, Math.floor(idx / 6))];

  const handleAnswer = useCallback(
    (a: QuizAnswer) => {
      const next = [...answers];
      next[idx] = a;
      setAnswers(next);
      if (idx < total - 1) {
        setTimeout(() => setIdx(idx + 1), 150);
      } else {
        const scored = next.filter(Boolean) as QuizAnswer[];
        const scores = computeRiasecScores(scored);
        setTimeout(() => onComplete(scores), 200);
      }
    },
    [idx, answers, total, onComplete],
  );

  const prev = () => idx > 0 && setIdx(idx - 1);

  return (
    <div className="relative min-h-screen">
      {/* exit button */}
      <div className="flex justify-end px-4 pb-0 pt-4 sm:px-6 sm:pt-5">
        <button
          onClick={onExit}
          className="flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-sm font-semibold text-ink-2 transition-colors hover:bg-surface-subtle"
        >
          <Icon name="close" size={14} />
          ออก
        </button>
      </div>

      <div className="mx-auto max-w-2xl px-4 pb-28 pt-3 sm:px-6">
        {/* progress */}
        <div className="mb-3 flex items-center gap-3">
          <button
            onClick={prev}
            disabled={idx === 0}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-ink-2 transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon name="arrow-left" size={18} />
          </button>
          <div className="flex-1">
            <ProgressBar value={progress} />
          </div>
          <span className="text-sm font-bold tabular-nums text-ink-2">
            {idx + 1}
            <span className="font-normal text-ink-4">/{total}</span>
          </span>
        </div>
        <p className="mb-7 text-center text-sm font-semibold text-dgreen">
          ✨ {encouragement}
        </p>

        {/* dim chip */}
        <div className="mb-4 flex justify-center">
          <span
            className="inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-bold"
            style={{ background: dim.color + "1A", color: dim.color }}
          >
            <Icon name={dim.icon} size={13} color={dim.color} />
            {dim.th}
          </span>
        </div>

        {/* question */}
        <div key={q.id}>
          <h2 className="mb-8 text-center text-2xl font-bold leading-snug tracking-tight text-ink sm:text-3xl">
            {q.text}
          </h2>

          {q.format === "agree" && (
            <div className="space-y-3">
              {(
                [
                  { val: -2, label: "ไม่เห็นด้วยอย่างยิ่ง" },
                  { val: -1, label: "ไม่เห็นด้วย" },
                  { val: 0, label: "เฉย ๆ" },
                  { val: 1, label: "เห็นด้วย" },
                  { val: 2, label: "เห็นด้วยอย่างยิ่ง" },
                ] as { val: number; label: string }[]
              ).map((o) => (
                <button
                  key={o.val}
                  onClick={() => handleAnswer({ dim: q.dim, val: o.val })}
                  className="flex w-full items-center justify-between rounded-2xl border border-line-soft bg-surface px-5 py-4 text-left text-base font-semibold text-ink transition-all hover:border-dgreen hover:bg-dgreen-soft/50 active:scale-[0.99]"
                >
                  {o.label}
                  <Icon name="arrow-right" size={18} color="var(--ink-3)" />
                </button>
              ))}
            </div>
          )}

          {q.format === "choice" && q.options && (
            <div className="space-y-3">
              {q.options.map((o, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer({ dim: o.dim, val: 2 })}
                  className="flex w-full items-center gap-3 rounded-2xl border border-line-soft bg-surface px-5 py-4 text-left text-base font-semibold text-ink transition-all hover:border-dgreen hover:bg-dgreen-soft/50 hover:-translate-y-0.5 active:scale-[0.99]"
                >
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-surface-subtle text-xs font-bold text-ink-2">
                    {["A", "B", "C", "D"][i]}
                  </span>
                  <span className="flex-1 leading-snug">{o.label}</span>
                </button>
              ))}
            </div>
          )}

          {q.format === "slider" && (
            <SliderQuestion dim={q.dim} onAnswer={handleAnswer} />
          )}
        </div>

        <p className="mt-7 text-center text-sm text-ink-4">
          ตอบจากสัญชาตญาณแรก ไม่ต้องคิดเยอะ ✨
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// RESULTS SCREEN
// ─────────────────────────────────────────────────────────────
function ResultsScreen({
  scores,
  onRetake,
}: {
  scores: RiasecScores;
  onRetake: () => void;
}) {
  const sorted = (Object.entries(scores) as [RiasecDim, number][]).sort(
    (a, b) => b[1] - a[1],
  );
  const top3Code = getTop3Code(scores);
  const topDim = RIASEC_DIMS[sorted[0][0]];

  // Sort programs by RIASEC fit
  const scoredPrograms = Object.values(RICH_PROGRAMS)
    .map((p) => ({
      ...p,
      computedMatch: computeProgramMatch(p.riasec, scores, p.baseFit),
    }))
    .sort((a, b) => b.computedMatch - a.computedMatch)
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6">
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-dgreen">
        ผลการทดสอบ RIASEC ของคุณ
      </p>
      <h1 className="mb-3 text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
        คุณคือ{" "}
        <span
          style={{
            background: `linear-gradient(135deg, ${topDim.color}, var(--d-green))`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {topDim.th}
        </span>
        <br />
        รหัสบุคลิก{" "}
        <span className="font-mono text-dgreen">{top3Code}</span>
      </h1>
      <p className="mb-8 max-w-xl text-base leading-relaxed text-ink-2">
        คุณเด่นด้าน <strong>{topDim.th}</strong> — {topDim.desc}{" "}
        เราคัดคณะที่เข้ากับบุคลิกของคุณมาแล้ว ลองดูข้างล่างได้เลย
      </p>

      {/* Radar + score bars */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="flex items-center justify-center rounded-2xl border border-line-soft bg-surface p-6">
          <RadarChart scores={scores} size={260} />
        </div>
        <div className="rounded-2xl border border-line-soft bg-surface p-6">
          <p className="mb-4 text-sm font-bold text-ink">คะแนนแยกตามมิติ</p>
          <div className="space-y-4">
            {sorted.map(([k, v], i) => {
              const d = RIASEC_DIMS[k];
              return (
                <div key={k}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black"
                        style={{ background: d.color + "22", color: d.color }}
                      >
                        {d.key}
                      </span>
                      <span className="text-sm font-semibold text-ink">{d.th}</span>
                      {i === 0 && (
                        <span className="rounded-full bg-dgreen-soft px-2 py-0.5 text-[10px] font-bold text-dgreen-deep">
                          เด่นที่สุด
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-bold tabular-nums text-ink">{v}</span>
                  </div>
                  <ScoreBar value={v} color={d.color} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top programs */}
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <p className="text-lg font-bold text-ink">คณะที่เข้ากับคุณมากที่สุด</p>
          <p className="text-sm text-ink-3">คำนวณจากบุคลิกของคุณ × ลักษณะของหลักสูตร</p>
        </div>
        <Link
          href="/explore"
          className="hidden items-center gap-1 text-sm font-semibold text-dgreen hover:underline sm:flex"
        >
          ดูทั้งหมด <Icon name="arrow-right" size={14} color="var(--d-green)" />
        </Link>
      </div>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {scoredPrograms.map((p) => (
          <Link
            key={p.id}
            href={`/explore/${p.id}`}
            className="group rounded-2xl border border-line-soft bg-surface p-4 transition-shadow hover:shadow-md"
          >
            <div className="mb-1 flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink group-hover:text-dgreen">
                  {MOCK_PROGRAM_NAMES[p.id]?.name_th ?? p.id}
                </p>
                <p className="mt-0.5 text-xs text-ink-3">
                  {MOCK_PROGRAM_NAMES[p.id]?.faculty_th}
                </p>
              </div>
              <span
                className="flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-black"
                style={{ background: "var(--d-green-soft)", color: "var(--d-green-deep)" }}
              >
                {p.computedMatch}%
              </span>
            </div>
            <div className="mb-2 flex flex-wrap gap-1">
              {p.riasec.slice(0, 3).map((dk) => (
                <span
                  key={dk}
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ background: RIASEC_DIMS[dk].color + "1A", color: RIASEC_DIMS[dk].color }}
                >
                  {RIASEC_DIMS[dk].th}
                </span>
              ))}
            </div>
            <p className="text-xs text-ink-3">{p.why}</p>
          </Link>
        ))}
      </div>

      {/* Green CTA */}
      <div
        className="mb-6 flex items-center gap-4 rounded-2xl p-5"
        style={{ background: "var(--d-green-soft)" }}
      >
        <div className="flex-1">
          <p className="font-bold text-dgreen-deep">ก้าวต่อไป — สำรวจคณะทั้งหมด</p>
          <p className="mt-1 text-sm text-dgreen-deep opacity-80">
            KUru จัดเรียงผลตามบุคลิกของคุณแล้ว ลองเปรียบเทียบ
          </p>
        </div>
        <Link
          href="/explore"
          className="flex h-11 items-center gap-2 rounded-2xl bg-dgreen px-5 text-sm font-bold text-white transition-colors hover:bg-dgreen-deep"
        >
          เริ่ม <Icon name="arrow-right" size={16} color="white" />
        </Link>
      </div>

      <div className="text-center">
        <button
          onClick={onRetake}
          className="text-sm font-semibold text-ink-3 hover:text-ink"
        >
          ทำแบบทดสอบใหม่
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────
type Phase = "intro" | "quiz" | "results";

export default function RiasecPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [scores, setScoresLocal] = useState<RiasecScores | null>(null);
  const setScores = useAppStore((s) => s.riasec.setScores);

  const handleComplete = useCallback(
    (s: RiasecScores) => {
      setScoresLocal(s);
      setScores(s);
      setPhase("results");
    },
    [setScores],
  );

  const handleRetake = () => {
    setScoresLocal(null);
    setPhase("intro");
  };

  if (phase === "intro") return <IntroScreen onStart={() => setPhase("quiz")} />;
  if (phase === "quiz")
    return (
      <QuizScreen
        onComplete={handleComplete}
        onExit={() => setPhase("intro")}
      />
    );
  if (phase === "results" && scores)
    return <ResultsScreen scores={scores} onRetake={handleRetake} />;

  return null;
}
