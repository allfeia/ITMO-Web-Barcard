import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import IngredientsPage from '../../src/game-pages/ingredients-page/IngredientsPage';
import rootReducer from '../../src/game/rootReducer'; // ← твой rootReducer

// Мокаем useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Мокаем useIngredients (возвращает данные для рендера)
vi.mock('../../src/game-pages/ingredients-page/Ingredients', () => ({
    useIngredients: () => ({
        searchValue: '',
        setSearchValue: vi.fn(),
        groupedIngredients: [
            {
                type: 'alcohol',
                title: 'Алкогольные',
                items: [
                    { id: 1, name: 'Белый ром' },
                    { id: 2, name: 'Лайм' },
                ],
            },
        ],
    }),
}));

// Мокаем drawHint
vi.mock('../../src/game-pages/hint.js', () => ({
    default: vi.fn(),
}));

// Мокаем ingredientErrors
vi.mock('../../src/game-pages/ingredients-page/ingredients_error.js', () => ({
    ingredientErrors: vi.fn(),
}));

// Мокаем RecipeCard и ErrorModal
vi.mock('../../src/menu-page/RecipeCard.jsx', () => ({
    default: () => <div data-testid="recipe-card">RecipeCard</div>,
}));

vi.mock('../../src/components/ErrorModal.jsx', () => ({
    default: ({ open, errorCount }) =>
        open ? <div data-testid="error-modal">Ошибок: {errorCount}</div> : null,
}));

// Мокаем HardModeFailModal (чтобы не падал при gameOver)
vi.mock('../../src/components/HardModeFailModal', () => ({
    default: () => <div data-testid="hard-modal">Hard Mode Fail Modal</div>,
}));

describe('IngredientsPage', () => {
    let mockStore;

    beforeEach(() => {
        vi.clearAllMocks();

        // Создаём моковый store с нужным состоянием
        mockStore = configureStore({
            reducer: rootReducer,
            preloadedState: {
                game: {
                    mode: 'easy',
                    cocktailId: 1,
                    cocktailData: {
                        ingredients: [
                            { id: 1, name: 'Белый ром' },
                            { id: 2, name: 'Лайм' },
                        ],
                    },
                    selectedIngredients: {},
                    stages: {
                        stage1: {
                            stepsCount: 0,
                            mistakes: 0,
                            hintsUsed: 0,
                            score: 0,
                        },
                        stage2: { stepsCount: 0, mistakes: 0, hintsUsed: 0, score: 0 },
                        stage3: { stepsCount: 0, mistakes: 0, hintsUsed: 0, score: 0 },
                    },
                    gameOver: false,
                    gameOverReason: null,
                },
            },
        });
    });

    const renderPage = () =>
        render(
            <Provider store={mockStore}>
                <MemoryRouter>
                    <IngredientsPage />
                </MemoryRouter>
            </Provider>
        );

    it('рендерит заголовок страницы', () => {
        renderPage();
        expect(screen.getByText('Ингредиенты')).toBeInTheDocument();
    });

    it('рендерит кнопку назад', () => {
        renderPage();
        expect(screen.getByTestId('back-button')).toBeInTheDocument();
    });

    it('клик по кнопке назад вызывает navigate(-1) и resetLevel', () => {
        renderPage();

        fireEvent.click(screen.getByTestId('back-button'));

        expect(mockNavigate).toHaveBeenCalledWith(-1);
        expect(mockStore.getActions()).toContainEqual({
            type: 'game/resetLevel',
        });
    });

    it('рисует ингредиенты', () => {
        renderPage();

        expect(screen.getByText('Белый ром')).toBeInTheDocument();
        expect(screen.getByText('Лайм')).toBeInTheDocument();
    });

    it('клик по ингредиенту вызывает toggleIngredient', () => {
        renderPage();

        fireEvent.click(screen.getByText('Лайм'));

        expect(mockStore.getActions()).toContainEqual({
            type: 'game/toggleIngredient',
            payload: expect.objectContaining({ id: 2, name: 'Лайм' }),
        });
    });

    it('вызывает drawHint при монтировании (mode !== hard)', () => {
        renderPage();
        expect(vi.mocked(drawHint)).toHaveBeenCalledTimes(1);
    });

    it('если есть ошибки — открывает модалку и dispatch addStageMistake', () => {
        vi.mocked(ingredientErrors).mockReturnValue(2);

        renderPage();

        fireEvent.click(screen.getByText('Создать с пропорциями'));

        expect(mockStore.getActions()).toContainEqual({
            type: 'game/addStageMistake',
            payload: { stage: 'stage1', count: 2 },
        });

        expect(screen.getByTestId('error-modal')).toHaveTextContent('Ошибок: 2');
    });

    it('если ошибок нет — переходит на /proportions', () => {
        vi.mocked(ingredientErrors).mockReturnValue(0);

        renderPage();

        fireEvent.click(screen.getByText('Создать с пропорциями'));

        expect(mockNavigate).toHaveBeenCalledWith('/proportions');
    });
});