// tests/unit/CreatedPage.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import CreatedPage from '../../src/game-pages/created-page/CreatedPage.jsx';
import gameReducer from '../../src/game/gameSlice';


vi.mock('../../menu-page/RecipeCard.jsx', () => ({
    default: ({ open, isHint }) =>
        open ? (
            <div data-testid="hint-recipe-card">
                Подсказка {isHint ? '(hint)' : ''}
            </div>
        ) : null,
}));

vi.mock('../ErrorModal.jsx', () => ({
    default: ({ open, errorCount }) =>
        open ? <div data-testid="error-modal">Ошибок: {errorCount}</div> : null,
}));

vi.mock('../HardModeFailModal', () => ({
    default: ({ open }) =>
        open ? <div data-testid="hard-fail-modal">Hard Mode Fail</div> : null,
}));

vi.mock('../PageHeader.jsx', () => ({
    default: ({ title, showHint, onHintClick }) => (
        <header data-testid="page-header">
            <h1>{title}</h1>
            {showHint && (
                <button data-testid="hint-btn" onClick={onHintClick}>
                    Подсказка
                </button>
            )}
        </header>
    ),
}));

// Самый важный мок — без него шаги не рендерятся
vi.mock('./RecipeStepCard.jsx', () => ({
    default: (props) => {
        const { step } = props || {};
        return (
            <div data-testid={`step-card-${step?.step_number || 'unknown'}`}>
                <div className="step-number">Шаг {step?.step_number || '?'}</div>
                <div className="step-description">{step?.description || 'Описание'}</div>
                <button
                    data-testid={`answer-btn-${step?.step_number || 'unknown'}`}
                    onClick={() => {
                        if (props?.setUserAnswers) {
                            props.setUserAnswers((prev) => ({
                                ...prev,
                                [step.step_number]: 'mock-answer',
                            }));
                        }
                    }}
                >
                    Ответить
                </button>
            </div>
        );
    },
}));

vi.mock('./created_error.js', () => ({
    createdErrors: vi.fn(),
}));

vi.mock('../../game/scoreCalculator.js', () => ({
    calculateStageScore: vi.fn(() => 92),
}));

// Упрощённый мок drag-and-drop (без ошибок)
vi.mock('@hello-pangea/dnd', () => ({
    DragDropContext: ({ children }) => <div data-testid="dnd-context">{children}</div>,
    Droppable: ({ children }) => (
        <div data-testid="droppable">{children({ provided: { innerRef: vi.fn() } })}</div>
    ),
    Draggable: ({ children, index }) => (
        <div data-testid={`draggable-${index}`}>
            {children({ innerRef: vi.fn(), draggableProps: {}, dragHandleProps: {} }, { isDragging: false })}
        </div>
    ),
}));

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
                        stage3: { mistakes: 0, stepsCount: 0 },
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

    it('показывает шаги рецепта', async () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <CreatedPage />
                </MemoryRouter>
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByText(/Шаг 1/)).toBeInTheDocument();
            expect(screen.getByText(/Шаг 2/)).toBeInTheDocument();
            expect(screen.getByText(/Шаг 3/)).toBeInTheDocument();
        });
    });

    it('при 0 ошибок переходит на /result и сохраняет score', async () => {
        vi.mocked(createdErrors).mockReturnValue(0);

        render(
            <Provider store={store}>
                <MemoryRouter>
                    <CreatedPage />
                </MemoryRouter>
            </Provider>
        );

        // Имитация ответов (клик по кнопкам в RecipeStepCard)
        await waitFor(() => {
            fireEvent.click(screen.getByTestId('answer-btn-1'));
            fireEvent.click(screen.getByTestId('answer-btn-2'));
            fireEvent.click(screen.getByTestId('answer-btn-3'));
        });

        fireEvent.click(screen.getByRole('button', { name: /создать коктейль/i }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/result');
        });

        expect(store.getActions()).toContainEqual(
            expect.objectContaining({
                type: 'game/setStageScore',
                payload: expect.objectContaining({ stage: 'stage3', score: 92 }),
            })
        );
    });

    it('при ошибках в normal mode показывает ErrorModal', async () => {
        vi.mocked(createdErrors).mockReturnValue(2);

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
        });
    });

    it('в hard mode при превышении ошибок открывает HardModeFailModal', async () => {
        vi.mocked(createdErrors).mockReturnValue(4);

        store = configureStore({
            reducer: { game: gameReducer },
            preloadedState: {
                game: {
                    mode: 'hard',
                    cocktailData: { steps: Array(5).fill({}) }, // 5 шагов → maxAllowed = 3
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
        }, { timeout: 2000 });

        expect(store.getState().game.gameOver).toBe(true);
    });

    it('кнопка подсказки открывает RecipeCard в normal mode', async () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <CreatedPage />
                </MemoryRouter>
            </Provider>
        );

        await waitFor(() => {
            fireEvent.click(screen.getByTestId('hint-btn'));
        });

        expect(screen.getByTestId('hint-recipe-card')).toBeInTheDocument();
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
                    <CreatedPage />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.queryByTestId('hint-btn')).not.toBeInTheDocument();
    });
});