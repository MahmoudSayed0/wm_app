/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Washman Brand Colors - Matching NextJS App
        primary: {
          DEFAULT: '#1F8783', // Teal - Main brand color
          light: '#2A9D99', // Lighter teal for dark mode
          foreground: '#FFFFFF',
        },
        'brand-beige': {
          DEFAULT: '#F9EFDB', // Cream/Beige accent
          foreground: '#5C4A2A',
        },
        // Semantic colors
        background: '#FCFCFC',
        foreground: '#1A1A2E',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#1A1A2E',
        },
        muted: {
          DEFAULT: '#F4F4F5',
          foreground: '#71717A',
        },
        accent: {
          DEFAULT: '#E6F4F3', // Light teal accent
          foreground: '#1A4D4A',
        },
        border: '#E4E4E7',
        input: '#E4E4E7',
        ring: '#1F8783',
        // Status colors
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        success: {
          DEFAULT: '#10B981',
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT: '#F59E0B',
          foreground: '#422006',
        },
      },
      fontFamily: {
        sans: ['EuclidCircularA-Regular'],
        'euclid-light': ['EuclidCircularA-Light'],
        'euclid-regular': ['EuclidCircularA-Regular'],
        'euclid-medium': ['EuclidCircularA-Medium'],
        'euclid-semibold': ['EuclidCircularA-SemiBold'],
        'euclid-bold': ['EuclidCircularA-Bold'],
      },
    },
  },
  plugins: [],
}
