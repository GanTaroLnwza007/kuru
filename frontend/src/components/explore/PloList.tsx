import type { PloItem } from "@/lib/api";

type Props = {
  heading: string;
  items: PloItem[];
};

export function PloList({ heading, items }: Props) {
  return (
    <section>
      <h2 className="text-lg font-bold text-text-primary">{heading}</h2>
      <ol className="mt-3 space-y-2">
        {items.map((plo, index) => (
          <li key={plo.code} className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {index + 1}
            </span>
            <p className="text-sm text-text-secondary">{plo.description_th}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
