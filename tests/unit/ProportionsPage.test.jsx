import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProportionsPage from "../../src/game-pages/proportions-page/ProportionsPage";
import * as redux from "react-redux";

const mockNavigate = vi.fn();
const mockDispatch = vi.fn();

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock("react-redux", async () => {
    const actual = await vi.importActual("react-redux");
    return {
        ...actual,
        useDispatch: () => mockDispatch,           // ← здесь лучше () => mockDispatch
        useSelector: vi.fn(),                      // ← пока пустой, реализацию добавим ниже
    };
});

vi.mock("../../src/game-pages/proportions-page/proportions_error.js", () => ({
    proportionsErrors: vi.fn(),
}));

vi.mock("../../src/game/scoreCalculator.js", () => ({
    calculateStageScore: vi.fn(() => 100),
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

import { proportionsErrors } from "../../src/game-pages/proportions-page/proportions_error.js";
import {
    addStageMistake,
    setStageStepsCount,
    setIngredientAmount,
} from "../../src/game/gameSlice.js";

const mockState = {
    game: {
        mode: "easy",
        cocktailId: 1,
        gameOver: false,
        selectedIngredients: {
            1: { id: 1, name: "Лайм", amount: 20 },
        },
        cocktailData: {
            ingredients: [
                { id: 1, name: "Лайм", unit: "мл", amount: 30 }, // amount исправлен (было amout → опечатка)
            ],
        },
        stages: {
            stage2: {
                mistakes: 0,
                stepsCount: 0,
                score: 0,
            },
        },
    },
};

// ← Самое важное: реализуем useSelector так, чтобы он вызывал переданный селектор
redux.useSelector.mockImplementation((selector) => selector(mockState));

const renderPage = () =>
    render(
        <MemoryRouter>
            <ProportionsPage />
        </MemoryRouter>
    );

describe("ProportionsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // useDispatch уже замокан выше через () => mockDispatch
        // useSelector уже настроен через mockImplementation выше
    });

    it("рендерит заголовок страницы", () => {
        renderPage();
        expect(screen.getByText("Пропорции")).toBeInTheDocument();
    });

    it("рендерит кнопку перехода", () => {
        renderPage();
        expect(screen.getByText("Перейти к созданию")).toBeInTheDocument();
    });

    it("рисует выбранные ингредиенты с количеством", () => {
        renderPage();

        expect(screen.getByText("Лайм")).toBeInTheDocument();
        expect(screen.getByDisplayValue("20")).toBeInTheDocument();
        expect(screen.getByText("мл")).toBeInTheDocument();
    });

    it("изменение инпута вызывает setIngredientAmount", () => {
        renderPage();

        const input = screen.getByDisplayValue("20");
        fireEvent.change(input, { target: { value: "30" } });

        expect(mockDispatch).toHaveBeenCalledWith(
            setIngredientAmount({ id: 1, amount: 30 })
        );
    });

    it("если есть ошибки — dispatch addStageMistake и показывает ErrorModal", () => {
        proportionsErrors.mockReturnValue(2);

        renderPage();
        fireEvent.click(screen.getByText("Перейти к созданию"));

        expect(mockDispatch).toHaveBeenCalledWith(
            setStageStepsCount({
                stage: "stage2",
                stepsCount: 1,
            })
        );

        expect(mockDispatch).toHaveBeenCalledWith(
            addStageMistake({
                stage: "stage2",
                count: 2,
            })
        );

        expect(screen.getByText("Ошибок: 2")).toBeInTheDocument();
    });


});