/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern neutral palette inspired by Qitchen
        'modern-black': '#0A0A0A',
        'modern-dark': '#1A1A1A', 
        'modern-gray': '#2A2A2A',
        'modern-light': '#F8F8F6',
        'modern-cream': '#F5F2E9',
        'modern-beige': '#E8E4D9',
        
        // Accent colors
        'accent-warm': '#D4A574',
        'accent-gold': '#C9A961',
        'accent-green': '#8B9A47',
        'accent-red': '#B85C38',
        
        // Legacy colors for backward compatibility
        'sushi-red': '#B85C38',
        'sushi-gold': '#C9A961',
        'sushi-black': '#0A0A0A',
        'sushi-light': '#F8F8F6',
        'sushi-accent': '#D4A574',
        'sushi-neutral': '#2A2A2A',
        // Kawaii theme colors
        'sushi-pink': {
          100: '#FFF5F7',
          200: '#FED7E2',
          300: '#FBB6CE',
          400: '#F687B3',
          500: '#ED64A6',
          600: '#D53F8C',
          700: '#B83280',
        },
        'sushi-blue': {
          100: '#EBF8FF',
          200: '#BEE3F8',
          300: '#90CDF4',
          400: '#63B3ED',
          500: '#4299E1',
          600: '#3182CE',
          700: '#2B6CB0',
        },
        'sushi-purple': {
          100: '#FAF5FF',
          200: '#E9D8FD',
          300: '#D6BCFA',
          400: '#B794F4',
          500: '#9F7AEA',
          600: '#805AD5',
          700: '#6B46C1',
        },
        'sushi-green': {
          100: '#F0FFF4',
          200: '#C6F6D5',
          300: '#9AE6B4',
          400: '#68D391',
          500: '#48BB78',
          600: '#38A169',
          700: '#2F855A',
        },
      },
      fontFamily: {
        'sans': ['Inter', '"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
        'display': ['Forum', '"Noto Serif JP"', 'serif'],
        'accent': ['Inter', 'Montserrat', 'sans-serif'],
        'kawaii': ['"Comic Sans MS"', '"Segoe UI"', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'pulse-subtle': 'pulseSubtle 2s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'bounce-slow': 'bounceSlow 3s infinite',
        'spin-slow': 'spin 3s linear infinite',
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
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        bounceSlow: {
          '0%, 100%': {
            transform: 'translateY(-5%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
      },
      screens: {
        'xs': '480px',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'kawaii': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 -2px 0 0 rgba(0, 0, 0, 0.1) inset',
      },
    },
  },
  plugins: [],
} 