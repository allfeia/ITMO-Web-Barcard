import {canvaStyles} from "../bottoms-utils/canvaStyles.js";

export default function drawOlive(canvas) {
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const devicePixelRatio = window.devicePixelRatio || 1;

    const canvasRect = canvas.getBoundingClientRect();
    const cssWidth = canvasRect.width;
    const cssHeight = canvasRect.height;

    canvas.width = cssWidth * devicePixelRatio;
    canvas.height = cssHeight * devicePixelRatio;

    ctx.scale(devicePixelRatio, devicePixelRatio);

    ctx.fillStyle = "#46551E";
    canvaStyles(canvas);

    ctx.beginPath();
    ctx.ellipse(205.5, 130.5, 80, 60, 2.5, 0, 2 * Math.PI, false);
    ctx.fill();

    ctx.fillStyle = "#E35C5C";

    ctx.beginPath();
    ctx.ellipse(160.5, 160.5, 15, 10, 4, 0, 2 * Math.PI, false);
    ctx.fill();

    ctx.fillStyle = "#483030";

    //зубочистка
    ctx.beginPath();
    ctx.moveTo(310, 20);
    ctx.lineTo(320, 30);
    ctx.lineTo(267, 83);
    ctx.lineTo(263, 76);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(160, 190);
    ctx.lineTo(100, 245);
    ctx.lineTo(153, 187);
    ctx.closePath();
    ctx.fill();

}