import { setupWorker } from "msw/browser";
import { signInBarman } from "./signInBarman.js";
import { getCocktails } from "./getCocktails.js";
import { getCocktailRecipe } from "./getRecipe.js";
import { meInfo } from "./getBarmenInfo.js";
import { getFavouritesCocktails } from "./getFavourites.js";
import { addFavouriteCocktail } from "./addFavoritesCocktail.js";
import { removeFavouriteCocktail } from "./removeFavouriteCocktail.js";

export const worker = setupWorker(
  ...signInBarman,
  ...getCocktails,
  ...getFavouritesCocktails,
  ...getCocktailRecipe,
  ...meInfo,
  ...addFavouriteCocktail,
  ...removeFavouriteCocktail,
);
