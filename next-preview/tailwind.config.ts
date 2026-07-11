import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 18K brand palette
        pearl:      '#F5F0EB',
        warmwhite:  '#FAF7F4',
        cream:      '#FDFBF8',
        blush:      '#F0E6DC',
        champagne:  '#E8DDD3',
        taupe:      '#8C7B6B',
        softgold:   '#C9A96E',
        deepgold:   '#B8964E',
        warmblack:  '#1A1714',
        blacksoft:  '#211E1B',
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        body:    ['var(--font-outfit)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.4em',
      },
      animation: {
        marquee: 'marquee 22s linear infinite',
        rise:    'rise 1s ease-out forwards',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
        rise: {
          from: { opacity: '0', transform: 'translateY(28px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
