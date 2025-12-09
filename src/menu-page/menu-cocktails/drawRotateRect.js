export function drawRotatedRect(ctx, x, y, width, height, angleDeg, color = "#E5E5E3") {
    ctx.save();

    const angleRad = angleDeg * Math.PI / 180;

    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate(angleRad);

    ctx.fillStyle = color;
    ctx.fillRect(-width / 2, -height / 2, width, height);

    ctx.restore();
}