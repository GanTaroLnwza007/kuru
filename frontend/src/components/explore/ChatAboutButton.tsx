"use client";

import { useRouter } from "next/navigation";

type Props = {
  programId: string;
  programName: string;
  label: string;
};

export function ChatAboutButton({ programId, programName, label }: Props) {
  const router = useRouter();

  function handleClick() {
    const params = new URLSearchParams({
      program_id: programId,
      program_name: programName,
    });
    router.push(`/chat?${params.toString()}`);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex min-h-[44px] items-center gap-2 rounded-card px-6 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      style={{ background: "linear-gradient(135deg, #006b32 0%, #008740 100%)" }}
    >
      💬 {label}
    </button>
  );
}
