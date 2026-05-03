import type { TcasRound } from "@/lib/api";

type Props = {
  heading: string;
  rounds: TcasRound[];
  minScoreLabel: string;
  quotaLabel: string;
  noScoreLabel: string;
};

export function TcasRoundsCards({
  heading,
  rounds,
  minScoreLabel,
  quotaLabel,
  noScoreLabel,
}: Props) {
  return (
    <section>
      <h2 className="text-lg font-bold text-text-primary">{heading}</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {rounds.map((round, index) => (
          <div
            key={round.round}
            className="flex flex-col gap-2 rounded-card bg-surface p-4 shadow-sm"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-primary-foreground"
              style={{ background: "linear-gradient(135deg, #006b32 0%, #008740 100%)" }}
            >
              {index + 1}
            </div>
            <p className="font-semibold text-text-primary text-sm leading-snug">{round.round}</p>
            <div className="mt-auto space-y-1 text-xs text-text-secondary">
              <p>
                <span className="font-medium text-text-muted">{quotaLabel}: </span>
                {round.quota}
              </p>
              <p>
                <span className="font-medium text-text-muted">{minScoreLabel}: </span>
                {round.min_score != null ? round.min_score : noScoreLabel}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
