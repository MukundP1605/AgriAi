/** @type {import('tailwindcss').Config} */
export default {  
  content: [
    "./src/themes/futuristic/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  // Use selector strategy for better theme isolation
  important: '.theme-futuristic',
  theme: {
    extend: {
      colors: {
        // Dark theme (Futuristic/Apple style)
        dark: {
          bg: '#121212',
          elevated: '#1e1e1e',
          card: '#23272f',
          border: '#333333',
          accent: '#8b5cf6', // purple
          accent2: '#10b981', // emerald
          glass: 'rgba(30,30,30,0.85)',
        },
        // Neon and glassy accent colors
        neon: {
          pink: '#ec4899',
          purple: '#8b5cf6',
          emerald: '#10b981',
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(139,92,246,0.12), 0 1.5px 8px 0 rgba(16,185,129,0.10)',
        'neon': '0 0 24px 0 rgba(139,92,246,0.18), 0 0 8px 0 rgba(16,185,129,0.10)',
      },
      backgroundImage: {
        'hero-dark': 'radial-gradient(ellipse at top, #8b5cf6 0%, #121212 80%)',
        'aurora': 'radial-gradient(circle at 50% 0, rgba(236,72,153,0.18) 0%, transparent 80%)',
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
