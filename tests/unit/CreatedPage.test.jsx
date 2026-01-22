import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import CreatedPage from '../../src/game-pages/created-page/CreatedPage.jsx';
import gameReducer from '../../src/game/gameSlice';

// Моки зависимостей
vi.mock('../../menu-page/RecipeCard.jsx', () => ({
    default: ({ open, onClose, isHint }) =>
        open ? (
            <div data-testid="hint-recipe-card">
                Подсказка-рецепт {isHint ? '(hint)' : ''}
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
                <button data-testid="close-fail" onClick={onClose}>Закрыть</button>
                <button data-testid="study-recipe" onClick={onStudyRecipe}>Посмотреть рецепт</button>
                <button data-testid="change-mode" onClick={onChangeMode}>Сменить режим</button>
            </div>
        ) : null,
}));

vi.mock('../PageHeader.jsx', () => ({
    default: ({ title, showHint, onBack, onHintClick }) => (
        <header data-testid="page-header">
            {title}
            {showHint && <button data-testid="hint-btn" onClick={onHintClick}>Подсказка</button>}
            <button data-testid="back-btn" onClick={onBack}>Назад</button>
        </header>
    ),
}));


vi.mock('../../game/scoreCalculator.js', () => ({
    calculateStageScore: vi.fn(() => 92),
}));

// Мок drag-and-drop (упрощённый, без полной эмуляции @hello-pangea/dnd)
vi.mock('@hello-pangea/dnd', () => {
    const actual = vi.importActual('@hello-pangea/dnd');
    return {
        ...actual,
        DragDropContext: ({ children, onDragEnd }) => (
            <div data-testid="dnd-context" onDragEnd={onDragEnd}>
                {children}
            </div>
        ),
        Droppable: ({ children }) => (
            <div data-testid="droppable">{children({ provided: {}, snapshot: {} })}</div>
        ),
        Draggable: ({ children, index }) => (
            <div data-testid={`draggable-${index}`}>
                {children(
                    { innerRef: vi.fn(), draggableProps: {}, dragHandleProps: {} },
                    { isDragging: false }
                )}
            </div>
        ),
    };
});

// Мок navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('CreatedPage', () => {
    let store;

    beforeEach(() => {
        vi.clearAllMocks();

        store = configureStore({
            reducer: { game: gameReducer },
            preloadedState: {
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
                        stage3: {
                            mistakes: 0,
                            stepsCount: 0,
                        },
                    },
                    gameOver: false,
                },
            },
        });
    });

    it('отображает заголовок и кнопку "Создать коктейль"', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <CreatedPage />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByText('Коктейль')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /создать коктейль/i })).toBeInTheDocument();
    });

    it('показывает шаги рецепта в перемешанном порядке', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <CreatedPage />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByText(/Шаг 1/)).toBeInTheDocument();
        expect(screen.getByText(/Шаг 2/)).toBeInTheDocument();
        expect(screen.getByText(/Шаг 3/)).toBeInTheDocument();
    });

    it('в normal mode → при 0 ошибок переходит на /result и сохраняет score', async () => {
        // Предполагаем, что createdErrors вернёт 0 при правильных ответах
        vi.mock('./created_error.js', () => ({
            createdErrors: vi.fn().mockReturnValue(0),
        }));

        render(
            <Provider store={store}>
                <MemoryRouter>
                    <CreatedPage />
                </MemoryRouter>
            </Provider>
        );

        // Имитация ответов пользователя (если логика в RecipeStepCard)
        fireEvent.click(screen.getByTestId('answer-btn-1'));
        fireEvent.click(screen.getByTestId('answer-btn-2'));
        fireEvent.click(screen.getByTestId('answer-btn-3'));

        fireEvent.click(screen.getByRole('button', { name: /создать коктейль/i }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/result');
        });

        const actions = store.getActions();
        expect(actions.some(a => a.type === 'game/setStageScore' && a.payload.score === 92)).toBe(true);
    });

    it('в normal mode при ошибках показывает ErrorModal', async () => {
        vi.mock('./created_error.js', () => ({
            createdErrors: vi.fn().mockReturnValue(2),
        }));

        render(
            <Provider store={store}>
                <MemoryRouter>
                    <CreatedPage />
                </MemoryRouter>
            </Provider>
        );

        fireEvent.click(screen.getByRole('button', { name: /создать коктейль/i }));

        await waitFor(() => {
            expect(screen.getByTestId('error-modal')).toBeInTheDocument();
            expect(screen.getByText(/ошибок: 2/i)).toBeInTheDocument();
        });

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('в hard mode при превышении ошибок открывает HardModeFailModal', async () => {
        vi.mock('./created_error.js', () => ({
            createdErrors: vi.fn().mockReturnValue(4),
        }));

        store = configureStore({
            reducer: { game: gameReducer },
            preloadedState: {
                game: {
                    mode: 'hard',
                    cocktailData: { steps: [{}, {}, {}, {}, {}] }, // 5 шагов → maxAllowed = 3
                    stages: { stage3: { mistakes: 1 } },
                    gameOver: false,
                },
            },
        });

        render(
            <Provider store={store}>
                <MemoryRouter>
                    <CreatedPage />
                </MemoryRouter>
            </Provider>
        );

        fireEvent.click(screen.getByRole('button', { name: /создать коктейль/i }));

        await waitFor(() => {
            expect(screen.getByTestId('hard-fail-modal')).toBeInTheDocument();
        });

        expect(store.getState().game.gameOver).toBe(true);
    });

    it('кнопка подсказки открывает RecipeCard (только в normal mode)', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <CreatedPage />
                </MemoryRouter>
            </Provider>
        );

        fireEvent.click(screen.getByTestId('hint-btn'));

        expect(screen.getByTestId('hint-recipe-card')).toBeInTheDocument();
        expect(screen.getByText('(hint)')).toBeInTheDocument();

        // Проверка диспатча addHintUsage
        expect(store.getActions()).toContainEqual(
            expect.objectContaining({
                type: 'game/addHintUsage',
                payload: { stage: 'stage3' },
            })
        );
    });

    it('в hard mode подсказка не отображается', () => {
        store = configureStore({
            reducer: { game: gameReducer },
            preloadedState: {
                game: { mode: 'hard', ...store.getState().game },
            },
        });

        render(
            <Provider store={store}>
                <MemoryRouter>
                    <CreatedPage />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.queryByTestId('hint-btn')).not.toBeInTheDocument();
    });
});