import type { Config } from "tailwindcss";

/* Design tokens — verified against Figma (Kids-app). Do not invent new values. */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0F0F0F",
        surface: "#171717",
        surface2: "#1C1C20",
        "surface-selected": "#2A2A2A",
        border: "#2C2C2C",
        "border-strong": "#FFFFFF",
        badge: "#282828",
        "text-primary": "#D9D9D9",
        value: "#E9E9E9",
        error: "#F0524F",
        ink: "#000000",
      },
      textColor: {
        secondary: "rgba(217,217,217,0.6)",
        tertiary: "rgba(217,217,217,0.38)",
        placeholder: "rgba(233,233,233,0.5)",
      },
      borderRadius: {
        DEFAULT: "16px",
        card: "16px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
