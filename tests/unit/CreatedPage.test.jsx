import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';
import CreatedPage from '../../src/game-pages/created-page/CreatedPage.jsx';

// ================== МОКИ ==================

// RecipeCard (подсказка)
vi.mock('../../src/menu-page/RecipeCard.jsx', () => ({
    default: ({ open }) => (open ? <div>Подсказка</div> : null),
}));

// ErrorModal
vi.mock('../../src/game-pages/ErrorModal.jsx', () => ({
    default: ({ open, errorCount }) =>
        open ? <div>Ошибок: {errorCount}</div> : null,
}));

// HardModeFailModal
vi.mock('../../src/game-pages/HardModeFailModal.jsx', () => ({
    default: ({ open }) =>
        open ? <div>Hard Mode Fail</div> : null,
}));

// PageHeader
vi.mock('../../src/game-pages/PageHeader.jsx', () => ({
    default: ({ title, showHint, onHintClick }) => (
        <header>
            <h1>{title}</h1>
            {showHint && <button onClick={onHintClick}>Подсказка</button>}
        </header>
    ),
}));

// RecipeStepCard — упрощённый, но реалистичный
vi.mock('../../src/game-pages/created-page/RecipeStepCard.jsx', () => ({
    default: ({ step = {}, setUserAnswers }) => (
        <div>
            <span>Шаг {step.step_number}</span>
            <button
                onClick={() =>
                    setUserAnswers?.((prev) => ({
                        ...prev,
                        [step.step_number]: 'answer',
                    }))
                }
            >
                Ответить
            </button>
        </div>
    ),
}));

// createdErrors
const createdErrorsMock = vi.fn();
vi.mock('../../src/game-pages/created-page/created_error.js', () => ({
    createdErrors: (...args) => createdErrorsMock(...args),
}));

// scoreCalculator
vi.mock('../../src/game/scoreCalculator.js', () => ({
    calculateStageScore: () => 92,
}));

// dnd — полностью заглушаем
vi.mock('@hello-pangea/dnd', () => ({
    DragDropContext: ({ children }) => <div>{children}</div>,
    Droppable: ({ children }) => <div>{children({ provided: {} })}</div>,
    Draggable: ({ children }) => <div>{children({ innerRef: vi.fn() })}</div>,
}));

// router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

// ================== SETUP ==================

const mockStore = configureMockStore([]);

const renderPage = (store) =>
    render(
        <Provider store={store}>
            <MemoryRouter>
                <CreatedPage />
            </MemoryRouter>
        </Provider>
    );

describe('CreatedPage', () => {
    let store;

    beforeEach(() => {
        vi.clearAllMocks();

        store = mockStore({
            game: {
                mode: 'normal',
                selectedIngredients: { gin: true, tonic: true },
                cocktailId: 'gin-tonic',
                cocktailData: {
                    ingredients: [{ id: 'gin' }, { id: 'tonic' }],
                    steps: [
                        { step_number: 1, description: 'Налить джин' },
                        { step_number: 2, description: 'Добавить тоник' },
                        { step_number: 3, description: 'Перемешать' },
                    ],
                },
                stages: {
                    stage3: { mistakes: 0, stepsCount: 0 },
                },
                gameOver: false,
            },
        });
    });

    // ================== TESTS ==================

    it('отображает заголовок и кнопку создания', () => {
        renderPage(store);

        expect(screen.getByText('Коктейль')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /создать коктейль/i })
        ).toBeInTheDocument();
    });

    it('отображает шаги рецепта', async () => {
        renderPage(store);

        expect(await screen.findByText('Шаг 1')).toBeInTheDocument();
        expect(screen.getByText('Шаг 2')).toBeInTheDocument();
        expect(screen.getByText('Шаг 3')).toBeInTheDocument();
    });

    it('0 ошибок → переход на /result и dispatch setStageScore', async () => {
        createdErrorsMock.mockReturnValue(0);

        renderPage(store);

        fireEvent.click(screen.getAllByText('Ответить')[0]);
        fireEvent.click(screen.getAllByText('Ответить')[1]);
        fireEvent.click(screen.getAllByText('Ответить')[2]);

        fireEvent.click(
            screen.getByRole('button', { name: /создать коктейль/i })
        );

        await waitFor(() =>
            expect(mockNavigate).toHaveBeenCalledWith('/result')
        );

        const actions = store.getActions();
        expect(actions.some(a => a.type === 'game/setStageScore')).toBe(true);
    });

    it('ошибки в normal режиме → ErrorModal', async () => {
        createdErrorsMock.mockReturnValue(2);

        renderPage(store);

        fireEvent.click(
            screen.getByRole('button', { name: /создать коктейль/i })
        );

        expect(
            await screen.findByText(/Ошибок:/i)
        ).toBeInTheDocument();
    });

    it('hard mode + много ошибок → HardModeFailModal', async () => {
        createdErrorsMock.mockReturnValue(4);

        store = mockStore({
            game: {
                mode: 'hard',
                cocktailData: {
                    steps: Array(5).fill({}),
                },
                stages: {
                    stage3: { mistakes: 1 },
                },
                gameOver: false,
            },
        });

        renderPage(store);

        fireEvent.click(
            screen.getByRole('button', { name: /создать коктейль/i })
        );

        expect(
            await screen.findByText('Hard Mode Fail')
        ).toBeInTheDocument();
    });

    it('в normal режиме кнопка подсказки открывает RecipeCard', async () => {
        renderPage(store);

        fireEvent.click(
            screen.getByRole('button', { name: /подсказка/i })
        );

        expect(
            await screen.findByText('Подсказка')
        ).toBeInTheDocument();
    });

    it('в hard режиме подсказка не отображается', () => {
        store = mockStore({
            game: {
                ...store.getState().game,
                mode: 'hard',
            },
        });

        renderPage(store);

        expect(
            screen.queryByRole('button', { name: /подсказка/i })
        ).not.toBeInTheDocument();
    });
});
