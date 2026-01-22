import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import IngredientsPage from "../../src/game-pages/ingredients-page/IngredientsPage";
import { MemoryRouter } from "react-router-dom";

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
                    ingredients: [
                        { id: 1, name: "Лайм" },
                        { id: 2, name: "Белый ром" },
                    ],
                },
            },
        }),
}));

vi.mock("../../src/game-pages/ingredients-page/Ingredients", () => ({
    useIngredients: () => ({
        searchValue: "",
        setSearchValue: vi.fn(),
        groupedIngredients: [
            {
                type: "base",
                title: "Основа",
                items: [
                    { id: 1, name: "Лайм" },
                    { id: 2, name: "Белый ром" },
                ],
            },
        ],
    }),
}));

vi.mock("../../src/game-pages/hint.js", () => ({
    default: vi.fn(),
}));

vi.mock("../../src/game-pages/ingredients-page/ingredients_error.js", () => ({
    ingredientErrors: vi.fn(),
}));

vi.mock("../../src/menu-page/RecipeCard.jsx", () => ({
    default: () => <div>RecipeCard</div>,
}));

vi.mock("../../src/game-pages/ErrorModal.jsx", () => ({
    default: ({ open, errorCount }) =>
        open ? <div>Ошибок: {errorCount}</div> : null,
}));

import drawHint from "../../src/game-pages/hint.js";
import { ingredientErrors } from "../../src/game-pages/ingredients-page/ingredients_error.js";
import {
    addStageMistake,
    resetLevel,
    toggleIngredient,
} from "../../src/game/gameSlice.js";


const renderPage = () =>
    render(
        <MemoryRouter>
            <IngredientsPage />
        </MemoryRouter>
    );


describe("IngredientsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("рендерит заголовок страницы", () => {
        renderPage();
        expect(screen.getByText("Ингредиенты")).toBeInTheDocument();
    });

    it("рендерит кнопку назад", () => {
        renderPage();
        expect(screen.getByTestId("back-button")).toBeInTheDocument();
    });

    it("клик по кнопке назад вызывает navigate(-1) и resetLevel", () => {
        renderPage();

        fireEvent.click(screen.getByTestId("back-button"));

        expect(mockNavigate).toHaveBeenCalledWith(-1);
        expect(mockDispatch).toHaveBeenCalledWith(resetLevel());
    });

    it("рисует ингредиенты", () => {
        renderPage();

        expect(screen.getByText("Лайм")).toBeInTheDocument();
        expect(screen.getByText("Белый ром")).toBeInTheDocument();
    });

    it("клик по ингредиенту вызывает toggleIngredient", () => {
        renderPage();

        fireEvent.click(screen.getByText("Лайм"));

        expect(mockDispatch).toHaveBeenCalledWith(
            toggleIngredient({ id: 1, name: "Лайм" })
        );
    });

    it("вызывает drawHint при монтировании (mode !== hard)", () => {
        renderPage();
        expect(drawHint).toHaveBeenCalledTimes(1);
    });

    it("если есть ошибки — открывает модалку и dispatch addStageMistake", () => {
        ingredientErrors.mockReturnValue(2);

        renderPage();

        fireEvent.click(screen.getByText("Создать с пропорциями"));

        expect(mockDispatch).toHaveBeenCalledWith(
            addStageMistake({ stage: "stage1", count: 2 })
        );

        expect(screen.getByText("Ошибок: 2")).toBeInTheDocument();
    });

    it("если ошибок нет — переходит на /proportions", () => {
        ingredientErrors.mockReturnValue(0);

        renderPage();

        fireEvent.click(screen.getByText("Создать с пропорциями"));

        expect(mockNavigate).toHaveBeenCalledWith("/proportions");
    });
});
