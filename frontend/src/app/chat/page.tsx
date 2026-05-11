"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAppStore } from "@/lib/store";
import { apiClient } from "@/lib/api";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { LeftRail } from "@/components/chat/LeftRail";
import { RightRail } from "@/components/chat/RightRail";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function ChatPage() {
  const t = useTranslations("chat");
  const searchParams = useSearchParams();

  const programId = searchParams.get("program_id");
  const programName = searchParams.get("program_name");

  const messages = useAppStore((s) => s.chat.messages);
  const sessionId = useAppStore((s) => s.chat.sessionId);
  const isLoading = useAppStore((s) => s.chat.isLoading);
  const addMessage = useAppStore((s) => s.chat.addMessage);
  const setSessionId = useAppStore((s) => s.chat.setSessionId);
  const setLoading = useAppStore((s) => s.chat.setLoading);
  const clearMessages = useAppStore((s) => s.chat.clearMessages);
  const riasecResult = useAppStore((s) => s.riasec.result);

  const autoSentRef = useRef(false);
  const [saved, setSaved] = useState(false);

  const sendMessage = useCallback(
    async (text: string) => {
      if (isLoading) return;

      // Capture history before the new user message is added to the store
      const history = messages
        .slice(-10)
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

      addMessage({
        id: generateId(),
        role: "user",
        content: text,
        createdAt: new Date().toISOString(),
      });

      setLoading(true);

      try {
        const response = await apiClient.chat({
          message: text,
          program_context_id: programId ?? undefined,
          session_id: sessionId ?? undefined,
          conversation_history: history,
        });

        const data = response.data;
        const isMock = "isMock" in response && response.isMock === true;

        setSessionId(data.session_id);

        addMessage({
          id: generateId(),
          role: "assistant",
          content: data.answer,
          createdAt: new Date().toISOString(),
          confidenceLevel: data.confidence_level,
          sources: data.sources,
          isMock,
          usedTcasData: data.used_tcas_data,
        });
      } catch {
        addMessage({
          id: generateId(),
          role: "assistant",
          content: t("errorSend"),
          createdAt: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    },
    [isLoading, messages, sessionId, programId, addMessage, setSessionId, setLoading, t]
  );

  useEffect(() => {
    if (programId && programName && !autoSentRef.current && messages.length === 0) {
      autoSentRef.current = true;
      sendMessage(`ช่วยแนะนำโปรแกรม ${programName} ให้หน่อยได้ไหม`);
    }
  }, [programId, programName, messages.length, sendMessage]);

  const hollandCode = riasecResult?.hollandCode ?? null;

  return (
    // -mt-4 -mb-8 cancels the AppShell main's pt-4 pb-8 so the chat fills the viewport exactly
    <div
      className="relative -mb-8 -mt-4 overflow-hidden bg-paper"
      style={{ height: "calc(100dvh - var(--navbar-height))" }}
    >
      {/* Background mesh gradients */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 700px 500px at 88% 18%, rgba(0,166,81,.15) 0%, transparent 60%), radial-gradient(ellipse 500px 500px at 12% 80%, rgba(244,182,140,.15) 0%, transparent 60%)",
        }}
      />

      {/* Responsive grid: single column → 3-column at xl */}
      <div className="relative z-10 mx-auto grid h-full max-w-[1320px] grid-rows-1 grid-cols-1 gap-6 px-4 py-6 sm:px-8 sm:py-8 xl:grid-cols-[280px_1fr_320px]">
        {/* ── Left rail (hidden below xl) ── */}
        <aside className="hidden max-h-full overflow-y-auto xl:block">
          <LeftRail onQuickPrompt={sendMessage} />
        </aside>

        {/* ── Chat main ── */}
        <div
          className="flex h-full flex-col overflow-hidden rounded-[28px] border border-line-soft bg-white shadow-[0_20px_60px_-28px_rgba(15,27,20,.12)]"
          data-testid="chat-shell"
        >
          {/* Header */}
          <div
            className="flex shrink-0 items-center justify-between gap-3 border-b border-line-soft px-7 py-5"
            style={{ background: "linear-gradient(180deg,#fff 0%,var(--paper) 100%)" }}
          >
            <div className="flex items-center gap-3.5">
              <div className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-[14px] bg-ink">
                <span
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 30%, var(--d-green-pop), transparent 60%)",
                    opacity: 0.7,
                  }}
                />
                <span className="relative font-serif text-[22px] font-semibold italic text-white">
                  K
                </span>
              </div>
              <div>
                <div className="font-display text-lg font-extrabold tracking-tight text-ink">
                  KUru AI
                </div>
                <div
                  className="mt-0.5 flex items-center gap-1.5 text-[12.5px]"
                  style={{ color: "var(--d-green-deep)" }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      background: "var(--d-green)",
                      animation: "pulse 1.6s infinite",
                    }}
                  />
                  พร้อมคุยตอนนี้ · ตอบเป็นภาษาคน
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearMessages}
                className="grid h-9 w-9 min-h-0 min-w-0 place-items-center rounded-xl text-ink-3 transition-colors hover:bg-line-soft hover:text-ink"
                title="เริ่มบทสนทนาใหม่"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-9 9z" />
                  <path d="M3 4v5h5" />
                  <path d="m3 9 3-3" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!messages.length) return;
                  const text = messages
                    .map((m) => `${m.role === "user" ? "น้อง" : "KUru"}: ${m.content}`)
                    .join("\n\n");
                  navigator.clipboard.writeText(text).then(() => {
                    setSaved(true);
                    setTimeout(() => setSaved(false), 2000);
                  });
                }}
                disabled={messages.length === 0}
                className="inline-flex h-9 min-h-0 items-center rounded-full border border-line bg-white/70 px-4 font-display text-[13.5px] font-bold text-ink transition-all hover:border-ink hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saved ? "✓ คัดลอกแล้ว" : "บันทึก"}
              </button>
            </div>
          </div>

          {/* Context banner (when coming from Program Explorer) */}
          {programName && (
            <div
              className="shrink-0 border-b border-line-soft px-6 py-2.5 text-sm font-semibold"
              style={{ background: "var(--d-green-soft)", color: "var(--d-green-deep)" }}
            >
              💬 {t("contextBanner", { name: programName })}
            </div>
          )}

          {/* Message list — fills remaining space */}
          <MessageList
            messages={messages}
            isLoading={isLoading}
            sourcesLabel={t("sources")}
            mockBadgeLabel={t("mockBadge")}
            typingIndicatorLabel={t("typingIndicator")}
            onQuickPrompt={sendMessage}
            hollandCode={hollandCode}
          />

          {/* Input area — pinned to bottom */}
          <div className="shrink-0 border-t border-line-soft bg-white px-5 py-4">
            <ChatInput
              onSend={sendMessage}
              disabled={isLoading}
              placeholder="ถามคำถามใด ๆ ก็ได้... กด ↵ เพื่อส่ง"
            />
            <div className="mt-2.5 flex flex-wrap items-center gap-2 px-1.5">
              <span className="text-[11.5px] text-ink-4">
                Enter เพื่อส่ง · Shift + Enter เพื่อขึ้นบรรทัดใหม่
              </span>
              <span className="ml-auto text-[11.5px] text-ink-4">
                🔒 บทสนทนาเป็นส่วนตัว ไม่ใช้ฝึก AI
              </span>
            </div>
          </div>
        </div>

        {/* ── Right rail (hidden below xl) ── */}
        <aside className="hidden max-h-full overflow-y-auto xl:flex xl:flex-col xl:gap-3.5">
          <RightRail hollandCode={hollandCode} />
        </aside>
      </div>
    </div>
  );
}
