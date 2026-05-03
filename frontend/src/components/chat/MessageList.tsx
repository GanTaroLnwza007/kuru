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
};

function TypingIndicator({ label }: { label: string }) {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-2 rounded-2xl bg-surface px-4 py-3 shadow-sm">
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="inline-block h-2 w-2 animate-bounce rounded-full bg-text-muted"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </span>
        <span className="text-xs text-text-muted">{label}</span>
      </div>
    </div>
  );
}

export function MessageList({
  messages,
  isLoading,
  sourcesLabel,
  mockBadgeLabel,
  typingIndicatorLabel,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-1 py-4">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          sourcesLabel={sourcesLabel}
          mockBadgeLabel={mockBadgeLabel}
        />
      ))}
      {isLoading && <TypingIndicator label={typingIndicatorLabel} />}
      <div ref={bottomRef} />
    </div>
  );
}
