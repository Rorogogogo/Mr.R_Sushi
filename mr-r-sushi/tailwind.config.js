/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sushi-red': '#8B0000',
        'sushi-gold': '#D4AF37',
        'sushi-black': '#121212',
        'sushi-light': '#F5F5F5',
        'sushi-accent': '#E83A14',
        'sushi-neutral': '#2D2D2D',
      },
      fontFamily: {
        'sans': ['"Be Vietnam Pro"', 'Poppins', 'sans-serif'],
        'display': ['"Noto Serif JP"', 'Playfair Display', 'serif'],
        'accent': ['Montserrat', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'pulse-subtle': 'pulseSubtle 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.85 },
        },
      },
      screens: {
        'xs': '480px',
      },
    },
  },
  plugins: [],
} 