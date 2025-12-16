import { scaler } from "../scaler.js";

export function drawHotToddy(canvas) {
  if (!canvas) return;

  const ctx = scaler(canvas, 175, 220);

  //чашка
  ctx.beginPath();
  ctx.roundRect(55, 70, 80, 106, 4);
  ctx.fillStyle = "#DFDFDF";
  ctx.fill();

  //ручка
  ctx.beginPath();
  ctx.moveTo(60, 80);
  ctx.bezierCurveTo(0, 80, 0, 160, 60, 160);
  ctx.bezierCurveTo(10, 150, 10, 90, 60, 80);
  ctx.closePath();
  ctx.fill();

  //пунш
  ctx.beginPath();
  ctx.rect(56, 100, 78, 70, 116);
  const gradient = ctx.createLinearGradient(50, 50, 50, 150);
  gradient.addColorStop(0, "#8C420A");
  gradient.addColorStop(1, "#EC641F");
  ctx.fillStyle = gradient;
  ctx.fill();

  //корица
  ctx.beginPath();
  ctx.lineTo(125, 60);
  ctx.lineTo(135, 63);
  ctx.lineTo(115, 170);
  ctx.lineTo(105, 167);
  ctx.closePath();
  ctx.fillStyle = "#7F2604";
  ctx.fill();

  ctx.beginPath();
  ctx.lineTo(120, 60);
  ctx.lineTo(110, 60);
  ctx.lineTo(120, 170);
  ctx.lineTo(130, 170);
  ctx.closePath();
  ctx.fill();

  //лимон
  ctx.save();
  ctx.beginPath();
  ctx.translate(50, -10);
  ctx.rotate((30 * Math.PI) / 180);
  ctx.arc(85, 70, 25, 0, Math.PI, false);
  ctx.strokeStyle = "#FFEC63";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.translate(50, -10);
  ctx.rotate((30 * Math.PI) / 180);
  ctx.arc(85, 70, 24, 0, Math.PI, false);
  ctx.closePath();
  ctx.fillStyle = "#FCF19D";
  ctx.fill();
  ctx.restore();
}
