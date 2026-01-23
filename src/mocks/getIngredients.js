import { http, HttpResponse } from "msw";
import { db } from "./db.js";

export const getIngredients = [
  http.post("api/ingredients", () => {
    const ingredients = db.ingredient;
    if (!ingredients) {
      return HttpResponse.json(
        { status: 404 },
        { error: "Нет доступных ингрединетов" },
      );
    }
    return HttpResponse.json(ingredients, { status: 200 });
  }),
];
