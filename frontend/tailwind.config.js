/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
        },
        text: {
          heading: 'var(--color-text-heading)',
          subheading: 'var(--color-text-subheading)',
          body: 'var(--color-text-body)',
          muted: 'var(--color-text-muted)',
          'link-hover': 'var(--color-text-link-hover)',
        },
        accent: {
          yellow: 'var(--color-accent-yellow)',
          'yellow-light': 'var(--color-accent-yellow-light)',
        },
        cta: {
          bg: 'var(--color-cta-primary-bg)',
          text: 'var(--color-cta-primary-text)',
          hover: 'var(--color-cta-primary-hover)',
        },
      },
      fontFamily: {
        serif: ['var(--font-heading)'],
        sans: ['var(--font-body)'],
      },
      fontSize: {
        'display': ['3.5rem', { lineHeight: '1.1', fontWeight: '600' }],
        'h1': ['2.5rem', { lineHeight: '1.2', fontWeight: '600' }],
        'h2': ['2rem', { lineHeight: '1.25', fontWeight: '600' }],
        'h3': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h4': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      boxShadow: {
        'card': '0 2px 8px rgb(0 0 0 / 0.06)',
      },
      borderRadius: {
        'theme': 'var(--radius-md)',
      },
      transitionTimingFunction: {
        'accordion': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
