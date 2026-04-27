type KuruLogoSize = "sm" | "md" | "lg";

type KuruLogoProps = {
  size?: KuruLogoSize;
  iconOnly?: boolean;
};

const sizeMap: Record<KuruLogoSize, { iconPx: number; textClass: string }> = {
  sm: { iconPx: 20, textClass: "text-lg" },
  md: { iconPx: 28, textClass: "text-2xl" },
  lg: { iconPx: 36, textClass: "text-3xl" },
};

export default function KuruLogo({
  size = "md",
  iconOnly = false,
}: KuruLogoProps) {
  const { iconPx, textClass } = sizeMap[size];

  return (
    <span
      className="inline-flex items-center gap-1.5"
      aria-label="KUru"
    >
      <svg
        width={iconPx}
        height={iconPx}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ color: "var(--color-primary)" }}
      >
        {/* Mortarboard cap top (diamond shape) */}
        <path
          d="M12 3L22 8L12 13L2 8L12 3Z"
          fill="currentColor"
          opacity="0.15"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Board base */}
        <path
          d="M7 10.5V15.5C7 15.5 9 17.5 12 17.5C15 17.5 17 15.5 17 15.5V10.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Tassel string */}
        <path
          d="M22 8V12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Tassel ball */}
        <circle cx="22" cy="13" r="1" fill="currentColor" />
      </svg>

      {!iconOnly && (
        <span className={`${textClass} leading-none tracking-tight`}>
          <span className="font-extrabold text-primary">KU</span>
          <span className="font-bold text-primary/80">ru</span>
        </span>
      )}
    </span>
  );
}
