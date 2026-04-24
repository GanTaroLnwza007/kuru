"use client";

export default function HeartButton() {
  return (
    <button
      type="button"
      aria-label="บันทึก"
      className="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-base shadow-sm transition-colors hover:bg-white hover:text-red-500"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      🤍
    </button>
  );
}
