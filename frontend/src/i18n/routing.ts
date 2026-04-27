import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["th", "en"],
  defaultLocale: "th",
  localePrefix: "never",
  localeDetection: true,
});

export type AppLocale = (typeof routing.locales)[number];