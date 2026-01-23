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
    test.beforeEach(async ({ page }) => {
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
                        { id: 1, name: 'Белый ром', type: 'alcohol' },
                        { id: 2, name: 'Лайм', type: 'fruit' },
                    ],
                    steps: [],
                },
            })
        );
    });

    test('обработка ошибок и показ модального окна', async ({ page }) => {
        await goToIngredientsPage(page);

        await page.getByText('Мята').click();
        await page.getByRole('button', { name: 'Создать с пропорциями' }).click();

        const errorModal = page.locator('.menu-flipped-card-content');
        await expect(errorModal).toBeVisible();
        await expect(errorModal.getByText(/Найдено ошибок:/i)).toBeVisible();
    });
});