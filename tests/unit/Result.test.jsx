import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import Result from '../../src/game-pages/result-page/Result';
import gameReducer from '../../src/game/gameSlice';

// Мокаем CocktailCanvas — теперь как canvas, чтобы было ближе к реальности
vi.mock('../../src/game-pages/result-page/CocktailCanvas', () => ({
    default: () => <canvas data-testid="cocktail-canvas" aria-label="Нарисованный коктейль" />,
}));

// Мокаем useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Result', () => {
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

    // остальные тесты без изменений
    it('отображает заголовок «Готово!»', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <Result />
                </MemoryRouter>
            </Provider>,
        );

        expect(screen.getByText('Готово!')).toBeInTheDocument();
    });

    it('правильно суммирует и показывает общий рейтинг', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <Result />
                </MemoryRouter>
            </Provider>,
        );

        expect(screen.getByText('Рейтинг: 125 ★')).toBeInTheDocument();
    });

    it('показывает рейтинг 0, если скора нет', () => {
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
            </Provider>,
        );

        expect(screen.getByText('Рейтинг: 0 ★')).toBeInTheDocument();
    });

    it('рендерит CocktailCanvas', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <Result />
                </MemoryRouter>
            </Provider>,
        );

        expect(screen.getByTestId('cocktail-canvas')).toBeInTheDocument();
    });

    it('при клике на «Переиграть» перенаправляет на /levelPage', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <Result />
                </MemoryRouter>
            </Provider>,
        );

        const replayButton = screen.getByRole('button', { name: /переиграть/i });
        fireEvent.click(replayButton);

        expect(mockNavigate).toHaveBeenCalledWith('/levelPage');
    });

    it('при клике на «Бар» перенаправляет на /menu', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <Result />
                </MemoryRouter>
            </Provider>,
        );

        const barButton = screen.getByRole('button', { name: /бар/i });
        fireEvent.click(barButton);

        expect(mockNavigate).toHaveBeenCalledWith('/menu');
    });

    it('при клике на «Заказать» перенаправляет на /order', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <Result />
                </MemoryRouter>
            </Provider>,
        );

        const orderButton = screen.getByRole('button', { name: /заказать/i });
        fireEvent.click(orderButton);

        expect(mockNavigate).toHaveBeenCalledWith('/order');
    });

    it('отображаются подписи под иконками', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <Result />
                </MemoryRouter>
            </Provider>,
        );

        expect(screen.getByText('Переиграть')).toBeInTheDocument();
        expect(screen.getByText('Бар')).toBeInTheDocument();
    });
});