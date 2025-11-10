import {canvaStyles} from "../bottoms-utils/canvaStyles.js";

export function drawGreenCircleBottle(canvas) {
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvaStyles(canvas);
    ctx.fillStyle = "#46551E";

    // круглая крышка
    ctx.beginPath();
    ctx.arc(80, 24, 10, 0, 2 * Math.PI, false);
    ctx.fill();

    // горлышко
    ctx.beginPath();
    ctx.fillRect(71.5, 33, 18, 10);

    //овальная бутылка
    ctx.beginPath();
    ctx.ellipse(80, 60, 18, 20, 0, 0, 2 * Math.PI, false);
    ctx.ellipse(80, 89, 18, 20, 0, 0, 2 * Math.PI, false);
    ctx.fill();

}