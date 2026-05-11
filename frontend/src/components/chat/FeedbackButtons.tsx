"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { apiClient } from "@/lib/api";

type Props = {
  question: string;
  answer: string;
};

export function FeedbackButtons({ question, answer }: Props) {
  const sessionId = useAppStore((s) => s.chat.sessionId);
  const [rating, setRating] = useState<1 | -1 | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(value: 1 | -1) {
    if (rating !== null || submitting || !sessionId) return;
    setSubmitting(true);
    try {
      await apiClient.chatFeedback({ session_id: sessionId, question, answer, rating: value });
      setRating(value);
    } catch (err) {
      console.error("chatFeedback failed:", err);
      // buttons re-enable naturally since setRating is not called
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-1 flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => submit(1)}
        disabled={rating !== null || submitting}
        aria-label="มีประโยชน์"
        title="มีประโยชน์"
        className={`grid h-7 w-7 place-items-center rounded-lg border text-sm transition-colors disabled:cursor-default ${
          rating === 1
            ? "border-green-300 bg-green-50 text-green-700"
            : "border-line text-ink-4 hover:border-ink hover:text-ink disabled:opacity-50"
        }`}
      >
        <span aria-hidden="true">👍</span>
      </button>
      <button
        type="button"
        onClick={() => submit(-1)}
        disabled={rating !== null || submitting}
        aria-label="ไม่มีประโยชน์"
        title="ไม่มีประโยชน์"
        className={`grid h-7 w-7 place-items-center rounded-lg border text-sm transition-colors disabled:cursor-default ${
          rating === -1
            ? "border-red-300 bg-red-50 text-red-600"
            : "border-line text-ink-4 hover:border-ink hover:text-ink disabled:opacity-50"
        }`}
      >
        <span aria-hidden="true">👎</span>
      </button>
    </div>
  );
}
