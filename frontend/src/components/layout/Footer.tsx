import KuruLogo from "@/components/ui/KuruLogo";

export default function Footer() {
  return (
    <footer className="border-t border-surface-subtle bg-surface-subtle py-10 px-4">
      <div className="mx-auto max-w-[1280px] grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Logo + tagline */}
        <div>
          <KuruLogo size="sm" />
          <p className="text-sm text-text-secondary mt-2 leading-relaxed">
            เครื่องมือแนะแนวการศึกษาอัจฉริยะที่จะช่วยให้คุณค้นพบ
            ศักยภาพที่ซ่อนอยู่ และคณะที่เหมาะกับคุณที่สุดในรั้วนนทรี
          </p>
        </div>

        {/* Center: Useful links */}
        <div>
          <h3 className="font-bold mb-3">ลิ้งค์ที่เป็นประโยชน์</h3>
          <ul className="flex flex-col gap-2 text-sm text-text-secondary">
            <li>
              <span>Team Members &amp; IDs</span>
            </li>
            <li>
              <span>Advisor Information</span>
            </li>
            <li>
              <span>Faculty of Engineering</span>
            </li>
          </ul>
        </div>

        {/* Right: Social / follow */}
        <div>
          <h3 className="font-bold mb-3">ติดตามข่าวสาร</h3>
          <div className="flex gap-3">
            <button
              type="button"
              aria-label="รางวัล"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-surface-subtle bg-surface text-lg text-text-secondary transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              🏆
            </button>
            <button
              type="button"
              aria-label="แชร์"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-surface-subtle bg-surface text-lg text-text-secondary transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              ↗
            </button>
            <button
              type="button"
              aria-label="อีเมล"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-surface-subtle bg-surface text-lg text-text-secondary transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              ✉
            </button>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="mx-auto max-w-[1280px] border-t border-surface-subtle mt-8 pt-4 text-center text-sm text-text-secondary">
        © 2026 KUru Academic Advisor - Senior Project
      </div>
    </footer>
  );
}
