"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { cn } from "@/lib/cn";
import KuruLogo from "@/components/ui/KuruLogo";

type NavItem = { href: string; label: string };

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function MainNav() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const navItems: NavItem[] = [
    { href: "/explore",    label: t("explore") },
    { href: "/riasec",     label: t("riasec") },
    { href: "/portfolio",  label: t("portfolio") },
    { href: "/chat",       label: t("chat") },
  ];

  const nextLocale = locale === "th" ? "en" : "th";
  const handleLocaleToggle = () => {
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  };

  return (
    <nav className="flex h-full w-full items-center justify-between gap-4">
      {/* Brand */}
      <Link href="/" aria-label="KUru Home" className="shrink-0">
        <KuruLogo size="md" />
      </Link>

      {/* Center links */}
      <div className="hidden flex-1 items-center justify-center gap-7 md:flex">
        {navItems.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "font-display relative pb-1 text-sm font-semibold transition-colors",
                active
                  ? "text-ink after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-dgreen"
                  : "text-ink-3 hover:text-ink"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Right CTAs */}
      <div className="flex items-center gap-2">
        {/* Ask AI — desktop */}
        <Link
          href="/chat"
          className="hidden h-9 items-center gap-1.5 rounded-full border border-ink bg-white px-4 font-display text-sm font-bold text-ink transition-all hover:-translate-y-px hover:border-ink/70 hover:shadow-sm md:inline-flex"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.5A8 8 0 1 1 21 12z"/>
          </svg>
          ถาม AI
        </Link>

        {/* Language toggle — desktop */}
        <button
          type="button"
          onClick={handleLocaleToggle}
          className="hidden h-9 items-center gap-1.5 rounded-full border border-ink bg-white px-3 font-display text-sm font-bold text-ink transition-all hover:-translate-y-px hover:border-ink/70 hover:shadow-sm sm:inline-flex"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>
          </svg>
          {locale.toUpperCase()}
        </button>

        {/* Ask AI — mobile */}
        <Link
          href="/chat"
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ink bg-white px-3 font-display text-xs font-bold text-ink md:hidden"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.5A8 8 0 1 1 21 12z"/>
          </svg>
          AI
        </Link>

        {/* Hamburger — mobile */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 items-center rounded-full border border-line px-3 font-display text-xs font-semibold text-ink-3 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {t("menu")}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          id="mobile-nav"
          className="absolute left-0 top-[72px] z-40 w-full border-b border-line bg-paper/95 px-4 py-3 backdrop-blur-sm md:hidden"
        >
          <div className="mx-auto flex max-w-[1320px] flex-col gap-1">
            {[{ href: "/", label: t("home") }, ...navItems].map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-xl px-3 py-2.5 text-sm font-semibold font-display",
                    active ? "bg-dgreen-soft text-dgreen-deep" : "text-ink-2 hover:bg-line-soft"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
