/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F3F5F2',
        tx: '#1B2A2E',
        mute: '#4B5B5F',
        pri: {
          DEFAULT: '#0B4F4A',
          hover: '#083B37',
          dark: '#052A27',
        },
        tint: '#E4EFEC',
        bd: '#D9DFDA',
        bdi: '#8FA09A',
        kuning: {
          DEFAULT: '#FDF0D5',
          tx: '#5C3305',
          warn: '#8A4B08',
        },
        danger: {
          DEFAULT: '#B42318',
          bg: '#FDE7E4',
          tx: '#7A1D12',
        },
        biru: {
          DEFAULT: '#1D4ED8',
          bg: '#E3ECFA',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '14px',
        'btn': '10px',
      }
    },
  },
  plugins: [],
}
