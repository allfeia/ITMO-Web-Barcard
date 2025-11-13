import {canvaStyles} from "../bottoms-utils/canvaStyles.js";

export function drawYellowCircleBottle(canvas) {
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvaStyles(canvas);
    ctx.fillStyle = "#FED233";

    // круглая крышка
    ctx.beginPath();
    ctx.arc(280, 26, 10, 0, 2 * Math.PI, false);
    ctx.fill();

    // горлышко
    ctx.beginPath();
    ctx.ellipse(280, 39, 12, 4, 0, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.fillRect(274.5, 40, 12, 25);

    //овальная бутылка
    ctx.beginPath();
    ctx.ellipse(280, 80, 22, 20, 0, 0, 2 * Math.PI, false);
    ctx.fill();

}