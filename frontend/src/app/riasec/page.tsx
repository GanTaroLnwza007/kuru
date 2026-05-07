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

// ── Background textures ────────────────────────────────────────
function BgMesh() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: [
            "radial-gradient(ellipse 700px 500px at 88% 18%, rgba(0,166,81,.18) 0%, transparent 60%)",
            "radial-gradient(ellipse 500px 500px at 12% 80%, rgba(244,182,140,.18) 0%, transparent 60%)",
          ].join(", "),
        }}
      />
      <svg
        className="pointer-events-none absolute inset-0 z-0 opacity-55 mix-blend-multiply"
        preserveAspectRatio="none"
        style={{ width: "100%", height: "100%" }}
      >
        <filter id="quiz-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix values="0 0 0 0 0.05  0 0 0 0 0.1  0 0 0 0 0.07  0 0 0 0 0.04 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#quiz-grain)" />
      </svg>
    </>
  );
}

// ── Score bar (results screen) ─────────────────────────────────
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
    <div className="mx-auto max-w-[760px] px-5 pb-24 pt-8 sm:px-8 sm:pt-12">
      {/* Eyebrow badge */}
      <div
        className="mb-5 inline-flex items-center gap-2 rounded-full border border-line-soft bg-white px-3 py-1.5 font-display text-xs font-bold text-ink-2"
        style={{ boxShadow: "0 8px 20px -8px rgba(15,27,20,.08)" }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full bg-dgreen"
          style={{ animation: "pulse 1.6s infinite" }}
        />
        RIASEC · 24 ข้อ · 3-5 นาที
      </div>

      <h1
        className="mb-5 font-display font-extrabold leading-none tracking-tight text-ink"
        style={{ fontSize: "clamp(44px, 5.6vw, 72px)" }}
      >
        ตอบจากใจคุณก็พอ
        <br />
        <span className="font-serif font-normal italic" style={{ color: "var(--d-green)" }}>
          ไม่มีคำตอบที่ถูกหรือผิด
        </span>
      </h1>

      <p className="mb-8 max-w-[560px] text-lg leading-relaxed text-ink-2">
        KUru ใช้ <em className="font-serif not-italic">RIASEC</em> — ทฤษฎีบุคลิกอาชีพของ John Holland
        ที่นักจิตวิทยาทั่วโลกใช้กว่า 60 ปี เราจะค่อย ๆ ถามด้วยคำถามที่หลากหลาย
        ตอบโดยใช้สัญชาตญาณแรกได้เลย
      </p>

      {/* Dim cards */}
      <div className="mb-8 grid gap-2.5">
        {(Object.values(RIASEC_DIMS) as (typeof RIASEC_DIMS)[RiasecDim][]).map((d) => (
          <div
            key={d.key}
            className="flex items-center gap-4 rounded-[20px] border border-line-soft bg-white px-5 py-[18px] transition-all duration-[240ms] hover:translate-x-1 hover:border-ink"
          >
            <div
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl font-serif text-[22px] font-semibold italic"
              style={{ background: d.bg, color: d.color }}
            >
              {d.key}
            </div>
            <div className="flex-1">
              <p className="font-display text-base font-bold text-ink">
                <span className="mr-2 font-serif font-semibold italic" style={{ color: d.color }}>
                  {d.key}
                </span>
                {d.th}
              </p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-ink-3">{d.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        className="relative flex h-[60px] w-full items-center justify-center gap-2.5 overflow-hidden rounded-full font-display text-base font-bold text-white"
        style={{
          background: "var(--ink)",
          boxShadow: "0 8px 24px -8px rgba(10,31,20,.5), inset 0 1px 0 rgba(255,255,255,.1)",
        }}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
          e.currentTarget.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%");
        }}
      >
        <span
          className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 hover:opacity-60"
          style={{
            background: "radial-gradient(circle at var(--mx,30%) var(--my,50%), var(--d-green) 0%, transparent 50%)",
          }}
        />
        <svg
          className="relative z-10"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
        <span className="relative z-10">เริ่มทดสอบ</span>
      </button>

      <p className="mt-3.5 text-center text-[12.5px] text-ink-3">
        🔒 ข้อมูลของคุณปลอดภัย ไม่ใช้กับใครเด็ดขาด
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// QUIZ SCREEN
// ─────────────────────────────────────────────────────────────
type QuizAnswer = AnswerRecord;

function SliderQuestion({ onAnswer, dim }: { onAnswer: (a: QuizAnswer) => void; dim: RiasecDim }) {
  const [val, setVal] = useState(50);
  const labels = ["ไม่ใช่ฉันเลย", "ค่อนข้างไม่ใช่", "ตรงกลาง", "ค่อนข้างใช่", "ใช่ฉันเลย!"];
  const idx = Math.min(4, Math.floor(val / 20.01));

  return (
    <div className="slider-block px-1">
      <p
        className="mb-7 h-8 text-center font-display text-[22px] font-extrabold transition-all duration-200"
        style={{ color: "var(--d-green)" }}
      >
        {labels[idx]}
      </p>
      <div className="relative mb-4 h-[60px] px-[18px]">
        {/* track */}
        <div
          className="absolute inset-x-[18px] top-[26px] h-2 rounded-full"
          style={{ background: "var(--d-green-soft)" }}
        />
        {/* fill */}
        <div
          className="absolute top-[26px] h-2 rounded-full transition-[width] duration-[80ms]"
          style={{
            left: "18px",
            width: `calc(${val}% * (100% - 36px) / 100%)`,
            background: "linear-gradient(90deg, var(--d-green), var(--d-green-pop))",
          }}
        />
        {/* thumb */}
        <div
          className="pointer-events-none absolute top-[16px] h-7 w-7 rounded-full bg-white transition-[left] duration-[80ms]"
          style={{
            left: `calc(${val}% - 14px)`,
            border: "3px solid var(--d-green)",
            boxShadow: "0 6px 16px -4px rgba(0,166,81,.4)",
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
        />
      </div>
      <div className="mb-7 flex justify-between text-[12.5px] text-ink-3">
        <span>ไม่ใช่ฉันเลย</span>
        <span>ใช่ฉันเลย!</span>
      </div>
      <button
        onClick={() => onAnswer({ dim, val: (val - 50) / 25 })}
        className="flex h-[60px] w-full items-center justify-center gap-2 rounded-full font-display text-base font-bold text-white transition-transform hover:-translate-y-0.5"
        style={{
          background: "var(--ink)",
          boxShadow: "0 8px 24px -8px rgba(10,31,20,.5)",
        }}
      >
        ยืนยันคำตอบ
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>
    </div>
  );
}

const AGREE_OPTS = [
  { val: -2, label: "ไม่เห็นด้วยอย่างยิ่ง", dots: 1 },
  { val: -1, label: "ไม่เห็นด้วย", dots: 2 },
  { val: 0, label: "เฉย ๆ", dots: 3 },
  { val: 1, label: "เห็นด้วย", dots: 4 },
  { val: 2, label: "เห็นด้วยอย่างยิ่ง", dots: 5 },
] as const;

const ENCOURAGEMENTS = [
  "คุณทำได้ดี ✨",
  "ค่อย ๆ คิดได้นะ 🌱",
  "ครึ่งทางแล้ว ไม่ต้องรีบ",
  "อีกนิดเดียวเอง 💚",
  "เก่งมากเลย ใกล้เสร็จแล้ว ✨",
];

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
  const encouragement = ENCOURAGEMENTS[Math.min(ENCOURAGEMENTS.length - 1, Math.floor(idx / 5))];

  const handleAnswer = useCallback(
    (a: QuizAnswer) => {
      const next = [...answers];
      next[idx] = a;
      setAnswers(next);
      if (idx < total - 1) {
        setTimeout(() => setIdx(idx + 1), 120);
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
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden py-8 sm:py-10">
      <BgMesh />

      <div className="relative z-10 mx-auto max-w-[760px] px-5 pb-20 sm:px-8">
        {/* Header */}
        <div className="mb-9 flex items-center gap-3.5">
          <button
            onClick={prev}
            disabled={idx === 0}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-line bg-white text-ink-2 transition-all hover:border-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="flex-1">
            <div className="mb-2 flex justify-between font-display text-[12px] font-bold uppercase tracking-[.04em] text-ink-3">
              <span>{dim.name}</span>
              <span>
                <span className="tabular-nums text-ink">{idx + 1}</span>
                <span className="text-ink-4">/{total}</span>
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-line-soft">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${Math.max(4, progress)}%`,
                  background: "linear-gradient(90deg, var(--d-green), var(--d-green-pop))",
                }}
              />
            </div>
          </div>
          <button
            onClick={onExit}
            className="rounded-full bg-transparent px-3.5 py-2 text-[13px] font-semibold text-ink-3 transition-all hover:bg-ink/[.06] hover:text-ink"
          >
            ออก
          </button>
        </div>

        {/* Encouragement */}
        <p
          className="mb-7 text-center font-serif italic"
          style={{ color: "var(--d-green)", fontSize: 16 }}
        >
          {encouragement}
        </p>

        {/* Dim pill */}
        <div className="mb-2.5 flex justify-center">
          <span
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-display text-[12.5px] font-bold"
            style={{ background: dim.bg, color: dim.color }}
          >
            <span className="font-serif italic opacity-70">·</span>
            {dim.th}
            <span className="font-serif italic opacity-70">·</span>
          </span>
        </div>

        {/* Question block */}
        <div key={q.id} style={{ animation: "slideUp 380ms cubic-bezier(.2,.7,.2,1)" }}>
          <h2
            className="mb-9 text-center font-display font-bold leading-[1.2] tracking-[-0.02em] text-ink"
            style={{ fontSize: "clamp(26px, 3.4vw, 40px)" }}
          >
            {q.text}
          </h2>

          {/* Agree */}
          {q.format === "agree" && (
            <div className="grid gap-2.5">
              {AGREE_OPTS.map((o) => (
                <button
                  key={o.val}
                  onClick={() => handleAnswer({ dim: q.dim, val: o.val })}
                  className="group flex w-full items-center gap-3.5 rounded-[18px] border border-line-soft bg-white px-[22px] py-4 text-left font-thai text-[15.5px] font-semibold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-dgreen"
                  style={{
                    boxShadow: "none",
                    transition: "all 200ms",
                  }}
                >
                  {/* Scale dots */}
                  <span className="flex flex-shrink-0 gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span
                        key={i}
                        className="h-2.5 w-2.5 rounded-full transition-all duration-200"
                        style={{
                          background: i <= o.dots ? "var(--d-green)" : "var(--line)",
                        }}
                      />
                    ))}
                  </span>
                  <span className="flex-1">{o.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Choice */}
          {q.format === "choice" && q.options && (
            <div className="grid gap-2.5">
              {q.options.map((o, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer({ dim: o.dim, val: 2 })}
                  className="group relative flex w-full items-center justify-between gap-3.5 overflow-hidden rounded-[18px] border border-line-soft bg-white px-[22px] py-[18px] text-left font-thai text-base font-semibold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-dgreen"
                  style={{ boxShadow: "none" }}
                >
                  {/* Hover sweep */}
                  <span
                    className="pointer-events-none absolute inset-y-0 left-0 w-0 transition-[width] duration-[240ms] group-hover:w-full"
                    style={{
                      background: "linear-gradient(90deg, var(--d-green-soft), transparent)",
                    }}
                  />
                  <span className="relative z-10 flex flex-1 items-center gap-3.5">
                    <span
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg font-display text-[13px] font-extrabold text-ink-2 transition-all duration-200 group-hover:bg-dgreen group-hover:text-white"
                      style={{ background: "var(--paper)" }}
                    >
                      {"ABCD"[i]}
                    </span>
                    <span className="leading-snug">{o.label}</span>
                  </span>
                  <span
                    className="relative z-10 text-ink-4 transition-all duration-200 group-hover:translate-x-1 group-hover:text-dgreen"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Slider */}
          {q.format === "slider" && <SliderQuestion dim={q.dim} onAnswer={handleAnswer} />}
        </div>

        <p className="mt-8 text-center text-[13px] text-ink-4">
          ตอบจากสัญชาตญาณแรก ไม่ต้องคิดเยอะ
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPLETE SCREEN
// ─────────────────────────────────────────────────────────────
function CompleteScreen({ onView }: { onView: () => void }) {
  return (
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden">
      <BgMesh />
      <div className="relative z-10 mx-auto max-w-[760px] px-5 py-16 sm:px-8">
        <div
          className="rounded-[28px] border border-line-soft bg-white p-8 text-center"
          style={{ boxShadow: "0 1px 2px rgba(15,27,20,.04)" }}
        >
          {/* Check icon */}
          <div
            className="mx-auto mb-6 flex h-[88px] w-[88px] items-center justify-center rounded-[28px]"
            style={{
              background: "var(--d-green)",
              boxShadow: "0 20px 40px -10px rgba(0,166,81,.4)",
              animation: "pop 600ms cubic-bezier(.2,.7,.2,1)",
            }}
          >
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m5 12 5 5L20 7" />
            </svg>
          </div>

          <p className="mb-3.5 font-display text-xs font-extrabold uppercase tracking-[.18em] text-dgreen">
            เสร็จแล้ว
          </p>
          <h2
            className="mb-3.5 font-display font-extrabold leading-none tracking-tight text-ink"
            style={{ fontSize: "clamp(36px, 4.6vw, 64px)" }}
          >
            ทำได้{" "}
            <span className="font-serif font-normal italic" style={{ color: "var(--d-green)" }}>
              ยอดเยี่ยม
            </span>
            <br />
            มาดูผลกัน
          </h2>
          <p className="mx-auto mb-8 max-w-[480px] text-lg leading-relaxed text-ink-2">
            KUru กำลังจับคู่บุคลิกของคุณกับหลักสูตร 47 หลักสูตรของ ม.เกษตรศาสตร์
          </p>
          <button
            onClick={onView}
            className="inline-flex h-[60px] items-center gap-2 rounded-full px-7 font-display text-base font-bold text-white transition-transform hover:-translate-y-0.5"
            style={{
              background: "var(--ink)",
              boxShadow: "0 8px 24px -8px rgba(10,31,20,.5)",
            }}
          >
            ดูผลของฉัน
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
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
                        style={{ background: d.bg, color: d.color }}
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
                  style={{
                    background: RIASEC_DIMS[dk].bg,
                    color: RIASEC_DIMS[dk].color,
                  }}
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
type Phase = "intro" | "quiz" | "complete" | "results";

export default function RiasecPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [scores, setScoresLocal] = useState<RiasecScores | null>(null);
  const setScores = useAppStore((s) => s.riasec.setScores);

  const handleComplete = useCallback(
    (s: RiasecScores) => {
      setScoresLocal(s);
      setScores(s);
      setPhase("complete");
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
  if (phase === "complete") return <CompleteScreen onView={() => setPhase("results")} />;
  if (phase === "results" && scores)
    return <ResultsScreen scores={scores} onRetake={handleRetake} />;

  return null;
}
