import { http, HttpResponse } from "msw";

const cocktailRecipeDatabase = {
  cocktail_recipe_step: [
    //мохито
    {
      id: 1,
      cocktail_id: 1,
      step_number: 1,
      action: "Выжмите сок из половинки лайма в стакан",
      ingredient_id: 3,
    },
    {
      id: 2,
      cocktail_id: 1,
      step_number: 2,
      action: "Добавьте белый ром, затем наполните стакан для хайбола льдом",
      ingredient_id: 1,
    },
    {
      id: 3,
      cocktail_id: 1,
      step_number: 3,
      action: "Долейте содовую по вкусу",
      ingredient_id: 2,
    },
    {
      id: 4,
      cocktail_id: 1,
      step_number: 4,
      action: "Украсьте мятой",
      ingredient_id: 4,
    },

    //разбитый базилик
    {
      id: 5,
      cocktail_id: 2,
      step_number: 1,
      action: "Разомните свежий базилик в шейкере",
      ingredient_id: 5,
    },
    {
      id: 6,
      cocktail_id: 2,
      step_number: 2,
      action: "Добавьте джин",
      ingredient_id: 6,
    },
    {
      id: 7,
      cocktail_id: 2,
      step_number: 3,
      action: "Добавьте свежий лимонный сок, лёд и взболтайте",
      ingredient_id: 17,
    },
    {
      id: 8,
      cocktail_id: 2,
      step_number: 4,
      action: "Процедите в бокал и украсьте листиком базилика",
      ingredient_id: 5,
    },

    //негрони
    {
      id: 9,
      cocktail_id: 3,
      step_number: 1,
      action: "Смешайте джин, кампари и сладкий вермут в стакане со льдом",
      ingredient_id: 6,
    },
    {
      id: 10,
      cocktail_id: 3,
      step_number: 2,
      action: "Перемешайте до охлаждения",
      ingredient_id: null,
    },
    {
      id: 11,
      cocktail_id: 3,
      step_number: 3,
      action: "Украсьте долькой апельсина",
      ingredient_id: 7,
    },

    //клеверный клуб
    {
      id: 12,
      cocktail_id: 4,
      step_number: 1,
      action: "Налейте джин, малиновый сироп и лимонный сок в шейкер",
      ingredient_id: 6,
    },
    {
      id: 13,
      cocktail_id: 4,
      step_number: 2,
      action: "Добавьте яичный белок",
      ingredient_id: 11,
    },
    {
      id: 14,
      cocktail_id: 4,
      step_number: 3,
      action: "Встряхните без льда, затем добавьте лёд и снова встряхните",
      ingredient_id: null,
    },
    {
      id: 15,
      cocktail_id: 4,
      step_number: 4,
      action: "Процедите в охлаждённый бокал",
      ingredient_id: null,
    },

    //горячий пунш
    {
      id: 16,
      cocktail_id: 5,
      step_number: 1,
      action: "Налейте виски в кружку",
      ingredient_id: 12,
    },
    {
      id: 17,
      cocktail_id: 5,
      step_number: 2,
      action: "Добавьте мёд и лимонный сок",
      ingredient_id: 13,
    },
    {
      id: 18,
      cocktail_id: 5,
      step_number: 3,
      action: "Залейте кипятком и размешайте",
      ingredient_id: 14,
    },
    {
      id: 19,
      cocktail_id: 5,
      step_number: 4,
      action: "Добавьте гвоздику для аромата",
      ingredient_id: 16,
    },
  ],

  cocktail_ingredient: [
    //мохито
    {
      id: 1,
      cocktail_id: 1,
      ingredient_id: 3,
      recipe_step_id: 1,
      amount: null,
      unit: "",
    },
    {
      id: 2,
      cocktail_id: 1,
      ingredient_id: 1,
      recipe_step_id: 2,
      amount: 60,
      unit: "ml",
    },
    {
      id: 3,
      cocktail_id: 1,
      ingredient_id: 2,
      recipe_step_id: 3,
      amount: 120,
      unit: "ml",
    },
    {
      id: 4,
      cocktail_id: 1,
      ingredient_id: 4,
      recipe_step_id: 1,
      amount: null,
      unit: "",
    },

    //разбитый базилик
    {
      id: 5,
      cocktail_id: 2,
      ingredient_id: 5,
      recipe_step_id: 1,
      amount: null,
      unit: "",
    },
    {
      id: 6,
      cocktail_id: 2,
      ingredient_id: 6,
      recipe_step_id: 2,
      amount: 50,
      unit: "ml",
    },
    {
      id: 7,
      cocktail_id: 2,
      ingredient_id: 17,
      recipe_step_id: 2,
      amount: 20,
      unit: "ml",
    }, // лимонный сок

    //негрони
    {
      id: 8,
      cocktail_id: 3,
      ingredient_id: 6,
      recipe_step_id: 1,
      amount: 30,
      unit: "ml",
    }, // джин
    {
      id: 9,
      cocktail_id: 3,
      ingredient_id: 8,
      recipe_step_id: 1,
      amount: 30,
      unit: "ml",
    }, // кампари
    {
      id: 10,
      cocktail_id: 3,
      ingredient_id: 9,
      recipe_step_id: 1,
      amount: 30,
      unit: "ml",
    }, // вермут
    {
      id: 11,
      cocktail_id: 3,
      ingredient_id: 7,
      recipe_step_id: 3,
      amount: null,
      unit: "",
    }, // апельсин

    //клеверный клуб
    {
      id: 12,
      cocktail_id: 4,
      ingredient_id: 6,
      recipe_step_id: 12,
      amount: 50,
      unit: "ml",
    }, // джин
    {
      id: 13,
      cocktail_id: 4,
      ingredient_id: 10,
      recipe_step_id: 12,
      amount: 15,
      unit: "ml",
    }, // малиновый сироп
    {
      id: 14,
      cocktail_id: 4,
      ingredient_id: 15,
      recipe_step_id: 12,
      amount: 25,
      unit: "ml",
    }, // лимон
    {
      id: 15,
      cocktail_id: 4,
      ingredient_id: 11,
      recipe_step_id: 13,
      amount: 1,
      unit: "pc",
    }, // белок

    //горячий пунш
    {
      id: 16,
      cocktail_id: 5,
      ingredient_id: 12,
      recipe_step_id: 16,
      amount: 45,
      unit: "ml",
    }, // виски
    {
      id: 17,
      cocktail_id: 5,
      ingredient_id: 13,
      recipe_step_id: 17,
      amount: 1,
      unit: "tsp",
    }, // мёд
    {
      id: 18,
      cocktail_id: 5,
      ingredient_id: 15,
      recipe_step_id: 17,
      amount: 10,
      unit: "ml",
    }, // лимонный сок
    {
      id: 19,
      cocktail_id: 5,
      ingredient_id: 14,
      recipe_step_id: 18,
      amount: 150,
      unit: "ml",
    }, // кипяток
    {
      id: 20,
      cocktail_id: 5,
      ingredient_id: 16,
      recipe_step_id: 19,
      amount: 2,
      unit: "pc",
    }, // гвоздика
  ],

  ingredient: [
    { id: 1, name: "Белый ром", type: "alcohol" },
    { id: 2, name: "Содовая", type: "non-alcohol" },
    { id: 3, name: "Лайм", type: "fruit" },
    { id: 4, name: "Мята", type: "decoration" },
    { id: 5, name: "Базилик", type: "decoration" },
    { id: 6, name: "Джин", type: "alcohol" },
    { id: 7, name: "Апельсин", type: "decoration" },
    { id: 8, name: "Кампари", type: "alcohol" },
    { id: 9, name: "Сладкий вермут", type: "alcohol" },
    { id: 10, name: "Малиновый сироп", type: "syrup" },
    { id: 11, name: "Яичный белок", type: "other" },
    { id: 12, name: "Виски", type: "alcohol" },
    { id: 13, name: "Мёд", type: "added" },
    { id: 14, name: "Кипяток", type: "non-alcohol" },
    { id: 15, name: "Лимон", type: "fruit" },
    { id: 16, name: "Гвоздика", type: "spice" },
    { id: 17, name: "Лимонный сок", type: "non-alcohol" },
  ],

  cocktail: [
    { id: 1, bar_id: 123, name: "Мохито", draw_file: "mojito" },
    { id: 2, bar_id: 123, name: "Разбитый базилик", draw_file: "smash-basil" },
    { id: 3, bar_id: 123, name: "Негрони", draw_file: "negroni" },
    { id: 4, bar_id: 777, name: "Клеверный клуб", draw_file: "clover-club" },
    { id: 5, bar_id: 777, name: "Горячий пунш", draw_file: "hot-toddy" },
  ],
};

export const getCocktailRecipe = [
  http.get("/api/cocktail/:cocktailId/recipe", ({ params }) => {
    const cocktailId = parseInt(params.cocktailId);

    const cocktail = cocktailRecipeDatabase.cocktail.find(
      (c) => c.id === cocktailId,
    );
    if (!cocktail) {
      return HttpResponse.json(
        { error: "Коктейль не найден" },
        { status: 404 },
      );
    }

    const steps = cocktailRecipeDatabase.cocktail_recipe_step
      .filter((step) => step.cocktail_id === cocktailId)
      .sort((a, b) => a.step_number - b.step_number);
    const ingredients = cocktailRecipeDatabase.cocktail_ingredient.filter(
      (ing) => ing.cocktail_id === cocktailId,
    );
    const allIngredients = cocktailRecipeDatabase.ingredient;

    const mainIngredients = [];
    const decorationIngredients = [];

    ingredients.forEach((ing) => {
      const ingredientData = allIngredients.find(
        (i) => i.id === ing.ingredient_id,
      );
      if (ingredientData) {
        const amountStr =
          ing.amount !== null ? `${ing.amount} ${ing.unit}` : "";
        const ingredientWithAmount = {
          ...ingredientData,
          amount: ing.amount,
          unit: ing.unit,
          amountStr: amountStr,
        };

        if (ingredientData.type === "decoration") {
          decorationIngredients.push(ingredientWithAmount);
        } else {
          mainIngredients.push(ingredientWithAmount);
        }
      }
    });

    const decoration =
      decorationIngredients.length > 0
        ? decorationIngredients.map((d) => d.name).join(", ")
        : "-";

    const recipeData = {
      id: cocktail.id,
      name: cocktail.name,
      ingredients: mainIngredients,
      decoration: decoration,
      steps: steps.map((step) => {
        const ingredientData = allIngredients.find(
          (i) => i.id === step.ingredient_id,
        );
        return {
          step_number: step.step_number,
          action: step.action,
          ingredient_name: ingredientData
            ? ingredientData.name
            : "Неизвестный ингредиент",
        };
      }),
    };

    return HttpResponse.json(recipeData, { status: 200 });
  }),
];
