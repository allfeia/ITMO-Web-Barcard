import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    test: {
        environment: "jsdom",
        setupFiles: "./src/setupTests.js",
        globals: true,
        exclude: ['node_modules/**', 'tests/e2e/**'],
        coverage: {
            provider: "v8",
            reporter: ['text', 'json-summary', "html", "lcov"],
            reporterDirectory: './coverage',
            all: true,
            include: ['src/**/*.{js,jsx}'],
            exclude: ['node_modules/', 'tests/e2e/**', 'src/mocks/**', 'src/bottoms-utils', 'src/main.jsx', 'src/Menu.jsx', 'src/StartPage.jsx', 'src/sign-in-page/olive.js'],
        },
    },
});
