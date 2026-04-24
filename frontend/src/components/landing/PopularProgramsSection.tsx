import Link from "next/link";
import { getTranslations } from "next-intl/server";
import HeartButton from "./HeartButton";

const STUB_PROGRAMS = [
  {
    id: "ske",
    name: "วิศวกรรมคอมพิวเตอร์",
    faculty: "FACULTY OF ENGINEERING",
    description: "นักศึกษาเขียนโปรแกรมและทำความเข้าใจเกี่ยวกับวิศวกรรมไฟฟ้า",
    match: 98,
  },
  {
    id: "dmd",
    name: "ดิจิทัลมีเดีย",
    faculty: "ARCHITECTURE",
    description: "สร้างสรรค์และออกแบบสื่อดิจิทัลและแอนิเมชันขั้นสูง",
    match: 92,
  },
  {
    id: "ba",
    name: "บริหารธุรกิจ",
    faculty: "BUSINESS ADMIN",
    description: "การบริหารองค์กรและความสัมพันธ์ทางธุรกิจเพื่อความสำเร็จ",
    match: 85,
  },
  {
    id: "hum",
    name: "อักษรศาสตร์",
    faculty: "HUMANITIES",
    description: "งานค้นคว้าด้านภาษา วรรณกรรม และการสื่อสารข้ามวัฒนธรรม",
    match: 79,
  },
] as const;

export default async function PopularProgramsSection() {
  const t = await getTranslations("landing");

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">{t("programs.heading")}</h2>
          <p className="text-sm text-text-secondary mt-1">
            {t("programs.subheading")}
          </p>
        </div>
        <Link
          href="/explore"
          className="text-sm font-semibold text-primary hover:underline shrink-0 ml-4"
        >
          {t("programs.viewAll")}
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
        {STUB_PROGRAMS.map((p) => (
          <Link
            key={p.id}
            href={`/explore/${p.id}`}
            className="relative min-w-[240px] snap-start rounded-2xl border border-surface-subtle bg-surface flex flex-col hover:shadow-md transition-shadow"
          >
            {/* Image placeholder area */}
            <div className="relative">
              <div
                className="h-36 bg-surface-subtle rounded-t-2xl flex items-center justify-center text-4xl"
                aria-hidden="true"
              >
                📚
              </div>
              {/* Match badge */}
              <span className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                {t("programs.match", { pct: p.match })}
              </span>
              {/* Heart button */}
              <HeartButton />
            </div>

            <div className="p-4">
              <h3 className="font-bold">{p.name}</h3>
              <p className="text-sm text-text-secondary line-clamp-2 mt-1">
                {p.description}
              </p>
              <p className="text-xs text-text-secondary mt-2 uppercase tracking-wide">
                {p.faculty}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
