/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B35',
        secondary: '#2EC4B6',
        background: { DEFAULT: '#0A0A0A', light: '#F9F9F9' },
        surface: { DEFAULT: '#1A1A1A', light: '#FFFFFF' },
        muted: '#888888',
        danger: '#FF4444',
        success: '#44CC88',
      },
      fontFamily: {
        sans: ['Inter_400Regular'],
        medium: ['Inter_500Medium'],
        semibold: ['Inter_600SemiBold'],
        bold: ['Inter_700Bold'],
        display: ['Poppins_600SemiBold'],
      },
    },
  },
  plugins: [],
};
