// tests/unit/IngredientsPage.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import IngredientsPage from '../../src/game-pages/ingredients-page/IngredientsPage.jsx';
import gameReducer from '../../src/game/gameSlice';
import {ingredientErrors} from "../../src/game-pages/ingredients-page/ingredients_error.js";

// Все моки — САМЫЙ ВЕРХ файла
vi.mock('../../src/game-pages/ingredients-page/Ingredients.jsx', () => ({
    useIngredients: () => ({
        searchValue: '',
        setSearchValue: vi.fn(),
        groupedIngredients: [
            {
                type: 'alcohol',
                title: 'Алкогольные',
                items: [
                    { id: 'gin', name: 'Джин' },
                    { id: 'vodka', name: 'Водка' },
                ],
            },
            {
                type: 'mixer',
                title: 'Миксеры',
                items: [{ id: 'tonic', name: 'Тоник' }],
            },
        ],
    }),
}));

vi.mock('./ingredients_error.js', () => ({
    ingredientErrors: vi.fn(),
}));

vi.mock('../../menu-page/RecipeCard.jsx', () => ({
    default: ({ open }) => (open ? <div data-testid="recipe-hint-modal">Подсказка</div> : null),
}));

vi.mock('../ErrorModal.jsx', () => ({
    default: ({ open, errorCount }) => (open ? <div data-testid="error-modal">Ошибок: {errorCount}</div> : null),
}));

vi.mock('../HardModeFailModal', () => ({
    default: ({ open }) => (open ? <div data-testid="hard-fail-modal">Hard Fail</div> : null),
}));

vi.mock('../PageHeader.jsx', () => ({
    default: ({ title, showHint, onHintClick }) => (
        <header>
            <h1>{title}</h1>
            {showHint && <button data-testid="hint-btn" onClick={onHintClick}>Подсказка</button>}
        </header>
    ),
}));

vi.mock('../../game/scoreCalculator.js', () => ({
    calculateStageScore: vi.fn(() => 85),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

describe('IngredientsPage', () => {
    let store;

    beforeEach(() => {
        vi.clearAllMocks();
        store = configureStore({
            reducer: { game: gameReducer },
            preloadedState: {
                game: {
                    mode: 'normal',
                    selectedIngredients: {},
                    cocktailId: 'test-cocktail',
                    cocktailData: { ingredients: [{ id: 'gin' }, { id: 'tonic' }] },
                    stages: { stage1: { mistakes: 0, stepsCount: 0 } },
                    gameOver: false,
                },
            },
        });
    });

    it('отображает заголовок и кнопку', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <IngredientsPage />
                </MemoryRouter>
            </Provider>
        );
        expect(screen.getByText('Ингредиенты')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /создать с пропорциями/i })).toBeInTheDocument();
    });

    it('показывает группы и ингредиенты', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <IngredientsPage />
                </MemoryRouter>
            </Provider>
        );
        expect(screen.getByText('Алкогольные')).toBeInTheDocument();
        expect(screen.getByText('Джин')).toBeInTheDocument();
        expect(screen.getByText('Миксеры')).toBeInTheDocument();
        expect(screen.getByText('Тоник')).toBeInTheDocument();
    });

    it('toggle ингредиента меняет класс active', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <IngredientsPage />
                </MemoryRouter>
            </Provider>
        );

        const gin = screen.getByText('Джин');
        fireEvent.click(gin);
        expect(gin).toHaveClass('active');

        fireEvent.click(gin);
        expect(gin).not.toHaveClass('active');
    });

    it('0 ошибок → /proportions + setStageScore', async () => {
        vi.mocked(ingredientErrors).mockReturnValue(0);

        render(<Provider store={store}><MemoryRouter><IngredientsPage /></MemoryRouter></Provider>);

        fireEvent.click(screen.getByText('Джин'));
        fireEvent.click(screen.getByText('Тоник'));

        fireEvent.click(screen.getByRole('button', { name: /создать с пропорциями/i }));

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/proportions'));

        expect(store.getActions()).toContainEqual(
            expect.objectContaining({ type: 'game/setStageScore', payload: expect.any(Object) })
        );
    });

    it('ошибки в normal → ErrorModal', async () => {
        vi.mocked(ingredientErrors).mockReturnValue(2);

        render(<Provider store={store}><MemoryRouter><IngredientsPage /></MemoryRouter></Provider>);

        fireEvent.click(screen.getByRole('button', { name: /создать с пропорциями/i }));

        await waitFor(() => {
            expect(screen.getByTestId('error-modal')).toBeInTheDocument();
        });
    });

    it('hard mode + много ошибок → HardModeFailModal', async () => {
        vi.mocked(ingredientErrors).mockReturnValue(4);

        store = configureStore({
            reducer: { game: gameReducer },
            preloadedState: {
                game: {
                    mode: 'hard',
                    cocktailData: { ingredients: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] },
                    stages: { stage1: { mistakes: 0 } },
                    gameOver: false,
                },
            },
        });

        render(<Provider store={store}><MemoryRouter><IngredientsPage /></MemoryRouter></Provider>);

        fireEvent.click(screen.getByRole('button', { name: /создать с пропорциями/i }));

        await waitFor(() => {
            expect(screen.getByTestId('hard-fail-modal')).toBeInTheDocument();
        });
    });
});