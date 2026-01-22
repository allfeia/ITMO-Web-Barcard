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
}

test.describe('IngredientsPage', () => {
    test.beforeEach(async ({page}) => {
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
        await page.route('**/api/cocktail/1/recipe', route =>
            route.fulfill({
                json: {
                    id: 1,
                    name: 'Мохито',
                    ingredients: [
                        { id: 1, name: 'Белый ром', type: 'alcohol', amount: 60, unit: 'ml' },
                        { id: 2, name: 'Лайм', type: 'fruit', amount: null, unit: '' },
                        { id: 3, name: 'Мята', type: 'decoration', amount: null, unit: '' },
                    ],
                    steps: [
                        { step_number: 1, action: 'Добавьте Белый ром', ingredient_name: 'Белый ром' },
                        { step_number: 2, action: 'Добавьте Лайм', ingredient_name: 'Лайм' },
                        { step_number: 3, action: 'Добавьте Мяту', ingredient_name: 'Мята' },
                    ],
                },
            })
        );

    })

    test.describe('CreatedPage E2E', () => {

        test.beforeEach(async ({page}) => {
            await goToIngredientsPage(page);
        });

        test('показывает ErrorModal при неправильных ответах', async ({page}) => {
            await page.getByRole('button', {name: 'Создать коктейль'}).click();

            const errorModal = page.locator('.menu-flipped-card-content');
            await expect(errorModal).toBeVisible();
            await expect(errorModal.getByText(/Найдено ошибок:/i)).toBeVisible();
        });

        test('переходит на /result при правильных ответах', async ({ page }) => {
            await goToIngredientsPage(page);
            await page.getByRole('button', {name: 'Создать коктейль'}).click();
            await expect(page).toHaveURL(/\/result/, { timeout: 10000 });
        });

        test('drag-and-drop шагов (проверка на корректность порядка)', async ({page}) => {
            const firstStep = page.locator('.recipe-step-card').first();
            const secondStep = page.locator('.recipe-step-card').nth(1);

            await firstStep.dragTo(secondStep);

            const steps = await page.locator('.recipe-step-card .step-text').allTextContents();
            expect(steps.length).toBe(3);
            expect(steps[0]).not.toBe('Добавьте Белый ром');
        });
    })

})