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
                brand: {
                    50: '#f5f3ff',
                    100: '#ede9fe',
                    200: '#ddd6fe',
                    300: '#c4b5fd',
                    400: '#a78bfa',
                    500: '#8b5cf6',
                    600: '#7c3aed',
                    700: '#6d28d9',
                    800: '#5b21b6',
                    900: '#4c1d95',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'card': '0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)',
                'card-dark': '0 1px 3px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.3)',
                'glow-purple': '0 0 30px rgba(124, 58, 237, 0.35)',
                'glow-cyan': '0 0 30px rgba(6, 182, 212, 0.35)',
            },
            animation: {
                'fade-in': 'fadeIn 0.4s ease-out',
                'fade-up': 'fadeUp 0.5s ease-out',
                'float': 'float 7s ease-in-out infinite',
                'blob': 'blob 8s ease-in-out infinite',
                'shimmer': 'shimmer 1.5s infinite',
                'spin-slow': 'spin 3s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeUp: {
                    '0%': { opacity: '0', transform: 'translateY(24px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '33%': { transform: 'translateY(-15px) rotate(1deg)' },
                    '66%': { transform: 'translateY(-8px) rotate(-1deg)' },
                },
                blob: {
                    '0%': { transform: 'translate(0, 0) scale(1)' },
                    '33%': { transform: 'translate(30px, -40px) scale(1.08)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.92)' },
                    '100%': { transform: 'translate(0, 0) scale(1)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% center' },
                    '100%': { backgroundPosition: '200% center' },
                },
            },
            backgroundImage: {
                'gradient-aurora': 'linear-gradient(135deg, #7c3aed 0%, #2563eb 50%, #06b6d4 100%)',
                'gradient-purple': 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                'gradient-sunset': 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #7c3aed 100%)',
            },
        },
    },
    plugins: [],
};
