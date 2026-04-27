import { getTranslations } from "next-intl/server";

export default async function ChatPage() {
  const t = await getTranslations("chat");
  const common = await getTranslations("common");

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-4" data-testid="chat-shell">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-text-primary">{t("title")}</h1>
        <p className="text-sm text-text-secondary">{t("emptyStateDescription")}</p>
      </header>

      <article className="rounded-card border border-surface-subtle bg-surface p-4">
        <h2 className="text-base font-semibold text-text-primary">{t("emptyStateTitle")}</h2>
        <p className="mt-2 text-sm text-text-secondary">{common("empty")}</p>
      </article>

      <article className="rounded-card border border-surface-subtle bg-surface p-4" aria-live="polite">
        <div className="space-y-2">
          <div className="h-4 w-2/3 animate-pulse rounded bg-surface-subtle" />
          <div className="h-4 w-full animate-pulse rounded bg-surface-subtle" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-surface-subtle" />
        </div>
        <p className="mt-3 text-xs font-medium text-text-muted">{t("loading")}</p>
      </article>

      <article className="rounded-card border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        {t("fallbackWarning")}
      </article>

      <article className="rounded-card border border-surface-subtle bg-surface p-4">
        <h3 className="text-sm font-semibold text-text-primary">{t("sources")}</h3>
        <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-text-secondary">
          <li>Source footnotes will render here as expandable items.</li>
        </ol>
      </article>
    </section>
  );
}