export const colors = {
  bruce: {
    accent: "#8b5cf6",
    accentLight: "#a78bfa",
    accentDark: "#7c3aed",
    gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
  },

  glass: {
    light: "rgba(255,255,255,0.25)",
    dark: "rgba(0,0,0,0.25)",
  },

  neu: {
    shadowLight: "#d1d1d1",
    highlightLight: "#ffffff",
    shadowDark: "#1a1a1a",
    highlightDark: "#3a3a3a",
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
} as const;

export const typography = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.875rem",
} as const;

export const borderRadius = {
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1rem",
  "3xl": "1.5rem",
  full: "9999px",
} as const;

export const animation = {
  fast: "150ms",
  normal: "300ms",
  slow: "500ms",
  spring: { type: "spring" as const, stiffness: 300, damping: 25 },
} as const;

export const zIndex = {
  dropdown: 50,
  modal: 100,
  toast: 200,
  tooltip: 300,
} as const;
