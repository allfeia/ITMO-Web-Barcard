import { http, HttpResponse } from "msw";

const cocktailsDatabase = {
    BAR123: [
        { id: 1, name: "Мохито", draw_file: "mojito" },
        { id: 2, name: "Разбитый базилик", draw_file: "smash-basil" },
        { id: 3, name: "Негрони", draw_file: "negroni" },
    ],
    BAR777: [
        { id: 1, name: "Клеверный клуб", draw_file: "clover-club" },
        { id: 2, name: "Горячий пунш", draw_file: "hot-toddy" },
    ],
};

export const getCocktails = [
    http.get("/api/cocktail", ({ request }) => {
        const url = new URL(request.url);
        const barId = url.searchParams.get("barId");

        if (!barId || !cocktailsDatabase[barId]) {
            return HttpResponse.json(
                { error: "Бар не найден или нет коктейлей" },
                { status: 404 }
            );
        }

        return HttpResponse.json(cocktailsDatabase[barId], { status: 200 });
    }),
];
