import { test, expect } from "@playwright/test";

test.describe("StartPage — E2E тесты", () => {
    test("кнопка ведёт на /signInPage, если isBarman=true", async ({ page }) => {
        await page.goto("/?barId=123&isBarman=true");
        await page.getByRole("button", { name: "Начать" }).click();
        await expect(page).toHaveURL(/.*signInPage$/);
    });

    test("кнопка ведёт на /menu, если isBarman=false", async ({ page }) => {
        await page.goto("/?barId=777&isBarman=false");
        await page.getByRole("button", { name: "Начать" }).click();
        await expect(page).toHaveURL(/.*menu$/);
    });

    test("показывает сообщение об ошибке, если нет barId и isBarman", async ({ page }) => {
        await page.goto("/");
        await expect(
            page.getByText("Пожалуйста, отсканируйте QR-код, чтобы продолжить")
        ).toBeVisible();
        await expect(page.getByRole("button", { name: "Начать" })).not.toBeVisible();
    });

    test("показывает сообщение, если есть barId, но нет isBarman", async ({ page }) => {
        await page.goto("/?barId=123");
        await expect(
            page.getByText("Пожалуйста, отсканируйте QR-код, чтобы продолжить")
        ).toBeVisible();
    });

    test("показывает сообщение, если есть isBarman, но нет barId", async ({ page }) => {
        await page.goto("/?isBarman=true");
        await expect(
            page.getByText("Пожалуйста, отсканируйте QR-код, чтобы продолжить")
        ).toBeVisible();
    });

    test("отображает анимацию треков и кнопку Начать при валидных параметрах", async ({ page }) => {
        await page.goto("/?barId=123&isBarman=false");
        await expect(page.getByText("Barcard")).toBeVisible();
        await expect(page.getByText("Barcard")).toHaveClass("titleStart");

        const startButton = page.getByRole("button", { name: "Начать" });
        await expect(startButton).toBeVisible();
        await expect(startButton).toHaveClass(/start-button/);
        await expect(startButton).toHaveClass(/MuiButton-contained/);
        const tracks = page.locator(".tracks-rotated .track");
        await expect(tracks).toHaveCount(5);
    });

    test("не перенаправляет и не ломает страницу при клике, если isBarmanChecker === null", async ({ page }) => {
        await page.goto("/?barId=123&isBarman=invalid");

        const startButton = page.getByRole("button", { name: "Начать" });
        await expect(startButton).toBeVisible();
        const consolePromise = page.waitForEvent("console", msg => msg.text().includes("неизвестный пользователь"));
        await startButton.click();
        const consoleMsg = await consolePromise;
        expect(consoleMsg.text()).toContain("неизвестный пользователь");
        await expect(page).toHaveURL(/.*\?barId=555&isBarman=invalid$/);
    });

    test("отображает страницу нормально при /super* или /administration*", async ({ page }) => {
        await page.goto("/super/dashboard?barId=999&isBarman=true");
        await expect(page.getByText("Barcard")).toBeVisible();
        await expect(
            page.getByText("Пожалуйста, отсканируйте QR-код")
        ).not.toBeVisible();

        const startButton = page.getByRole("button", { name: "Начать" });
        await expect(startButton).toBeVisible();
    });
});