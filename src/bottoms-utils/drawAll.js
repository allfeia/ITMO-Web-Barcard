import {drawGreenGlass} from "../glasses-bottom/greenGlass.js";
import {drawYellowGlass} from "../glasses-bottom/yellowGlass.js";
import {drawRedGlass} from "../glasses-bottom/redGlass.js";
import {drawBlueGlass} from "../glasses-bottom/blueGlass.js";
import {drawPinkGlass} from "../glasses-bottom/pinkGlass.js";
import {drawOrangeGlass} from "../glasses-bottom/orangeGlass.js";

export function drawAll(barmanCanvas, guestCanvas) {

    const guest = [
        drawGreenGlass,
        drawYellowGlass,
        drawRedGlass,
        drawBlueGlass,
        drawPinkGlass,
        drawOrangeGlass,
    ];

    guest.forEach(func => func(guestCanvas));
}
