import { canvaStyles } from "../start-page/utils/canvaStyles.js";

export function drawPinkGlass(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvaStyles(canvas);
  ctx.fillStyle = "#FFC5EB";

  const cx = 50;

  // Чаша
  ctx.beginPath();
  ctx.ellipse(cx, 25, 18, 30, 0, (7 * Math.PI) / 6, (11 * Math.PI) / 6, true);
  ctx.fill();

  // Ножка
  ctx.fillRect(cx - 2.5, 54, 5, 30);
}
