import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bml: {
          background: "#08111f",
          surface: "rgba(17,25,40,0.8)",
          border: "rgba(255,255,255,0.08)",
          primary: "#2563eb",
          accent: "#3b82f6",
          text: "#ffffff",
          muted: "#94a3b8",
          success: "#10b981",
          warning: "#f59e0b",
          danger: "#ef4444"
        }
      },
      boxShadow: {
        glass: "0 20px 50px rgba(0, 0, 0, 0.25)",
        soft: "0 10px 30px rgba(0, 0, 0, 0.15)"
      },
      borderRadius: {
        xl: "1.25rem"
      }
    }
  },
  plugins: []
};

export default config;
