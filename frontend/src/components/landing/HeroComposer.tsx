"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const PLACEHOLDERS = [
  "อยากเรียนเทคโนโลยีและเกษตรไปด้วยกัน...",
  "หาคณะที่เน้นวิจัย ใช้คณิตเยอะ",
  "ชอบช่วยคน อยากทำสายสุขภาพ",
  "ต้องการหลักสูตรอินเตอร์ มีฝึกงาน ตปท.",
];

const CHIPS = [
  { emoji: "🧮", label: "คณิตเยอะ" },
  { emoji: "🌍", label: "อินเตอร์" },
  { emoji: "💰", label: "ค่าเทอม < 15K" },
  { emoji: "✈️", label: "ฝึกงาน ตปท." },
];

export default function HeroComposer() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [phIndex, setPhIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setPhIndex((i) => (i + 1) % PLACEHOLDERS.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    setValue(el.value);
    el.style.height = "auto";
    el.style.height = Math.min(100, el.scrollHeight) + "px";
  };

  const submit = (q: string) => {
    if (!q.trim()) return;
    router.push(`/explore?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div
      className="mt-8 max-w-[580px]"
      style={{
        background: "#fff",
        borderRadius: 28,
        border: "1px solid var(--line-soft, #F0F2EB)",
        boxShadow: "0 1px 2px rgba(15,27,20,.04), 0 16px 40px -16px rgba(15,27,20,.16)",
        padding: 8,
        transition: "box-shadow 240ms, border-color 240ms",
      }}
    >
      {/* Row */}
      <div className="flex items-end gap-2">
        {/* Avatar */}
        <div
          aria-hidden="true"
          style={{
            width: 44, height: 44, borderRadius: 18, flexShrink: 0,
            background: "linear-gradient(135deg, #0A1F14, #1a3a26)",
            color: "#fff", display: "grid", placeItems: "center",
            position: "relative",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>
          </svg>
          <span
            aria-hidden="true"
            style={{
              position: "absolute", bottom: -2, right: -2,
              width: 12, height: 12, borderRadius: "50%",
              background: "var(--d-green-pop, #3DDC84)", border: "2px solid #fff",
            }}
          />
        </div>

        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={handleInput}
          placeholder={PLACEHOLDERS[phIndex]}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit(value);
            }
          }}
          aria-label="ค้นหาคณะหรือถาม KUru"
          style={{
            flex: 1, minHeight: 44, maxHeight: 100, resize: "none",
            border: "none", outline: "none", padding: "12px 8px",
            fontSize: 16, lineHeight: 1.45, background: "transparent",
            color: "var(--ink, #0A1F14)",
            fontFamily: "inherit",
          }}
        />

        <button
          type="button"
          onClick={() => submit(value)}
          aria-label="ส่ง"
          style={{
            width: 44, height: 44, borderRadius: 16, flexShrink: 0,
            background: value.trim() ? "var(--d-green, #00A651)" : "var(--ink-4, #9CA59F)",
            color: "#fff", display: "grid", placeItems: "center",
            transition: "background 220ms, box-shadow 220ms",
            boxShadow: value.trim() ? "0 4px 12px -4px rgba(0,166,81,.5)" : "none",
            border: "none", cursor: "pointer",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M7 17 17 7M9 7h8v8"/>
          </svg>
        </button>
      </div>

      {/* Chips */}
      <div className="flex flex-wrap gap-1.5 pb-1 pt-2" style={{ paddingLeft: 58 }}>
        {CHIPS.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => {
              setValue(c.label);
              textareaRef.current?.focus();
            }}
            style={{
              height: 28, padding: "0 11px", borderRadius: 999,
              background: "var(--paper, #FAFAF6)",
              border: "1px solid var(--line-soft, #F0F2EB)",
              color: "var(--ink-2, #2E3D34)",
              fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              transition: "all 180ms",
              display: "inline-flex", alignItems: "center", gap: 4,
            }}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
