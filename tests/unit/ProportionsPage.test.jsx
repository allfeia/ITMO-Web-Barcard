import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ProportionsPage from "../../src/game-pages/proportions-page/ProportionsPage";

const dispatchMock = vi.fn();
const navigateMock = vi.fn();

vi.mock("react-redux", () => ({
    useDispatch: () => dispatchMock,
    useSelector: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
    useNavigate: () => navigateMock,
}));

vi.mock("../../src/game-pages/proportions-page/proportions_error.js", () => ({
    proportionsErrors: vi.fn(),
}));

vi.mock("../../src/game-pages/PageHeader.jsx", () => ({
    default: ({ title }) => <div>{title}</div>,
}));

vi.mock("../../src/menu-page/RecipeCard.jsx", () => ({
    default: () => <div>RecipeCard</div>,
}));

vi.mock("../../src/game-pages/ErrorModal.jsx", () => ({
    default: ({ open, errorCount }) =>
        open ? <div>Ошибок: {errorCount}</div> : null,
}));

import { useSelector } from "react-redux";
import { proportionsErrors } from "../../src/game-pages/proportions-page/proportions_error.js";
import { addStageMistake, setIngredientAmount} from "../../src/game/gameSlice.js";

describe("ProportionsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        useSelector.mockImplementation((selector) =>
            selector({
                game: {
                    mode: "easy",
                    cocktailId: 1,
                    selectedIngredients: {
                        6: { id: 6, name: "Джин", amount: 40 },
                    },
                    cocktailData: {
                        ingredients: [
                            { id: 6, amount: 50, unit: "ml" },
                        ],
                    },
                },
            })
        );
    });

    it("рендерит ингредиент с полем ввода и единицей измерения", () => {
        render(<ProportionsPage />);

        expect(screen.getByText("Джин")).toBeInTheDocument();
        expect(screen.getByDisplayValue("40")).toBeInTheDocument();
        expect(screen.getByText("ml")).toBeInTheDocument();
    });

    it("диспатчит setIngredientAmount при вводе значения", () => {
        render(<ProportionsPage />);

        const input = screen.getByDisplayValue("40");

        fireEvent.change(input, { target: { value: "45" } });

        expect(dispatchMock).toHaveBeenCalledWith(
            setIngredientAmount({ id: 6, amount: 45 })
        );
    });

    it("показывает ErrorModal и диспатчит ошибку, если пропорции неверны", () => {
        proportionsErrors.mockReturnValue(1);

        render(<ProportionsPage />);

        fireEvent.click(screen.getByText("Перейти к созданию"));

        expect(dispatchMock).toHaveBeenCalledWith(
            addStageMistake({ stage: "stage2", count: 1 })
        );

        expect(screen.getByText("Ошибок: 1")).toBeInTheDocument();
    });

    it("переходит на /create, если ошибок нет", () => {
        proportionsErrors.mockReturnValue(0);

        render(<ProportionsPage />);

        fireEvent.click(screen.getByText("Перейти к созданию"));

        expect(navigateMock).toHaveBeenCalledWith("/create");
    });
});
