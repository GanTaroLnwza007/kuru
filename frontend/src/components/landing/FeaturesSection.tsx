import { getTranslations } from "next-intl/server";

export default async function FeaturesSection() {
  const t = await getTranslations("landing");

  const cards = [
    { key: "card1", icon: "⚡", bg: "bg-yellow-100" },
    { key: "card2", icon: "⚙️", bg: "bg-gray-100" },
    { key: "card3", icon: "💗", bg: "bg-pink-100" },
  ] as const;

  return (
    <section>
      <h2 className="text-2xl font-bold text-center mb-10">
        {t("features.heading")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map(({ key, icon, bg }) => (
          <div
            key={key}
            className="rounded-2xl border border-surface-subtle p-6 flex flex-col gap-3 bg-surface"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${bg}`}
            >
              {icon}
            </div>
            <h3 className="font-bold text-lg">{t(`features.${key}.title`)}</h3>
            <p className="text-sm text-text-secondary">
              {t(`features.${key}.body`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
