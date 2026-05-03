"use client";

import { useRef, type KeyboardEvent } from "react";

type Props = {
  onSend: (message: string) => void;
  disabled: boolean;
  placeholder: string;
};

export function ChatInput({ onSend, disabled, placeholder }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    const value = textareaRef.current?.value.trim();
    if (!value || disabled) return;
    onSend(value);
    if (textareaRef.current) textareaRef.current.value = "";
  }

  return (
    <div className="flex items-end gap-2 rounded-2xl border border-surface-subtle bg-surface p-3 shadow-sm">
      <textarea
        ref={textareaRef}
        rows={1}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={placeholder}
        className="flex-1 resize-none bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted disabled:opacity-50"
        style={{ maxHeight: "120px", overflowY: "auto" }}
        onInput={(e) => {
          const el = e.currentTarget;
          el.style.height = "auto";
          el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
        }}
      />
      <button
        type="button"
        onClick={submit}
        disabled={disabled}
        aria-label="ส่งข้อความ"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        style={{ background: "linear-gradient(135deg, #006b32 0%, #008740 100%)" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
