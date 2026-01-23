import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CreatedPage from "../../src/game-pages/created-page/CreatedPage";

const mockNavigate = vi.fn();
const mockDispatch = vi.fn();

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock("react-redux", () => ({
    useDispatch: () => mockDispatch,
    useSelector: (selector) =>
        selector({
            game: {
                mode: "easy",
                cocktailId: 1,
                selectedIngredients: {},
                cocktailData: {
                    ingredients: [{ id: 1, name: "Лайм" }],
                    steps: [
                        { step_number: 1, text: "Шаг 1" },
                        { step_number: 2, text: "Шаг 2" },
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
        }),
}));

vi.mock("../../src/game-pages/created-page/created_error.js", () => ({
    createdErrors: vi.fn(),
}));

vi.mock("../../src/game/scoreCalculator.js", () => ({
    calculateStageScore: vi.fn(() => 10),
}));

vi.mock("../../src/menu-page/RecipeCard.jsx", () => ({
    default: () => <div>RecipeCard</div>,
}));

vi.mock("../../src/game-pages/ErrorModal.jsx", () => ({
    default: ({ open, errorCount }) =>
        open ? <div>Ошибок: {errorCount}</div> : null,
}));

vi.mock("../../src/game-pages/HardModeFailModal.jsx", () => ({
    default: ({ open }) => (open ? <div>HardModeFail</div> : null),
}));

vi.mock("../../src/game-pages/created-page/RecipeStepCard.jsx", () => ({
    default: ({ step }) => <div>{step.text}</div>,
}));

// DnD мокаем максимально просто
vi.mock("@hello-pangea/dnd", () => ({
    DragDropContext: ({ children }) => <div>{children}</div>,
    Droppable: ({ children }) =>
        children({
            droppableProps: {},
            innerRef: vi.fn(),
            placeholder: null,
        }),
    Draggable: ({ children }) =>
        children({
            draggableProps: { style: {} },
            dragHandleProps: {},
            innerRef: vi.fn(),
        }, { isDragging: false }),
}));

import { createdErrors } from "../../src/game-pages/created-page/created_error.js";
import {
    addStageMistake,
    setStageScore,
    setStageStepsCount,
} from "../../src/game/gameSlice.js";

const renderPage = () =>
    render(
        <MemoryRouter>
            <CreatedPage />
        </MemoryRouter>
    );

describe("CreatedPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("рендерит заголовок страницы", () => {
        renderPage();
        expect(screen.getByText("Коктейль")).toBeInTheDocument();
    });

    it("рендерит шаги рецепта", () => {
        renderPage();

        expect(screen.getByText("Шаг 1")).toBeInTheDocument();
        expect(screen.getByText("Шаг 2")).toBeInTheDocument();
    });

    it("кнопка назад вызывает navigate(-1)", () => {
        renderPage();

        fireEvent.click(screen.getByTestId("back-button"));

        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it("если есть ошибки — диспатчит addStageMistake и показывает модалку", () => {
        createdErrors.mockReturnValue(2);

        renderPage();

        fireEvent.click(screen.getByText("Создать коктейль"));

        expect(mockDispatch).toHaveBeenCalledWith(
            setStageStepsCount({
                stage: "stage3",
                stepsCount: 3,
            })
        );

        expect(mockDispatch).toHaveBeenCalledWith(
            addStageMistake({
                stage: "stage3",
                count: 2,
            })
        );

        expect(screen.getByText("Ошибок: 2")).toBeInTheDocument();
    });

    it("если ошибок нет — считает скор и переходит на /result", () => {
        createdErrors.mockReturnValue(0);

        renderPage();

        fireEvent.click(screen.getByText("Создать коктейль"));

        expect(mockDispatch).toHaveBeenCalledWith(
            setStageScore({
                stage: "stage3",
                score: 10,
            })
        );

        expect(mockNavigate).toHaveBeenCalledWith("/result");
    });
});
