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
    environment: "happy-dom",
    setupFiles: "./tests/setup.js",
    globals: true,
    exclude: ["tests/**/*.spec.js", "node_modules/**"],
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
