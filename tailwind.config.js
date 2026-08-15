/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        'app-bg': 'var(--color-bg)',
        'app-text': 'var(--color-text)',
      },
      borderRadius: {
        app: 'var(--border-radius)',
      },
      spacing: {
        unit: 'var(--spacing-unit)',
      },
      fontSize: {
        base: 'var(--font-size-base)',
      },
    },
  },
  plugins: [],
}
