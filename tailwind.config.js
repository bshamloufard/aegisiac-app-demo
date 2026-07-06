/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        aegis: {
          bg: "rgb(var(--aegis-bg) / <alpha-value>)",
          elevated: "rgb(var(--aegis-bg-elevated) / <alpha-value>)",
          solid: "rgb(var(--aegis-bg-solid) / <alpha-value>)",
          surface: "rgb(var(--aegis-surface) / <alpha-value>)",
          border: "rgb(var(--aegis-border) / <alpha-value>)",
          "border-strong": "rgb(var(--aegis-border-strong) / <alpha-value>)",
          text: "rgb(var(--aegis-text) / <alpha-value>)",
          "text-soft": "rgb(var(--aegis-text-soft) / <alpha-value>)",
          "text-muted": "rgb(var(--aegis-text-muted) / <alpha-value>)",
          "text-faint": "rgb(var(--aegis-text-faint) / <alpha-value>)",
          accent: "rgb(var(--aegis-accent) / <alpha-value>)",
          blue: "rgb(var(--aegis-accent-blue) / <alpha-value>)",
          success: "rgb(var(--aegis-accent-success) / <alpha-value>)",
          danger: "rgb(var(--aegis-accent-danger) / <alpha-value>)",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
    },
  },
  plugins: [],
}
