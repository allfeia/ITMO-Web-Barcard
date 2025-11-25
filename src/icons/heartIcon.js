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
  const w = s;
  const h = s;

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  const strokeW = Math.max(1, s * 0.09); 
  ctx.lineWidth = strokeW;

  const cxL = offsetX + 0.25 * w;
  const cxR = offsetX + 0.75 * w;
  const cy = offsetY + 0.28 * h;      
  const r = 0.25 * w;
  const tipX = offsetX + 0.5 * w;
  const tipY = offsetY + 0.98 * h;

  ctx.beginPath();
  ctx.arc(cxL, cy, r, Math.PI - 0.6, -0.15, false);
  ctx.arc(cxR, cy, r, Math.PI + 0.15, 0.6, false);
  ctx.lineTo(tipX, tipY);
  ctx.closePath();

  if (filled) {
    ctx.fill();
  }
}