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