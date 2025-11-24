
import {drawRotatedRect} from "../drawRotateReact.js";
import {scaler} from "../scaler.js";

export function drawSmashBasil(canvas) {
    if (!canvas) return;

    const ctx = scaler(canvas);

    //бокал
    ctx.beginPath();
    ctx.roundRect(45, 75, 86, 105, 4);
    ctx.fillStyle = "#DFDFDF";
    ctx.fill();

    //листики
    ctx.beginPath();
    ctx.ellipse(70, 80, 15, 25, -60 * Math.PI / 180, 0, 2 * Math.PI, false);
    ctx.fillStyle = "#1D7926";
    ctx.fill();

    ctx.beginPath();
    ctx.globalAlpha = 1;
    ctx.ellipse(80, 80, 15, 35, -25 * Math.PI / 180, 0, 2 * Math.PI, false);
    ctx.fillStyle = "#3D9755";
    ctx.fill();

    //разбитый базилик
    ctx.beginPath();
    const gradient = ctx.createLinearGradient(50, 30, 50, 150);
    gradient.addColorStop(0, "#C4C730");
    gradient.addColorStop(1, "#EAE9A8");
    ctx.rect(45, 90, 84, 70);
    ctx.fillStyle = gradient;
    ctx.fill();

    //лед
    ctx.beginPath();
    ctx.globalAlpha = 0.5;
    drawRotatedRect(ctx, 90, 120, 35, 35, 20, "#F2F0C5");
    drawRotatedRect(ctx, 75, 83, 35, 35, -5, "#F2F0C5");


}