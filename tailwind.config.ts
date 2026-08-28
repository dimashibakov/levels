import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        ink: "#1B1B1F",
        ink2: "#3C3C43",
        mute: "#8A8A8E",
        bg: "#F4F2EE",
        card: "#FFFFFF",
        line: "#ECEAE4",
        brand: "#5B52D9",
        brandsoft: "#EDECFB",
        good: "#7CB342",
        goodsoft: "#EEF5E4",
        mid: "#E0A32E",
        midsoft: "#FBF1DE",
        edge: "#E5533B",
        edgesoft: "#FBE7E1",
      },
      borderRadius: { card: "22px" },
    },
  },
  plugins: [],
};
export default config;
