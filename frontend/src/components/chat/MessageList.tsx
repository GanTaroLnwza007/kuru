"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/store";
import { MessageBubble } from "./MessageBubble";

type Props = {
  messages: ChatMessage[];
  isLoading: boolean;
  sourcesLabel: string;
  mockBadgeLabel: string;
  typingIndicatorLabel: string;
  onQuickPrompt: (text: string) => void;
  hollandCode: string | null;
};

const WELCOME_QUICK_CHIPS = [
  { num: "01.", label: "คณะไหนเข้ากับฉันที่สุด?", prompt: "คณะไหนเข้ากับฉันที่สุด?" },
  { num: "02.", label: "โอกาสรับเข้า CS ของฉัน?", prompt: "โอกาสรับเข้า CS ของฉัน?" },
  { num: "03.", label: "พอร์ตของฉันขาดอะไร?", prompt: "พอร์ตของฉันขาดอะไร?" },
  { num: "04.", label: "TCAS รอบไหนเหมาะที่สุด?", prompt: "TCAS รอบไหนเหมาะที่สุด?" },
];

function BotAvatarSmall() {
  return (
    <div className="relative grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-[10px] bg-ink">
      <span
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at 30% 30%, var(--d-green-pop), transparent 60%)",
          opacity: 0.7,
        }}
      />
      <span className="relative font-serif text-sm font-semibold italic text-white">K</span>
    </div>
  );
}

function WelcomeState({
  hollandCode,
  onQuickPrompt,
}: {
  hollandCode: string | null;
  onQuickPrompt: (text: string) => void;
}) {
  const greeting = hollandCode
    ? `สวัสดีค่ะ ฉัน KUru — ที่ปรึกษา AI ของน้อง 🌱\nเห็นว่าน้องทำ RIASEC แล้วได้รหัส ${hollandCode} ใช่มั้ยคะ? วันนี้อยากให้ช่วยอะไรดี?`
    : "สวัสดีค่ะ ฉัน KUru — ที่ปรึกษา AI ของน้อง 🌱\nวันนี้อยากให้ช่วยอะไรดี? ถามเรื่องคณะ, TCAS, หรืออาชีพได้เลย";

  return (
    <div className="flex flex-col gap-[18px]">
      {/* Greeting bubble */}
      <div className="flex max-w-[92%] gap-3 self-start" style={{ animation: "slideUp 320ms cubic-bezier(.2,.7,.2,1)" }}>
        <BotAvatarSmall />
        <div className="flex flex-col gap-1 items-start">
          <div
            className="px-[18px] py-3.5 text-[15px] leading-[1.55] whitespace-pre-wrap"
            style={{ background: "var(--paper)", color: "var(--ink)", borderRadius: "18px 18px 18px 6px" }}
          >
            {greeting}
          </div>
        </div>
      </div>

      {/* Quick chips */}
      <div className="ml-11 flex max-w-[480px] flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          {WELCOME_QUICK_CHIPS.map((chip) => (
            <button
              key={chip.num}
              type="button"
              onClick={() => onQuickPrompt(chip.prompt)}
              className="rounded-[14px] border border-line bg-white px-3.5 py-3 text-left font-display text-[13px] font-semibold text-ink leading-snug transition-all hover:-translate-y-px hover:border-ink hover:bg-paper"
            >
              <span className="mr-1.5 font-serif italic text-dgreen">{chip.num}</span>
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator({ label }: { label: string }) {
  return (
    <div className="ml-11 flex self-start items-center gap-1 rounded-[18px_18px_18px_6px] bg-paper px-[18px] py-3.5">
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block h-[7px] w-[7px] animate-bounce rounded-full bg-ink-4"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </span>
      <span className="ml-1 text-xs text-ink-4">{label}</span>
    </div>
  );
}

export function MessageList({
  messages,
  isLoading,
  sourcesLabel,
  mockBadgeLabel,
  typingIndicatorLabel,
  onQuickPrompt,
  hollandCode,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-[18px] overflow-y-auto px-8 py-7">
      {messages.length === 0 && !isLoading ? (
        <WelcomeState hollandCode={hollandCode} onQuickPrompt={onQuickPrompt} />
      ) : (
        messages.map((message, i) => {
          const question =
            message.role === "assistant"
              ? messages
                  .slice(0, i)
                  .reverse()
                  .find((m) => m.role === "user")?.content ?? ""
              : "";
          const isStreaming = isLoading && i === messages.length - 1 && message.role === "assistant";
          return (
            <MessageBubble
              key={message.id}
              message={message}
              sourcesLabel={sourcesLabel}
              mockBadgeLabel={mockBadgeLabel}
              question={question}
              isStreaming={isStreaming}
            />
          );
        })
      )}
      {isLoading && <TypingIndicator label={typingIndicatorLabel} />}
      <div ref={bottomRef} />
    </div>
  );
}
