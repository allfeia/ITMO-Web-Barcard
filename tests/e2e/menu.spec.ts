import {expect, test} from "@playwright/test";

test.beforeEach(async ({ page }) => {

    await page.addInitScript(() => {
        sessionStorage.setItem("barId", "123");
        sessionStorage.setItem("barSite", "https://olivebarandkitchen.com");
        sessionStorage.setItem("isBarman", "true");
        sessionStorage.setItem("roles", "[]");
        sessionStorage.setItem("barName", "Olive Bar");
        sessionStorage.setItem("savedCocktailsId", "[2]");
        sessionStorage.setItem("token", "aXZhbi0xMjMtMTc");
    });
});


test.beforeEach(async ({ page }) => {
    await page.route("/api/cocktail?barId=123", async (route) => {
        await route.fulfill({
            json: [
                { id: 1, name: "Мохито", draw_file: "mojito.js" },
                { id: 2, name: "Разбитый базилик", draw_file: "smash-basil.js" },
            ],
        });
    });

    await page.route("/api/favourites/add/1", async (route) => {
        await route.fulfill({ json: { cocktailId: 1 } });
    });

    await page.route("/api/favourites/remove/1", async (route) => {
        await route.fulfill({ json: {} });
    });

    await page.route("/api/cocktail/1/recipe", async (route) => {
        await route.fulfill({
            json: {
                name: "Мохито",
                ingredients: [
                    { name: "Белый ром", amountStr: "50 ml" }
                ],
                decoration: "Мята",
                steps: [
                    { action: "Выжмите сок из половинки лайма в стакан" }
                ],
            },
        });
    });
});

test("полный пользовательский сценарий MenuPage", async ({ page, context }) => {
    await page.goto("/menu");


    const barLink = page.getByRole("link", { name: "Olive Bar" });
    await barLink.click();


    await page.waitForURL("https://olivebarandkitchen.com");
    expect(page.url().trim().replace(/\/$/, "")).toBe("https://olivebarandkitchen.com");

    await page.goBack();

    const search = page.getByPlaceholder("Поиск");
    await search.fill("мох");

    await expect(page.getByText("Мохито")).toBeVisible();
    await expect(page.locator(".menu-card")).toHaveCount(1);

    const heart = page.getByTestId("favourites-canvas").first();
    await heart.click();

    await expect.poll(async () => {
        return await page.evaluate(() => {
            return JSON.parse(sessionStorage.getItem("savedCocktailsId") || "[]");
        });
    }).toContain(1);

    await heart.click();

    await expect.poll(async () => {
        return await page.evaluate(() => {
            return JSON.parse(sessionStorage.getItem("savedCocktailsId") || "[]");
        });
    }).not.toContain(1);

    const card = page.locator(".menu-card").first();
    await card.click();

    const modal = page.locator(".menu-flipped-card-content");
    await expect(modal).toBeVisible();

    await expect(modal.getByText("Мохито")).toBeVisible();
    await expect(modal.getByText("Ингредиенты")).toBeVisible();
    await expect(modal.getByText("Белый ром")).toBeVisible();
    await expect(modal.getByText("Выжмите сок из половинки лайма в стакан")).toBeVisible();
});
