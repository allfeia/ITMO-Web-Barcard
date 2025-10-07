import { test, expect } from "@playwright/test";

test.describe("Vite + React App", () => {
  test("отображает логотипы, заголовок и работает счётчик", async ({
    page,
  }) => {
    // Открываем приложение
    await page.goto("http://localhost:4173/");

    // Проверяем, что логотипы видны
    const viteLogo = page.locator('img[alt="Vite logo"]');
    const reactLogo = page.locator('img[alt="React logo"]');
    await expect(viteLogo).toBeVisible();
    await expect(reactLogo).toBeVisible();

    // Проверяем заголовок
    await expect(page.locator("h1")).toHaveText("Vite + React");

    // Проверяем кнопку и счётчик
    const button = page.locator("button");
    await expect(button).toHaveText("count is 0");
    await button.click();
    await expect(button).toHaveText("count is 1");

    // Проверяем, что есть текст с инструкцией
    await expect(page.locator(".read-the-docs")).toContainText(
      "Click on the Vite and React logos",
    );
  });
});
