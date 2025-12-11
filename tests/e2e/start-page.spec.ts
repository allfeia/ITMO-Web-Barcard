import { test, expect } from "@playwright/test";

test.describe("StartPage — E2E тесты", () => {
    test("сохраняет barId и isBarman в sessionStorage", async ({ page }) => {
        await page.goto("/?barId=789&isBarman=true");

        await expect.poll(async () => {
            const barId = await page.evaluate(() => sessionStorage.getItem("barId"));
            const isBarman = await page.evaluate(() => sessionStorage.getItem("isBarman"));
            return { barId, isBarman };
        }).toEqual({
            barId: "789",
            isBarman: "true",
        });
    });

    test("кнопка ведет на /signInPage, если isBarman=true", async ({ page }) => {
        await page.goto("/?barId=111&isBarman=true");

        await page.getByRole("button", { name: "Начать" }).click();

        await expect(page).toHaveURL(/.*\/signInPage/);
    });

    test("кнопка ведет на /menu, если isBarman=false", async ({ page }) => {
        await page.goto("/?barId=222&isBarman=false");

        await page.getByRole("button", { name: "Начать" }).click();

        await expect(page).toHaveURL(/.*\/menu/);
    });

    test("если параметров нет — sessionStorage пуст", async ({ page }) => {
        await page.goto("/");

        await expect.poll(async () => {
            return {
                barId: await page.evaluate(() => sessionStorage.getItem("barId")),
                isBarman: await page.evaluate(() => sessionStorage.getItem("isBarman")),
            };
        }).toEqual({
            barId: null,
            isBarman: null,
        });
    });
});
