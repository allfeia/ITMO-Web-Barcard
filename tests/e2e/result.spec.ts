import { test, expect } from '@playwright/test';

test.describe('Result page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/result');
    });

    test('отображает заголовок "Готово!" и рейтинг', async ({ page }) => {
        await expect(page.getByText('Готово!')).toBeVisible();
        await expect(page.getByText(/Рейтинг/i)).toBeVisible();
        await expect(page.getByText('326 ★')).toBeVisible();
    });
    test('показывает CocktailCanvas (проверяем, что блок появился)', async ({ page }) => {
        const canvasContainer = page.locator('.cocktail-container');
        await expect(canvasContainer).toBeVisible();
        await expect(canvasContainer.locator('canvas')).toBeVisible();
        await expect(canvasContainer).toHaveCount(1);
    });

    test('кнопка "Переиграть" ведёт на /levelPage', async ({ page }) => {
        const replayButton = page.getByRole('button', { name: /переиграть/i });
        await expect(replayButton).toBeVisible();
        await replayButton.click();
        await page.waitForURL('**/levelPage**');
        await expect(page).toHaveURL(/levelPage/);
        await expect(page.getByText(/Выберите/i)).toBeVisible();
        await expect(page.getByText(/уровень/i)).toBeVisible();
    });

    test('кнопка "Бар" ведёт на /menu', async ({ page }) => {
        const barButton = page.getByRole('button', { name: /бар/i });
        await expect(barButton).toBeVisible();
        await barButton.click();
        await page.waitForURL('**/menu**');
        await expect(page).toHaveURL(/menu/);
    });

    test('кнопка "Заказать" ведёт на /order', async ({ page }) => {
        const orderButton = page.getByRole('button', { name: 'Заказать' });
        await expect(orderButton).toBeVisible();
        await expect(orderButton).toHaveClass(/MuiButton-contained/);
        await orderButton.click();
        await page.waitForURL('**/order**');
        await expect(page).toHaveURL(/order/);
    });

    test('иконки и лейблы отображаются корректно', async ({ page }) => {
        await expect(page.getByTitle('Переиграть')).toBeVisible();
        await expect(page.getByTitle('Бар')).toBeVisible();
        await expect(page.getByTitle('переиграть')).toBeVisible();
        await expect(page.getByTitle('бар')).toBeVisible();
    });

});