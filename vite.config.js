import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    plugins: [react()],
    environment: "jsdom",
    setupFiles: "/Users/aroslavasilova/Documents/ITMO-Web-Barcard/tests/setup.js",
    globals: true,
    restoreMocks: true,
    exclude: ["tests/**/*.spec.js", "node_modules/**", "src/backend/node_modules/**"],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      all: true,
      include: ["src/**/*.{js,jsx}"],
      exclude: ["src/main.jsx"],
    },
  },
});
