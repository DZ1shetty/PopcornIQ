/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#080808', // Matte Carbon
                surface: '#121212',    // Deep Slate
                primary: '#ffffff',    // Pure White for high contrast
                accent: '#4F46E5',     // Electric Indigo for focus points
                muted: '#636363',      // Soft Grey for secondary text
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            },
            animation: {
                'reveal': 'reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'slide-up': 'slideUp 0.5s ease-out forwards',
                'spotlight': 'spotlight 2s linear infinite',
            },
            keyframes: {
                reveal: {
                    '0%': { opacity: '0', filter: 'blur(20px)', transform: 'scale(1.05)' },
                    '100%': { opacity: '1', filter: 'blur(0)', transform: 'scale(1)' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [
        require('tailwind-scrollbar-hide')
    ],
}
