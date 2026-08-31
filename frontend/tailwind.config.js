/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#006AFF",
        secondary: "#001B3B",
        accent: "#E6F0FF",
        // Minimal shadcn/ui token set — just what components/ui/chart.tsx
        // needs (muted-foreground for axis text, border for gridlines,
        // background for the tooltip surface). This site is light-only, so
        // only :root values are defined; shadcn's dark-mode selector in that
        // component is inert here, which is fine.
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        "muted-foreground": "var(--muted-foreground)",
      },
    },
  },
  plugins: [],
};
