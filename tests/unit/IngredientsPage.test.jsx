import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import IngredientsPage from "../../src/game-pages/ingredients-page/IngredientsPage";

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

vi.mock("../../src/game-pages/ingredients-page/ingredients_error.js", () => ({
    ingredientErrors: vi.fn(),
}));

import { ingredientErrors } from "../../src/game-pages/ingredients-page/ingredients_error.js";

vi.mock("../../src/game-pages/ingredients-page/Ingredients.jsx", () => ({
    useIngredients: () => ({
        searchValue: "",
        setSearchValue: vi.fn(),
        groupedIngredients: [
            {
                type: "base",
                title: "Основа",
                items: [{ id: 1, name: "Лайм" }],
            },
        ],
    }),
}));

vi.mock("../PageHeader.jsx", () => ({
    default: () => <div data-testid="page-header" />,
}));

vi.mock("../../src/game-pages/ErrorModal.jsx", () => ({
    default: ({ open, errorCount }) =>
        open ? (
            <div data-testid="error-modal">Errors: {errorCount}</div>
        ) : null,
}));

vi.mock("../../src/menu-page/RecipeCard.jsx", () => ({
    default: () => <div />,
}));

vi.mock("../HardModeFailModal", () => ({
    default: () => <div />,
}));


const baseState = {
    game: {
        mode: "easy",
        selectedIngredients: {},
        cocktailId: 1,
        cocktailData: {
            ingredients: [{ id: 1, name: "Лайм" }],
        },
        stages: {
            stage1: {
                mistakes: 0,
                stepsCount: 0,
            },
        },
        gameOver: false,
    },
};

beforeEach(() => {
    vi.clearAllMocks();
    useSelector.mockImplementation(selector => selector(baseState));
    window.ym = vi.fn();
});

describe("IngredientsPage", () => {
    it("показывает ErrorModal и диспатчит ошибку, если есть ошибки", () => {
        ingredientErrors.mockReturnValue(2);

        render(<IngredientsPage />);

        fireEvent.click(
            screen.getByText("Создать с пропорциями")
        );

        expect(dispatchMock).toHaveBeenCalledWith(
            expect.objectContaining({
                payload: { stage: "stage1", count: 2 },
            })
        );

        expect(
            screen.getByTestId("error-modal")
        ).toBeInTheDocument();
    });

    it("переходит на /proportions, если ошибок нет", () => {
        ingredientErrors.mockReturnValue(0);

        render(<IngredientsPage />);

        fireEvent.click(
            screen.getByText("Создать с пропорциями")
        );

        expect(navigateMock).toHaveBeenCalledWith("/proportions");
    });
});
