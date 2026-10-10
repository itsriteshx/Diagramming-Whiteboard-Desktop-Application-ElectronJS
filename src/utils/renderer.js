// src/utils/renderer.js

/**
 * 🌟 High-DPI Canvas Rendering Engine (Excalidraw Aesthetics)
 * Day 2: Shape Geometry & Models — Triangle, Hexagon, Parallelogram, Star + Solid Arrowheads
 */

// ─────────────────────────────────────────────────────────────────────────────
// GRID
// ─────────────────────────────────────────────────────────────────────────────
export function drawGrid(ctx, width, height, pan, zoom, dotColor = '#e4e4e7') {
  const dotRadius = 1.2;
  const baseSpacing = 24;
  const gridSize = baseSpacing * zoom;

  if (gridSize < 10) return;

  ctx.save();
  ctx.fillStyle = dotColor;

  const startX = ((pan.x % gridSize) + gridSize) % gridSize;
  const startY = ((pan.y % gridSize) + gridSize) % gridSize;

  for (let x = startX; x < width; x += gridSize) {
    for (let y = startY; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// ARCHITECTURE: DATABASE CYLINDER
// ─────────────────────────────────────────────────────────────────────────────
export function drawDatabase(ctx, shape) {
  const { x, y, width, height } = shape;
  const rx = Math.abs(width) / 2;
  const ry = Math.min(20, Math.abs(height) / 4);
  const cx = x + rx;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y + ry);
  ctx.lineTo(x, y + height - ry);
  ctx.ellipse(cx, y + height - ry, rx, ry, 0, Math.PI, 0, true);
  ctx.lineTo(x + width, y + ry);
  ctx.ellipse(cx, y + ry, rx, ry, 0, 0, Math.PI, true);
  ctx.closePath();

  if (shape.fillColor && shape.fillColor !== 'transparent') ctx.fill();
  ctx.stroke();

  // Top lid
  ctx.beginPath();
  ctx.ellipse(cx, y + ry, rx, ry, 0, 0, Math.PI * 2);
  if (shape.fillColor && shape.fillColor !== 'transparent') ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// ARCHITECTURE: CLOUD
// ─────────────────────────────────────────────────────────────────────────────
export function drawCloud(ctx, shape) {
  const { x, y, width, height } = shape;
  const w = width;
  const h = height;

  ctx.beginPath();
  ctx.moveTo(x + w * 0.25, y + h * 0.7);
  ctx.bezierCurveTo(x, y + h * 0.7, x, y + h * 0.4, x + w * 0.2, y + h * 0.35);
  ctx.bezierCurveTo(x + w * 0.15, y + h * 0.1, x + w * 0.45, y, x + w * 0.55, y + h * 0.2);
  ctx.bezierCurveTo(x + w * 0.7, y + h * 0.05, x + w * 0.9, y + h * 0.2, x + w * 0.85, y + h * 0.4);
  ctx.bezierCurveTo(x + w * 1.05, y + h * 0.45, x + w * 1.02, y + h * 0.75, x + w * 0.8, y + h * 0.75);
  ctx.closePath();

  if (shape.fillColor && shape.fillColor !== 'transparent') ctx.fill();
  ctx.stroke();
}

// ─────────────────────────────────────────────────────────────────────────────
// DAY 2: TRIANGLE
// ─────────────────────────────────────────────────────────────────────────────
export function drawTriangle(ctx, shape) {
  const { x, y, width, height } = shape;
  ctx.beginPath();
  ctx.moveTo(x + width / 2, y);           // Top center
  ctx.lineTo(x + width, y + height);      // Bottom right
  ctx.lineTo(x, y + height);              // Bottom left
  ctx.closePath();
  if (shape.fillColor && shape.fillColor !== 'transparent') ctx.fill();
  ctx.stroke();
}

// ─────────────────────────────────────────────────────────────────────────────
// DAY 2: HEXAGON
// ─────────────────────────────────────────────────────────────────────────────
export function drawHexagon(ctx, shape) {
  const { x, y, width, height } = shape;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const rx = Math.abs(width) / 2;
  const ry = Math.abs(height) / 2;

  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6; // flat-top hexagon
    const px = cx + rx * Math.cos(angle);
    const py = cy + ry * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  if (shape.fillColor && shape.fillColor !== 'transparent') ctx.fill();
  ctx.stroke();
}

// ─────────────────────────────────────────────────────────────────────────────
// DAY 2: PARALLELOGRAM
// ─────────────────────────────────────────────────────────────────────────────
export function drawParallelogram(ctx, shape) {
  const { x, y, width, height } = shape;
  const skew = Math.abs(width) * 0.2; // 20% horizontal skew offset

  ctx.beginPath();
  ctx.moveTo(x + skew, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width - skew, y + height);
  ctx.lineTo(x, y + height);
  ctx.closePath();
  if (shape.fillColor && shape.fillColor !== 'transparent') ctx.fill();
  ctx.stroke();
}

// ─────────────────────────────────────────────────────────────────────────────
// DAY 2: STAR (5-pointed)
// ─────────────────────────────────────────────────────────────────────────────
export function drawStar(ctx, shape) {
  const { x, y, width, height } = shape;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const outerR = Math.min(Math.abs(width), Math.abs(height)) / 2;
  const innerR = outerR * 0.4;
  const points = 5;

  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const px = cx + r * Math.cos(angle);
    const py = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  if (shape.fillColor && shape.fillColor !== 'transparent') ctx.fill();
  ctx.stroke();
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Draw Solid Filled Arrowhead (Excalidraw style)
// ─────────────────────────────────────────────────────────────────────────────
function drawSolidArrowhead(ctx, fromX, fromY, toX, toY, size = 13) {
  const angle = Math.atan2(toY - fromY, toX - fromX);
  const spread = Math.PI / 5.5; // 32.7° — tight, elegant arrowhead

  ctx.save();
  ctx.fillStyle = ctx.strokeStyle;
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - size * Math.cos(angle - spread),
    toY - size * Math.sin(angle - spread)
  );
  ctx.lineTo(
    toX - size * Math.cos(angle + spread),
    toY - size * Math.sin(angle + spread)
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SHAPE DISPATCHER
// ─────────────────────────────────────────────────────────────────────────────
export function drawShape(ctx, shape) {
  ctx.save();
  ctx.strokeStyle = shape.strokeColor || '#1e1e1e';
  ctx.fillStyle = shape.fillColor || 'transparent';
  ctx.lineWidth = shape.strokeWidth || 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const opacityVal = (shape.opacity !== undefined ? shape.opacity : 100) / 100;
  ctx.globalAlpha = opacityVal;

  // Stroke style
  if (shape.strokeStyle === 'dashed') {
    ctx.setLineDash([8, 8]);
  } else if (shape.strokeStyle === 'dotted') {
    ctx.setLineDash([3, 5]);
  } else {
    ctx.setLineDash([]);
  }

  const { x, y, width, height } = shape;

  switch (shape.type) {
    // ── Basic Shapes ──────────────────────────────────────────────────────────
    case 'rectangle':
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, 8);
      if (shape.fillColor && shape.fillColor !== 'transparent') ctx.fill();
      ctx.stroke();
      break;

    case 'ellipse':
      ctx.beginPath();
      ctx.ellipse(
        x + width / 2, y + height / 2,
        Math.abs(width / 2), Math.abs(height / 2),
        0, 0, Math.PI * 2
      );
      if (shape.fillColor && shape.fillColor !== 'transparent') ctx.fill();
      ctx.stroke();
      break;

    case 'diamond':
      ctx.beginPath();
      ctx.moveTo(x + width / 2, y);
      ctx.lineTo(x + width, y + height / 2);
      ctx.lineTo(x + width / 2, y + height);
      ctx.lineTo(x, y + height / 2);
      ctx.closePath();
      if (shape.fillColor && shape.fillColor !== 'transparent') ctx.fill();
      ctx.stroke();
      break;

    // ── Day 2: New Geometry ───────────────────────────────────────────────────
    case 'triangle':
      drawTriangle(ctx, shape);
      break;

    case 'hexagon':
      drawHexagon(ctx, shape);
      break;

    case 'parallelogram':
      drawParallelogram(ctx, shape);
      break;

    case 'star':
      drawStar(ctx, shape);
      break;

    // ── Architecture Nodes ────────────────────────────────────────────────────
    case 'database':
      drawDatabase(ctx, shape);
      break;

    case 'cloud':
      drawCloud(ctx, shape);
      break;

    // ── Pen Freehand ──────────────────────────────────────────────────────────
    case 'pen':
      if (shape.points && shape.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        // Smooth quadratic bezier through points
        for (let i = 1; i < shape.points.length - 1; i++) {
          const mx = (shape.points[i].x + shape.points[i + 1].x) / 2;
          const my = (shape.points[i].y + shape.points[i + 1].y) / 2;
          ctx.quadraticCurveTo(shape.points[i].x, shape.points[i].y, mx, my);
        }
        // Draw final segment
        const last = shape.points[shape.points.length - 1];
        ctx.lineTo(last.x, last.y);
        ctx.stroke();
      }
      break;

    // ── Text ──────────────────────────────────────────────────────────────────
    case 'text':
      if (shape.text) {
        ctx.fillStyle = shape.strokeColor || '#1e1e1e';
        ctx.font = `${shape.fontSize || 18}px ${shape.fontFamily || 'Inter, sans-serif'}`;
        ctx.textAlign = shape.textAlign || 'left';
        ctx.textBaseline = 'top';
        ctx.setLineDash([]);
        ctx.fillText(shape.text, x, y);
      }
      break;

    // ── Arrow & Line ──────────────────────────────────────────────────────────
    case 'arrow':
    case 'line': {
      const endX = x + width;
      const endY = y + height;

      // Shorten line body slightly so arrowhead tip looks clean
      const angle = Math.atan2(endY - y, endX - x);
      const arrowSize = 13;
      const shortenBy = shape.type === 'arrow' ? arrowSize * 0.6 : 0;
      const lineEndX = endX - shortenBy * Math.cos(angle);
      const lineEndY = endY - shortenBy * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(lineEndX, lineEndY);
      ctx.stroke();

      if (shape.type === 'arrow') {
        ctx.setLineDash([]); // arrowhead always solid
        drawSolidArrowhead(ctx, x, y, endX, endY, arrowSize);
      }
      break;
    }

    default:
      break;
  }

  // ── Embedded Text Label (for container shapes) ────────────────────────────
  if (shape.text && shape.type !== 'text') {
    ctx.setLineDash([]);
    ctx.fillStyle = shape.textColor || shape.strokeColor || '#1e1e1e';
    ctx.font = `600 ${shape.fontSize || 15}px ${shape.fontFamily || 'Inter, sans-serif'}`;
    ctx.textAlign = shape.textAlign || 'center';
    ctx.textBaseline = 'middle';

    const textX =
      shape.textAlign === 'left'  ? x + 12 :
      shape.textAlign === 'right' ? x + width - 12 :
      x + width / 2;

    // Clip text to shape bounding box so it doesn't overflow
    const padding = 8;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + padding, y + padding, Math.abs(width) - padding * 2, Math.abs(height) - padding * 2);
    ctx.clip();
    ctx.fillText(shape.text, textX, y + height / 2);
    ctx.restore();
  }

  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// SELECTION GIZMO (Excalidraw Style — 4 corners + 4 edge handles)
// ─────────────────────────────────────────────────────────────────────────────
export function drawSelectionBox(ctx, shape) {
  const { x, y, width, height } = shape;

  ctx.save();
  ctx.strokeStyle = '#6366f1'; // Indigo accent
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 1.8;

  // Arrow / Line: Only endpoint handles
  if (shape.type === 'arrow' || shape.type === 'line') {
    const endX = x + width;
    const endY = y + height;
    [{ x, y }, { x: endX, y: endY }].forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
    ctx.restore();
    return;
  }

  const padding = 7;
  const minX = Math.min(x, x + width) - padding;
  const minY = Math.min(y, y + height) - padding;
  const w = Math.abs(width) + padding * 2;
  const h = Math.abs(height) + padding * 2;

  // Dashed bounding box
  ctx.setLineDash([5, 4]);
  ctx.strokeRect(minX, minY, w, h);
  ctx.setLineDash([]);

  // 8 handles: 4 corners + 4 edge midpoints
  const handles = [
    { x: minX,         y: minY },          // TL
    { x: minX + w / 2, y: minY },          // TC
    { x: minX + w,     y: minY },          // TR
    { x: minX + w,     y: minY + h / 2 },  // MR
    { x: minX + w,     y: minY + h },      // BR
    { x: minX + w / 2, y: minY + h },      // BC
    { x: minX,         y: minY + h },      // BL
    { x: minX,         y: minY + h / 2 },  // ML
  ];

  handles.forEach((pt) => {
    ctx.beginPath();
    ctx.rect(pt.x - 4, pt.y - 4, 8, 8);
    ctx.fill();
    ctx.stroke();
  });

  ctx.restore();
}
