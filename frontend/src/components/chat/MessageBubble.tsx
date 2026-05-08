import type { ChatMessage } from "@/lib/store";
import { SourceCitationList } from "./SourceCitationList";

type Props = {
  message: ChatMessage;
  sourcesLabel: string;
  mockBadgeLabel: string;
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return (
    String(d.getHours()).padStart(2, "0") +
    ":" +
    String(d.getMinutes()).padStart(2, "0")
  );
}

function BotAvatar() {
  return (
    <div className="relative grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-[10px] bg-ink">
      <span
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, var(--d-green-pop), transparent 60%)",
          opacity: 0.7,
        }}
      />
      <span className="relative font-serif text-sm font-semibold italic text-white">K</span>
    </div>
  );
}

function UserAvatar() {
  return (
    <div
      className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] font-serif text-sm font-semibold italic"
      style={{ background: "var(--d-peach-soft)", color: "var(--d-rust)" }}
    >
      ก
    </div>
  );
}

export function MessageBubble({ message, sourcesLabel, mockBadgeLabel }: Props) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex max-w-[92%] gap-3 ${isUser ? "self-end flex-row-reverse" : "self-start"}`}
      style={{ animation: "slideUp 320ms cubic-bezier(.2,.7,.2,1)" }}
    >
      {isUser ? <UserAvatar /> : <BotAvatar />}

      <div className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className="px-[18px] py-3.5 text-[15px] leading-[1.55] whitespace-pre-wrap"
          style={
            isUser
              ? {
                  background: "var(--ink)",
                  color: "#fff",
                  borderRadius: "18px 18px 6px 18px",
                }
              : {
                  background: "var(--paper)",
                  color: "var(--ink)",
                  borderRadius: "18px 18px 18px 6px",
                }
          }
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

        <div
          className="px-1 text-[11px] text-ink-4"
          style={isUser ? { textAlign: "right" } : undefined}
        >
          {formatTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
}
