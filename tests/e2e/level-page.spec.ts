import { test, expect } from '@playwright/test';

test.describe('LevelPage', () => {
    // Переходим на страницу с коктейлем, открываем рецепт и кликаем "Изучить"
    // Это имитирует реальный путь пользователя к LevelPage
    test.beforeEach(async ({ page }) => {
        // Предполагаем, что есть страница с открытым RecipeCard (например, главная или меню)
        // Если у тебя есть конкретный роут — замени на него, например: await page.goto('/menu');
        await page.goto('/'); // или твой роут, где есть коктейль

        // Ждём появления кнопки "Изучить" и кликаем по ней
        // Кнопка находится внутри модалки RecipeCard
        await page.getByText('Изучить').click();

        // Ждём загрузки LevelPage по заголовку
        await expect(page.getByRole('heading', { name: /Выберите уровень/i })).toBeVisible();

        // Проверяем, что URL изменился
        await expect(page).toHaveURL('/levelPage');
    });

    test('отображает заголовок, подсказки, кнопки уровней и оливки на canvas', async ({ page }) => {
        // Заголовок
        await expect(page.getByRole('heading', { name: /Выберите уровень/i })).toBeVisible();

        // Подсказки (hint)
        await expect(page.getByText('С подсказками без штрафов')).toBeVisible();
        await expect(page.getByText('С подсказками и штрафами')).toBeVisible();
        await expect(page.getByText('Без подсказок и штрафами за ошибки')).toBeVisible();

        // Кнопки уровней
        await expect(page.getByRole('button', { name: 'Легкий' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Средний' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Сложный' })).toBeVisible();

        // Кнопка назад
        await expect(page.getByRole('button', { name: '←' })).toBeVisible();

        // Три canvas с оливками
        const canvases = page.locator('canvas[data-testid="olive-canvas"]');
        await expect(canvases).toHaveCount(3);
    });

    test('кнопка ← возвращает на предыдущую страницу', async ({ page }) => {
        // Запоминаем текущий URL (должен быть /levelPage)
        const previousUrl = page.url();

        await page.getByRole('button', { name: '←' }).click();

        // В SPA navigate(-1) меняет URL назад
        // Ждём, что URL больше не /levelPage
        await expect(page).not.toHaveURL(previousUrl);

        // Опционально: ждём возвращения на главную или меню
        // await expect(page).toHaveURL('/'); // если возвращает на корень
    });

    test('клик по кнопкам уровней ведёт на правильные роуты', async ({ page }) => {
        // Легкий
        await page.getByRole('button', { name: 'Легкий' }).click();
        await expect(page).toHaveURL('/game/easy');

        // Возвращаемся назад, чтобы проверить остальные
        await page.goBack();
        await expect(page.getByRole('heading', { name: /Выберите уровень/i })).toBeVisible();

        // Средний
        await page.getByRole('button', { name: 'Средний' }).click();
        await expect(page).toHaveURL('/game/medium');

        await page.goBack();
        await expect(page.getByRole('heading', { name: /Выберите уровень/i })).toBeVisible();

        // Сложный
        await page.getByRole('button', { name: 'Сложный' }).click();
        await expect(page).toHaveURL('/game/hard');
    });

    test('оливки отрисовываются корректно (визуальная проверка)', async ({ page }) => {
        const canvases = page.locator('canvas[data-testid="olive-canvas"]');

        // Первая кнопка — 1 оливка
        await expect(canvases.nth(0)).toHaveScreenshot('olive-easy-1.png', {
            maxDiffPixels: 100, // допуск на антиалиасинг/dpr
        });

        // Вторая — 2 оливки
        await expect(canvases.nth(1)).toHaveScreenshot('olive-medium-2.png', {
            maxDiffPixels: 100,
        });

        // Третья — 3 оливки
        await expect(canvases.nth(2)).toHaveScreenshot('olive-hard-3.png', {
            maxDiffPixels: 100,
        });
    });
});