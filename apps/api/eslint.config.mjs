import { baseConfig } from "@eduvantage/config/eslint-base.mjs";

export default [
  ...baseConfig,
  {
    ignores: ["dist/**"],
  },
];
