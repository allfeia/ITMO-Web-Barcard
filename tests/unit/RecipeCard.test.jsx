import { render, screen, fireEvent } from "@testing-library/react";
import RecipeCard from "../../src/menu-page/RecipeCard.jsx";
import { MemoryRouter } from "react-router-dom";
import {AuthProvider} from "../../src/authContext/AuthContext.jsx";
import {vi} from "vitest";

const mockNavigate = vi.fn();
const mockDispatch = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
    const actual = await importOriginal();
    return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("react-redux", () => ({
    useDispatch: () => mockDispatch,
    useSelector: (selector) =>
        selector({
            game: {
                cocktailId: null,
            },
        }),
}));

global.fetch = vi.fn();

describe("RecipeCard", () => {

    const mockCocktail = { id: 1 };

    const mockRecipeResponse = {
        name: "Мохито",
        ingredients: [
            { name: "Лайм", amountStr: "" },
            { name: "Белый ром", amountStr: "60 ml" },
            { name: "Содовая", amountStr: "120 ml" },
            { name: "Мята", amountStr: "" }
        ],
        decoration: "Мята",
        steps: [
            { action: "Выжмите сок из половинки лайма в стакан" },
            { action: "Добавьте белый ром, затем наполните стакан для хайбола льдом" },
            { action: "Долейте содовую по вкусу" },
            { action: "Украсьте мятой" }
        ]
    };


    beforeEach(() => {
        vi.clearAllMocks();
    });

    function renderComponent(props = {}) {
        return render(
            <AuthProvider>
                <MemoryRouter>
                    <RecipeCard
                        open={true}
                        cocktail={mockCocktail}
                        onClose={() => {}}
                        {...props}
                    />
                </MemoryRouter>
            </AuthProvider>
        );
    }

    test("отправляет запрос при открытии и показе id коктейля", async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockRecipeResponse)
        });

        renderComponent();

        expect(fetch).toHaveBeenCalledWith("/api/cocktail/1/recipe");
    });

    test("рисует название коктейля после получения данных", async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockRecipeResponse)
        });

        renderComponent();

        expect(await screen.findByText("Мохито")).toBeInTheDocument();
    });

    test("показывает ингредиенты", async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockRecipeResponse)
        });

        renderComponent();

        expect(await screen.findByText(/Лайм/)).toBeInTheDocument();
        expect(await screen.findByText(/Белый ром/)).toBeInTheDocument();
        expect(await screen.findByText(/Содовая/)).toBeInTheDocument();
    });

    test("показывает шаги приготовления", async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockRecipeResponse)
        });

        renderComponent();

        expect(await screen.findByText("Выжмите сок из половинки лайма в стакан")).toBeInTheDocument();
        expect(screen.getByText("Добавьте белый ром, затем наполните стакан для хайбола льдом")).toBeInTheDocument();
        expect(screen.getByText("Долейте содовую по вкусу")).toBeInTheDocument();
        expect(screen.getByText("Украсьте мятой")).toBeInTheDocument();

    });

    test("клик по кнопке 'Изучить' вызывает navigate('/levelPage')", async () => {

        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockRecipeResponse)
        });

        renderComponent();

        const learnButton = await screen.findByRole("button", {
            name: /изучить/i,
        });

        fireEvent.click(learnButton);

        expect(mockDispatch).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith("/levelPage");
    });
});
