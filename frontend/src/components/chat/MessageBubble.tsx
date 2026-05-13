import ReactMarkdown, { type Components } from "react-markdown";
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
    <div
      className="relative grid h-8 w-8 shrink-0 place-items-center rounded-[10px]"
      style={{ background: "linear-gradient(135deg, #00A651 0%, #006D35 100%)" }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>
      </svg>
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
          className="px-[18px] py-3.5 text-[15px] leading-[1.55]"
          style={
            isUser
              ? { background: "var(--ink, #0A1F14)", color: "#fff", borderRadius: "18px 18px 6px 18px" }
              : { background: "#fff", color: "var(--ink)", borderRadius: "18px 18px 18px 6px", boxShadow: "0 1px 4px rgba(15,27,20,.07)" }
          }
        >
          {isUser ? (
            <span className="whitespace-pre-wrap">{message.content}</span>
          ) : (
            <ReactMarkdown
              components={({
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-0.5">{children}</ul>,
                ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-0.5">{children}</ol>,
                li: ({ children }) => <li>{children}</li>,
                h1: ({ children }) => <h1 className="mb-1 text-base font-bold">{children}</h1>,
                h2: ({ children }) => <h2 className="mb-1 text-base font-bold">{children}</h2>,
                h3: ({ children }) => <h3 className="mb-1 text-sm font-semibold">{children}</h3>,
                code: ({ children }) => <code className="rounded bg-black/10 px-1 py-0.5 font-mono text-[13px]">{children}</code>,
              } satisfies Components)}
            >
              {message.content}
            </ReactMarkdown>
          )}
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

        {/* TCAS structured-data badge */}
        {!isUser && message.usedTcasData && (
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
            📋 TCAS data
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
