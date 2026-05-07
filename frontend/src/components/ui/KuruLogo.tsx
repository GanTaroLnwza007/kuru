type KuruLogoSize = "sm" | "md" | "lg";

type KuruLogoProps = {
  size?: KuruLogoSize;
  iconOnly?: boolean;
  /** "dark" uses ink background (default), "light" uses white */
  variant?: "dark" | "light";
};

const sizeMap: Record<KuruLogoSize, { markPx: number; textClass: string; radiusPx: number }> = {
  sm: { markPx: 24, textClass: "text-lg",  radiusPx: 7  },
  md: { markPx: 32, textClass: "text-xl",  radiusPx: 10 },
  lg: { markPx: 40, textClass: "text-2xl", radiusPx: 12 },
};

export default function KuruLogo({
  size = "md",
  iconOnly = false,
  variant = "dark",
}: KuruLogoProps) {
  const { markPx, textClass, radiusPx } = sizeMap[size];
  const markBg = variant === "dark" ? "var(--ink, #0A1F14)" : "#fff";
  const markText = variant === "dark" ? "#fff" : "var(--ink, #0A1F14)";
  const logoText = variant === "dark" ? "var(--ink, #0A1F14)" : "#fff";

  return (
    <span className="inline-flex items-center gap-2.5" aria-label="KUru">
      {/* Logo mark: dark rounded square with italic "K" */}
      <span
        style={{
          width: markPx,
          height: markPx,
          borderRadius: radiusPx,
          background: markBg,
          color: markText,
          display: "grid",
          placeItems: "center",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        {/* green-pop radial glow */}
        <span
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 30% 30%, var(--d-green-pop, #3DDC84) 0%, transparent 60%)",
            opacity: 0.8,
          }}
        />
        <span
          style={{
            position: "relative",
            fontFamily: "var(--font-serif, 'Source Serif 4', Georgia, serif)",
            fontStyle: "italic",
            fontSize: markPx * 0.56,
            lineHeight: 1,
            fontWeight: 400,
          }}
        >
          K
        </span>
      </span>

      {!iconOnly && (
        <span
          className={`${textClass} font-extrabold leading-none tracking-tight font-display`}
          style={{ color: logoText }}
        >
          KUru
        </span>
      )}
    </span>
  );
}
