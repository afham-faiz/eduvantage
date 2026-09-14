import nextConfig from "eslint-config-next";

// `eslint-config-next`'s default export is already a complete flat config
// (core-web-vitals + TypeScript rules) — Next.js 16 dropped `next lint` in
// favor of running ESLint directly, see package.json's "lint" script.
const eslintConfig = [
  ...nextConfig,
  {
    ignores: [".next/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
