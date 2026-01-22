import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import CreatedPage from '../../src/game-pages/created-page/CreatedPage';
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

// Мокаем createdErrors
vi.mock('../../src/game-pages/created-page/created_error.js', () => ({
    createdErrors: vi.fn(),
}));

// Мокаем внешние компоненты
vi.mock('../../src/game-pages/PageHeader.jsx', () => ({
    default: () => <div data-testid="page-header" />,
}));

vi.mock('../../src/menu-page/RecipeCard.jsx', () => ({
    default: () => <div data-testid="recipe-card" />,
}));

vi.mock('../../src/game-pages/created-page/RecipeStepCard.jsx', () => ({
    default: () => <div data-testid="recipe-step" />,
}));

vi.mock('../../src/components/ErrorModal.jsx', () => ({
    default: ({ open, errorCount }) =>
        open ? <div data-testid="error-modal">Ошибок: {errorCount}</div> : null,
}));

vi.mock('../../src/components/HardModeFailModal', () => ({
    default: () => <div data-testid="hard-modal" />,
}));

// Мокаем @hello-pangea/dnd (Drag and Drop)
vi.mock('@hello-pangea/dnd', () => ({
    DragDropContext: ({ children }) => <div data-testid="drag-context">{children}</div>,
    Droppable: ({ children }) =>
        children(
            {
                droppableProps: { 'data-testid': 'droppable' },
                innerRef: vi.fn(),
                placeholder: null,
            },
            {}
        ),
    Draggable: ({ children }) =>
        children(
            {
                draggableProps: { style: {}, 'data-testid': 'draggable' },
                dragHandleProps: {},
                innerRef: vi.fn(),
            },
            { isDragging: false }
        ),
}));

describe('CreatedPage', () => {
    let mockStore;

    beforeEach(() => {
        vi.clearAllMocks();

        // Моковый store с нужным состоянием
        mockStore = configureStore({
            reducer: rootReducer,
            preloadedState: {
                game: {
                    mode: 'easy',
                    cocktailId: 1,
                    cocktailData: {
                        ingredients: [],
                        steps: [
                            { step_number: 1 },
                            { step_number: 2 },
                        ],
                    },
                    selectedIngredients: {},
                    stages: {
                        stage1: { stepsCount: 0, mistakes: 0, hintsUsed: 0, score: 0 },
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
                    <CreatedPage />
                </MemoryRouter>
            </Provider>
        );

    it('показывает ErrorModal и диспатчит ошибку, если есть ошибки', () => {
        vi.mocked(createdErrors).mockReturnValue(3);

        renderPage();

        fireEvent.click(screen.getByText('Создать коктейль'));

        expect(mockStore.getActions()).toContainEqual(
            expect.objectContaining({
                type: 'game/addStageMistake',
                payload: { stage: 'stage3', count: 3 },
            })
        );

        expect(screen.getByTestId('error-modal')).toBeInTheDocument();
    });

    it('переходит на /result, если ошибок нет', () => {
        vi.mocked(createdErrors).mockReturnValue(0);

        renderPage();

        fireEvent.click(screen.getByText('Создать коктейль'));

        expect(navigateMock).toHaveBeenCalledWith('/result');
    });
});