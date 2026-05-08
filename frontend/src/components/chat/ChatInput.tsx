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
    if (textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.style.height = "auto";
    }
  }

  return (
    <div
      className="flex items-end gap-2.5 rounded-[20px] border border-line bg-paper px-2 pb-2 pt-2 transition-all focus-within:border-ink focus-within:bg-white"
      style={{ paddingLeft: "8px", paddingRight: "8px" }}
    >
      {/* Attach button */}
      <button
        type="button"
        title="แนบไฟล์"
        className="grid h-[38px] w-[38px] min-h-0 min-w-0 shrink-0 place-items-center rounded-xl text-ink-3 transition-all hover:bg-line-soft hover:text-ink self-end"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 17.93 8.83l-8.59 8.57a2 2 0 1 1-2.83-2.83l8.49-8.48" />
        </svg>
      </button>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        rows={1}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={placeholder}
        className="flex-1 resize-none bg-transparent py-2.5 text-[15px] leading-[1.5] text-ink outline-none placeholder:text-ink-4 disabled:opacity-50"
        style={{ maxHeight: "120px" }}
        onInput={(e) => {
          const el = e.currentTarget;
          el.style.height = "auto";
          el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
        }}
      />

      {/* Mic button */}
      <button
        type="button"
        title="บันทึกเสียง"
        className="grid h-[38px] w-[38px] min-h-0 min-w-0 shrink-0 place-items-center rounded-xl text-ink-3 transition-all hover:bg-line-soft hover:text-ink self-end"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <path d="M12 19v3" />
        </svg>
      </button>

      {/* Send button */}
      <button
        type="button"
        onClick={submit}
        disabled={disabled}
        aria-label="ส่งข้อความ"
        className="grid h-11 w-11 min-h-0 min-w-0 shrink-0 place-items-center rounded-[14px] bg-ink text-white transition-all hover:scale-[1.06] disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-4 disabled:scale-100 self-end"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>
    </div>
  );
}
