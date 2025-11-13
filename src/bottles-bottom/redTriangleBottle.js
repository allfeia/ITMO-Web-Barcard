import {canvaStyles} from "../bottoms-utils/canvaStyles.js";
import {drawTriangle} from "../bottoms-utils/drawTriangle.js";

export function drawRedTriangleBottle(canvas) {
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvaStyles(canvas);
    ctx.lineWidth = 5;
    ctx.fillStyle = "#E35C5C";

    // круглая крышка
    ctx.beginPath();
    ctx.arc(30, 19, 10, 0, 2 * Math.PI, false);
    ctx.fill();

    // горлышко
    ctx.beginPath();
    ctx.fillRect(22.5, 28, 15, 15);

    //треугольная бутылка (верх)
    drawTriangle(ctx, 30, 35, 40, 30)

    //треугольная бутылка (низ)
    drawTriangle(ctx, 30, 95, 40, 30, true)



}