import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': 'http://localhost:4000',
        },
    },
    test: {
        environment: "jsdom",
        setupFiles: "./src/setupTests.js",
        globals: true,
        exclude: ['node_modules/**', 'tests/e2e/**', "backend/node_modules/**"],
        coverage: {
            provider: "v8",
            reporter: ['text', 'json-summary', "html", "lcov"],
            reporterDirectory: './coverage',
            all: true,
            include: ['src/**/*.{js,jsx}'],
            exclude: ['node_modules/', 'tests/e2e/**', 'src/mocks/**', 'src/bottoms-utils', 'src/main.jsx', 'src/sign-in-page/olive.js', 'src/menu-page/menu-cocktails/**', 'src/ProtectedRoute.jsx', 'src/game-pages/level-page/Olive.js', 'src/game-pages/level-page/Styles.js'],
        },
    },
});
