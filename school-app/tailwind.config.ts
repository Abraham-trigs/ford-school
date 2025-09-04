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
        wine: "#72040e",
        light: "#920055",
        back: "#dee4ea",
        switch: "#eee6e6",
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
