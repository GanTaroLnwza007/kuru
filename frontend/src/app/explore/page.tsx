"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { apiClient } from "@/lib/api";
import type { ProgramSummary } from "@/lib/api";
import { ProgramSearchBar } from "@/components/explore/ProgramSearchBar";
import { ProgramCard } from "@/components/explore/ProgramCard";

export default function ExplorePage() {
  const t = useTranslations("explore");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProgramSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.searchPrograms({ q: query });
        if (!cancelled) setResults(response.data.results);
      } catch {
        if (!cancelled) setError(t("errorFetch"));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [query, t]);

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6" data-testid="explore-shell">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-text-primary">{t("title")}</h1>
        <p className="text-sm text-text-secondary">{t("subtitle")}</p>
      </header>

      <ProgramSearchBar placeholder={t("searchPlaceholder")} onSearch={setQuery} />

      {error && (
        <p className="rounded-card border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
          {error}
        </p>
      )}

      {isLoading ? (
        <ul className="grid gap-3 sm:grid-cols-2" aria-busy="true" aria-label={t("loading")}>
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="h-32 animate-pulse rounded-card bg-surface-subtle" />
          ))}
        </ul>
      ) : results.length === 0 ? (
        <div className="rounded-card border border-dashed border-surface-subtle p-8 text-center">
          <p className="text-sm text-text-muted">{t("emptyState")}</p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {results.map((program) => (
            <li key={program.id}>
              <ProgramCard program={program} ctaLabel={t("cardCta")} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
