import tseslint from "typescript-eslint";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  // Recommended TypeScript rules
  ...tseslint.configs.recommended,

  {
    rules: {
      // TypeScript — allow explicit `any` with a warning rather than error during early dev
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],

      // General best practices
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always", { null: "ignore" }],
    },
  },
];

export default config;
