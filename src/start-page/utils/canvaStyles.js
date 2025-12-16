export function canvaStyles(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = 75;
  canvas.height = 75;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
