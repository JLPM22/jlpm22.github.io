/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Green theme
                accent: {
                    DEFAULT: '#168560',
                    light: '#42a982',
                    dark: '#106b4d',
                    glow: 'rgba(16, 185, 129, 0.15)',
                },
                bg: {
                    DEFAULT: '#fafbf8',
                    card: '#ffffff',
                    subtle: '#f0f3ee',
                },
                border: {
                    DEFAULT: '#dce3db',
                    glow: 'rgba(16, 185, 129, 0.4)',
                },
                text: {
                    DEFAULT: '#202d27',
                    secondary: '#526158',
                    muted: '#64736a',
                },
                danger: '#ef4444',
                warning: '#f59e0b',
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
                outfit: ['var(--font-outfit)', 'sans-serif'],
            },
            borderRadius: {
                DEFAULT: '14px',
                sm: '8px',
                lg: '20px',
            },
            boxShadow: {
                card: '0 4px 18px rgba(32, 45, 39, 0.035)',
                glow: '0 4px 20px rgba(16, 185, 129, 0.15)',
                'glow-lg': '0 8px 30px rgba(16, 185, 129, 0.2)',
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, #168560 0%, #106b4d 100%)',
                'gradient-critical': 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                'gradient-backlog': 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
