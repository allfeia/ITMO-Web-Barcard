import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import RecipeStepCard from "../../src/game-pages/created-page/RecipeStepCard.jsx";

describe("RecipeStepCard", () => {
    const step = {
        step_number: 1,
        action: "Добавьте джин",
        ingredient_name: "Джин",
    };

    const selectedIngredients = {
        1: { id: 1, name: "Джин" },
        2: { id: 2, name: "Лимонный сок" },
    };

    it("рендерит текст шага", () => {
        render(
            <RecipeStepCard
                step={step}
                selectedIngredients={selectedIngredients}
                userAnswers={{}}
                setUserAnswers={vi.fn()}
            />
        );

        expect(screen.getByText("Добавьте")).toBeInTheDocument();
    });

    it("показывает select с ингредиентами", () => {
        render(
            <RecipeStepCard
                step={step}
                selectedIngredients={selectedIngredients}
                userAnswers={{}}
                setUserAnswers={vi.fn()}
            />
        );

        const select = screen.getByRole("combobox");
        expect(select).toBeInTheDocument();

        expect(screen.getByText("Джин")).toBeInTheDocument();
        expect(screen.getByText("Лимонный сок")).toBeInTheDocument();
    });

    it("вызывает setUserAnswers при выборе ингредиента", () => {
        const setUserAnswers = vi.fn();

        render(
            <RecipeStepCard
                step={step}
                selectedIngredients={selectedIngredients}
                userAnswers={{}}
                setUserAnswers={setUserAnswers}
            />
        );

        const select = screen.getByRole("combobox");

        fireEvent.change(select, {
            target: { value: "Джин" },
        });

        expect(setUserAnswers).toHaveBeenCalledTimes(1);

        const updaterFn = setUserAnswers.mock.calls[0][0];
        const result = updaterFn({});

        expect(result).toHaveProperty("1");
    });

    it("не рендерит select, если ingredient_name отсутствует", () => {
        render(
            <RecipeStepCard
                step={{
                    step_number: 2,
                    action: "Встряхните со льдом",
                }}
                selectedIngredients={selectedIngredients}
                userAnswers={{}}
                setUserAnswers={vi.fn()}
            />
        );

        expect(screen.queryByRole("combobox")).toBeNull();
    });
});
