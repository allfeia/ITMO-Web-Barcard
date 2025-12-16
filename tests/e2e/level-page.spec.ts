import { test, expect } from '@playwright/test';

test.describe('LevelPage — выбор уровня сложности', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/levelPage');
        await expect(page.getByRole('heading', { name: /Выберите уровень/i })).toBeVisible();
    });

    test('отображает заголовок, подсказки, кнопки уровней и оливки отрисованы', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /Выберите уровень/i })).toBeVisible();

        await expect(page.getByRole('button', { name: '←' })).toBeVisible();

        await expect(page.getByText('С подсказками без штрафов')).toBeVisible();
        await expect(page.getByText('С подсказками и штрафами')).toBeVisible();
        await expect(page.getByText('Без подсказок и штрафами за ошибки')).toBeVisible();

        await expect(page.getByRole('button', { name: 'Легкий' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Средний' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Сложный' })).toBeVisible();

        const canvases = page.locator('canvas[data-testid="olive-canvas"]');
        await expect(canvases).toHaveCount(3);

        for (let i = 0; i < 3; i++) {
            const canvas = canvases.nth(i);
            const box = await canvas.boundingBox();
            expect(box?.width).toBeGreaterThan(50);
            expect(box?.height).toBeGreaterThan(50);
        }
    });

    test('клик по кнопке ← возвращает назад', async ({ page }) => {
        await page.getByRole('button', { name: '←' }).click();
        await expect(page).not.toHaveURL('/levelPage');
    });

    test('клик по уровням ведёт на правильные страницы игры', async ({ page }) => {
        await page.evaluate(() => window.scrollTo(0, 0));

        await page.getByRole('button', { name: 'Легкий' }).click({ force: true });
        await expect(page).toHaveURL('/game/easy');
        await page.goto('/levelPage');
        await page.evaluate(() => window.scrollTo(0, 0));

        await page.getByRole('button', { name: 'Средний' }).click({ force: true });
        await expect(page).toHaveURL('/game/medium');
        await page.goto('/levelPage');
        await page.evaluate(() => window.scrollTo(0, 0));

        await page.getByRole('button', { name: 'Сложный' }).click({ force: true });
        await expect(page).toHaveURL('/game/hard');
    });

    test('оливки отрисовываются по-разному в зависимости от уровня (визуальная проверка)', async ({ page }) => {
        const canvases = page.locator('canvas[data-testid="olive-canvas"]');

        await expect(canvases.nth(0)).toHaveScreenshot('level-easy-olive.png', { maxDiffPixels: 200 });
        await expect(canvases.nth(1)).toHaveScreenshot('level-medium-olive.png', { maxDiffPixels: 200 });
        await expect(canvases.nth(2)).toHaveScreenshot('level-hard-olive.png', { maxDiffPixels: 200 });
    });
});