import { Fragment } from "react";
import { getTranslations } from "next-intl/server";

const STEPS = [
  { n: 1, icon: "🎯", titleKey: "howItWorks.step1.title", bodyKey: "howItWorks.step1.body" },
  { n: 2, icon: "🤖", titleKey: "howItWorks.step2.title", bodyKey: "howItWorks.step2.body" },
  { n: 3, icon: "💡", titleKey: "howItWorks.step3.title", bodyKey: "howItWorks.step3.body" },
  { n: 4, icon: "✅", titleKey: "howItWorks.step4.title", bodyKey: "howItWorks.step4.body" },
] as const;

export default async function HowItWorksSection() {
  const t = await getTranslations("landing");

  return (
    <section className="text-center">
      <h2 className="text-2xl font-bold mb-2">{t("howItWorks.heading")}</h2>
      <p className="text-sm text-text-secondary mb-10">
        {t("howItWorks.subheading")}
      </p>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-center gap-0 md:gap-0">
        {STEPS.map((step, i) => (
          <Fragment key={step.n}>
            <div className="flex flex-col items-center text-center max-w-[180px] mx-auto md:mx-0">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg mb-3">
                {step.n}
              </div>
              <h3 className="font-bold text-sm mb-1">{t(step.titleKey)}</h3>
              <p className="text-xs text-text-secondary">{t(step.bodyKey)}</p>
            </div>
            {i < 3 && (
              <div className="hidden md:block h-0.5 w-12 bg-primary/20 flex-shrink-0" />
            )}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
