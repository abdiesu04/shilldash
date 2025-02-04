import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        crypto: {
          primary: '#2563EB',    // Bright blue for primary actions
          secondary: '#7C3AED',  // Purple for secondary elements
          accent: '#10B981',     // Green for positive trends
          warning: '#F59E0B',    // Amber for warnings
          danger: '#EF4444',     // Red for negative trends
          dark: {
            900: '#0F172A',      // Dark background
            800: '#1E293B',      // Card background
            700: '#334155',      // Border color
            600: '#475569',      // Muted text
          },
          light: {
            100: '#F1F5F9',      // Light background
            200: '#E2E8F0',      // Card background
            300: '#CBD5E1',      // Border color
            400: '#94A3B8',      // Muted text
          }
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-crypto': 'linear-gradient(to right, #2563EB, #7C3AED)',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      boxShadow: {
        'crypto': '0 4px 14px 0 rgba(37, 99, 235, 0.1)',
        'crypto-lg': '0 10px 25px -3px rgba(37, 99, 235, 0.1)',
      }
    },
  },
  plugins: [],
} satisfies Config;

export default config;
