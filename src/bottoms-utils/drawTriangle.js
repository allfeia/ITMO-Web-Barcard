export function drawTriangle(ctx, topX, topY, baseWidth, height, invert = false) {
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    if (!invert) {
        ctx.lineTo(topX - baseWidth / 2, topY + height);
        ctx.lineTo(topX + baseWidth / 2, topY + height);
    } else {
        ctx.lineTo(topX - baseWidth / 2, topY - height);
        ctx.lineTo(topX + baseWidth / 2, topY - height);
    }
    ctx.closePath();
    ctx.fill();
}