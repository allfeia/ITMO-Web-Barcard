import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import vitest from "@vitest/eslint-plugin";           // ← новый
import testingLibrary from "eslint-plugin-testing-library"; // ← новый

export default tseslint.config(
    // Игнорируем папку сборки
    { ignores: ["dist", "node_modules"] },

    // Общие настройки для всех файлов
    {
      extends: [
        js.configs.recommended,
        ...tseslint.configs.recommended, // если используешь TypeScript — оставь, если чистый JS — можно убрать
      ],
      languageOptions: {
        globals: {
          ...globals.browser,
          ...globals.node,
        },
      },
    },

    // Настройки для обычного React-кода
    {
      files: ["**/*.{js,jsx,ts,tsx}"],
      excludes: ["**/*.test.{js,jsx,ts,tsx}", "**/*.spec.{js,jsx,ts,tsx}"], // тесты отдельно
      plugins: {
        "react-hooks": reactHooks,
        "react-refresh": reactRefresh,
      },
      rules: {
        ...reactHooks.configs.recommended.rules,
        "react-refresh/only-export-components": "warn",
        "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
      },
    },

    // Специально для тестов — вот где магия!
    {
      files: ["**/*.test.{js,jsx,ts,tsx}", "**/*.spec.{js,jsx,ts,tsx}"],
      plugins: {
        vitest,
        "testing-library": testingLibrary,
      },
      rules: {
        ...vitest.configs.recommended.rules,
        ...testingLibrary.configs.react.rules,

        // Очень полезные послабления в тестах
        "no-console": "off",
        "testing-library/await-async-queries": "error",
        "testing-library/no-await-sync-queries": "error",
      },
      languageOptions: {
        globals: {
          ...vitest.configs.recommended.globals,
        },
      },
    },
);