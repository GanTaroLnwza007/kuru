import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { apiClient } from "@/lib/api";
import { PloList } from "@/components/explore/PloList";
import { TcasRoundsCards } from "@/components/explore/TcasRoundsCards";
import { ChatAboutButton } from "@/components/explore/ChatAboutButton";

type Props = {
  params: Promise<{ programId: string }>;
};

export default async function ProgramDetailPage({ params }: Props) {
  const { programId } = await params;
  const t = await getTranslations("explore");

  let program;
  try {
    const response = await apiClient.getProgramDetail(programId);
    program = response.data;
  } catch {
    notFound();
  }

  if (!program) notFound();

  return (
    <article
      className="mx-auto flex w-full max-w-4xl flex-col gap-8"
      data-testid="explore-detail-shell"
    >
      {/* 1 — Hero header */}
      <header className="space-y-3">
        <span className="inline-block rounded-full bg-surface-subtle px-3 py-1 text-xs font-bold uppercase tracking-widest text-text-muted">
          {program.faculty_en}
        </span>
        <h1 className="text-3xl font-extrabold text-text-primary">{program.name_th}</h1>
        <p className="text-base text-text-secondary">{program.name_en}</p>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-surface-subtle px-3 py-1 text-xs font-medium text-text-muted">
            {program.degree}
          </span>
          <span className="rounded-full bg-surface-subtle px-3 py-1 text-xs font-medium text-text-muted">
            {program.campus}
          </span>
        </div>
      </header>

      {/* 2 — Year-by-year vibe */}
      {program.year_by_year_vibe && (
        <section className="rounded-2xl bg-surface-subtle p-5">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-primary">
            {t("vibeHeading")}
          </p>
          <p className="text-sm leading-relaxed text-text-primary">{program.year_by_year_vibe}</p>
        </section>
      )}

      {/* 3 — PLOs */}
      {program.plos.length > 0 && (
        <PloList heading={t("plosHeading")} items={program.plos} />
      )}

      {/* 4 — TCAS rounds */}
      {program.tcas_rounds.length > 0 && (
        <TcasRoundsCards
          heading={t("tcasHeading")}
          rounds={program.tcas_rounds}
          quotaLabel={t("tcasQuota")}
          minScoreLabel={t("tcasMinScore")}
          noScoreLabel={t("tcasNoScore")}
        />
      )}

      {/* 5 — Chat CTA */}
      <section className="rounded-2xl border border-surface-subtle bg-surface p-5">
        <p className="mb-3 text-sm text-text-secondary">{t("chatCtaDescription")}</p>
        <ChatAboutButton
          programId={program.id}
          programName={program.name_th}
          label={t("chatCtaButton", { name: program.name_th })}
        />
      </section>
    </article>
  );
}
