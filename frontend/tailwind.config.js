/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Near-black with an olive cast, so the lime reads as part of the
        // same family rather than sitting on top of neutral grey.
        void: "#0A0C07",
        ink: {
          900: "#10130C",
          800: "#161A10",
          700: "#1E2416",
          600: "#2A311F",
        },
        line: "#28301C",
        ash: {
          500: "#6F7A61",
          400: "#98A288",
          200: "#D7DCCD",
        },
        bone: "#F4F7EC",
        lime: {
          DEFAULT: "#C9F73E",
          600: "#B2DE2A",
          700: "#95BC1E",
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      screens: { xs: "480px", sm: "768px", md: "1060px", lg: "1280px" },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        drift: "drift 5s ease-in-out infinite",
        marquee: "marquee 32s linear infinite",
      },
    },
  },
  plugins: [],
};
