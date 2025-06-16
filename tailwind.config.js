/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a73e8',
        secondary: '#4285f4',
        accent: '#34a853',
        background: '#f8f9fa',
        surface: '#ffffff',
        error: '#ea4335',
        success: '#34a853',
        warning: '#fbbc05',
      },
    },
  },
  plugins: [],
} 