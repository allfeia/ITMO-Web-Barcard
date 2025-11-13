import {canvaStyles} from "../bottoms-utils/canvaStyles.js";
import {drawTriangle} from "../bottoms-utils/drawTriangle.js";


export function drawOrangeGlass(canvas) {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvaStyles(canvas);
    ctx.fillStyle = "#FF8D11";

    //бокал
    ctx.beginPath();
    drawTriangle(ctx, 277, 55, 25, 50, true);
    ctx.fill();


    //ножка
    ctx.beginPath();
    ctx.fillRect(274.6, 47, 5, 35);

}