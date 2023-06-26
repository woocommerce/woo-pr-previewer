/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        "woo-purple-50": "#7F54B3",
        "woo-purple-80": "#3C2861",
        "wp-blueberry-1": "#3858e9",
        "wp-blueberry-2": "#7b90ff",
        "wp-blueberry-3": "#c7d1ff",
        "wp-blueberry-4": "#eff2ff",
        "wp-blueberry-5": "#e26f56",
        "wp-blueberry-6": "#ffb7a7",
        "wp-blueberry-7": "#ff39de",
      },
    },
  },
  plugins: [],
};
