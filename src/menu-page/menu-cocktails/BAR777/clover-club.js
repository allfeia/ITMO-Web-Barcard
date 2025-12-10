import { scaler } from "../scaler.js";
import { drawTriangle } from "../../../bottoms-utils/drawTriangle.js";

export function drawCloverClub(canvas) {
  if (!canvas) return;

  const ctx = scaler(canvas);

  //малина
  ctx.beginPath();
  ctx.ellipse(120, 76, 8, 8, 0, 0, 2 * Math.PI, false);
  ctx.ellipse(106, 78, 8, 8, 0, 0, 2 * Math.PI, false);
  ctx.ellipse(92, 80, 8, 8, 0, 0, 2 * Math.PI, false);
  ctx.fillStyle = "#F23653";
  ctx.fill();

  //зубочистка
  ctx.beginPath();
  ctx.lineTo(141.5, 69);
  ctx.lineTo(142, 73);
  ctx.lineTo(128, 75);
  ctx.lineTo(127.5, 72);
  ctx.closePath();
  ctx.fillStyle = "#E4B00C";
  ctx.fill();

  //ножка
  ctx.beginPath();
  ctx.rect(85, 115, 10, 70);
  ctx.fillStyle = "#D5D7DB";
  ctx.fill();

  drawTriangle(ctx, 90, 180, 85, 10, false);

  //бокал
  ctx.beginPath();
  ctx.ellipse(90, 80, 50, 40, 0, 0, Math.PI, false);
  ctx.fill();

  //коктейль
  ctx.beginPath();
  ctx.ellipse(90, 85, 49, 35, 0, 0, Math.PI, false);
  ctx.fillStyle = "#EB889B";
  ctx.fill();
}
