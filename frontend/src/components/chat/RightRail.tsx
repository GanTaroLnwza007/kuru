"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { RIASEC_DIMS } from "@/lib/riasec";

function codeLabel(key: string): string {
  return (RIASEC_DIMS as Record<string, { th: string }>)[key]?.th ?? key;
}

function codeDescription(code: string): string {
  return code
    .split("")
    .map(codeLabel)
    .join(" + ");
}

const PINNED_PROGRAMS = [
  { id: "01", name: "วิทยาการคอมพิวเตอร์", meta: "match 92% · TCAS 2 เปิด 6 ก.พ.", active: true },
  { id: "02", name: "วิศวกรรมข้อมูล", meta: "match 88% · TCAS 2 เปิด 12 ก.พ.", active: false },
  { id: "03", name: "เทคโนโลยีชีวภาพ", meta: "match 84% · TCAS 1 ปิดแล้ว", active: false },
];

type Props = {
  hollandCode: string | null;
};

export function RightRail({ hollandCode }: Props) {
  return (
    <>
      {/* RIASEC context card */}
      <div className="relative overflow-hidden rounded-3xl bg-ink p-6 text-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(circle at 80% 0, rgba(0,166,81,.4), transparent 60%)" }}
        />
        <div className="relative z-10">
          <div className="text-[11px] font-bold uppercase tracking-[.14em] text-white/50">
            {hollandCode ? "บุคลิกของน้อง" : "ยังไม่ได้ทำแบบทดสอบ"}
          </div>

          {hollandCode ? (
            <>
              <div className="my-2 font-display text-[56px] font-extrabold leading-none tracking-[-0.04em]">
                {hollandCode}
              </div>
              <div className="mb-4 font-serif text-sm italic text-white/70">
                {codeDescription(hollandCode)}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                  📊 GPA 3.65
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                  📁 4 ผลงาน
                </span>
              </div>
            </>
          ) : (
            <div className="mt-3">
              <p className="mb-4 text-sm text-white/60 leading-relaxed">
                ทำแบบทดสอบ RIASEC เพื่อให้ KUru แนะนำได้ตรงกับคุณมากขึ้น
              </p>
              <Link
                href="/riasec"
                className="inline-flex h-9 items-center rounded-full bg-dgreen px-4 font-display text-sm font-bold text-white transition-all hover:bg-dgreen-deep"
                style={{ boxShadow: "0 8px 24px -8px rgba(0,166,81,.5)" }}
              >
                ทำแบบทดสอบ RIASEC
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Pinned programs */}
      <div className="rounded-3xl border border-line-soft bg-white p-5">
        <h5 className="mb-3 font-display text-[11px] font-extrabold uppercase tracking-[.12em] text-ink-3">
          ★ คณะที่ปักหมุด
        </h5>

        {PINNED_PROGRAMS.map((item) => (
          <Link
            key={item.id}
            href="/explore"
            className={cn(
              "flex items-start gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] leading-snug transition-all",
              item.active ? "bg-paper text-ink" : "text-ink-2 hover:bg-paper hover:text-ink"
            )}
          >
            <span
              className={cn(
                "min-w-[18px] shrink-0 font-serif font-semibold italic",
                item.active ? "text-dgreen" : "text-ink-3"
              )}
            >
              {item.id}
            </span>
            <div>
              <strong className="font-bold text-ink">{item.name}</strong>
              <div className="mt-0.5 text-[11.5px] text-ink-3">{item.meta}</div>
            </div>
          </Link>
        ))}

        <Link
          href="/explore"
          className="mt-2.5 flex h-10 w-full items-center justify-center gap-2 rounded-full border border-line bg-white/70 font-display text-[13.5px] font-bold text-ink transition-all hover:border-ink hover:bg-white"
        >
          ดูทั้งหมด
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </>
  );
}
