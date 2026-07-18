/* =====================================================================================
   DESIGN TOKENS — verified against Figma (Kids-app). Do not invent new values.
   Mirrors the `T` / `R` objects from reference/natal-app-prototype.jsx so the ported
   screens stay pixel-faithful. Tailwind theme (tailwind.config.ts) exposes the same
   palette as utility classes; these are used for inline styles where precise gradients,
   glows and pixel metrics are easier to keep accurate than with utilities.
   ===================================================================================== */
export const T = {
  bg: "#0F0F0F",
  surface: "#171717",
  surface2: "#1C1C20",
  surfaceInput: "#171717",
  surfaceSelected: "#2A2A2A",
  border: "rgba(255,255,255,0.07)",
  borderSubtle: "#2C2C2C",
  borderStrong: "#FFFFFF",
  textPrimary: "#D9D9D9",
  textSecondary: "rgba(217,217,217,0.6)",
  textTertiary: "rgba(217,217,217,0.38)",
  body: "rgba(217,217,217,0.82)",
  placeholder: "rgba(233,233,233,0.5)",
  value: "#E9E9E9",
  white: "#FFFFFF",
  ink: "#000000",
  error: "#F0524F",
  badge: "#282828",
  badgeText: "#B6B6BD",
} as const;

/* Radii — 16 everywhere */
export const R = {
  card: 16,
  button: 16,
  input: 16,
  chip: 16,
  tile: 16,
  back: 16,
} as const;
