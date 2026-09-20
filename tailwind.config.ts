import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        nine: {
          bg: "#08080a",
          surface: "#0e0e12",
          elevated: "#15151c",
          card: "#181822",
          border: "#262633",
          borderHighlight: "#3f3f52",
          text: "#f4f4f7",
          muted: "#888899",
          dim: "#4e4e61",
          green: "#00ff66",
          greenMuted: "#0d3b1e",
          greenGlow: "rgba(0, 255, 102, 0.15)",
          red: "#ff3344",
          redDark: "#520c13",
          redGlow: "rgba(255, 51, 68, 0.15)",
          yellow: "#eab308",
          gold: "#ffd700",
          amber: "#f59e0b",
        },
      },
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "marquee": "marquee 32s linear infinite",
        "marquee-fast": "marquee 18s linear infinite",
        "glitch": "glitch 0.4s ease-in-out",
        "scanline": "scanline 8s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        glitch: {
          "0%, 100%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-1px, -2px)" },
          "60%": { transform: "translate(2px, 1px)" },
          "80%": { transform: "translate(1px, -1px)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
