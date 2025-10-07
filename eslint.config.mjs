import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import prettier from "eslint-config-prettier";

export default defineConfig([
  {
    ignores: [
      "**/*", // ignore everything
      "!src/**", // except src folder
    ],
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended", prettier],
    languageOptions: { globals: globals.browser },
    rules: {
      semi: ["error", "always"],
      "no-console": "warn",
      "prefer-const": "warn",
    },
  },
]);
