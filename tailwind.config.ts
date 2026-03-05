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
        scruffs: {
          dark:    '#3A4F4A',
          darker:  '#2B3A36',
          beige:   '#DBD4C7',
          teal:    '#A3C0BE',
          'teal-dark': '#7AA8A5',
          light:   '#F4F2EE',
          muted:   '#7A8582',
          border:  '#E8E4DE',
        },
      },
      fontFamily: {
        display: ['Montserrat', 'system-ui', 'sans-serif'],
        body:    ['Nunito', 'system-ui', 'sans-serif'],
        sans:    ['Nunito', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
      },
      boxShadow: {
        'brand-sm': '0 2px 8px rgba(58,79,74,0.06)',
        'brand-md': '0 4px 16px rgba(58,79,74,0.10)',
        'brand-lg': '0 8px 32px rgba(58,79,74,0.14)',
      },
      animation: {
        'slide-up':    'slideUp 0.3s ease-out',
        'fade-in':     'fadeIn 0.4s ease-out',
        'scale-in':    'scaleIn 0.2s ease-out',
        'spin-slow':   'spin 2s linear infinite',
      },
      keyframes: {
        slideUp:  { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:   { from: { opacity: '0', transform: 'translateY(8px)' },  to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:  { from: { opacity: '0', transform: 'scale(0.95)' },      to: { opacity: '1', transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
};

export default config;
