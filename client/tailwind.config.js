/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: '#1E3A8A', // dark blue
          secondary: '#3B82F6', // bright blue
          hover: '#2563EB',
        },
        theme: {
          bg: {
            light: '#F8FAFC',
            dark: '#020617',
            mutedLight: '#F1F5F9',
            mutedDark: '#1E293B',
          },
          card: {
            light: '#FFFFFF',
            dark: '#0F172A',
          },
          text: {
            primaryLight: '#111827',
            secondaryLight: '#6B7280',
            primaryDark: '#F8FAFC',
            secondaryDark: '#CBD5F5',
          },
          border: {
            light: '#E5E7EB',
            dark: '#334155',
          }
        }
      },
    },
  },
  plugins: [],
}
