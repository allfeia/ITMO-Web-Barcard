import { describe, it, expect } from "vitest";
import { createdErrors } from "../../src/game-pages/created-page/created_error.js";

describe("createdErrors", () => {

    const cocktailIngredients = [
        { id: 1, name: "Базилик" },
        { id: 2, name: "Джин" },
        { id: 3, name: "Лимонный сок" },
    ];

    const correctSteps = [
        { step_number: 1, ingredient_name: "Базилик" },
        { step_number: 2, ingredient_name: "Джин" },
        { step_number: 3, ingredient_name: "Лимонный сок" },
    ];

    it("возвращает 0, если все правильно", () => {
        const shuffledSteps = [
            { step_number: 1, ingredient_name: "Базилик" },
            { step_number: 2, ingredient_name: "Джин" },
            { step_number: 3, ingredient_name: "Лимонный сок" },
        ];

        const userAnswers = {
            1: "Базилик",
            2: "Джин",
            3: "Лимонный сок",
        };

        const result = createdErrors(shuffledSteps, correctSteps, cocktailIngredients, userAnswers);
        expect(result).toBe(0);
    });

    it("считает ошибки ингредиентов", () => {
        const shuffledSteps = [
            { step_number: 1, ingredient_name: "Базилик" },
            { step_number: 2, ingredient_name: "Джин" },
            { step_number: 3, ingredient_name: "Лимонный сок" },
        ];

        const userAnswers = {
            1: "Базилик",
            2: "Лимонный сок", // ошибка
            3: "Лимонный сок",
        };

        const result = createdErrors(shuffledSteps, correctSteps, cocktailIngredients, userAnswers);
        expect(result).toBe(1); // 1 ошибка ингредиента
    });

    it("считает ошибки порядка", () => {
        const shuffledSteps = [
            { step_number: 2, ingredient_name: "Джин" },
            { step_number: 1, ingredient_name: "Базилик" },
            { step_number: 3, ingredient_name: "Лимонный сок" },
        ];

        const userAnswers = {
            1: "Базилик",
            2: "Джин",
            3: "Лимонный сок",
        };

        const result = createdErrors(shuffledSteps, correctSteps, cocktailIngredients, userAnswers);
        expect(result).toBe(2); // 2 ошибки порядка
    });

    it("считает ошибки ингредиентов и порядка вместе", () => {
        const shuffledSteps = [
            { step_number: 2, ingredient_name: "Джин" },
            { step_number: 1, ingredient_name: "Базилик" },
            { step_number: 3, ingredient_name: "Лимонный сок" },
        ];

        const userAnswers = {
            1: "Базилик",
            2: "Базилик", // ошибка ингредиента
            3: "Лимонный сок",
        };

        const result = createdErrors(shuffledSteps, correctSteps, cocktailIngredients, userAnswers);
        expect(result).toBe(3); // 2 ошибки порядка + 1 ингредиента
    });

});
