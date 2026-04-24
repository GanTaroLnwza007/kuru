import { getTranslations } from "next-intl/server";

export default async function PortfolioPage() {
  const t = await getTranslations("portfolio");

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-4" data-testid="portfolio-shell">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-text-primary">{t("title")}</h1>
        <p className="text-sm text-text-secondary">
          Criterion-by-criterion gap report will be rendered in this route.
        </p>
      </header>

      <section className="rounded-card border border-surface-subtle bg-surface p-4">
        <h2 className="text-sm font-semibold text-text-primary">{t("uploadPlaceholder")}</h2>
        <form className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
          <textarea
            rows={5}
            placeholder="Paste portfolio details..."
            className="w-full rounded-lg border border-surface-subtle bg-background p-3 text-sm outline-none ring-primary focus:ring-2"
          />
          <button
            type="button"
            className="h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            Analyze
          </button>
        </form>
      </section>

      <section className="rounded-card border border-surface-subtle bg-surface p-4" aria-live="polite">
        <h2 className="text-sm font-semibold text-text-primary">Async status</h2>
        <p className="mt-2 text-sm text-text-secondary">{t("statusPlaceholder")}</p>
        <p className="mt-1 text-xs text-text-muted">Polling target: /api/v1/portfolio/status every 2 seconds when in progress.</p>
      </section>
    </section>
  );
}