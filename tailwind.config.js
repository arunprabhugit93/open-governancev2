/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Semantic tokens resolve to CSS variables set per-theme in index.css.
        bg: 'hsl(var(--bg) / <alpha-value>)',
        surface: 'hsl(var(--surface) / <alpha-value>)',
        'surface-2': 'hsl(var(--surface-2) / <alpha-value>)',
        elevated: 'hsl(var(--elevated) / <alpha-value>)',
        border: 'hsl(var(--border) / <alpha-value>)',
        'border-strong': 'hsl(var(--border-strong) / <alpha-value>)',
        fg: 'hsl(var(--fg) / <alpha-value>)',
        muted: 'hsl(var(--muted) / <alpha-value>)',
        faint: 'hsl(var(--faint) / <alpha-value>)',
        primary: 'hsl(var(--primary) / <alpha-value>)',
        'primary-fg': 'hsl(var(--primary-fg) / <alpha-value>)',
        pass: 'hsl(var(--pass) / <alpha-value>)',
        warn: 'hsl(var(--warn) / <alpha-value>)',
        fail: 'hsl(var(--fail) / <alpha-value>)',
        info: 'hsl(var(--info) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        lg: '12px',
        md: '9px',
        sm: '6px',
      },
      boxShadow: {
        card: '0 1px 2px 0 hsl(var(--shadow) / 0.06), 0 1px 3px 0 hsl(var(--shadow) / 0.05)',
        pop: '0 8px 30px -6px hsl(var(--shadow) / 0.25)',
        glow: '0 0 0 1px hsl(var(--primary) / 0.25), 0 0 24px -6px hsl(var(--primary) / 0.5)',
      },
      keyframes: {
        'pulse-live': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateY(-6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-4px)' },
          '40%, 80%': { transform: 'translateX(4px)' },
        },
      },
      animation: {
        'pulse-live': 'pulse-live 1.6s ease-in-out infinite',
        'slide-in': 'slide-in 0.28s ease-out',
        shake: 'shake 0.4s ease-in-out',
      },
    },
  },
  plugins: [],
};
