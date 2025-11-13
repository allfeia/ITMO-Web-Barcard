import {canvaStyles} from "../bottoms-utils/canvaStyles.js";

export function drawGreenGlass(canvas) {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvaStyles(canvas);
    ctx.fillStyle = "#46551E";

    //бокал
    ctx.beginPath();
    ctx.ellipse(25, 24, 25, 25, 0, Math.PI * 1.2, Math.PI * 1.8, true);
    ctx.fill();

    //ножка
    ctx.beginPath();
    ctx.fillRect(22, 49, 5, 35);

}