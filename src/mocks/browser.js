import { setupWorker } from "msw/browser";
import { signInBarman } from "./signInBarman.js";
import {getCocktails} from "./getCocktails.js";

export const worker = setupWorker(...signInBarman, ...getCocktails);
