import {http, HttpResponse} from "msw";

let savedCocktailsId = [];

export const removeFavouriteCocktail = [
    http.delete("/api/favourites/remove/:id", ({ params }) => {
        const id = Number(params.id);
        savedCocktailsId = savedCocktailsId.filter(x => x !== id);
        return HttpResponse.json({ removedId: id });
    })
];