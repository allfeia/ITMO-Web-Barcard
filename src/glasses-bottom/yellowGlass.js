import {canvaStyles} from "../bottoms-utils/canvaStyles.js";

export function drawYellowGlass(canvas) {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvaStyles(canvas);
    ctx.fillStyle = "#FED233";

    //бокал
    ctx.beginPath();
    ctx.ellipse(55, 25, 7, 25, 0, 3 * Math.PI / 2, Math.PI / 2, false);
    ctx.ellipse(95, 25, 7, 25, 0, Math.PI / 2, 3 * Math.PI / 2, false);
    ctx.fill();


    //ножка
    ctx.beginPath();
    ctx.fillRect(72, 49, 5, 35);

}