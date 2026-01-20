import {http, HttpResponse} from "msw";

const userFavourites = {};

export const addFavouriteCocktail = [
    http.patch("/api/favourites/add/:id", ({ params, cookies }) => {
        const userId = cookies?.access_token ? JSON.parse(atob(cookies.access_token)).id : null;
        if (!userId) {
            return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const id = Number(params.id);

        if (!userFavourites[userId]) {
            userFavourites[userId] = [];
        }

        if (!userFavourites[userId].includes(id)) {
            userFavourites[userId].push(id);
        }

        return HttpResponse.json({
            ok: true,
            cocktailId: id,
            saved: userFavourites[userId],
        });
    }),
];

export const removeFavouriteCocktail = [
    http.delete("/api/favourites/remove/:id", ({ params, cookies }) => {
        const userId = cookies?.access_token ? JSON.parse(atob(cookies.access_token)).id : null;
        if (!userId) {
            return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const id = Number(params.id);

        if (!userFavourites[userId]) {
            userFavourites[userId] = [];
        }

        userFavourites[userId] = userFavourites[userId].filter((x) => x !== id);

        return HttpResponse.json({
            ok: true,
            cocktailId: id,
            saved: userFavourites[userId],
        });
    }),
];