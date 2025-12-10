/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'boost-green': '#4a7c59',
        'boost-dark': '#2d5a27',
        'boost-light': '#7fb069',
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        boost: {
          "primary": "#4a7c59",
          "primary-content": "#ffffff",
          "secondary": "#5a9367",
          "secondary-content": "#ffffff",
          "accent": "#7fb069",
          "accent-content": "#ffffff",
          "neutral": "#6c757d",
          "neutral-content": "#ffffff",
          "base-100": "#ffffff",
          "base-200": "#f8f9fa",
          "base-300": "#dee2e6",
          "base-content": "#2c3e50",
          "info": "#5dade2",
          "info-content": "#ffffff",
          "success": "#52c41a",
          "success-content": "#ffffff",
          "warning": "#faad14",
          "warning-content": "#ffffff",
          "error": "#dc2626",
          "error-content": "#ffffff",
        }
      }
    ],
    darkTheme: "boost",
    base: true,
    styled: true,
    utils: true,
  },
}
