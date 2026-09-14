// Shared ESLint flat config for plain TypeScript packages (Node/Nest/Expo).
// Next.js apps use `eslint-config-next` directly instead — Next ships its own
// well-maintained flat config and layering this on top adds little value.
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

/** @type {import("eslint").Linter.Config[]} */
export const baseConfig = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // Framework tooling configs (babel/metro) are CommonJS by convention —
    // don't fight that here.
    files: ["**/babel.config.js", "**/metro.config.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    ignores: ["dist/**", "build/**", ".next/**", ".turbo/**", ".expo/**", "node_modules/**"],
  },
];

export default baseConfig;
