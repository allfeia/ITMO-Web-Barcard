import {canvaStyles} from "../bottoms-utils/canvaStyles.js";

export function drawBlueCircleBottle(canvas) {
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvaStyles(canvas);
    ctx.fillStyle = "#9DA3EF";

    // круглая крышка
    ctx.beginPath();
    ctx.arc(130, 19, 10, 0, 2 * Math.PI, false);
    ctx.fill();

    // горлышко
    ctx.beginPath();
    ctx.ellipse(130, 32, 15, 4, 0, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.fillRect(121.5, 33, 18, 20);

    //овальная бутылка
    ctx.beginPath();
    ctx.ellipse(130, 70, 22, 20, 0, 0, 2 * Math.PI, false);
    ctx.fill();

}