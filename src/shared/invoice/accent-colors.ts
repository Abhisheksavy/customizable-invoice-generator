/** Curated invoice accents; each passes WCAG AA contrast on white and on its own tint. */
export const ACCENT_COLORS = {
  ink: { label: "Ink", hex: "#2E4BDB", tint: "#EEF1FC" },
  forest: { label: "Forest", hex: "#1E6B4F", tint: "#EDF3F1" },
  clay: { label: "Clay", hex: "#B4441F", tint: "#F9F0ED" },
  plum: { label: "Plum", hex: "#7A2E79", tint: "#F4EEF4" },
  ocean: { label: "Ocean", hex: "#0D6680", tint: "#ECF3F5" },
  graphite: { label: "Graphite", hex: "#2F2E2B", tint: "#EEEEEE" },
} as const;

export type AccentColor = keyof typeof ACCENT_COLORS;

export const ACCENT_COLOR_KEYS = Object.keys(ACCENT_COLORS) as [AccentColor, ...AccentColor[]];

export const DEFAULT_ACCENT_COLOR: AccentColor = "ink";
