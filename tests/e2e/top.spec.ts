import { test, expect } from '@playwright/test';

test.describe('TopList page (Рейтинг бара) — E2E', () => {
    test.beforeEach(async ({ page, context }) => {
        await page.route('**/mc.yandex.ru/**', route => route.abort());
        await page.route('**/sentry*/**', route => route.abort());

        await context.addInitScript(() => {
            sessionStorage.setItem('barId', '123');
            sessionStorage.setItem('barName', 'Olive Bar');
            sessionStorage.setItem('barSite', 'https://olive.example.com');
            sessionStorage.setItem('isBarman', 'false');
            sessionStorage.setItem('token', 'fake-jwt-for-tests');
        });

        await page.route('**/api/bar/123/with-rating', route =>
            route.fulfill({
                status: 200,
                json: {
                    rating: [
                        { login: 'alice', score: 12500 },
                        { login: 'bob', score: 9800 },
                        { login: 'charlie', score: 4500 },
                        { login: 'dave', score: 1200 },
                    ],
                },
            })
        );
    });

    test('отображает загрузку, затем список рейтинга...', async ({ page }) => {
        await page.goto('/top');

        await expect(page.getByText('Загрузка рейтинга...')).toBeVisible({ timeout: 8000 });

        await expect(page.getByText('Загрузка рейтинга...')).toBeHidden({ timeout: 10000 });
        await expect(page.getByText('Olive Bar')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('12 500 очков')).toBeVisible();
        await expect(page.getByText('9 800 очков')).toBeVisible();
        await expect(page.getByText('4 500 очков')).toBeVisible();
        await expect(page.getByText('1 200 очков')).toBeVisible();

        await expect(page.locator('.position-number.top-three')).toHaveCount(3);
        await expect(page.getByText('1')).toBeVisible();
        await expect(page.getByText('2')).toBeVisible();
        await expect(page.getByText('3')).toBeVisible();
        await expect(page.getByText('4')).toBeVisible();
    });

    test('кнопка "Назад" возвращает на предыдущую страницу', async ({ page }) => {
        await page.goto('/menu');
        await page.goto('/top');

        const backButton = page.getByTestId('back-button');
        await expect(backButton).toBeVisible();

        await backButton.click();

        await expect(page).toHaveURL(/\/menu$/);
    });

    test('название бара — кликабельная ссылка в новой вкладке, если barSite есть', async ({ page, context }) => {
        const newPagePromise = context.waitForEvent('page');

        await page.goto('/top');

        const barLink = page.getByRole('link', { name: 'Olive Bar' });
        await expect(barLink).toBeVisible();

        await expect(barLink).toHaveAttribute('href', 'https://olive.example.com');
        await expect(barLink).toHaveAttribute('target', '_blank');
        await expect(barLink).toHaveAttribute('rel', 'noopener noreferrer');
        await barLink.click();
        const newPage = await newPagePromise;
        await expect(newPage).toBeTruthy();
        await expect(newPage.locator('body')).toBeVisible({ timeout: 10000 });
    });

    test('если barSite отсутствует — название бара как обычный текст (не ссылка)', async ({ page, context }) => {
        await context.addInitScript(() => {
            sessionStorage.setItem('barSite', '');
        });

        await page.goto('/top');

        const barName = page.getByText('Olive Bar');
        await expect(barName).toBeVisible();

        await expect(barName).not.toHaveAttribute('href');
        await expect(barName.evaluate(el => el.tagName)).resolves.toBe('SPAN');
    });

    test('отображает "Рейтинг пуст", если пользователей нет', async ({ page }) => {
        await page.route('**/api/bar/123/with-rating', route =>
            route.fulfill({
                status: 200,
                json: { rating: [] },
            })
        );

        await page.goto('/top');

        await expect(page.getByText('Рейтинг пуст')).toBeVisible();
        await expect(page.getByText('Станьте первым участником!')).toBeVisible();
    });

    test('показывает ошибку, если barId отсутствует', async ({ page, context }) => {
        await context.addInitScript(() => {
            sessionStorage.removeItem('barId');
        });

        await page.goto('/top');

        await expect(page.getByText('ID бара не найден')).toBeVisible();
        await expect(page.getByTestId('back-button')).toBeVisible();
    });

    test('показывает ошибку при неудачном запросе на сервер', async ({ page }) => {
        await page.route('**/api/bar/123/with-rating', route =>
            route.fulfill({
                status: 500,
                body: 'Internal Server Error',
            })
        );

        await page.goto('/top');

        await expect(page.getByText(/Ошибка 500|Не удалось загрузить рейтинг/i)).toBeVisible();
    });
});