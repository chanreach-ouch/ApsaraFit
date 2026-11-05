import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#fbf8eb",
          100: "#f5eecb",
          200: "#eddba1",
          300: "#e4c36e",
          400: "#dcaa40",
          500: "#ca9126",
          600: "#ae731d",
          700: "#8b531a",
          800: "#73421c",
          900: "#60371c",
          950: "#371c0c",
        },
        silk: {
          50: "#faf7f5",
          100: "#f3ece6",
          200: "#e7d9ce",
          300: "#d7beae",
          400: "#c39e8a",
          500: "#b5836d",
          600: "#a6715b",
          700: "#8a5c4b",
          800: "#714d40",
          900: "#5d4138",
        },
        khmer: {
          ruby: "#9b111e",
          emerald: "#097969",
          indigo: "#1a2a44",
          copper: "#b87333",
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        khmer: ["var(--font-khmer)", "Hanuman", "Kantumruy Pro", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
