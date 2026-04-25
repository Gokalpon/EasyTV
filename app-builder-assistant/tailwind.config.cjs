/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Manrope", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      },
      boxShadow: {
        glass: "0 18px 48px rgba(0, 0, 0, 0.45)",
        glow: "0 0 0 1px rgba(255, 255, 255, 0.07), 0 0 24px rgba(56, 189, 248, 0.2)"
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "0.65", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.02)" }
        },
        "flow-in": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "pulse-soft": "pulse-soft 1.8s ease-in-out infinite",
        "flow-in": "flow-in 0.55s ease forwards"
      }
    }
  },
  plugins: []
};
