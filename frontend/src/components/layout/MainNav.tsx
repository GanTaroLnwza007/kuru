"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { cn } from "@/lib/cn";
import KuruLogo from "@/components/ui/KuruLogo";

type NavItem = {
  href: string;
  label: string;
};

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function MainNav() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { href: "/", label: t("home") },
    { href: "/explore", label: t("explore") },
    { href: "/riasec", label: t("riasec") },
    { href: "/portfolio", label: t("portfolio") },
    { href: "/chat", label: t("chat") },
  ];

  const nextLocale = locale === "th" ? "en" : "th";

  const handleLocaleToggle = () => {
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  };

  return (
    <nav className="flex h-full w-full items-center justify-between gap-3">
      <div className="flex min-w-0 flex-1 items-center">
        <Link href="/" aria-label="KUru Home">
          <KuruLogo size="md" />
        </Link>
      </div>

      <div className="hidden flex-1 items-center justify-center gap-7 md:flex">
        {navItems.map((item) => {
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative pb-1 text-sm font-semibold transition-colors",
                active
                  ? "text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-1 items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleLocaleToggle}
          className="inline-flex items-center rounded-full border border-surface-subtle px-3 py-2 text-xs font-semibold text-text-secondary transition-colors hover:border-primary hover:text-primary"
        >
          {nextLocale.toUpperCase()}
        </button>

        <button
          type="button"
          className="hidden rounded-full border border-surface-subtle px-3 py-2 text-xs font-semibold text-text-secondary transition-colors hover:border-primary hover:text-primary md:inline-flex"
        >
          {t("profile")}
        </button>

        <button
          type="button"
          className="inline-flex rounded-full border border-surface-subtle px-3 py-2 text-xs font-semibold text-text-secondary transition-colors hover:border-primary hover:text-primary md:hidden"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-main-nav"
        >
          {t("menu")}
        </button>
      </div>

      {mobileMenuOpen ? (
        <div
          id="mobile-main-nav"
          className="absolute left-0 top-[var(--navbar-height)] z-40 w-full border-b border-surface-subtle bg-surface px-4 py-3 md:hidden"
        >
          <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-1">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "rounded-lg px-3 py-3 text-sm font-semibold",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </nav>
  );
}