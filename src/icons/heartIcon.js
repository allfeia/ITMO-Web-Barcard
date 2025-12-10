export default function drawHeartIcon(canvas, { color = '#fff', filled = true } = {}) {
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;

  const rect = canvas.getBoundingClientRect();
  const cssWidth = rect.width || 18;
  const cssHeight = rect.height || 18;

  canvas.width = Math.max(1, Math.round(cssWidth * dpr));
  canvas.height = Math.max(1, Math.round(cssHeight * dpr));

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const s = Math.min(cssWidth, cssHeight);
  const offsetX = (cssWidth - s) / 2;
  const offsetY = (cssHeight - s) / 2;

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1, s * 0.09);

    const padding = 2;
    const sAdjusted = s - padding * 2;
    const wAdjusted = sAdjusted;
    const hAdjusted = sAdjusted;
    const offsetXAdjusted = offsetX + padding;
    const offsetYAdjusted = offsetY + padding;

    const cxL = offsetXAdjusted + 0.25 * wAdjusted;
    const cxR = offsetXAdjusted + 0.75 * wAdjusted;
    const cy = offsetYAdjusted + 0.28 * hAdjusted;
    const r = 0.25 * wAdjusted;
    const tipX = offsetXAdjusted + 0.5 * wAdjusted;
    const tipY = offsetYAdjusted + 0.98 * hAdjusted;

  ctx.beginPath();
  ctx.arc(cxL, cy, r, Math.PI - 0.6, -0.15, false);
  ctx.arc(cxR, cy, r, Math.PI + 0.15, 0.6, false);
  ctx.lineTo(tipX, tipY);
  ctx.closePath();

  if (filled) {
    ctx.fill();
  } else {
      ctx.stroke();
  }
}