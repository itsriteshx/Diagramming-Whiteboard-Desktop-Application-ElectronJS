import { drawShape } from './renderer';

export function getShapesBoundingBox(shapes, padding = 24) {
  if (!shapes || shapes.length === 0) {
    return { minX: 0, minY: 0, maxX: 400, maxY: 300, width: 400, height: 300 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  shapes.forEach((s) => {
    if (s.type === 'pen' && s.points && s.points.length > 0) {
      s.points.forEach((p) => {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      });
      return;
    }

    const x = s.x || 0;
    const y = s.y || 0;
    const w = s.width || 0;
    const h = s.height || 0;

    const left = Math.min(x, x + w);
    const top = Math.min(y, y + h);
    const right = Math.max(x, x + w);
    const bottom = Math.max(y, y + h);

    minX = Math.min(minX, left);
    minY = Math.min(minY, top);
    maxX = Math.max(maxX, right);
    maxY = Math.max(maxY, bottom);
  });

  if (!isFinite(minX) || !isFinite(minY)) {
    minX = 0;
    minY = 0;
    maxX = 400;
    maxY = 300;
  }

  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  const width = Math.max(Math.round(maxX - minX), 120);
  const height = Math.max(Math.round(maxY - minY), 120);

  return { minX, minY, maxX, maxY, width, height };
}

export function renderShapesToCanvas(shapes, options = {}) {
  const {
    scale = 1,
    padding = 24,
    transparent = false,
    canvasBg = { color: '#ffffff' },
  } = options;

  const box = getShapesBoundingBox(shapes, padding);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(box.width * scale);
  canvas.height = Math.round(box.height * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Background Fill
  if (!transparent) {
    ctx.fillStyle = canvasBg?.color || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Scale and translate to crop exactly to diagram bounding box
  ctx.save();
  ctx.scale(scale, scale);
  ctx.translate(-box.minX, -box.minY);

  shapes.forEach((s) => {
    drawShape(ctx, s);
  });

  ctx.restore();

  const dataUrl = canvas.toDataURL('image/png');
  return {
    canvas,
    width: canvas.width,
    height: canvas.height,
    dataUrl,
    box,
  };
}
