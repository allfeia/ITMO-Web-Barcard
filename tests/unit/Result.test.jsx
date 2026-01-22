import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import Result from '../../src/game-pages/result-page/Result';
import rootReducer from '../../src/game/rootReducer'; // ← правильный путь к rootReducer

// Мокаем useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Мокаем CocktailCanvas
vi.mock('../../src/game-pages/result-page/CocktailCanvas', () => ({
    default: () => <div data-testid="cocktail-canvas">Mocked Cocktail Canvas</div>,
}));

describe('Result', () => {
    let mockStore;

    beforeEach(() => {
        mockNavigate.mockClear();

        mockStore = configureStore({
            reducer: rootReducer,
            preloadedState: {
                game: {
                    stages: {
                        stage1: { score: 0 },
                        stage2: { score: 0 },
                        stage3: { score: 0 },
                    },
                },
            },
        });
    });

    const renderResult = (customStages = {}) => {
        // Создаём store с кастомным состоянием для теста
        const storeWithState = configureStore({
            reducer: rootReducer,
            preloadedState: {
                game: {
                    stages: {
                        stage1: { score: 0 },
                        stage2: { score: 0 },
                        stage3: { score: 0 },
                        ...customStages,
                    },
                },
            },
        });

        return render(
            <Provider store={storeWithState}>
                <MemoryRouter>
                    <Result />
                </MemoryRouter>
            </Provider>
        );
    };

    it('отображает заголовок "Готово!"', () => {
        renderResult();
        expect(screen.getByText('Готово!')).toBeInTheDocument();
    });

    it('показывает рейтинг по умолчанию (0, если нет данных в сторе)', () => {
        renderResult();
        expect(screen.getByText(/Рейтинг:\s*0\s*★/i)).toBeInTheDocument();
    });

    it('отображает рейтинг из Redux (сумма stage1 + stage2 + stage3)', () => {
        renderResult({
            stage1: { score: 200 },
            stage2: { score: 300 },
            stage3: { score: 80 },
        });

        expect(screen.getByText(/Рейтинг:\s*580\s*★/i)).toBeInTheDocument();
    });

    it('рендерит CocktailCanvas внутри .cocktail-container', () => {
        renderResult();
        const canvas = screen.getByTestId('cocktail-canvas');
        expect(canvas).toBeInTheDocument();

        const container = canvas.closest('.cocktail-container');
        expect(container).toBeInTheDocument();
        expect(container).toContainElement(canvas);
    });

    it('кнопка "Переиграть" вызывает navigate на /levelPage', () => {
        renderResult();

        const replayButton = screen.getByRole('button', { name: /переиграть/i });
        fireEvent.click(replayButton);

        expect(mockNavigate).toHaveBeenCalledWith('/levelPage');
    });

    it('кнопка "Бар" вызывает navigate на /menu', () => {
        renderResult();

        const barButton = screen.getByRole('button', { name: /бар/i });
        fireEvent.click(barButton);

        expect(mockNavigate).toHaveBeenCalledWith('/menu');
    });

    it('кнопка "Заказать" вызывает navigate на /order', () => {
        renderResult();

        const orderButton = screen.getByRole('button', { name: /заказать/i });
        fireEvent.click(orderButton);

        expect(mockNavigate).toHaveBeenCalledWith('/order');
    });

    it('отображает две иконки с подписями "Переиграть" и "Бар"', () => {
        renderResult();

        expect(screen.getByText('Переиграть')).toBeInTheDocument();
        expect(screen.getByText('Бар')).toBeInTheDocument();

        expect(screen.getByText('Переиграть')).toHaveClass('icon-label');
        expect(screen.getByText('Бар')).toHaveClass('icon-label');
    });

    it('Stack с иконками отображается корректно (две группы кнопок)', () => {
        renderResult();

        const iconContainers = screen.getAllByText(/Переиграть|Бар/)
            .map(el => el.closest('.icon-button-container'))
            .filter(Boolean);

        expect(iconContainers).toHaveLength(2);
    });

    it('рендерит кнопку "Заказать" с правильными пропсами MUI', () => {
        renderResult();
        const orderBtn = screen.getByRole('button', { name: /заказать/i });

        expect(orderBtn).toHaveClass('order-button');
        expect(orderBtn).not.toBeDisabled();
    });

    it('отрисовывает правильную структуру: titleResult, subtitle, button-stack', () => {
        renderResult({
            stage1: { score: 200 },
            stage2: { score: 300 },
            stage3: { score: 80 },
        });

        const title = screen.getByText('Готово!');
        expect(title).toHaveClass('titleResult');

        const subtitle = screen.getByText(/Рейтинг:\s*580\s*★/i);
        expect(subtitle).toHaveClass('subtitle');

        const stack = screen.getByText('Переиграть').closest('.button-stack');
        expect(stack).toBeInTheDocument();
        expect(stack).toHaveClass('button-stack');
    });

    it('handle-функции вызывают navigate с правильными путями (альтернативная проверка)', () => {
        renderResult();

        fireEvent.click(screen.getByTitle('переиграть'));
        expect(mockNavigate).toHaveBeenNthCalledWith(1, '/levelPage');

        fireEvent.click(screen.getByTitle('бар'));
        expect(mockNavigate).toHaveBeenNthCalledWith(2, '/menu');

        fireEvent.click(screen.getByRole('button', { name: /заказать/i }));
        expect(mockNavigate).toHaveBeenNthCalledWith(3, '/order');
    });
});