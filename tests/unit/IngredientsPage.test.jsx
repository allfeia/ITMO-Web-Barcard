// tests/unit/IngredientsPage.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';
import IngredientsPage from '../../src/game-pages/ingredients-page/IngredientsPage.jsx';


// useIngredients
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

// ingredientErrors
const ingredientErrorsMock = vi.fn();
vi.mock('../../src/game-pages/ingredients-page/ingredients_error.js', () => ({
    ingredientErrors: (...args) => ingredientErrorsMock(...args),
}));

// Recipe hint modal
vi.mock('../../src/menu-page/RecipeCard.jsx', () => ({
    default: ({ open }) =>
        open ? <div>Подсказка</div> : null,
}));

// ErrorModal
vi.mock('../../src/game-pages/ErrorModal.jsx', () => ({
    default: ({ open, errorCount }) =>
        open ? <div>Ошибок: {errorCount}</div> : null,
}));

// HardModeFailModal
vi.mock('../../src/game-pages/HardModeFailModal.jsx', () => ({
    default: ({ open }) =>
        open ? <div>Hard Fail</div> : null,
}));

// PageHeader
vi.mock('../../src/game-pages/PageHeader.jsx', () => ({
    default: ({ title }) => (
        <header>
            <h1>{title}</h1>
        </header>
    ),
}));

// scoreCalculator
vi.mock('../../src/game/scoreCalculator.js', () => ({
    calculateStageScore: () => 85,
}));

// router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

// ===== SETUP =====

const mockStore = configureMockStore([]);

const renderPage = (store) =>
    render(
        <Provider store={store}>
            <MemoryRouter>
                <IngredientsPage />
            </MemoryRouter>
        </Provider>
    );

describe('IngredientsPage', () => {
    let store;

    beforeEach(() => {
        vi.clearAllMocks();

        store = mockStore({
            game: {
                mode: 'normal',
                selectedIngredients: {},
                cocktailId: 'test-cocktail',
                cocktailData: {
                    ingredients: [{ id: 'gin' }, { id: 'tonic' }],
                },
                stages: {
                    stage1: { mistakes: 0, stepsCount: 0 },
                },
                gameOver: false,
            },
        });
    });

    // ===== TESTS =====

    it('отображает заголовок и кнопку перехода', () => {
        renderPage(store);

        expect(screen.getByText('Ингредиенты')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /создать с пропорциями/i })
        ).toBeInTheDocument();
    });

    it('показывает группы и ингредиенты', () => {
        renderPage(store);

        expect(screen.getByText('Алкогольные')).toBeInTheDocument();
        expect(screen.getByText('Джин')).toBeInTheDocument();
        expect(screen.getByText('Миксеры')).toBeInTheDocument();
        expect(screen.getByText('Тоник')).toBeInTheDocument();
    });

    it('toggle ингредиента меняет класс active', () => {
        renderPage(store);

        const gin = screen.getByText('Джин');

        fireEvent.click(gin);
        expect(gin).toHaveClass('active');

        fireEvent.click(gin);
        expect(gin).not.toHaveClass('active');
    });

    it('0 ошибок → переход на /proportions + dispatch setStageScore', async () => {
        ingredientErrorsMock.mockReturnValue(0);

        renderPage(store);

        fireEvent.click(screen.getByText('Джин'));
        fireEvent.click(screen.getByText('Тоник'));

        fireEvent.click(
            screen.getByRole('button', { name: /создать с пропорциями/i })
        );

        await waitFor(() =>
            expect(mockNavigate).toHaveBeenCalledWith('/proportions')
        );

        const actions = store.getActions();
        expect(actions.some(a => a.type === 'game/setStageScore')).toBe(true);
    });

    it('ошибки в normal режиме → показывается ErrorModal', async () => {
        ingredientErrorsMock.mockReturnValue(2);

        renderPage(store);

        fireEvent.click(
            screen.getByRole('button', { name: /создать с пропорциями/i })
        );

        await waitFor(() =>
            expect(screen.getByText(/Ошибок:/i)).toBeInTheDocument()
        );
    });

    it('hard mode + много ошибок → HardModeFailModal', async () => {
        ingredientErrorsMock.mockReturnValue(4);

        store = mockStore({
            game: {
                mode: 'hard',
                cocktailData: {
                    ingredients: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
                },
                stages: {
                    stage1: { mistakes: 0 },
                },
                gameOver: false,
            },
        });

        renderPage(store);

        fireEvent.click(
            screen.getByRole('button', { name: /создать с пропорциями/i })
        );

        await waitFor(() =>
            expect(screen.getByText('Hard Fail')).toBeInTheDocument()
        );
    });
});
