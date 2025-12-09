import {drawRotatedRect} from "../drawRotateRect.js";
import {drawRotateTriangle} from "../drawRotateTriangle.js";
import {scaler} from "../scaler.js";

export function drawMojito(canvas) {
    if (!canvas) return;

    const ctx = scaler(canvas);

    //бокал
    ctx.beginPath();
    ctx.roundRect(56, 60, 66, 150, 4);
    ctx.fillStyle = "#DFDFDF";
    ctx.fill();

    //мохито
    ctx.beginPath();
    ctx.rect(56, 70, 64, 120);
    ctx.fillStyle = "#D5D7DB";
    ctx.fill();

    //лед
    ctx.beginPath();
    ctx.rect(70, 160, 30, 30);
    ctx.fillStyle = "#E5E5E3";
    ctx.fill();

    drawRotatedRect(ctx, 75, 129, 30, 30, 240);
    drawRotatedRect(ctx, 65, 98, 30, 30, 30);
    drawRotatedRect(ctx, 80, 67, 30, 30, 5);

    //лайм
    ctx.beginPath();
    ctx.arc(65, 70, 25, 0, Math.PI, true);
    ctx.strokeStyle = "#A0AE71";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(65, 70, 23,  0, Math.PI, true);
    ctx.closePath();
    ctx.fillStyle = "#DEF09A";
    ctx.fill();

    drawRotateTriangle(ctx, 63.5, 69, 16, 20, -250);
    drawRotateTriangle(ctx, 64.5, 69, 18, 20, -205);
    drawRotateTriangle(ctx, 65.5, 69, 18, 20, 205);
    drawRotateTriangle(ctx, 66.5, 69, 16, 20, 250);

}