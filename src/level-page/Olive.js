import { styles } from "./Styles.js";

function drawSingleOlive(ctx) {
    ctx.fillStyle = "#46551E";
    ctx.beginPath();
    ctx.ellipse(205.5, 130.5, 80, 60, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#E35C5C";
    ctx.beginPath();
    ctx.ellipse(160.5, 160.5, 15, 10, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#483030";

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

export default function drawOlive(canvas, count = 1) {
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    const oliveSize = 70;
    const gap = 38;
    const scale = 0.25;
    const quality = 2;

    const cssWidth = oliveSize + (count - 1) * gap;
    const cssHeight = oliveSize;

    canvas.width = cssWidth * dpr * quality;
    canvas.height = cssHeight * dpr * quality;

    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    ctx.setTransform(dpr * quality, 0, 0, dpr * quality, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    styles(canvas);
    const groupWidth = oliveSize + (count - 1) * gap;
    const startX = (cssWidth - groupWidth) / 2;

    for (let i = 0; i < count; i++) {
        ctx.save();

        ctx.scale(scale, scale);

        ctx.translate(
            (-110 + (startX + i * gap) / scale),
            -15
        );

        drawSingleOlive(ctx);
        ctx.restore();
    }
}
