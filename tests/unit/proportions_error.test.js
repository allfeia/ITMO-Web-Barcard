import { describe, it, expect } from "vitest";
import { proportionsErrors } from "../../src/game-pages/proportions-page/proportions_error.js";

describe("proportionsErrors", () => {
    it("возвращает 0, если все пропорции совпадают", () => {
        const ingredientsWithQuantity = [
            { id: 1, amount: 50 },
            { id: 2, amount: 30 },
        ];

        const cocktailIngredients = [
            { id: 1, amount: 50 },
            { id: 2, amount: 30 },
        ];

        const result = proportionsErrors(
            ingredientsWithQuantity,
            cocktailIngredients
        );

        expect(result).toBe(0);
    });

    it("считает одну ошибку, если одно количество неверно", () => {
        const ingredientsWithQuantity = [
            { id: 1, amount: 40 },
            { id: 2, amount: 30 },
        ];

        const cocktailIngredients = [
            { id: 1, amount: 50 },
            { id: 2, amount: 30 },
        ];

        const result = proportionsErrors(
            ingredientsWithQuantity,
            cocktailIngredients
        );

        expect(result).toBe(1);
    });

    it("считает несколько ошибок, если несколько пропорций неверны", () => {
        const ingredientsWithQuantity = [
            { id: 1, amount: 40 },
            { id: 2, amount: 20 },
            { id: 3, amount: 10 },
        ];

        const cocktailIngredients = [
            { id: 1, amount: 50 },
            { id: 2, amount: 30 },
            { id: 3, amount: 15 },
        ];

        const result = proportionsErrors(
            ingredientsWithQuantity,
            cocktailIngredients
        );

        expect(result).toBe(3);
    });
});
