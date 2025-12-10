import { http, HttpResponse } from "msw";

let savedCocktailsId = [];

export const addFavouriteCocktail = [
    http.patch("/api/favourites/add/:id",  ({ params }) => {
        const id = Number(params.id);

        if (!savedCocktailsId.includes(id)) {
            savedCocktailsId.push(id);
        }
        return HttpResponse.json({ cocktailId: id });
    })
];
