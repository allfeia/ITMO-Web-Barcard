import {test, expect} from '@playwright/test';
test.describe('Result page E2E', () => {

    test.beforeEach(async ({ page }) => {
        await page.route('**/mc.yandex.ru/**', route => route.abort());
    });

    test('обычный пользователь: показывает результат и кнопку "Заказать"', async ({ page }) => {
        await page.addInitScript(() => {
            sessionStorage.setItem('isBarman', 'false');
            sessionStorage.setItem('user', JSON.stringify({
                id: 1,
                login: 'user_test',
            }));
        });

        await page.goto('/result');

        await expect(page.getByRole('heading', { name: 'Готово!' })).toBeVisible();
        await expect(page.getByText(/Ваш результат/i)).toBeVisible();

        const orderButton = page.getByRole('button', { name: 'Заказать' });
        await expect(orderButton).toBeVisible();

        await orderButton.click();
        await expect(page).toHaveURL('/order');
    });
});