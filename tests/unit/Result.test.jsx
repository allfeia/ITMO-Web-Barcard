import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Result from "../../src/game-pages/result/Result";

const navigateMock = vi.fn();

vi.mock("react-router-dom", () => ({
    useNavigate: () => navigateMock,
}));

vi.mock("react-redux", () => ({
    useSelector: vi.fn(),
}));

import { useSelector } from "react-redux";

vi.mock("../../src/game-pages/result/CocktailCanvas", () => ({
    default: () => <div data-testid="cocktail-canvas" />,
}));


const baseState = {
    game: {
        stages: {
            stage1: { score: 10 },
            stage2: { score: 20 },
            stage3: { score: 30 },
        },
    },
};

beforeEach(() => {
    vi.clearAllMocks();
    useSelector.mockImplementation(selector => selector(baseState));
});

describe("Result", () => {
    it("рендерит итоговый рейтинг", () => {
        render(<Result />);

        expect(
            screen.getByText("Рейтинг: 60 ★")
        ).toBeInTheDocument();
    });

    it("кнопка «Переиграть» ведет на /levelPage", () => {
        render(<Result />);

        fireEvent.click(
            screen.getByTitle("переиграть")
        );

        expect(navigateMock).toHaveBeenCalledWith("/levelPage");
    });

    it("кнопка «Бар» ведет на /menu", () => {
        render(<Result />);

        fireEvent.click(
            screen.getByTitle("бар")
        );

        expect(navigateMock).toHaveBeenCalledWith("/menu");
    });

    it("кнопка «Заказать» ведет на /order", () => {
        render(<Result />);

        fireEvent.click(
            screen.getByText("Заказать")
        );

        expect(navigateMock).toHaveBeenCalledWith("/order");
    });
});
