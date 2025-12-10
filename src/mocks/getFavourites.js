import { http, HttpResponse } from "msw";

const cocktailsDatabase = {
  123: [
    { id: 1, name: "Мохито", draw_file: "mojito" },
    { id: 2, name: "Разбитый базилик", draw_file: "smash-basil" },
    { id: 3, name: "Негрони", draw_file: "negroni" },
  ],
  777: [
    { id: 4, name: "Клеверный клуб", draw_file: "clover-club" },
    { id: 5, name: "Горячий пунш", draw_file: "hot-toddy" },
  ],
};

export const getFavouritesCocktails = [
  http.post("/api/favourites", async ({ request }) => {
    const { barId, savedCocktailsId } = await request.json();

    if (!barId) {
      return HttpResponse.json({ error: "barId обязателен" }, { status: 400 });
    }

    const cocktails = cocktailsDatabase[Number(barId)];
    if (!cocktails) {
      return HttpResponse.json({ error: "Бар не найден" }, { status: 404 });
    }

    if (
      !savedCocktailsId ||
      !Array.isArray(savedCocktailsId) ||
      savedCocktailsId.length === 0
    ) {
      return HttpResponse.json([], { status: 200 });
    }

    const savedCocktails = cocktails.filter((cocktail) =>
      savedCocktailsId.includes(cocktail.id),
    );

    return HttpResponse.json(savedCocktails, { status: 200 });
  }),
];
