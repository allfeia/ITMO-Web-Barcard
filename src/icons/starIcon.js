export default function drawStarIcon(
  canvas,
  {
    color = "#fff",
    filled = true,
    cornerRadiusOuter = 0.35,
    cornerRadiusInner = 0.05,
  } = {},
) {
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const devicePixelRatio = window.devicePixelRatio || 1;

  const rect = canvas.getBoundingClientRect();
  const cssWidth = rect.width || 18;
  const cssHeight = rect.height || 18;

  canvas.width = cssWidth * devicePixelRatio;
  canvas.height = cssHeight * devicePixelRatio;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(devicePixelRatio, devicePixelRatio);

  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const s = Math.min(cssWidth, cssHeight);
  const offsetX = (cssWidth - s) / 2;
  const offsetY = (cssHeight - s) / 2;

  const cx = offsetX + s / 2;
  const cy = offsetY + s / 2;
  const rOuter = s * 0.62;
  const rInner = s * 0.25;

  const points = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const r = i % 2 === 0 ? rOuter : rInner;
    points.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      r,
      angle,
      isOuter: i % 2 === 0,
    });
  }

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const maxCornerFactorOuter = 0.45;
  const maxCornerFactorInner = 0.45;

  const crOuter = clamp(cornerRadiusOuter, 0, maxCornerFactorOuter) * rOuter;
  const crInner = clamp(cornerRadiusInner, 0, maxCornerFactorInner) * rOuter;

  function cutSegment(p, q, t) {
    const vx = q.x - p.x;
    const vy = q.y - p.y;
    const len = Math.hypot(vx, vy);
    const ux = vx / len;
    const uy = vy / len;
    const tClamped = Math.min(len / 2 - 0.001, Math.max(0, t));
    return {
      from: { x: p.x + ux * tClamped, y: p.y + uy * tClamped },
      to: { x: q.x - ux * tClamped, y: q.y - uy * tClamped },
      len,
    };
  }

  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const prev = points[(i + points.length - 1) % points.length];
    const curr = points[i];
    const next = points[(i + 1) % points.length];

    const useR = curr.isOuter ? crOuter : crInner;

    const segA = cutSegment(prev, curr, useR);
    const segB = cutSegment(curr, next, useR);

    if (i === 0) {
      ctx.moveTo(segA.to.x, segA.to.y);
    } else {
      ctx.lineTo(segA.to.x, segA.to.y);
    }

    ctx.quadraticCurveTo(curr.x, curr.y, segB.from.x, segB.from.y);
  }
  ctx.closePath();

  if (filled) {
    ctx.fillStyle = color;
    ctx.fill();
  }
}
