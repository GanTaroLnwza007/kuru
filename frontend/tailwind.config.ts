import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "var(--ink)",
          2: "var(--ink-2)",
          3: "var(--ink-3)",
          4: "var(--ink-4)",
        },
        paper: "var(--paper)",
        cream: { DEFAULT: "var(--cream)", 2: "var(--cream-2)" },
        line: { DEFAULT: "var(--line)", soft: "var(--line-soft)" },
        dgreen: {
          DEFAULT: "var(--d-green)",
          deep: "var(--d-green-deep)",
          soft: "var(--d-green-soft)",
          pop: "var(--d-green-pop)",
        },
        peach: { DEFAULT: "var(--d-peach)", soft: "var(--d-peach-soft)" },
        rust: "var(--d-rust)",
        sky: { DEFAULT: "var(--d-sky)", soft: "var(--d-sky-soft)" },
        primary: {
          DEFAULT: "var(--kuru-color-primary)",
          strong: "var(--kuru-color-primary-strong)",
          foreground: "var(--kuru-color-primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--kuru-color-secondary)",
          foreground: "var(--kuru-color-secondary-foreground)",
        },
        surface: {
          DEFAULT: "var(--kuru-surface-card)",
          base: "var(--kuru-surface-base)",
          muted: "var(--kuru-surface-muted)",
          subtle: "var(--kuru-surface-subtle)",
        },
        text: {
          primary: "var(--kuru-text-primary)",
          secondary: "var(--kuru-text-secondary)",
          muted: "var(--kuru-text-muted)",
          inverse: "var(--kuru-text-inverse)",
        },
        success: "var(--kuru-status-success)",
        warning: "var(--kuru-status-warning)",
        danger: "var(--kuru-status-danger)",
        info: "var(--kuru-status-info)",
      },
      spacing: {
        touch: "44px",
        "navbar-height": "var(--navbar-height)",
        section: "clamp(1rem, 2vw, 2rem)",
      },
      fontFamily: {
        sans: ["var(--font-kuru-thai)", "Sarabun", "Noto Sans Thai", "sans-serif"],
        thai: ["var(--font-kuru-thai)", "Sarabun", "Noto Sans Thai", "sans-serif"],
        en: ["var(--font-kuru-en)", "Inter", "Segoe UI", "sans-serif"],
        heading: ["var(--font-kuru-thai)", "Sarabun", "Noto Sans Thai", "sans-serif"],
        mono: ["var(--font-kuru-en)", "Inter", "monospace"],
        display: ["var(--font-display)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Source Serif 4", "Georgia", "serif"],
      },
      boxShadow: {
        "navbar-soft": "var(--navbar-shadow)",
      },
      backdropBlur: {
        navbar: "var(--navbar-blur-strength)",
      },
      borderRadius: {
        card: "1rem",
      },
    },
  },
  plugins: [],
};

export default config;