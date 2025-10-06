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
        deepest: "#121212",       
        deepest0: "#1E1E1E",    
        accentPurple: "#BB86FC",  
        greener: "#03DAC6",    
        lightGray: "#cecece",     
        error: "#CF6679",         
        purple: "#7E48CC",   
        purple0: '#ae00ff',
        deeper: "#2a004b"
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
