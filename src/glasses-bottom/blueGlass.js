import {canvaStyles} from "../bottoms-utils/canvaStyles.js";
import {drawTriangle} from "../bottoms-utils/drawTriangle.js";


export function drawBlueGlass(canvas) {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvaStyles(canvas);
    ctx.fillStyle = "#9DA3EF";

    //бокал
    ctx.beginPath();
    drawTriangle(ctx, 181, 55, 50, 50, true);
    ctx.fill();


    //ножка
    ctx.beginPath();
    ctx.fillRect(178.5, 49, 5, 35);

}