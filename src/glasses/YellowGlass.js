import { canvaStyles } from "../start-page/utils/canvaStyles.js";

export function drawYellowGlass(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvaStyles(canvas);
  ctx.fillStyle = "#FED233";

  const cx = 50;

  // Чаша: две половинки эллипса
  ctx.beginPath();
  ctx.ellipse(cx - 20, 28, 8, 23, 0, (3 * Math.PI) / 2, Math.PI / 2, false); // левая
  ctx.ellipse(cx + 20, 28, 8, 23, 0, Math.PI / 2, (3 * Math.PI) / 2, false); // правая
  ctx.closePath();
  ctx.fill();

  // Ножка
  ctx.fillRect(cx - 2.5, 51, 5, 33);
}
