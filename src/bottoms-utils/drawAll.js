import {drawRedTriangleBottle} from "../bottles-barman-bottom/redTriangleBottle.js";
import {drawGreenCircleBottle} from "../bottles-barman-bottom/greenCircleBottle.js";
import {drawBlueCircleBottle} from "../bottles-barman-bottom/blueCircleBottle.js";
import {drawPinkCircleBottle} from "../bottles-barman-bottom/pinkCircleBottle.js";
import {drawOrangeLongBottle} from "../bottles-barman-bottom/orangeLongBottle.js";
import {drawYellowCircleBottle} from "../bottles-barman-bottom/yellowCircleBottle.js";

import {drawGreenGlass} from "../glasses-guest-bottom/greenGlass.js";
import {drawYellowGlass} from "../glasses-guest-bottom/yellowGlass.js";
import {drawRedGlass} from "../glasses-guest-bottom/redGlass.js";
import {drawBlueGlass} from "../glasses-guest-bottom/blueGlass.js";
import {drawPinkGlass} from "../glasses-guest-bottom/pinkGlass.js";
import {drawOrangeGlass} from "../glasses-guest-bottom/orangeGlass.js";

export function drawAll(barmanCanvas, guestCanvas) {
    const barman = [
        drawRedTriangleBottle,
        drawGreenCircleBottle,
        drawBlueCircleBottle,
        drawPinkCircleBottle,
        drawOrangeLongBottle,
        drawYellowCircleBottle,
    ];

    const guest = [
        drawGreenGlass,
        drawYellowGlass,
        drawRedGlass,
        drawBlueGlass,
        drawPinkGlass,
        drawOrangeGlass,
    ];

    barman.forEach(func => func(barmanCanvas));
    guest.forEach(func => func(guestCanvas));
}
