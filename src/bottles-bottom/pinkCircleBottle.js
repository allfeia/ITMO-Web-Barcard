import {canvaStyles} from "../bottoms-utils/canvaStyles.js";

export function drawPinkCircleBottle(canvas) {
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvaStyles(canvas);
    ctx.fillStyle = "#FFC5EB";

    // круглая крышка
    ctx.beginPath();
    ctx.arc(180, 24, 10, 0, 2 * Math.PI, false);
    ctx.fill();

    // горлышко
    ctx.beginPath();
    ctx.ellipse(180, 37, 12, 4, 0, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.fillRect(174.5, 40, 12, 25);

    //овальная бутылка
    ctx.beginPath();
    ctx.ellipse(180, 84, 22, 20, 0, 0, 2 * Math.PI, false);
    ctx.fill();

}