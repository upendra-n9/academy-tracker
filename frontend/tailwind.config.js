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
        pitch: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        grass: "#1a6b3c",
        turf: "#0d4a28",
        chalk: "#f8fafc",
        kit: {
          red: "#dc2626",
          amber: "#d97706",
          green: "#16a34a",
          blue: "#1d4ed8",
        },
      },
      fontFamily: {
        display: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "pitch-gradient": "linear-gradient(135deg, #0d4a28 0%, #1a6b3c 50%, #166534 100%)",
        "card-gradient": "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
      },
    },
  },
  plugins: [],
};
