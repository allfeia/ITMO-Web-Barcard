import { test, expect } from '@playwright/test';

test.describe('LevelPage', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.getByText('Изучить').click();
        await expect(page.getByRole('heading', { name: /Выберите уровень/i })).toBeVisible();
        await expect(page).toHaveURL('/levelPage');
    });

    test('отображает заголовок, подсказки, кнопки уровней и оливки на canvas', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /Выберите уровень/i })).toBeVisible();
        await expect(page.getByText('С подсказками без штрафов')).toBeVisible();
        await expect(page.getByText('С подсказками и штрафами')).toBeVisible();
        await expect(page.getByText('Без подсказок и штрафами за ошибки')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Легкий' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Средний' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Сложный' })).toBeVisible();
        await expect(page.getByRole('button', { name: '←' })).toBeVisible();
        const canvases = page.locator('canvas[data-testid="olive-canvas"]');
        await expect(canvases).toHaveCount(3);
    });

    test('кнопка ← возвращает на предыдущую страницу', async ({ page }) => {
        const previousUrl = page.url();
        await page.getByRole('button', { name: '←' }).click();
        await expect(page).not.toHaveURL(previousUrl);
    });

    test('клик по кнопкам уровней ведёт на правильные роуты', async ({ page }) => {
        await page.getByRole('button', { name: 'Легкий' }).click();
        await expect(page).toHaveURL('/game/easy');
        await page.goBack();
        await expect(page.getByRole('heading', { name: /Выберите уровень/i })).toBeVisible();
        await page.getByRole('button', { name: 'Средний' }).click();
        await expect(page).toHaveURL('/game/medium');
        await page.goBack();
        await expect(page.getByRole('heading', { name: /Выберите уровень/i })).toBeVisible();
        await page.getByRole('button', { name: 'Сложный' }).click();
        await expect(page).toHaveURL('/game/hard');
    });

    test('оливки отрисовываются корректно (визуальная проверка)', async ({ page }) => {
        const canvases = page.locator('canvas[data-testid="olive-canvas"]');
        await expect(canvases.nth(0)).toHaveScreenshot('olive-easy-1.png', {
            maxDiffPixels: 100,
        });
        await expect(canvases.nth(1)).toHaveScreenshot('olive-medium-2.png', {
            maxDiffPixels: 100,
        });
        await expect(canvases.nth(2)).toHaveScreenshot('olive-hard-3.png', {
            maxDiffPixels: 100,
        });
    });
});