import {drawMojito} from "./BAR123/mojito.js";
import {drawHotToddy} from "./BAR777/hot-toddy.js";
import {drawNegroni} from "./BAR123/negroni.js";
import {drawCloverClub} from "./BAR777/clover-club.js";
import {drawSmashBasil} from "./BAR123/smash-basil.js";

export const drawCocktailMap = {
    "mojito": drawMojito,
    "smash-basil": drawSmashBasil,
    "negroni": drawNegroni,

    "clover-club": drawCloverClub,
    "hot-toddy": drawHotToddy

}