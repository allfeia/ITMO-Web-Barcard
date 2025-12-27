export function styles(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;
  ctx.shadowBlur = 5;
  ctx.shadowColor = "#999";

  ctx.globalAlpha = 0.5;
}
