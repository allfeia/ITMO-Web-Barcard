import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom", // имитация браузера
    setupFiles: "./src/setupTests.js", // подключаем setupTests
    globals: true,
    exclude: ["tests/**/*.spec.js", "node_modules/**"],
    coverage: {
      all: true,
      include: ["src/**/*.{js,jsx}"],
      exclude: ["src/main.jsx"],
    },
  },
});
