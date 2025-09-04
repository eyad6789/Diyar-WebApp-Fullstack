/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'diyari-primary': '#2563eb',
        'diyari-secondary': '#059669',
        'diyari-accent': '#dc2626',
        'diyari-gold': '#f59e0b',
        'diyari-dark': '#1f2937',
        'diyari-light': '#f8fafc',
      },
      fontFamily: {
        'arabic': ['Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    },
  },
  plugins: [],
}
