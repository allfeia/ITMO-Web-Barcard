import {scaler} from "../scaler.js";
import {drawRotatedRect} from "../drawRotateRect.js";

export function drawNegroni(canvas) {
    if (!canvas) return;

    const ctx = scaler(canvas);

    //бокал
    ctx.beginPath();
    ctx.roundRect(45, 85, 86, 85, 4);
    ctx.fillStyle = "#DFDFDF";
    ctx.fill();

    // негрони
    ctx.beginPath();
    const gradient = ctx.createLinearGradient(50, 30, 50, 150);
    gradient.addColorStop(0, "#FAD3D0");
    gradient.addColorStop(1, "#781610");
    ctx.rect(46, 95, 84, 55);
    ctx.fillStyle = gradient;
    ctx.fill();

    //лед
    ctx.beginPath();
    ctx.globalAlpha = 0.5;
    drawRotatedRect(ctx, 90, 113, 35, 35, 265, "#781610");
    drawRotatedRect(ctx, 55, 93, 35, 35, 30, "#781610");

    //украшение
    ctx.fillStyle = "#F49E15";
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.lineTo(100, 60);
    ctx.lineTo(120, 60);
    ctx.lineTo(110, 95);
    ctx.lineTo(95, 95);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.lineTo(95, 95);
    ctx.lineTo(75, 76);
    ctx.lineTo(90, 76);
    ctx.lineTo(105, 95);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.arc(101.5, 87, 10.5, 0, Math.PI, false);
    ctx.fill();



}