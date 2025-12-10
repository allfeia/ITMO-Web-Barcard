import { test, expect } from '@playwright/test';

test.describe('StartPage — E2E тесты', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('отображается заголовок Barcard и кнопка "Начать"', async ({ page }) => {
        await expect(page.locator('.title')).toBeVisible();
        await expect(page.locator('.title')).toHaveText('Barcard');
        await expect(page.locator('.start-button')).toBeVisible();
        await expect(page.locator('.start-button')).toHaveText('Начать');
    });

    test('анимация стаканов работает (хотя бы один трек движется)', async ({ page }) => {
        await expect(page.locator('.track-inner').first()).toHaveCSS('animation-name', /slide/);

        const canvas = page.locator('canvas.glass-icon').first();
        await expect(canvas).toBeVisible();

        const hasColor = await canvas.evaluate((el) => {
            const canvas = el as HTMLCanvasElement;
            const ctx = canvas.getContext('2d');
            if (!ctx || canvas.width === 0 || canvas.height === 0) return false;
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            for (let i = 0; i < data.length; i += 4) {
                if (data[i + 3] !== 0 && (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255)) {
                    return true;
                }
            }
            return false;
        });

        expect(hasColor).toBe(true);
    });

    test('когда в URL нет параметров — кнопка "Начать" ничего не делает', async ({ page }) => {
        await page.locator('.start-button').click();
        await expect(page).toHaveURL('/');
    });

    test('когда пользователь — обычный гость (isBarman=false) → переходит на /menu', async ({ page }) => {
        await page.goto('/?barId=123&isBarman=false');
        await page.locator('.start-button').click();
        await expect(page).toHaveURL(/\/menu$/);
    });

    test('когда пользователь — бармен (isBarman=true) → переходит на /signInPage', async ({ page }) => {
        await page.goto('/?barId=456&isBarman=true');
        await page.locator('.start-button').click();
        await expect(page).toHaveURL(/\/signInPage$/);
    });

    test('сохраняет barId и isBarman в sessionStorage', async ({ page }) => {
        await page.goto('/?barId=789&isBarman=true');

        await expect.poll(async () => {
            const barId = await page.evaluate(() => window.sessionStorage.getItem('barId'));
            const isBarman = await page.evaluate(() => window.sessionStorage.getItem('isBarman'));
            return { barId, isBarman };
        }, {
            timeout: 15000,
            intervals: [100, 200, 500, 1000]
        }).toEqual({ barId: '789', isBarman: 'true' });

        await page.locator('.start-button').click();
        await expect(page).toHaveURL(/\/signInPage$/);

        expect(await page.evaluate(() => window.sessionStorage.getItem('barId'))).toBe('789');
        expect(await page.evaluate(() => window.sessionStorage.getItem('isBarman'))).toBe('true');
    });

    test('работает на разных размерах экрана', async ({ page }) => {
        await page.setViewportSize({ width: 414, height: 896 });
        await expect(page.locator('.title')).toBeVisible();
        await expect(page.locator('.start-button')).toBeVisible();
        await expect(page.locator('.start-button')).toHaveCSS('position', 'absolute');

        await page.setViewportSize({ width: 375, height: 667 });
        await expect(page.locator('.title')).toBeVisible();
        await expect(page.locator('.start-button')).toBeVisible();
    });
});