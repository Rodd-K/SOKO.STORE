/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#EEF1F6",
          100: "#D6DCE8",
          400: "#3C4F77",
          700: "#22345C",
          800: "#1B2A4A",
          900: "#131F38",
        },
        marigold: {
          400: "#F0BD63",
          500: "#E8A93E",
          600: "#CC9024",
        },
        ink: "#14181F",
        surface: "#F4F5F7",
        stock: "#2F8F5B",
        sale: "#D64545",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      maxWidth: {
        content: "1200px",
      },
    },
  },
  plugins: [],
};
