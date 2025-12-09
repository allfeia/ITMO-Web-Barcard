export function scaler(canvas) {
    const scale = window.devicePixelRatio || 1;

    const logicalWidth = canvas.clientWidth;
    const logicalHeight = canvas.clientHeight;

    canvas.width = logicalWidth * scale;
    canvas.height = logicalHeight * scale;

    canvas.style.width = logicalWidth + "px";
    canvas.style.height = logicalHeight + "px";

    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);

    return ctx;
}