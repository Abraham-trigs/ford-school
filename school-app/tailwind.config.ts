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
        background: "#121212",        // previously deepest
        surface: "#1E1E1E",           // previously deepest0
        primary: "#BB86FC",            // previously accentPurple
        secondary: "#03DAC6",          // previously greener
        muted: "#cecece",              // previously lightGray
        danger: "#CF6679",             // previously error
        purple: "#7E48CC",             // same, can use semantic if needed
        purpleBright: "#ae00ff",       // previously purple0
        deepPurple: "#2a004b",         // previously deeper
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
