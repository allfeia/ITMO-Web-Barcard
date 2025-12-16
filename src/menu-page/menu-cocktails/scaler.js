export function scaler(canvas, baseWidth = 175, baseHeight = 220) {
  const scale = window.devicePixelRatio || 1;

  const logicalWidth = canvas.clientWidth;
    const logicalWidthCSS = baseWidth + "px";
  const logicalHeight = canvas.clientHeight;
    const logicalHeightCSS = baseHeight + "px";

  canvas.width = logicalWidth * scale;
  canvas.height = logicalHeight * scale;

  canvas.style.width = logicalWidthCSS;
  canvas.style.height = logicalHeightCSS;

  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);

  return ctx;
}
