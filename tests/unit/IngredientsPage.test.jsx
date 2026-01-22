import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import IngredientsPage from '../../src/game-pages/ingredients-page/IngredientsPage.jsx';
import gameReducer from '../../src/game/gameSlice';

// Моки внешних зависимостей
vi.mock('./Ingredients.jsx', () => ({
    useIngredients: () => ({
        searchValue: '',
        setSearchValue: vi.fn(),
        groupedIngredients: [
            {
                type: 'alcohol',
                title: 'Алкоголь',
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

vi.mock('../../menu-page/RecipeCard.jsx', () => ({
    default: ({ open, onClose, isHint }) =>
        open ? (
            <div data-testid="recipe-hint-modal">
                Hint modal {isHint ? '(hint)' : ''}
                <button onClick={onClose}>Close</button>
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
                <button onClick={onClose}>Закрыть</button>
                <button onClick={onStudyRecipe}>Посмотреть рецепт</button>
                <button onClick={onChangeMode}>Сменить режим</button>
            </div>
        ) : null,
}));

vi.mock('../PageHeader.jsx', () => ({
    default: ({ title, showHint, onBack, onHintClick }) => (
        <header data-testid="page-header">
            {title}
            {showHint && <button onClick={onHintClick}>Подсказка</button>}
            <button onClick={onBack}>Назад</button>
        </header>
    ),
}));

vi.mock('../../game/scoreCalculator.js', () => ({
    calculateStageScore: vi.fn(() => 85),
}));

// Мокаем navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('IngredientsPage', () => {
    let store;

    beforeEach(() => {
        vi.clearAllMocks();

        store = configureStore({
            reducer: {
                game: gameReducer,
            },
            preloadedState: {
                game: {
                    mode: 'normal',
                    selectedIngredients: {},
                    cocktailId: 'gin-tonic-1',
                    cocktailData: {
                        ingredients: [
                            { id: 'gin', name: 'Джин' },
                            { id: 'tonic', name: 'Тоник' },
                        ],
                    },
                    stages: {
                        stage1: {
                            mistakes: 0,
                            stepsCount: 0,
                        },
                    },
                    gameOver: false,
                },
            },
        });
    });

    it('отображает заголовок и кнопку "Создать с пропорциями"', () => {
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

    it('показывает группы ингредиентов и чипсы', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <IngredientsPage />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByText('Алкоголь')).toBeInTheDocument();
        expect(screen.getByText('Джин')).toBeInTheDocument();
        expect(screen.getByText('Водка')).toBeInTheDocument();
        expect(screen.getByText('Миксеры')).toBeInTheDocument();
        expect(screen.getByText('Тоник')).toBeInTheDocument();
    });

    it('добавляет / убирает ингредиент при клике (toggle)', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <IngredientsPage />
                </MemoryRouter>
            </Provider>
        );

        const ginChip = screen.getByText('Джин');

        fireEvent.click(ginChip);
        expect(ginChip).toHaveClass('active');

        fireEvent.click(ginChip);
        expect(ginChip).not.toHaveClass('active');
    });

    it('при 0 ошибок → переходит на /proportions и сохраняет score', async () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <IngredientsPage />
                </MemoryRouter>
            </Provider>
        );

        // Выбираем правильные ингредиенты
        fireEvent.click(screen.getByText('Джин'));
        fireEvent.click(screen.getByText('Тоник'));

        const createBtn = screen.getByRole('button', { name: /создать с пропорциями/i });
        fireEvent.click(createBtn);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/proportions');
        });

        const actions = store.getActions();
        expect(actions.some(a => a.type === 'game/setStageScore' && a.payload.score === 85)).toBe(true);
    });

    it('в normal mode показывает ErrorModal при ошибках', async () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <IngredientsPage />
                </MemoryRouter>
            </Provider>
        );

        // Выбираем только один правильный
        fireEvent.click(screen.getByText('Джин'));

        fireEvent.click(screen.getByRole('button', { name: /создать с пропорциями/i }));

        await waitFor(() => {
            expect(screen.getByTestId('error-modal')).toBeInTheDocument();
            expect(screen.getByText(/ошибок: 1/i)).toBeInTheDocument(); // или точное число
        });

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('в hard mode при слишком большом количестве ошибок → открывает HardModeFailModal', async () => {
        store = configureStore({
            reducer: { game: gameReducer },
            preloadedState: {
                game: {
                    mode: 'hard',
                    selectedIngredients: {},
                    cocktailData: { ingredients: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] },
                    stages: { stage1: { mistakes: 0, stepsCount: 0 } },
                    gameOver: false,
                },
            },
        });

        render(
            <Provider store={store}>
                <MemoryRouter>
                    <IngredientsPage />
                </MemoryRouter>
            </Provider>
        );

        // Выбираем 0 правильных → 3 ошибки
        // maxAllowed = max(3-2,1) = 1 → 3 > 1 → game over
        fireEvent.click(screen.getByRole('button', { name: /создать с пропорциями/i }));

        await waitFor(() => {
            expect(screen.getByTestId('hard-fail-modal')).toBeInTheDocument();
        });

        expect(store.getState().game.gameOver).toBe(true);
    });

    it('кнопка подсказки в normal mode открывает RecipeCard с isHint=true', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <IngredientsPage />
                </MemoryRouter>
            </Provider>
        );

        const hintBtn = screen.getByRole('button', { name: 'Подсказка' });
        fireEvent.click(hintBtn);

        expect(screen.getByTestId('recipe-hint-modal')).toBeInTheDocument();
        expect(screen.getByText('(hint)')).toBeInTheDocument();
    });

    it('в hard mode подсказка НЕ отображается', () => {
        store = configureStore({
            reducer: { game: gameReducer },
            preloadedState: {
                game: { mode: 'hard', ...store.getState().game },
            },
        });

        render(
            <Provider store={store}>
                <MemoryRouter>
                    <IngredientsPage />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.queryByRole('button', { name: 'Подсказка' })).not.toBeInTheDocument();
    });
});