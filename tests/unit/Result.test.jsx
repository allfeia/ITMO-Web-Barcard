// tests/unit/Result.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import Result from '../../src/game-pages/result-page/Result.jsx';
import gameReducer from '../../src/game/gameSlice';

// Мок CocktailCanvas — возвращаем canvas, чтобы соответствовать реальному DOM
vi.mock('../../src/game-pages/result-page/CocktailCanvas', () => ({
    default: () => (
        <canvas
            data-testid="cocktail-canvas"
            className="cocktail-canvas"
            aria-label="Нарисованный коктейль с оливкой"
            width="200"
            height="260"
        />
    ),
}));

// Мок useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Result component', () => {
    let store;

    beforeEach(() => {
        vi.clearAllMocks();

        store = configureStore({
            reducer: {
                game: gameReducer,
            },
            preloadedState: {
                game: {
                    stages: {
                        stage1: { score: 40 },
                        stage2: { score: 70 },
                        stage3: { score: 15 },
                    },
                },
            },
        });
    });

    it('отображает заголовок «Готово!»', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <Result />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByText('Готово!')).toBeInTheDocument();
    });

    it('правильно суммирует и показывает общий рейтинг', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <Result />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByText('Рейтинг: 125 ★')).toBeInTheDocument();
    });

    it('показывает 0 если нет ни одного скора', () => {
        store = configureStore({
            reducer: { game: gameReducer },
            preloadedState: {
                game: { stages: {} },
            },
        });

        render(
            <Provider store={store}>
                <MemoryRouter>
                    <Result />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByText('Рейтинг: 0 ★')).toBeInTheDocument();
    });

    it('рендерит CocktailCanvas', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <Result />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByTestId('cocktail-canvas')).toBeInTheDocument();
    });

    it('при клике на «Переиграть» → navigate на /levelPage', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <Result />
                </MemoryRouter>
            </Provider>
        );

        // Более надёжный поиск: по title атрибуту (tooltip)
        const replayBtn = screen.getByTitle('переиграть');
        fireEvent.click(replayBtn);

        expect(mockNavigate).toHaveBeenCalledWith('/levelPage');
    });

    it('при клике на иконку «Бар» → navigate на /menu', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <Result />
                </MemoryRouter>
            </Provider>
        );

        const barBtn = screen.getByTitle('бар');
        fireEvent.click(barBtn);

        expect(mockNavigate).toHaveBeenCalledWith('/menu');
    });

    it('при клике на кнопку «Заказать» → navigate на /order', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <Result />
                </MemoryRouter>
            </Provider>
        );

        // Кнопка "Заказать" — это полноценный Button, ищем по тексту
        const orderBtn = screen.getByRole('button', { name: /заказать/i });
        fireEvent.click(orderBtn);

        expect(mockNavigate).toHaveBeenCalledWith('/order');
    });

    it('отображаются подписи под иконками', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <Result />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByText('Переиграть')).toBeInTheDocument();
        expect(screen.getByText('Бар')).toBeInTheDocument();
    });
});