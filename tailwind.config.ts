import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        brand: {
          white: '#FFFFFF',
          yellow: '#FFC107',
          'yellow-dark': '#E6AC00',
          'yellow-light': '#FFD54F',
          red: '#E53935',
          'red-dark': '#C62828',
          'red-light': '#EF5350',
        },
        // Dark mode surface colors
        surface: {
          DEFAULT: '#0A0A0A',
          '50': '#1A1A1A',
          '100': '#242424',
          '200': '#2E2E2E',
          '300': '#383838',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #0A0A0A 0%, #1a0a00 50%, #0A0A0A 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,193,7,0.1) 0%, rgba(229,57,53,0.1) 100%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,193,7,0.2) 50%, transparent 100%)',
      },
      boxShadow: {
        'glow-yellow': '0 0 30px rgba(255, 193, 7, 0.3)',
        'glow-red': '0 0 30px rgba(229, 57, 53, 0.3)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 48px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
};

export default config;
