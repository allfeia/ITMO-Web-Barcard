import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import FavouritesPage from "../../src/favourites-page/FavouritesPage.jsx";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
    const actual = await importOriginal();
    return { ...actual, useNavigate: () => mockNavigate };
});

const mockUseAuth = {
    barId: "123",
    barName: "Olive Bar",
    barSite: "https://olivebarandkitchen.com",
    savedCocktailsId: [1,3],
};

vi.mock("../../src/authContext/useAuth.js", () => ({
    useAuth: () => mockUseAuth,
}));


vi.mock("../../src/CocktailsListPage.jsx", () => ({
    default: ({ cocktails }) => (
        <div data-testid="cocktail-list">
            {cocktails.map((c) => (
                <div key={c.id}>{c.name}</div>
            ))}
        </div>
    ),
}));


describe("FavouritesPage", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        mockNavigate.mockClear();
        global.fetch = vi.fn();
    });

    it("показывает 'Сохранений нет', если savedCocktails пустой", async () => {
        global.fetch.mockResolvedValue({
            json: () => Promise.resolve([]),
        });

        render(
            <MemoryRouter>
                <FavouritesPage />
            </MemoryRouter>
        );

        expect(await screen.findByText(/Сохранений нет/i)).toBeInTheDocument();
    });

    it("запрашивает избранные коктейли и отображает их", async () => {
        global.fetch.mockResolvedValue({
            json: () =>
                Promise.resolve([
                    { id: 1, name: "Мохито" },
                    { id: 3, name: "Негрони" },
                ]),
        });

        render(
            <MemoryRouter>
                <FavouritesPage />
            </MemoryRouter>
        );

        expect(global.fetch).toHaveBeenCalledWith(
            "/api/favourites",
            expect.objectContaining({
                method: "POST",
                credentials: 'include',
                headers: expect.objectContaining({
            "Content-Type": "application/json",
        }),
                body: JSON.stringify({
                    savedCocktailsId: [1,3],
                }),
            })
        );

        expect(await screen.findByText("Мохито")).toBeInTheDocument();
        expect(screen.getByText("Негрони")).toBeInTheDocument();
    });

    it("нажатие на стрелку вызывает navigate('/account')", async () => {
        global.fetch.mockResolvedValue({ json: () => Promise.resolve([]) });

        render(
            <MemoryRouter>
                <FavouritesPage />
            </MemoryRouter>
        );

        const arrow = screen.getByTestId("WestIcon"); // если MUI позволяет, иначе через роль

        await userEvent.click(arrow);

        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it("передаёт barName, barSite и список коктейлей в CocktailListPage", async () => {
        const cocktails = [{ id: 1, name: "Мохито" }];

        global.fetch.mockResolvedValue({
            json: () => Promise.resolve(cocktails),
        });

        render(
            <MemoryRouter>
                <FavouritesPage />
            </MemoryRouter>
        );

        const item = await screen.findByText("Мохито");
        expect(item).toBeInTheDocument();

        const list = screen.getByTestId("cocktail-list");
        expect(list).toBeInTheDocument();
    });
});
