import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        wine: "#72040e",   // deep wine red
        light: "#920055",  // lighter accent
        back: "#f7f7f7",   // background neutral
        switch: "#eee6e6", // subtle gray for switches/cards
      },
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui"], // body text
        display: ["Playfair Display", "serif"],          // headings
      },
    },
  },
  plugins: [],
};
export default config;
