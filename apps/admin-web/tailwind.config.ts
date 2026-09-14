import type { Config } from "tailwindcss";

// No brand theme yet — Ailam owns the real Tailwind theme. This config only
// wires Tailwind up so apps can start using utility classes immediately.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
