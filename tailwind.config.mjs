/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          indigo: '#6366F1',
          purple: '#A855F7',
          pink: '#EC4899',
          orange: '#F97316',
          navy: '#4F46E5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
        'gradient-coral': 'linear-gradient(135deg, #EC4899 0%, #F97316 100%)',
        'gradient-text': 'linear-gradient(135deg, #4F46E5 0%, #EC4899 100%)',
      },
      boxShadow: {
        'brand': '0 10px 25px -5px rgba(99, 102, 241, 0.1)',
        'coral': '0 10px 25px -5px rgba(236, 72, 153, 0.1)',
        'glow-brand': '0 0 20px rgba(99, 102, 241, 0.15)',
        'glow-coral': '0 0 20px rgba(236, 72, 153, 0.15)',
      },
    },
  },
  plugins: [],
};
