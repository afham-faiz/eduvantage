import { baseConfig } from "@eduvantage/config/eslint-base.mjs";

export default [
  ...baseConfig,
  {
    // Generated output is machine-written — don't lint it as hand-authored code.
    ignores: ["src/generated/**"],
  },
];
