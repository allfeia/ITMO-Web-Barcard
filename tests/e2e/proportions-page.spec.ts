import { test, expect, Page } from '@playwright/test';

async function goToIngredientsPage(page: Page) {
    await page.goto('/menu');

    await page.route('**/api/cocktail?barId=123', route =>
        route.fulfill({
            json: [{ id: 1, name: 'Мохито', draw_file: 'mojito.js' }],
        })
    );

    await expect(page.getByText('Мохито')).toBeVisible();

    await page.getByText('Мохито').click();
    await page.getByRole('button', { name: /изучить/i }).click();

    await expect(page).toHaveURL(/levelPage/);
    await page.getByText('Легкий').click();

    await expect(page).toHaveURL(/ingredients/);
}

test.describe('IngredientsPage', () => {
    test.beforeEach(async ({page}) => {
        await page.route('**/mc.yandex.ru/**', route => route.abort());
        await page.addInitScript(() => {
            sessionStorage.setItem('barId', '123');
            sessionStorage.setItem('isBarman', 'false');
            sessionStorage.setItem('roles', '[]');
            sessionStorage.setItem('barName', 'Olive Bar');
        });

        await page.route('**/api/ingredients', route =>
            route.fulfill({
                json: [
                    { id: 1, name: 'Белый ром', type: 'alcohol' },
                    { id: 2, name: 'Лайм', type: 'fruit' },
                    { id: 3, name: 'Мята', type: 'decoration' },
                ],
            })
        );

        await page.route('**/api/cocktail/1/recipe', route =>
            route.fulfill({
                json: {
                    id: 1,
                    name: 'Мохито',
                    ingredients: [
                        {
                            id: 1,
                            name: 'Белый ром',
                            type: 'alcohol',
                            amount: 60,
                            unit: 'ml',
                        },
                        {
                            id: 2,
                            name: 'Лайм',
                            type: 'fruit',
                            amount: null,
                            unit: '',
                        },
                        {
                            id: 3,
                            name: 'Мята',
                            type: 'decoration',
                            amount: null,
                            unit: '',
                        },
                    ],
                    steps: [],
                },
            })
        );

    })

    test.describe("ProportionsPage", () => {
        test("показывает ошибку при неверных пропорциях", async ({page}) => {
            await goToIngredientsPage(page);

            await page.getByText("Белый ром").click();
            await page.getByText("Лайм").click();
            await page.getByText("Мята").click();

            await page.getByRole("button", {name: "Создать с пропорциями"}).click();
            await expect(page).toHaveURL("/proportions");

            const inputs = page.locator(".ingredient-input");
            await expect(inputs).toHaveCount(1);

            await inputs.nth(0).fill("1");

            await page.getByRole("button", {name: "Перейти к созданию"}).click();

            const modal = page.locator(".menu-flipped-card-content");
            await expect(modal).toBeVisible();
            await expect(modal).toContainText("Найдено ошибок");
        });

        test("переходит на /create при верных пропорциях", async ({page}) => {
            await goToIngredientsPage(page);

            await page.getByText("Белый ром").click();
            await page.getByText("Лайм").click();
            await page.getByText("Мята").click();

            await page.getByRole("button", {name: "Создать с пропорциями"}).click();
            await expect(page).toHaveURL("/proportions");

            const inputs = page.locator(".ingredient-input");
            await expect(inputs).toHaveCount(1);

            await inputs.nth(0).fill("60");

            await page.getByRole("button", {name: "Перейти к созданию"}).click();

            await expect(page).toHaveURL("/create");
        });
    });
})