/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#F0F4FA',
          100: '#D9E3F5',
          200: '#B3C8EB',
          300: '#82A5DE',
          400: '#4E7DCB',
          500: '#2A5EB3',
          600: '#1D458F',
          700: '#15336E',
          800: '#0E224D',
          900: '#091533',
          950: '#040A1A',
        },
        safety: {
          normal: '#059669',
          caution: '#D97706',
          warning: '#EA580C',
          hazardous: '#DC2626',
          invalid: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'navy-sm': '0 2px 8px -1px rgba(9, 21, 51, 0.08)',
        'navy-md': '0 4px 20px -2px rgba(9, 21, 51, 0.12)',
        'navy-lg': '0 12px 32px -4px rgba(9, 21, 51, 0.16)',
        'navy-xl': '0 20px 48px -8px rgba(9, 21, 51, 0.22)',
        'glow-primary': '0 0 25px -5px rgba(42, 94, 179, 0.4)',
        'glow-danger': '0 0 30px -5px rgba(220, 38, 38, 0.5)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'spin-slow': 'spin 12s linear infinite',
        'scanline': 'scanline 4s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      }
    },
  },
  plugins: [],
}
