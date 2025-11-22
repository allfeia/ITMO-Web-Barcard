export function drawTriangle(ctx, x, y, width, height, inverted = false) {
    ctx.beginPath();
    if (inverted) {
        ctx.moveTo(x - width / 2, y);
        ctx.lineTo(x + width / 2, y);
        ctx.lineTo(x, y + height);
    } else {
        ctx.moveTo(x, y);
        ctx.lineTo(x - width / 2, y + height);
        ctx.lineTo(x + width / 2, y + height);
    }
    ctx.closePath();
}