import type { ChatMessage } from "@/lib/store";
import { SourceCitationList } from "./SourceCitationList";

type Props = {
  message: ChatMessage;
  sourcesLabel: string;
  mockBadgeLabel: string;
};

export function MessageBubble({ message, sourcesLabel, mockBadgeLabel }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-surface text-text-primary shadow-sm"
          }`}
        >
          {message.content}
        </div>

        {!isUser && message.isMock && (
          <span className="rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
            {mockBadgeLabel}
          </span>
        )}

        {!isUser && message.sources && message.sources.length > 0 && (
          <SourceCitationList sources={message.sources} label={sourcesLabel} />
        )}
      </div>
    </div>
  );
}
