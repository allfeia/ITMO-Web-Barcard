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
        const firstTrack = page.locator('.track-inner').first();
        await expect(firstTrack).toHaveCSS('animation-name', /slide/);

        const canvas = page.locator('canvas.glass-icon').first();
        await expect(canvas).toBeVisible();

        const hasColor = await canvas.evaluate((canvas) => {
            const ctx = (canvas as HTMLCanvasElement).getContext('2d');
            if (!ctx || canvas.clientWidth === 0 || canvas.clientHeight === 0) return false;

            const { width, height } = canvas as HTMLCanvasElement;
            const imageData = ctx.getImageData(0, 0, width, height).data;

            for (let i = 0; i < imageData.length; i += 4) {
                const a = imageData[i + 3];
                if (a === 0) continue;
                const r = imageData[i];
                const g = imageData[i + 1];
                const b = imageData[i + 2];
                if (!(r === 255 && g === 255 && b === 255)) return true;
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

        expect(await page.evaluate(() => sessionStorage.getItem('barId'))).toBe('789');
        expect(await page.evaluate(() => sessionStorage.getItem('isBarman'))).toBe('true');

        await page.locator('.start-button').click();
        await expect(page).toHaveURL(/\/signInPage$/);

        expect(await page.evaluate(() => sessionStorage.getItem('barId'))).toBe('789');
        expect(await page.evaluate(() => sessionStorage.getItem('isBarman'))).toBe('true');
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