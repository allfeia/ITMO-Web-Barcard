import { test, expect } from '@playwright/test';

test.describe('Result page — E2E', () => {
    test.beforeEach(async ({ page, context }) => {

        await page.route('**/mc.yandex.ru/**', route => route.abort());
        await page.route('**/sentry*/**', route => route.abort());

        await context.addInitScript(() => {
            sessionStorage.setItem('barId', '123');
            sessionStorage.setItem('barName', 'Olive Bar');
            sessionStorage.setItem('barSite', 'https://example.bar');
        });

        await page.route('**/api/cocktail/**', route =>
            route.fulfill({
                status: 200,
                json: {
                    id: 999,
                    name: 'Test Cocktail',
                    ingredients: [],
                    steps: [],
                },
            })
        );

        await page.route('**/api/rating/update-score', route =>
            route.fulfill({
                status: 200,
                json: { success: true, message: 'Score updated' },
            })
        );
    });

    test('Обычный игрок видит свой результат + кнопку "Заказать"', async ({ page }) => {

        await page.addInitScript(() => {
            sessionStorage.setItem('isBarman', 'false');
            sessionStorage.setItem('currentUser', JSON.stringify({
                id: 1001,
                login: 'player_one',
                roles: [],
            }));
            sessionStorage.setItem('token', 'fake-jwt-player');
        });

        await page.goto('/result', { waitUntil: 'networkidle' });


        await expect(page.getByText('Готово!')).toBeVisible();

        await expect(page.getByText(/Ваш результат:/)).toBeVisible();
        await expect(page.getByText('★')).toBeVisible();

        await expect(page.getByRole('button', { name: 'Заказать' })).toBeVisible();

        await expect(page.getByTitle('переиграть')).toBeVisible();
        await expect(page.getByTitle('бар')).toBeVisible();

        await expect(page.getByRole('link', { name: 'Рейтинг' })).not.toBeVisible();

        await page.getByTitle('переиграть').click();
        await expect(page).toHaveURL(/\/levelPage$/);

        await page.goBack();
        await page.getByTitle('бар').click();
        await expect(page).toHaveURL(/\/menu$/);
    });

    test('Бармен видит ссылку на Рейтинг, НЕ видит кнопку Заказать + происходит попытка отправки очков', async ({ page }) => {
        // Имитируем бармена
        await page.addInitScript(() => {
            sessionStorage.setItem('isBarman', 'true');
            sessionStorage.setItem('currentUser', JSON.stringify({
                id: 500,
                login: 'bartender_max',
                roles: ['BARMAN'],
            }));
            sessionStorage.setItem('token', 'fake-jwt-barman');
        });

        const scoreRequestPromise = page.waitForRequest(
            req => req.url().includes('/api/rating/update-score') && req.method() === 'POST',
            { timeout: 8000 }
        );

        await page.goto('/result', { waitUntil: 'networkidle' });

        await expect(page.getByRole('link', { name: 'Рейтинг' })).toBeVisible();
        await expect(page.getByText(/Рейтинг\s*:\s*\d+\s*★/)).toBeVisible();

        await expect(page.getByRole('button', { name: 'Заказать' })).not.toBeVisible();

        const request = await scoreRequestPromise;
        expect(request.method()).toBe('POST');

        const body = JSON.parse(request.postData() || '{}');
        expect(body).toMatchObject({
            login: 'bartender_max',
            score: expect.any(Number),
        });

        await page.getByRole('link', { name: 'Рейтинг' }).click();
        await expect(page).toHaveURL(/\/top$/);
    });

    test('Если totalScore = 0 → очки НЕ отправляются (бармен)', async ({ page }) => {
        await page.addInitScript(() => {
            sessionStorage.setItem('isBarman', 'true');
            sessionStorage.setItem('currentUser', JSON.stringify({
                id: 501,
                login: 'bartender_zero',
                roles: ['BARMAN'],
            }));
        });

        const requestPromise = page.waitForRequest(
            () => true,
            { timeout: 3000 }
        ).catch(() => null);

        await page.goto('/result', { waitUntil: 'networkidle' });

        const request = await requestPromise;
        expect(request).toBeNull();
    });

    test('Если уже отправляли сегодня → повторно НЕ отправляем', async ({ page, context }) => {
        const today = new Date().toLocaleDateString();

        await page.addInitScript(({ todayKey }) => {
            sessionStorage.setItem('isBarman', 'true');
            sessionStorage.setItem('currentUser', JSON.stringify({
                id: 777,
                login: 'repeat_barman',
                roles: ['BARMAN'],
            }));

            localStorage.setItem(`scoreSent_777_${todayKey}`, 'true');
        }, { todayKey: today });

        const requestPromise = page.waitForRequest(
            () => true,
            { timeout: 3000 }
        ).catch(() => null);

        await page.goto('/result');

        const request = await requestPromise;
        expect(request).toBeNull();
    });
});