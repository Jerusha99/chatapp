import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bruce: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
        glass: {
          light: "rgba(255,255,255,0.25)",
          dark: "rgba(0,0,0,0.25)",
        },
        neu: {
          light: "#e8e8e8",
          dark: "#2a2a2a",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      backdropBlur: {
        xs: "2px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "neu-light": "8px 8px 16px #d1d1d1, -8px -8px 16px #ffffff",
        "neu-dark": "8px 8px 16px #1a1a1a, -8px -8px 16px #3a3a3a",
        "neu-pressed-light": "inset 4px 4px 8px #d1d1d1, inset -4px -4px 8px #ffffff",
        "neu-pressed-dark": "inset 4px 4px 8px #1a1a1a, inset -4px -4px 8px #3a3a3a",
      },
    },
  },
  plugins: [],
};

export default config;
