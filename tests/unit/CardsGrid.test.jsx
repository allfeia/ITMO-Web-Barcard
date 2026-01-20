import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CardsGrid from "../../src/menu-page/CardsGrid.jsx";
import drawHeartIcon from "../../src/icons/heartIcon.js";
import { drawCocktailMap } from "../../src/menu-page/menu-cocktails/drawCocktailMap.js";

vi.mock("../../src/menu-page/RecipeCard.jsx", () => ({
    default: ({ open, cocktail }) =>
        open ? <div data-testid="recipe-modal">{cocktail.name}</div> : null,
}));

vi.mock("../../src/menu-page/menu-cocktails/drawCocktailMap.js", () => ({
    drawCocktailMap: {
        "mojito.js": vi.fn(),
        "smash-basil.js": vi.fn(),
        "negroni.js": vi.fn(),
    },
}));

vi.mock("../../src/icons/heartIcon.js", () => ({
    default: vi.fn(),
}));

vi.mock("../../src/authContext/useAuth.js", () => ({
    useAuth: () => ({
        isBarman: true,
        savedCocktailsId: mockSavedIds,
        setSavedCocktailsId: mockSetSavedIds,
    }),
}));

let mockSavedIds = [];
let mockSetSavedIds = vi.fn();

beforeEach(() => {
    mockSavedIds = [];
    mockSetSavedIds = vi.fn((updater) => {
        if (typeof updater === "function") {
            mockSavedIds = updater(mockSavedIds);
        } else {
            mockSavedIds = updater;
        }
    });

    global.fetch = vi.fn(() =>
        Promise.resolve({
            json: () => Promise.resolve({ cocktailId: expect.any(Number) }),
        })
    );

    drawHeartIcon.mockClear();
    Object.values(drawCocktailMap).forEach(mock => mock.mockClear());
});

const cocktails = [
    { id: 1, name: "Мохито", draw_file: "mojito.js" },
    { id: 2, name: "Разбитый базилик", draw_file: "smash-basil.js" },
    { id: 3, name: "Негрони", draw_file: "negroni.js" },
];

describe("CardsGrid", () => {
    it("рендерит карточки", () => {
        render(<CardsGrid cocktails={cocktails} />);

        expect(screen.getByText("Мохито")).toBeInTheDocument();
        expect(screen.getByText("Разбитый базилик")).toBeInTheDocument();
        expect(screen.getByText("Негрони")).toBeInTheDocument();
    });

    it("вызывает функцию рисования коктейля", () => {
        render(<CardsGrid cocktails={cocktails} />);

        expect(drawCocktailMap["mojito.js"]).toHaveBeenCalled();
        expect(drawCocktailMap["smash-basil.js"]).toHaveBeenCalled();
        expect(drawCocktailMap["negroni.js"]).toHaveBeenCalled();
    });

    it("вызывает drawHeartIcon для каждого сердца", () => {
        render(<CardsGrid cocktails={cocktails} />);

        expect(drawHeartIcon).toHaveBeenCalledTimes(3);
        expect(drawHeartIcon).toHaveBeenCalledWith(expect.any(HTMLCanvasElement), {
            color: "#333",
            filled: false,
        });

        const heartCanvases = screen.getAllByTestId("favourites-canvas");
        expect(heartCanvases).toHaveLength(3);
    });

    it("открывает модалку с рецептом при клике", () => {
        render(<CardsGrid cocktails={cocktails} />);

        fireEvent.click(screen.getByText("Мохито"));

        expect(screen.getByTestId("recipe-modal")).toHaveTextContent("Мохито");
    });

    it("добавляет коктейль в избранное при клике на сердечко", async () => {
        render(<CardsGrid cocktails={cocktails} />);

        const hearts = screen.getAllByTestId("favourites-canvas");
        fireEvent.click(hearts[0]);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith("/api/favourites/add/1", {
                method: "PATCH",
                credentials: "include",
            });
        });

        await waitFor(() => {
            expect(mockSetSavedIds).toHaveBeenCalledWith(expect.any(Function));
        });
    });

    it("удаляет из избранного, если уже в избранном", async () => {
        mockSavedIds = [2];

        render(<CardsGrid cocktails={cocktails} />);

        const hearts = screen.getAllByTestId("favourites-canvas");
        fireEvent.click(hearts[1]);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith("/api/favourites/remove/2", {
                method: "DELETE",
                credentials: "include",
            });
        });

        await waitFor(() => {
            expect(mockSetSavedIds).toHaveBeenCalledWith(expect.any(Function));
        });
    });
});