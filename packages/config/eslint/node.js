import baseConfig from "./index.js";

/** @type {import("eslint").Linter.Config[]} */
const nodeConfig = [
  ...baseConfig,
  {
    // Node.js-specific env globals
    languageOptions: {
      globals: {
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        Buffer: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
      },
    },
    rules: {
      // Node services often need console for structured logging
      "no-console": "off",
    },
  },
];

export default nodeConfig;
