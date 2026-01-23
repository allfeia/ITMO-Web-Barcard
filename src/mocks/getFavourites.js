import { http, HttpResponse } from "msw";
import { getUserIdFromCookies } from "./authUtils.js";

const cocktailsDatabase = [
  { id: 1, name: "Мохито", draw_file: "mojito", bar_id: 123 },
  { id: 2, name: "Разбитый базилик", draw_file: "smash-basil", bar_id: 123 },
  { id: 3, name: "Негрони", draw_file: "negroni", bar_id: 123 },
  { id: 4, name: "Клеверный клуб", draw_file: "clover-club", bar_id: 777 },
  { id: 5, name: "Горячий пунш", draw_file: "hot-toddy", bar_id: 777 },
];

export const getFavouritesCocktails = [
  http.post("/api/favourites", async ({ request, cookies }) => {
    const userId = getUserIdFromCookies({ cookies });
    if (!userId) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return HttpResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { savedCocktailsId } = body;

    if (!Array.isArray(savedCocktailsId)) {
      return HttpResponse.json(
        {
          error: "Invalid payload",
          details: [{ path: ["savedCocktailsId"], message: "Expected array" }],
        },
        { status: 400 },
      );
    }

    if (savedCocktailsId.length === 0) {
      return HttpResponse.json([], { status: 200 });
    }

    const requestedIds = new Set(savedCocktailsId);
    const foundCocktails = cocktailsDatabase.filter((c) =>
      requestedIds.has(c.id),
    );

    foundCocktails.sort((a, b) => a.name.localeCompare(b.name, "ru"));

    const response = foundCocktails.map(({ id, name, draw_file, bar_id }) => ({
      id,
      name,
      draw_file,
      bar_id,
    }));

    return HttpResponse.json(response, { status: 200 });
  }),
];
