import { test, expect } from '@playwright/test';

test.describe('BarmanAuthForm E2E', () => {
    test.beforeEach(async ({ page }) => {

        await page.addInitScript(() => {
            sessionStorage.setItem('barId', '123');
        });
        await page.goto('/signInPage');
    });

    test('отображает все поля и кнопку', async ({ page }) => {
        await expect(page.getByLabel('Почта / Логин / Имя')).toBeVisible();
        await expect(page.getByLabel('Пароль')).toBeVisible();
        await expect(page.getByLabel('Барный ключ')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Войти' })).toBeVisible();
    });

    test('показывает ошибки при пустом submit', async ({ page }) => {
        await page.getByRole('button', { name: 'Войти' }).click();

        await expect(page.getByText('Введите почту / логин / имя')).toBeVisible();
        await expect(page.getByText('Введите пароль')).toBeVisible();
        await expect(page.getByText('Введите ключ бара')).toBeVisible();
    });

    test('успешный вход перенаправляет на /menu', async ({ page }) => {

        await page.goto('/signInPage');

        await page.route('**/api/barman/auth', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    ok: true,
                    mode: "login",
                    message: "Успешный вход",
                    token: "fake-token",
                    roles: ["BARMAN"],
                    barId: 123,
                    barName: "Olive Bar"
                }),
            });
        });

        await page.getByLabel('Почта / Логин / Имя').fill('ivan');
        await page.getByLabel('Пароль').fill('ivan');
        await page.getByLabel('Барный ключ').fill('OLIVE-2024');

        await page.getByRole('button', { name: 'Войти' }).click();

        await expect(page).toHaveURL('/menu');
    });

    test('показывает ошибку при неверном пароле', async ({ page }) => {
        await page.route('/api/barman/auth', async (route) => {
            await route.fulfill({
                status: 403,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Неверный пароль' }),
            });
        });

        await page.getByLabel('Почта / Логин / Имя').fill('ivan');
        await page.getByLabel('Пароль').fill('wrong');
        await page.getByLabel('Барный ключ').fill('OLIVE-2024');

        await page.getByRole('button', { name: 'Войти' }).click();

        await expect(page.locator('#auth-password-helper-text'))
            .toHaveText('Неверный пароль');
        await expect(page.locator('#auth-password-helper-text'))
            .toBeVisible();
    });

    test('показывает ошибку при отсутствии barId', async ({ page }) => {

        await page.goto('/signInPage');

        await page.evaluate(() => sessionStorage.clear());

        await page.getByLabel('Почта / Логин / Имя').fill('user');
        await page.getByLabel('Пароль').fill('123456');
        await page.getByLabel('Барный ключ').fill('key');

        await page.getByRole('button', { name: 'Войти' }).click();

        const consoleMessages: string[] = [];
        page.on('console', (msg) => {
            if (msg.text().includes('barId не найден')) {
                consoleMessages.push(msg.text());
            }
        });

        await page.reload();
        await page.evaluate(() => sessionStorage.clear());
        await page.getByLabel('Почта / Логин / Имя').fill('user');
        await page.getByLabel('Пароль').fill('123456');
        await page.getByLabel('Барный ключ').fill('key');
        await page.getByRole('button', { name: 'Войти' }).click();

    });

    test('переключает видимость пароля и барного ключа', async ({ page }) => {
        const passwordInput = page.getByLabel('Пароль');
        const keyInput = page.getByLabel('Барный ключ');

        await expect(passwordInput).toHaveAttribute('type', 'password');
        await expect(keyInput).toHaveAttribute('type', 'password');

        const passwordToggle = passwordInput.locator('+ .MuiInputAdornment-root button');
        await passwordToggle.click();
        await expect(passwordInput).toHaveAttribute('type', 'text');

        await passwordToggle.click();
        await expect(passwordInput).toHaveAttribute('type', 'password');

        const keyToggle = keyInput.locator('+ .MuiInputAdornment-root button');
        await keyToggle.click();
        await expect(keyInput).toHaveAttribute('type', 'text');

        await keyToggle.click();
        await expect(keyInput).toHaveAttribute('type', 'password');
    });
});