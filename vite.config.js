import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    test: {
        environment: "jsdom",
        setupFiles: "./src/setupTests.js",
        globals: true,
        exclude: ['node_modules/**', 'tests/e2e/**'],
    },
    coverage: {
        reporter: ['text', 'lcov', 'html'],
        all: true,
        include: ['src/**/*.{js,jsx}'],
        exclude: ['node_modules/', 'tests/e2e/**'],
    },
});
