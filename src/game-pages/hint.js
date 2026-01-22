import { drawTriangle } from "../bottoms-utils/drawTriangle.js";

export default function drawHint(canvas) {
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#333";

  ctx.beginPath();
  drawTriangle(ctx, 150, 25, 250, 100, false);
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(140 - 50, 20 + 70);
  ctx.quadraticCurveTo(190 - 40, 60, 240 - 30, 20 + 70);
  ctx.strokeStyle = "#EFEEEC";
  ctx.stroke();

  ctx.moveTo(140 - 50, 20 + 70);
  ctx.quadraticCurveTo(190 - 40, 120, 240 - 30, 20 + 70);
  ctx.stroke();
  ctx.closePath();
  ctx.fillStyle = "#EFEEEC";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(140 - 30, 20 + 70);
  ctx.quadraticCurveTo(190 - 40, 70, 240 - 50, 20 + 70);
  ctx.strokeStyle = "#333";
  ctx.stroke();

  ctx.moveTo(140 - 30, 20 + 70);
  ctx.quadraticCurveTo(190 - 40, 110, 240 - 50, 20 + 70);
  ctx.stroke();
  ctx.closePath();
  ctx.fillStyle = "#333";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(150, 90, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#EFEEEC";
  ctx.fill();
  ctx.closePath();
}
