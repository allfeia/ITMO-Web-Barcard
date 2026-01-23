import { describe, it, expect, vi, beforeEach } from "vitest";
import {act, renderHook, waitFor} from "@testing-library/react";
import { useIngredients } from "../../src/game-pages/ingredients-page/Ingredients";

const mockIngredients = [
    { id: 1, name: "Белый ром", type: "alcohol" },
    { id: 2, name: "Лайм", type: "fruit" },
    { id: 3, name: "Мята", type: "decoration" },
];

describe("useIngredients", () => {
    beforeEach(() => {
        vi.restoreAllMocks();

        global.fetch = vi.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve(mockIngredients),
            })
        );
    });

    it("делает fetch при монтировании", async () => {
        renderHook(() => useIngredients());

        expect(fetch).toHaveBeenCalledWith("/api/ingredients", {
            method: "POST",
        });
    });

    it("группирует ингредиенты по типам", async () => {
        const { result } = renderHook(() => useIngredients());

        await waitFor(() => {
            const alcoholGroup = result.current.groupedIngredients.find(
                g => g.type === "alcohol"
            );

            expect(alcoholGroup.items).toHaveLength(1);
            expect(alcoholGroup.items[0].name).toBe("Белый ром");
        });
    });

    it("фильтрует ингредиенты по searchValue", async () => {
        const { result } = renderHook(() => useIngredients());

        await waitFor(() => {
            expect(result.current.groupedIngredients.length).toBeGreaterThan(0);
        });

        result.current.setSearchValue("лайм");

        await waitFor(() => {
            const fruitGroup = result.current.groupedIngredients.find(
                g => g.type === "fruit"
            );

            expect(fruitGroup.items).toHaveLength(1);
            expect(fruitGroup.items[0].name).toBe("Лайм");
        });
    });

    it("возвращает пустые группы, если ничего не найдено", async () => {
        const { result } = renderHook(() => useIngredients());

        await waitFor(() => {
            expect(result.current.groupedIngredients.length).toBeGreaterThan(0);
        });
        await act(async () => {
            result.current.setSearchValue("несуществующий");
        });
        await waitFor(() => {
            const totalItems = result.current.groupedIngredients.reduce(
                (sum, g) => sum + g.items.length,
                0
            );

            expect(totalItems).toBe(0);
        });
    });

});
