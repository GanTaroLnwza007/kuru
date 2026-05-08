import type { ChatMessage } from "@/lib/store";
import { SourceCitationList } from "./SourceCitationList";
import { FeedbackButtons } from "./FeedbackButtons";

type Props = {
  message: ChatMessage;
  sourcesLabel: string;
  mockBadgeLabel: string;
  question: string;
  isStreaming?: boolean;
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

const CONFIDENCE_STYLES: Record<string, string> = {
  high: "border-green-200 bg-green-50 text-green-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-red-200 bg-red-50 text-red-600",
};

const CONFIDENCE_LABELS: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

function ConfidencePill({ level }: { level: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${CONFIDENCE_STYLES[level] ?? ""}`}
    >
      {CONFIDENCE_LABELS[level] ?? level}
    </span>
  );
}

export function MessageBubble({ message, sourcesLabel, mockBadgeLabel, question, isStreaming }: Props) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex max-w-[92%] gap-3 ${isUser ? "self-end flex-row-reverse" : "self-start"}`}
      style={{ animation: "slideUp 320ms cubic-bezier(.2,.7,.2,1)" }}
    >
      {isUser ? <UserAvatar /> : <BotAvatar />}

      <div className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        {/* Bubble */}
        <div
          className="px-[18px] py-3.5 text-[15px] leading-[1.55] whitespace-pre-wrap"
          style={
            isUser
              ? { background: "var(--ink)", color: "#fff", borderRadius: "18px 18px 6px 18px" }
              : { background: "var(--paper)", color: "var(--ink)", borderRadius: "18px 18px 18px 6px" }
          }
        >
          {message.content}
        </div>

        {/* Confidence pill — assistant only */}
        {!isUser && message.confidenceLevel && (
          <ConfidencePill level={message.confidenceLevel} />
        )}

        {/* Low-confidence disclaimer */}
        {!isUser && message.confidenceLevel === "low" && (
          <p className="max-w-xs rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] text-amber-800">
            ข้อมูลนี้อาจไม่ครบถ้วน / This answer may be incomplete.
          </p>
        )}

        {/* Mock badge */}
        {!isUser && message.isMock && (
          <span className="rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
            {mockBadgeLabel}
          </span>
        )}

        {/* Source chips */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <SourceCitationList sources={message.sources} label={sourcesLabel} />
        )}

        {/* Feedback buttons — assistant only, after load */}
        {!isUser && !isStreaming && (
          <FeedbackButtons question={question} answer={message.content} />
        )}

        {/* Timestamp */}
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
