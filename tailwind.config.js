/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'netflix-red': '#dc2626',
        'netflix-red-hover': '#b91c1c',
        'netflix-black': '#000000',
        'netflix-dark': '#141414',
        'netflix-darker': '#0a0a0a',
        'netflix-gray': '#333333',
        'netflix-light-gray': '#666666',
        'netflix-text': '#e5e5e5',
        'netflix-text-secondary': '#b3b3b3',
      },
      fontFamily: {
        'netflix': ['Netflix Sans', 'Arial', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'bounce-delay-1': 'bounce 1s infinite 0.1s',
        'bounce-delay-2': 'bounce 1s infinite 0.2s',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      transitionTimingFunction: {
        'netflix': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}