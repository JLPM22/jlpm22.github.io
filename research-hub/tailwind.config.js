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
                    DEFAULT: '#10b981',
                    light: '#34d399',
                    dark: '#059669',
                    glow: 'rgba(16, 185, 129, 0.15)',
                },
                bg: {
                    DEFAULT: '#f8faf9',
                    card: '#ffffff',
                    subtle: '#f1f7f4',
                },
                border: {
                    DEFAULT: '#e2ebe6',
                    glow: 'rgba(16, 185, 129, 0.4)',
                },
                text: {
                    DEFAULT: '#1a2e24',
                    secondary: '#4b6358',
                    muted: '#7a9989',
                },
                danger: '#ef4444',
                warning: '#f59e0b',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                DEFAULT: '14px',
                sm: '8px',
                lg: '20px',
            },
            boxShadow: {
                card: '0 4px 20px rgba(0, 0, 0, 0.06)',
                glow: '0 4px 20px rgba(16, 185, 129, 0.15)',
                'glow-lg': '0 8px 30px rgba(16, 185, 129, 0.2)',
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                'gradient-critical': 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                'gradient-backlog': 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
            },
        },
    },
    plugins: [],
}
