/** @type {import('tailwindcss').Config} */
export default {  
  content: [
    "./src/themes/classic/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  // Use selector strategy for better theme isolation
  important: '.theme-classic',
  theme: {
    extend: {
      colors: {
        // Light theme (AgriAI style)
        agri: {
          green: '#16a34a',
          greenLight: '#22d3ee',
          card: '#ffffff',
          border: '#e5e7eb',
          accent: '#10b981',
        },
      },
      backgroundImage: {
        'hero-light': 'linear-gradient(180deg, #16a34a 0%, #22d3ee 100%)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
