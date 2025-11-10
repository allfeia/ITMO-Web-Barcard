import {canvaStyles} from "../bottoms-utils/canvaStyles.js";

export function drawOrangeLongBottle(canvas) {
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvaStyles(canvas);
    ctx.fillStyle = "#FF8D11";

    // круглая крышка
    ctx.beginPath();
    ctx.arc(230, 19, 10, 0, 2 * Math.PI, false);
    ctx.fill();

    // горлышко
    ctx.beginPath();
    ctx.fillRect(224.5, 28, 12, 15);

    //овальная бутылка
    ctx.beginPath();
    ctx.ellipse(230.5, 85, 19, 45, 0, 0, 2 * Math.PI, false);
    ctx.fill();

}