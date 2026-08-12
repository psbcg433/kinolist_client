/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cinema: {
          bg: '#0b0d12',
          surface: '#141821',
          surface2: '#1c2230',
          border: '#2a3244',
          text: '#e6e9f0',
          muted: '#9aa4bb',
          accent: '#e50914',
          accent2: '#f5c518',
        },
      },
    },
  },
  plugins: [],
};
