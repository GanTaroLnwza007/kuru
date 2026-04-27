import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function CtaBannerSection() {
  const t = await getTranslations("landing");

  return (
    <section className="rounded-2xl bg-primary px-6 py-16 text-center text-white">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 leading-snug">
        {t("cta.headline")}
      </h2>
      <Link
        href="/riasec"
        className="inline-flex items-center rounded-full bg-white px-8 py-3 text-sm font-bold text-primary hover:bg-white/90 transition-colors min-h-[44px]"
      >
        {t("cta.button")}
      </Link>
    </section>
  );
}
