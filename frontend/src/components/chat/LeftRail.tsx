"use client";

import { cn } from "@/lib/cn";

const CONVERSATION_HISTORY = [
  { id: "01", title: "คณะที่เข้ากับ IAC", time: "วันนี้ · 14:22", active: true },
  { id: "02", title: "โอกาสรับเข้า CS", time: "เมื่อวาน", active: false },
  { id: "03", title: "เทียบสถาปัตย์ vs ดีไซน์", time: "2 วันก่อน", active: false },
];

const QUICK_PROMPTS = [
  { label: "โอกาสรับ CS", prompt: "โอกาสรับเข้าคณะ CS เป็นยังไงบ้าง?" },
  { label: "พอร์ตขาดอะไร", prompt: "พอร์ตของฉันยังขาดอะไร?" },
  { label: "TCAS รอบไหน", prompt: "TCAS รอบไหนเหมาะกับฉันที่สุด?" },
];

type Props = {
  onQuickPrompt: (text: string) => void;
};

export function LeftRail({ onQuickPrompt }: Props) {
  return (
    <div className="rounded-3xl border border-line-soft bg-white p-5">
      <h5 className="mb-3 font-display text-[11px] font-extrabold uppercase tracking-[.12em] text-ink-3">
        ★ บทสนทนา
      </h5>

      {CONVERSATION_HISTORY.map((item) => (
        <div
          key={item.id}
          className={cn(
            "flex cursor-pointer items-start gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] leading-snug transition-all",
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
            {item.title}
            <div className="mt-0.5 text-[11.5px] text-ink-4">{item.time}</div>
          </div>
        </div>
      ))}

      <h5 className="mb-3 mt-6 font-display text-[11px] font-extrabold uppercase tracking-[.12em] text-ink-3">
        ★ Quick prompts
      </h5>

      {QUICK_PROMPTS.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => onQuickPrompt(item.prompt)}
          className="flex w-full cursor-pointer items-start gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13.5px] leading-snug text-ink-2 transition-all hover:bg-paper hover:text-ink"
        >
          <span className="shrink-0 font-serif italic text-ink-3">→</span>
          <div>{item.label}</div>
        </button>
      ))}
    </div>
  );
}
