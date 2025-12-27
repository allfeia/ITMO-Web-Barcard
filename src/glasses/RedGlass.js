import { canvaStyles } from "../start-page/utils/canvaStyles.js";

export function drawRedGlass(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvaStyles(canvas);
  ctx.fillStyle = "#E35C5C";

  const cx = 50;

  // Чаша
  ctx.beginPath();
  ctx.roundRect(cx - 18, 8, 36, 42, 3);
  ctx.fill();

  // Ножка
  ctx.fillRect(cx - 2.5, 50, 5, 34);
}
