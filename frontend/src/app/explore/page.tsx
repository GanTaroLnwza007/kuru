import { getTranslations } from "next-intl/server";

export default async function ExplorePage() {
  const t = await getTranslations("explore");

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-4" data-testid="explore-shell">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-text-primary">{t("title")}</h1>
        <p className="text-sm text-text-secondary">{t("emptyState")}</p>
      </header>

      <div className="rounded-card border border-surface-subtle bg-surface p-3">
        <input
          type="search"
          aria-label={t("searchPlaceholder")}
          placeholder={t("searchPlaceholder")}
          className="h-11 w-full rounded-lg border border-surface-subtle bg-background px-3 text-sm outline-none ring-primary focus:ring-2"
        />
      </div>

      <section className="rounded-card border border-surface-subtle bg-surface p-4">
        <h2 className="text-base font-semibold text-text-primary">{t("resultsTitle")}</h2>

        <div className="mt-3 space-y-3">
          <article className="rounded-xl border border-surface-subtle bg-background p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">ตัวอย่างหลักสูตรที่เกี่ยวข้อง</h3>
                <p className="mt-1 text-xs text-text-secondary">คณะตัวอย่าง</p>
              </div>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                92% match
              </span>
            </div>
          </article>

          <article className="rounded-xl border border-dashed border-surface-subtle bg-background p-3 text-sm text-text-secondary">
            {t("emptyState")}
          </article>
        </div>
      </section>
    </section>
  );
}