import { getTranslations } from "next-intl/server";

export default async function RiasecPage() {
  const t = await getTranslations("riasec");

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-4" data-testid="riasec-shell">
      <header className="rounded-card border border-surface-subtle bg-surface p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          {t("step")} 1 {t("of")} 5
        </p>
        <h1 className="mt-1 text-xl font-bold text-text-primary">{t("title")}</h1>
        <p className="mt-2 text-sm text-text-secondary">{t("progressPlaceholder")}</p>
      </header>

      <section className="rounded-card border border-surface-subtle bg-surface p-4">
        <h2 className="text-sm font-semibold text-text-primary">Step 2 preview (pairwise)</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="rounded-lg border border-surface-subtle bg-background p-4 text-left text-sm font-medium text-text-primary"
          >
            Option A placeholder
          </button>
          <button
            type="button"
            className="rounded-lg border border-surface-subtle bg-background p-4 text-left text-sm font-medium text-text-primary"
          >
            Option B placeholder
          </button>
        </div>
      </section>

      <section className="rounded-card border border-surface-subtle bg-surface p-4">
        <h2 className="text-sm font-semibold text-text-primary">Step 5 preview (ranking)</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Drag-to-rank interaction mount point for value ordering.
        </p>
      </section>

      <section className="rounded-card border border-surface-subtle bg-surface p-4">
        <h2 className="text-sm font-semibold text-text-primary">Results placeholder</h2>
        <p className="mt-2 text-sm text-text-secondary">{t("resultPlaceholder")}</p>
      </section>
    </section>
  );
}