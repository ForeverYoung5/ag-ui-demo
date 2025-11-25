import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Chat Interface Colors
        "chat-bg": "hsl(var(--chat-background))",
        "chat-fg": "hsl(var(--chat-foreground))",
        "sidebar-bg": "hsl(var(--sidebar-bg))",
        "sidebar-fg": "hsl(var(--sidebar-fg))",
        "sidebar-hover": "hsl(var(--sidebar-hover))",
        "user-message": "hsl(var(--user-message))",
        "user-message-fg": "hsl(var(--user-message-fg))",
        "ai-message": "hsl(var(--ai-message))",
        "ai-message-fg": "hsl(var(--ai-message-fg))",
        "input-bg": "hsl(var(--input-bg))",
        "input-border": "hsl(var(--input-border))",
        "input-focus": "hsl(var(--input-focus))",
        "btn-primary": "hsl(var(--button-primary))",
        "btn-primary-fg": "hsl(var(--button-primary-fg))",
        "btn-secondary": "hsl(var(--button-secondary))",
        "btn-secondary-fg": "hsl(var(--button-secondary-fg))",
        "accent-glow": "hsl(var(--accent-glow))",
        "shadow-soft": "hsl(var(--shadow-soft))",
        
        // Custom Theme Colors
        "theme-primary": "hsl(var(--theme-primary))",
        "theme-accent": "hsl(var(--theme-accent))",
        "theme-warning": "hsl(var(--theme-warning))",
        "theme-error": "hsl(var(--theme-error))",
        
        // Status Colors
        "warning": "hsl(var(--warning))",
        "warning-foreground": "hsl(var(--warning-fg))",
        "error": "hsl(var(--error))",
        "error-foreground": "hsl(var(--error-fg))",
      },
      backgroundImage: {
        "gradient-primary": "var(--gradient-primary)",
        "gradient-subtle": "var(--gradient-subtle)",
        "gradient-accent": "var(--gradient-accent)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.3s var(--animation-smooth)",
        "bounce-in": "bounce-in 0.6s var(--animation-bounce)",
        "typing": "typing 1.5s infinite",
        "pulse-glow": "pulse-glow 2s infinite",
      },
      transitionTimingFunction: {
        "bounce": "var(--animation-bounce)",
        "smooth": "var(--animation-smooth)",
        "elastic": "var(--animation-elastic)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
