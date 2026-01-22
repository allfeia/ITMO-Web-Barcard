import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CreatedPage from "../../src/game-pages/created-page/CreatedPage";

const navigateMock = vi.fn();

vi.mock("react-router-dom", () => ({
    useNavigate: () => navigateMock,
}));

const dispatchMock = vi.fn();

vi.mock("react-redux", () => ({
    useDispatch: () => dispatchMock,
    useSelector: vi.fn(),
}));

import { useSelector } from "react-redux";

vi.mock("../../src/game-pages/created-page/created_error.js", () => ({
    createdErrors: vi.fn(),
}));

import { createdErrors } from "../../src/game-pages/created-page/created_error.js";

vi.mock("../PageHeader.jsx", () => ({
    default: () => <div data-testid="page-header" />,
}));

vi.mock("../../src/game-pages/ErrorModal.jsx", () => ({
    default: ({ open, errorCount }) =>
        open ? <div data-testid="error-modal">Errors: {errorCount}</div> : null,
}));

vi.mock("../../src/game-pages/created-page/RecipeStepCard.jsx", () => ({
    default: () => <div />,
}));

vi.mock("../../src/menu-page/RecipeCard.jsx", () => ({
    default: () => <div />,
}));

vi.mock("@hello-pangea/dnd", () => ({
    DragDropContext: ({ children }) => <div>{children}</div>,
    Droppable: ({ children }) =>
        children({
            droppableProps: {},
            innerRef: vi.fn(),
            placeholder: null,
        }),
    Draggable: ({ children }) =>
        children(
            {
                draggableProps: { style: {} },
                dragHandleProps: {},
                innerRef: vi.fn(),
            },
            {
                isDragging: false,
            }
        ),
}));


const baseState = {
    game: {
        mode: "easy",
        selectedIngredients: [],
        cocktailId: 1,
        cocktailData: {
            ingredients: [],
            steps: [
                { step_number: 1 },
                { step_number: 2 },
            ],
        },
    },
};

beforeEach(() => {
    vi.clearAllMocks();
    useSelector.mockImplementation(selector => selector(baseState));
});

describe("CreatedPage", () => {
    it("показывает ErrorModal и диспатчит ошибку, если есть ошибки", () => {
        createdErrors.mockReturnValue(3);

        render(<CreatedPage />);

        fireEvent.click(
            screen.getByText("Создать коктейль")
        );

        expect(dispatchMock).toHaveBeenCalledWith(
            expect.objectContaining({
                payload: { stage: "stage3", count: 3 },
            })
        );

        expect(
            screen.getByTestId("error-modal")
        ).toBeInTheDocument();
    });

    it("переходит на /result, если ошибок нет", () => {
        createdErrors.mockReturnValue(0);

        render(<CreatedPage />);

        fireEvent.click(
            screen.getByText("Создать коктейль")
        );

        expect(navigateMock).toHaveBeenCalledWith("/result");
    });
});
