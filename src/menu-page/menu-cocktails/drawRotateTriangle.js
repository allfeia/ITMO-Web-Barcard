export function drawRotateTriangle(ctx, topX, topY, baseWidth, height, angleDeg, color = "#CFE052") {

    ctx.save();

    const angleRad = angleDeg * Math.PI / 180;

    ctx.translate(topX, topY);
    ctx.rotate(angleRad);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-baseWidth / 2, height);
    ctx.lineTo(baseWidth / 2, height);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();

    ctx.restore();
}