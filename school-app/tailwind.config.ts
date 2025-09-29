// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#121212",       // Main dark background
        secondary: "#1E1E1E",     // Slightly lighter background
        accentPurple: "#BB86FC",  // Primary accent / buttons
        accentTeal: "#03DAC6",    // Secondary accent / highlights
        lightGray: "#E0E0E0",     // Backgrounds / borders
        error: "#CF6679",          // Errors and warnings
        deepPurple: "#7E48CC",    // For headings / emphasis
      },
      fontFamily: {
        sans: ["var(--font-lexend)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-lexend)", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
