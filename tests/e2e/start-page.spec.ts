import { test, expect } from "@playwright/test";

test.describe("StartPage — E2E тесты", () => {
    test("кнопка ведёт на /signInPage, если isBarman=true", async ({ page }) => {
        await page.goto("/?barId=111&isBarman=true");
        await page.getByRole("button", { name: "Начать" }).click();
        await expect(page).toHaveURL(/.*signInPage/);
    });

    test("кнопка ведёт на /menu, если isBarman=false", async ({ page }) => {
        await page.goto("/?barId=222&isBarman=false");
        await page.getByRole("button", { name: "Начать" }).click();
        await expect(page).toHaveURL(/.*menu/);
    });

    test("при отсутствии параметров приложение работает и редиректит по умолчанию", async ({ page }) => {
        await page.goto("/");
        const button = page.getByRole("button", { name: "Начать" });
        await button.click();
        await expect(page.locator(".StartPage")).toBeVisible();
    });
});