import { canvaStyles } from "../start-page/utils/canvaStyles.js";

export function drawBlueGlass(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvaStyles(canvas);
  ctx.fillStyle = "#9DA3EF";

  const cx = 50;
  const topY = 8;
  const bottomY = 48;
  const topWidth = 44;
  const bottomWidth = 6;

  ctx.beginPath();
  ctx.moveTo(cx - topWidth / 2, topY);
  ctx.lineTo(cx + topWidth / 2, topY);
  ctx.lineTo(cx + bottomWidth / 2, bottomY);
  ctx.lineTo(cx - bottomWidth / 2, bottomY);
  ctx.closePath();
  ctx.fill();

  //ножка
  ctx.fillRect(cx - 2.5, bottomY, 5, 36); // 48 → 84
}
