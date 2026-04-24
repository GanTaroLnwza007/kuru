import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function HeroSection() {
  const t = await getTranslations("landing");

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      {/* Left column */}
      <div>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight break-words">
          {t("hero.headline")}
        </h1>

        <form action="/explore" method="GET" className="mt-6 relative" role="search">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none select-none">
            🔍
          </span>
          <input
            name="q"
            type="search"
            placeholder={t("hero.searchPlaceholder")}
            className="w-full rounded-full border border-surface-subtle bg-surface pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </form>

        <Link
          href="/riasec"
          className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-strong min-h-[44px]"
        >
          {t("hero.cta")}
        </Link>
      </div>

      {/* Right column: decorative placeholder */}
      <div
        className="w-full aspect-[4/3] rounded-2xl bg-surface-subtle flex items-center justify-center"
        aria-hidden="true"
      >
        <span className="text-8xl">🎓</span>
      </div>
    </section>
  );
}
