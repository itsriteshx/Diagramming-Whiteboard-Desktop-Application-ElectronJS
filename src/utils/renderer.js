// src/utils/renderer.js

/**
 * 🌟 High-DPI Canvas Rendering Engine (Excalidraw Aesthetics)
 */

// Draw dynamic grid dots according to selected canvas theme
export function drawGrid(ctx, width, height, pan, zoom, dotColor = '#e4e4e7') {
  // Fixed subtle dot size (always elegant, never oversized)
  const dotRadius = 1.2;
  const baseSpacing = 24;
  const gridSize = baseSpacing * zoom;

  // Don't render dots if zoom is too small (prevents clutter)
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

/**
 * Technical Architecture Shape: Database Cylinder (Eraser.io extra feature)
 */
export function drawDatabase(ctx, shape) {
  const { x, y, width, height } = shape;
  const rx = Math.abs(width) / 2;
  const ry = Math.min(20, Math.abs(height) / 4);
  const cx = x + rx;

  ctx.save();
  // 1. Draw cylinder body
  ctx.beginPath();
  ctx.moveTo(x, y + ry);
  ctx.lineTo(x, y + height - ry);
  ctx.ellipse(cx, y + height - ry, rx, ry, 0, Math.PI, 0, true);
  ctx.lineTo(x + width, y + ry);
  ctx.ellipse(cx, y + ry, rx, ry, 0, 0, Math.PI, true);
  ctx.closePath();

  if (shape.fillColor && shape.fillColor !== 'transparent') {
    ctx.fill();
  }
  ctx.stroke();

  // 2. Draw top lid
  ctx.beginPath();
  ctx.ellipse(cx, y + ry, rx, ry, 0, 0, Math.PI * 2);
  if (shape.fillColor && shape.fillColor !== 'transparent') {
    ctx.fill();
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * Technical Architecture Shape: Cloud
 */
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

  if (shape.fillColor && shape.fillColor !== 'transparent') {
    ctx.fill();
  }
  ctx.stroke();
}

/**
 * Main Shape Drawing Function
 */
export function drawShape(ctx, shape) {
  ctx.save();
  ctx.strokeStyle = shape.strokeColor || '#1e1e1e';
  ctx.fillStyle = shape.fillColor || 'transparent';
  ctx.lineWidth = shape.strokeWidth || 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const opacityVal = (shape.opacity !== undefined ? shape.opacity : 100) / 100;
  ctx.globalAlpha = opacityVal;

  // Stroke Style (Solid, Dashed, Dotted)
  if (shape.strokeStyle === 'dashed') {
    ctx.setLineDash([8, 8]);
  } else if (shape.strokeStyle === 'dotted') {
    ctx.setLineDash([3, 5]);
  } else {
    ctx.setLineDash([]);
  }

  const { x, y, width, height } = shape;

  switch (shape.type) {
    case 'rectangle':
      ctx.beginPath();
      // Excalidraw rounded corner aesthetic
      ctx.roundRect(x, y, width, height, 8);
      if (shape.fillColor && shape.fillColor !== 'transparent') ctx.fill();
      ctx.stroke();
      break;

    case 'ellipse':
      ctx.beginPath();
      ctx.ellipse(
        x + width / 2,
        y + height / 2,
        Math.abs(width / 2),
        Math.abs(height / 2),
        0,
        0,
        Math.PI * 2
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

    case 'database':
      drawDatabase(ctx, shape);
      break;

    case 'cloud':
      drawCloud(ctx, shape);
      break;

    case 'pen':
      if (shape.points && shape.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        for (let i = 1; i < shape.points.length; i++) {
          ctx.lineTo(shape.points[i].x, shape.points[i].y);
        }
        ctx.stroke();
      }
      break;

    case 'text':
      // Text only shape
      if (shape.text) {
        ctx.fillStyle = shape.strokeColor || '#1e1e1e';
        ctx.font = `${shape.fontSize || 18}px ${shape.fontFamily || 'Inter, sans-serif'}`;
        ctx.textAlign = shape.textAlign || 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(shape.text, x, y);
      }
      break;

    case 'arrow':
    case 'line': {
      const endX = x + width;
      const endY = y + height;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      if (shape.type === 'arrow') {
        const angle = Math.atan2(endY - y, endX - x);
        const headLength = 14;
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - headLength * Math.cos(angle - Math.PI / 6),
          endY - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - headLength * Math.cos(angle + Math.PI / 6),
          endY - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      }
      break;
    }

    default:
      break;
  }

  // Draw embedded text inside containers (like Rectangles/Diamonds/Databases)
  if (shape.text && shape.type !== 'text') {
    ctx.fillStyle = shape.textColor || shape.strokeColor || '#1e1e1e';
    ctx.font = `600 ${shape.fontSize || 16}px ${shape.fontFamily || 'Inter, sans-serif'}`;
    ctx.textAlign = shape.textAlign || 'center';
    ctx.textBaseline = 'middle';
    ctx.setLineDash([]); // Text doesn't have dashed outline

    const textX =
      shape.textAlign === 'left'
        ? x + 12
        : shape.textAlign === 'right'
        ? x + width - 12
        : x + width / 2;

    ctx.fillText(shape.text, textX, y + height / 2);
  }

  ctx.restore();
}

/**
 * Excalidraw Style Selection Bounding Box & Handles
 */
export function drawSelectionBox(ctx, shape) {
  const { x, y, width, height } = shape;

  ctx.save();
  ctx.strokeStyle = '#6366f1'; // Indigo accent
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 1.8;

  // Arrow / Line selection: Only endpoint handles (no giant box!)
  if (shape.type === 'arrow' || shape.type === 'line') {
    const endX = x + width;
    const endY = y + height;

    [
      { x, y },
      { x: endX, y: endY },
    ].forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    ctx.restore();
    return;
  }

  // Regular shape bounding box
  const padding = 6;
  ctx.setLineDash([4, 4]);

  const minX = Math.min(x, x + width) - padding;
  const minY = Math.min(y, y + height) - padding;
  const w = Math.abs(width) + padding * 2;
  const h = Math.abs(height) + padding * 2;

  ctx.strokeRect(minX, minY, w, h);

  // 4 corner square handles
  const handles = [
    { x: minX, y: minY },
    { x: minX + w, y: minY },
    { x: minX, y: minY + h },
    { x: minX + w, y: minY + h },
  ];

  ctx.setLineDash([]);
  handles.forEach((pt) => {
    ctx.beginPath();
    ctx.rect(pt.x - 4, pt.y - 4, 8, 8);
    ctx.fill();
    ctx.stroke();
  });

  ctx.restore();
}
