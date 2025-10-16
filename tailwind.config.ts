import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        inverse: "var(--color-inverse)",
        secondary: "var(--color-secondary)",
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        third: "var(--color-third)",
        lightBorder: "var(--color-lightBorder)",
        lightPrimary: "var(--color-lightPrimary)",
        lightBackground: "var(--color-lightBackground)",
        colorBorder: "var(--color-colorBorder)",
      },
    },
  },
  plugins: [],
};

export default config;
