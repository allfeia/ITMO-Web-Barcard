export default function drawUserIcon(canvas, { color = '#fff', filled = true} = {}) {
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
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

  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, Math.min(cssWidth, cssHeight) * 0.07);

  const s = Math.min(cssWidth, cssHeight);
  const offsetX = (cssWidth - s) / 2;
  const offsetY = (cssHeight - s) / 2;

  // Голова
  ctx.beginPath();
  ctx.arc(offsetX + s / 2, offsetY + s * 0.38, s * 0.22, 0, Math.PI * 2);
  ctx.stroke();

  if (filled) {
    ctx.fillStyle = color;
    ctx.fill();
  } 

  // Плечи
  const bodyWidth = s * 0.70;    
  const bodyHeight = s * 0.23;   
  const bodyX = offsetX + (s - bodyWidth) / 2;
  const bodyY = offsetY + s * 0.63; 
  const r = Math.min(s * 0.2, bodyWidth / 2, bodyHeight); 

  ctx.beginPath();
  ctx.moveTo(bodyX + r, bodyY);
  ctx.arcTo(bodyX, bodyY, bodyX, bodyY + r, r);
  ctx.lineTo(bodyX, bodyY + bodyHeight);
  ctx.lineTo(bodyX + bodyWidth, bodyY + bodyHeight);
  ctx.lineTo(bodyX + bodyWidth, bodyY + r);
  ctx.arcTo(bodyX + bodyWidth, bodyY, bodyX + bodyWidth - r, bodyY, r);
  ctx.lineTo(bodyX + r, bodyY);
  ctx.closePath();

  if (filled) {
    ctx.fillStyle = color;
    ctx.fill();
  } 
}