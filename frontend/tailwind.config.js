/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./sites/**/*.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        dash: {
          bg: "#090909",
          sidebar: "#0d0e10",
          surface: "#111213",
          hover: "#161719",
          active: "#1c1e22",
          border: "#1e2025",
          muted: "#6b7280",
          ink: "#e5e7eb",
          accent: "#06b6d4",
          positive: "#10b981",
        },
      },
      borderRadius: {
        dash: "0.5rem",
      },
      boxShadow: {
        dash: "0 1px 2px rgba(0, 0, 0, 0.4)",
      },
    },
  },
  plugins: [],
};
