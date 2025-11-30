export function canvaStyles(canvas) {
  const ctx = canvas.getContext("2d");
  //тени
  ctx.shadowOffsetX = 10;
  ctx.shadowOffsetY = 10;
  ctx.shadowBlur = 10;
  ctx.shadowColor = "#999";

  //прозрачность
  ctx.globalAlpha = 0.5;
}
