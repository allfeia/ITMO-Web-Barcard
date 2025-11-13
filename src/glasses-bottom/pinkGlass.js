import {canvaStyles} from "../bottoms-utils/canvaStyles.js";

export function drawPinkGlass(canvas) {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvaStyles(canvas);
    ctx.fillStyle = "#FFC5EB";

    //бокал
    ctx.beginPath();
    ctx.ellipse(250, 25.5, 2, 10, 0, -Math.PI / 2, -Math.PI, true);
    ctx.ellipse(220, 25.5, 2, 10, 0, 0, -Math.PI / 2, true);

    ctx.lineTo(251, 15.5);
    ctx.lineTo(220, 15.5);

    ctx.closePath();
    ctx.fill();

    //основание
    ctx.beginPath();
    ctx.ellipse(235, 35, 15, 19, 0, 7 * Math.PI / 6, 11 * Math.PI / 6, true);
    ctx.fill();


    //ножка
    ctx.beginPath();
    ctx.fillRect(232, 53, 5, 33);

}