/**
 * PLACEHOLDER design tokens.
 *
 * Nothing in this file is a final brand decision — it exists only so apps
 * can wire up a token import path before Ailam defines the real design
 * system (colour, type, spacing, motion). Replace the values, not the shape,
 * unless the real system needs a different shape too.
 */

export const colors = {
  // Neutral grayscale only. No brand colour has been chosen yet.
  neutral: {
    0: "#ffffff",
    100: "#f5f5f5",
    300: "#d4d4d4",
    500: "#737373",
    700: "#404040",
    900: "#171717",
  },
} as const;

export const spacing = {
  // Generic 4px scale, standard placeholder — not a final system.
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  6: "1.5rem",
  8: "2rem",
  12: "3rem",
} as const;

export const typography = {
  // System font stack placeholder — no brand typeface chosen yet.
  fontFamily: {
    sans: "ui-sans-serif, system-ui, -apple-system, sans-serif",
  },
} as const;

export type DesignTokens = {
  colors: typeof colors;
  spacing: typeof spacing;
  typography: typeof typography;
};

export const tokens: DesignTokens = { colors, spacing, typography };
