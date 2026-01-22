import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import ProportionsPage from '../../src/game-pages/proportions-page/ProportionsPage.jsx';
import gameReducer from '../../src/game/gameSlice';
import {proportionsErrors} from "../../src/game-pages/proportions-page/proportions_error.js";

vi.mock('../PageHeader.jsx', () => ({
    default: ({ title, showHint, onBack, onHintClick }) => (
        <header data-testid="page-header">
            <h1>{title}</h1>
            {showHint && (
                <button data-testid="hint-btn" onClick={onHintClick}>
                    Подсказка
                </button>
            )}
            <button data-testid="back-btn" onClick={onBack}>
                Назад
            </button>
        </header>
    ),
}));

vi.mock('../../menu-page/RecipeCard.jsx', () => ({
    default: ({ open, onClose, isHint }) =>
        open ? (
            <div data-testid="hint-recipe-card">
                Подсказка {isHint ? '(hint)' : ''}
                <button onClick={onClose}>Закрыть</button>
            </div>
        ) : null,
}));

vi.mock('../ErrorModal.jsx', () => ({
    default: ({ open, onClose, errorCount }) =>
        open ? (
            <div data-testid="error-modal">
                Ошибок: {errorCount}
                <button onClick={onClose}>Закрыть</button>
            </div>
        ) : null,
}));

vi.mock('../HardModeFailModal', () => ({
    default: ({ open, onClose, onStudyRecipe, onChangeMode }) =>
        open ? (
            <div data-testid="hard-fail-modal">
                <button data-testid="close-fail" onClick={onClose}>
                    Закрыть
                </button>
                <button data-testid="study-recipe" onClick={onStudyRecipe}>
                    Посмотреть рецепт
                </button>
                <button data-testid="change-mode" onClick={onChangeMode}>
                    Сменить режим
                </button>
            </div>
        ) : null,
}));

vi.mock('../../game/scoreCalculator.js', () => ({
    calculateStageScore: vi.fn(() => 78),
}));

// Самое важное — мок функции ошибок ДО импорта компонента
vi.mock('../../src/game-pages/proportions-page/proportions_error.js', () => ({
    proportionsErrors: vi.fn(),
}));

// Мок navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('ProportionsPage', () => {
    let store;

    beforeEach(() => {
        vi.clearAllMocks();

        store = configureStore({
            reducer: { game: gameReducer },
            preloadedState: {
                game: {
                    mode: 'normal',
                    selectedIngredients: {
                        gin: { id: 'gin', name: 'Джин', amount: 50 },
                        tonic: { id: 'tonic', name: 'Тоник', amount: 150 },
                    },
                    cocktailId: 'gin-tonic',
                    cocktailData: {
                        ingredients: [
                            { id: 'gin', name: 'Джин', amount: 50, unit: 'ml' },
                            { id: 'tonic', name: 'Тоник', amount: 150, unit: 'ml' },
                        ],
                    },
                    stages: {
                        stage2: { mistakes: 0, stepsCount: 0 },
                    },
                    gameOver: false,
                },
            },
        });
    });

    it('отображает заголовок и кнопку "Перейти к созданию"', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <ProportionsPage />
                </MemoryRouter>
            </Provider>,
        );

        expect(screen.getByText('Пропорции')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /перейти к созданию/i })).toBeInTheDocument();
    });

    it('показывает ингредиенты с полями ввода и единицами измерения', async () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <ProportionsPage />
                </MemoryRouter>
            </Provider>,
        );

        expect(screen.getByText('Джин')).toBeInTheDocument();
        expect(screen.getByText('Тоник')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByDisplayValue('50')).toBeInTheDocument();
            expect(screen.getByDisplayValue('150')).toBeInTheDocument();
        });

        expect(screen.getAllByText('ml').length).toBeGreaterThanOrEqual(1);
    });

    it('показывает сообщение "Нет ингредиентов..." при пустом списке', () => {
        store = configureStore({
            reducer: { game: gameReducer },
            preloadedState: {
                game: {
                    selectedIngredients: {},
                    cocktailData: { ingredients: [] },
                    stages: { stage2: {} },
                    gameOver: false,
                },
            },
        });

        render(
            <Provider store={store}>
                <MemoryRouter>
                    <ProportionsPage />
                </MemoryRouter>
            </Provider>,
        );

        expect(screen.getByText('Нет ингредиентов с заданным количеством')).toBeInTheDocument();
    });

    it('изменение количества диспатчит setIngredientAmount', async () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <ProportionsPage />
                </MemoryRouter>
            </Provider>,
        );

        const tonicInput = await waitFor(() => screen.getByDisplayValue('150'));

        fireEvent.change(tonicInput, { target: { value: '200' } });

        await waitFor(() => {
            expect(store.getActions()).toContainEqual(
                expect.objectContaining({
                    type: 'game/setIngredientAmount',
                    payload: { id: 'tonic', amount: 200 },
                }),
            );
        });
    });

    it('при 0 ошибок → переходит на /create и сохраняет score', async () => {
        vi.mocked(proportionsErrors).mockReturnValue(0);

        render(
            <Provider store={store}>
                <MemoryRouter>
                    <ProportionsPage />
                </MemoryRouter>
            </Provider>,
        );

        fireEvent.click(screen.getByRole('button', { name: /перейти к созданию/i }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/create');
        });

        expect(store.getActions()).toContainEqual(
            expect.objectContaining({
                type: 'game/setStageScore',
                payload: { stage: 'stage2', score: 78 },
            }),
        );
    });

    it('в normal mode при ошибках показывает ErrorModal', async () => {
        vi.mocked(proportionsErrors).mockReturnValue(3);

        render(
            <Provider store={store}>
                <MemoryRouter>
                    <ProportionsPage />
                </MemoryRouter>
            </Provider>,
        );

        fireEvent.click(screen.getByRole('button', { name: /перейти к созданию/i }));

        await waitFor(() => {
            expect(screen.getByTestId('error-modal')).toBeInTheDocument();
            expect(screen.getByText(/ошибок: 3/i)).toBeInTheDocument();
        });

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('в hard mode при превышении ошибок открывает HardModeFailModal', async () => {
        vi.mocked(proportionsErrors).mockReturnValue(3); // больше, чем maxAllowed

        store = configureStore({
            reducer: { game: gameReducer },
            preloadedState: {
                game: {
                    mode: 'hard',
                    selectedIngredients: {
                        gin: { id: 'gin', name: 'Джин', amount: 50 },
                    },
                    cocktailData: {
                        ingredients: [{ id: 'gin', amount: 50, unit: 'ml' }],
                    },
                    stages: {
                        stage2: { mistakes: 0, stepsCount: 1 },
                    },
                    gameOver: false,
                },
            },
        });

        render(
            <Provider store={store}>
                <MemoryRouter>
                    <ProportionsPage />
                </MemoryRouter>
            </Provider>,
        );

        fireEvent.click(screen.getByRole('button', { name: /перейти к созданию/i }));

        await waitFor(
            () => {
                expect(screen.getByTestId('hard-fail-modal')).toBeInTheDocument();
            },
            { timeout: 2000 },
        );

        expect(store.getState().game.gameOver).toBe(true);
    });

    it('кнопка подсказки открывает RecipeCard (только в normal mode)', async () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <ProportionsPage />
                </MemoryRouter>
            </Provider>,
        );

        const hintBtn = await waitFor(() => screen.getByTestId('hint-btn'));
        fireEvent.click(hintBtn);

        expect(screen.getByTestId('hint-recipe-card')).toBeInTheDocument();
        expect(screen.getByText('(hint)')).toBeInTheDocument();

        expect(store.getActions()).toContainEqual(
            expect.objectContaining({
                type: 'game/addHintUsage',
                payload: { stage: 'stage2' },
            }),
        );
    });

    it('в hard mode подсказка не отображается', () => {
        store = configureStore({
            reducer: { game: gameReducer },
            preloadedState: {
                game: {
                    mode: 'hard',
                    ...store.getState().game,
                },
            },
        });

        render(
            <Provider store={store}>
                <MemoryRouter>
                    <ProportionsPage />
                </MemoryRouter>
            </Provider>,
        );

        expect(screen.queryByTestId('hint-btn')).not.toBeInTheDocument();
    });
});