import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/packs/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F5EBDC',
        ochre: '#E8C493',
        terracotta: '#E8A87C',
        rose: '#C38D9E',
        sage: '#95B88F',
        forest: '#6B8E5A',
        bark: '#6B4423',
        sun: '#FFD93D',
      },
      fontFamily: {
        sans: ['Nunito', 'Quicksand', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'kid-lg': ['28px', { lineHeight: '1.4', fontWeight: '700' }],
        'kid-md': ['24px', { lineHeight: '1.45', fontWeight: '600' }],
        'kid-sm': ['20px', { lineHeight: '1.5' }],
      },
      spacing: {
        'hit': '60px',
      },
    },
  },
  plugins: [],
};
export default config;
