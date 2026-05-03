"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAppStore } from "@/lib/store";
import { apiClient } from "@/lib/api";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";

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

  const autoSentRef = useRef(false);

  const sendMessage = useCallback(
    async (text: string) => {
      if (isLoading) return;

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
        });

        const data = response.data;
        const isMock = "isMock" in response && response.isMock === true;

        setSessionId(data.session_id);

        addMessage({
          id: generateId(),
          role: "assistant",
          content: data.answer,
          createdAt: new Date().toISOString(),
          sources: response.sources as import("@/lib/api").SourceChunk[],
          isMock,
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
    [isLoading, sessionId, programId, addMessage, setSessionId, setLoading, t]
  );

  // Auto-send first message when arriving from Program Explorer
  useEffect(() => {
    if (programId && programName && !autoSentRef.current && messages.length === 0) {
      autoSentRef.current = true;
      sendMessage(`ช่วยแนะนำโปรแกรม ${programName} ให้หน่อยได้ไหม`);
    }
  }, [programId, programName, messages.length, sendMessage]);

  return (
    <section
      className="mx-auto flex h-[calc(100dvh-var(--navbar-height))] w-full max-w-3xl flex-col"
      data-testid="chat-shell"
    >
      {/* Context banner */}
      {programName && (
        <div className="shrink-0 rounded-xl bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          💬 {t("contextBanner", { name: programName })}
        </div>
      )}

      {/* Message list — grows to fill space */}
      <MessageList
        messages={messages}
        isLoading={isLoading}
        sourcesLabel={t("sources")}
        mockBadgeLabel={t("mockBadge")}
        typingIndicatorLabel={t("typingIndicator")}
      />

      {/* Input bar — pinned to bottom */}
      <div className="shrink-0 pb-2 pt-1">
        <ChatInput
          onSend={sendMessage}
          disabled={isLoading}
          placeholder={t("inputPlaceholder")}
        />
      </div>
    </section>
  );
}
