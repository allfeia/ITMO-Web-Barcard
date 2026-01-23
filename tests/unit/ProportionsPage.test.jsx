import { describe, it, expect, vi, beforeEach } from "vitest";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProportionsPage from "../../src/game-pages/proportions-page/ProportionsPage";

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
                gameOver: false,
                selectedIngredients: {
                    1: { id: 1, name: "Лайм", amount: 20 },
                },
                cocktailData: {
                    ingredients: [
                        { id: 1, name: "Лайм", amount: 20, unit: "мл" },
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
        }),
}));

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
    default: ({ open }) =>
        open ? <div>HardModeFail</div> : null,
}));

import { proportionsErrors } from "../../src/game-pages/proportions-page/proportions_error.js";
import {
    addStageMistake,
    setStageStepsCount,
    setIngredientAmount,
} from "../../src/game/gameSlice.js";
import {useSelector} from "react-redux";

const renderPage = () =>
    render(
        <MemoryRouter>
            <ProportionsPage />
        </MemoryRouter>
    );

describe("ProportionsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("рендерит заголовок страницы", () => {
        renderPage();
        expect(screen.getByText("Пропорции")).toBeInTheDocument();
    });

    it("рендерит кнопку перехода", () => {
        renderPage();
        expect(
            screen.getByText("Перейти к созданию")
        ).toBeInTheDocument();
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

    it("при отсутствии ошибок переходит на /create", async () => {
        proportionsErrors.mockReturnValue(0);

        useSelector.mockImplementation(selector =>
            selector({
                game: {
                    mode: "easy",
                    selectedIngredients: {
                        1: { id: 1, name: "Джин", amount: 50 },
                        2: { id: 2, name: "Тоник", amount: 150 },
                    },
                    cocktailData: {
                        ingredients: [
                            { id: 1, name: "Джин", unit: "ml" },
                            { id: 2, name: "Тоник", unit: "ml" },
                        ],
                    },
                    stages: {
                        stage2: {
                            mistakes: 0,
                            stepsCount: 2,
                            score: 0,
                        },
                    },
                    gameOver: false,
                },
            })
        );

        renderPage();

        fireEvent.click(screen.getByText("Перейти к созданию"));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/create");
        });
    });


});
