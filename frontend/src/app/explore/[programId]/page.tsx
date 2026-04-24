type ProgramDetailPageProps = {
  params: Promise<{
    programId: string;
  }>;
};

export default async function ProgramDetailPage({ params }: ProgramDetailPageProps) {
  const { programId } = await params;

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-4" data-testid="explore-detail-shell">
      <header className="rounded-card border border-surface-subtle bg-surface p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Program ID</p>
        <h1 className="mt-1 text-xl font-bold text-text-primary">{programId}</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Program overview, admission highlights, and skills developed will appear in this section.
        </p>
      </header>

      <section className="rounded-card border border-surface-subtle bg-surface p-4">
        <h2 className="text-base font-semibold text-text-primary">Year-by-year vibe</h2>
        <div className="mt-3 space-y-3">
          <article className="rounded-lg border border-surface-subtle bg-background p-3">
            <p className="text-xs font-semibold text-primary">Year 1</p>
            <p className="mt-1 text-sm text-text-secondary">Foundation learning and orientation placeholder.</p>
          </article>
          <article className="rounded-lg border border-surface-subtle bg-background p-3">
            <p className="text-xs font-semibold text-primary">Year 2-3</p>
            <p className="mt-1 text-sm text-text-secondary">Skill development and project work placeholder.</p>
          </article>
          <article className="rounded-lg border border-surface-subtle bg-background p-3">
            <p className="text-xs font-semibold text-primary">Year 4</p>
            <p className="mt-1 text-sm text-text-secondary">Advanced electives and capstone placeholder.</p>
          </article>
        </div>
      </section>
    </section>
  );
}