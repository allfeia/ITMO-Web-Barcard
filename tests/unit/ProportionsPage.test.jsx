import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import ProportionsPage from '../../src/game-pages/proportions-page/ProportionsPage';
import rootReducer from '../../src/game/rootReducer'; // ← подставь реальный путь к rootReducer

// Мокаем useNavigate
const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => navigateMock,
    };
});

// Мокаем proportionsErrors
vi.mock('../../src/game-pages/proportions-page/proportions_error.js', () => ({
    proportionsErrors: vi.fn(),
}));

// Мокаем внешние компоненты, чтобы не падали
vi.mock('../../src/game-pages/PageHeader.jsx', () => ({
    default: ({ title }) => <div data-testid="page-header">{title}</div>,
}));

vi.mock('../../src/menu-page/RecipeCard.jsx', () => ({
    default: () => <div data-testid="recipe-card">RecipeCard</div>,
}));

vi.mock('../../src/components/ErrorModal.jsx', () => ({
    default: ({ open, errorCount }) =>
        open ? <div data-testid="error-modal">Ошибок: {errorCount}</div> : null,
}));

vi.mock('../../src/components/HardModeFailModal', () => ({
    default: () => <div data-testid="hard-modal">Hard Mode Fail Modal</div>,
}));

describe('ProportionsPage', () => {
    let mockStore;
    let dispatchMock;

    beforeEach(() => {
        vi.clearAllMocks();

        // Мокаем dispatch и store
        dispatchMock = vi.fn();

        mockStore = configureStore({
            reducer: rootReducer,
            preloadedState: {
                game: {
                    mode: 'easy',
                    cocktailId: 1,
                    selectedIngredients: {
                        6: { id: 6, name: 'Джин', amount: 40 },
                    },
                    cocktailData: {
                        ingredients: [
                            { id: 6, amount: 50, unit: 'ml' },
                        ],
                    },
                    stages: {
                        stage1: { stepsCount: 0, mistakes: 0, hintsUsed: 0, score: 0 },
                        stage2: { stepsCount: 0, mistakes: 0, hintsUsed: 0, score: 0 },
                        stage3: { stepsCount: 0, mistakes: 0, hintsUsed: 0, score: 0 },
                    },
                    gameOver: false,
                    gameOverReason: null,
                },
            },
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware().concat(() => (next) => (action) => {
                    dispatchMock(action);
                    return next(action);
                }),
        });
    });

    const renderPage = () =>
        render(
            <Provider store={mockStore}>
                <MemoryRouter>
                    <ProportionsPage />
                </MemoryRouter>
            </Provider>
        );

    it('рендерит ингредиент с полем ввода и единицей измерения', () => {
        renderPage();

        expect(screen.getByText('Джин')).toBeInTheDocument();
        expect(screen.getByDisplayValue('40')).toBeInTheDocument();
        expect(screen.getByText('ml')).toBeInTheDocument();
    });

    it('диспатчит setIngredientAmount при вводе значения', () => {
        renderPage();

        const input = screen.getByDisplayValue('40');

        fireEvent.change(input, { target: { value: '45' } });

        expect(dispatchMock).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'game/setIngredientAmount',
                payload: { id: 6, amount: 45 },
            })
        );
    });

    it('показывает ErrorModal и диспатчит ошибку, если пропорции неверны', () => {
        vi.mocked(proportionsErrors).mockReturnValue(1);

        renderPage();

        fireEvent.click(screen.getByText('Перейти к созданию'));

        expect(dispatchMock).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'game/addStageMistake',
                payload: { stage: 'stage2', count: 1 },
            })
        );

        expect(screen.getByTestId('error-modal')).toHaveTextContent('Ошибок: 1');
    });

    it('переходит на /create, если ошибок нет', () => {
        vi.mocked(proportionsErrors).mockReturnValue(0);

        renderPage();

        fireEvent.click(screen.getByText('Перейти к созданию'));

        expect(navigateMock).toHaveBeenCalledWith('/create');
    });
});