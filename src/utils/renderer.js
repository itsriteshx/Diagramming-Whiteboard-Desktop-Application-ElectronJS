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

  ctx.beginPath();
  ctx.ellipse(cx, y + ry, rx, ry, 0, 0, Math.PI * 2);
  if (shape.fillColor && shape.fillColor !== 'transparent') ctx.fill();
  ctx.stroke();
  ctx.restore();
}

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

export function drawTriangle(ctx, shape) {
  const { x, y, width, height } = shape;
  ctx.beginPath();
  ctx.moveTo(x + width / 2, y);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.closePath();
  if (shape.fillColor && shape.fillColor !== 'transparent') ctx.fill();
  ctx.stroke();
}

export function drawHexagon(ctx, shape) {
  const { x, y, width, height } = shape;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const rx = Math.abs(width) / 2;
  const ry = Math.abs(height) / 2;

  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const px = cx + rx * Math.cos(angle);
    const py = cy + ry * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  if (shape.fillColor && shape.fillColor !== 'transparent') ctx.fill();
  ctx.stroke();
}

export function drawParallelogram(ctx, shape) {
  const { x, y, width, height } = shape;
  const skew = Math.abs(width) * 0.2;

  ctx.beginPath();
  ctx.moveTo(x + skew, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width - skew, y + height);
  ctx.lineTo(x, y + height);
  ctx.closePath();
  if (shape.fillColor && shape.fillColor !== 'transparent') ctx.fill();
  ctx.stroke();
}

export function drawStar(ctx, shape) {
  const { x, y, width, height } = shape;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const rx = Math.abs(width) / 2;
  const ry = Math.abs(height) / 2;
  const points = 5;

  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const rX = i % 2 === 0 ? rx : rx * 0.4;
    const rY = i % 2 === 0 ? ry : ry * 0.4;
    const px = cx + rX * Math.cos(angle);
    const py = cy + rY * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  if (shape.fillColor && shape.fillColor !== 'transparent') ctx.fill();
  ctx.stroke();
}

function drawSolidArrowhead(ctx, fromX, fromY, toX, toY, size = 13) {
  const angle = Math.atan2(toY - fromY, toX - fromX);
  const spread = Math.PI / 5.5;

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

export function drawRightTriangle(ctx, shape) {
  const { x, y, width, height } = shape;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x + width, y + height);
  ctx.closePath();
  if (shape.fillColor && shape.fillColor !== 'transparent') ctx.fill();
  ctx.stroke();

  const corner = Math.min(12, Math.abs(width) / 5, Math.abs(height) / 5);
  if (corner > 4) {
    const dirX = width >= 0 ? 1 : -1;
    const dirY = height >= 0 ? 1 : -1;
    ctx.save();
    ctx.setLineDash([]);
    ctx.lineWidth = Math.max(1, (shape.strokeWidth || 2) * 0.7);
    ctx.beginPath();
    ctx.moveTo(x, y + height - dirY * corner);
    ctx.lineTo(x + dirX * corner, y + height - dirY * corner);
    ctx.lineTo(x + dirX * corner, y + height);
    ctx.stroke();
    ctx.restore();
  }
}

export function drawCoordinateAxis(ctx, shape) {
  const { x, y, width, height } = shape;
  const cx = x + width / 2;
  const cy = y + height / 2;

  ctx.beginPath();
  ctx.moveTo(x, cy);
  ctx.lineTo(x + width, cy);
  ctx.moveTo(cx, y + height);
  ctx.lineTo(cx, y);
  ctx.stroke();

  drawSolidArrowhead(ctx, x + 20, cy, x + width, cy, 9);
  drawSolidArrowhead(ctx, x + width - 20, cy, x, cy, 9);
  drawSolidArrowhead(ctx, cx, y + 20, cx, y, 9);
  drawSolidArrowhead(ctx, cx, y + height - 20, cx, y + height, 9);

  const tickSize = 3.5;
  const numTicks = 3;
  const xStep = Math.abs(width) / (numTicks * 2 + 2);
  const yStep = Math.abs(height) / (numTicks * 2 + 2);

  ctx.beginPath();
  for (let i = 1; i <= numTicks * 2 + 1; i++) {
    const tx = x + i * xStep;
    if (Math.abs(tx - cx) > 4) {
      ctx.moveTo(tx, cy - tickSize);
      ctx.lineTo(tx, cy + tickSize);
    }
    const ty = y + i * yStep;
    if (Math.abs(ty - cy) > 4) {
      ctx.moveTo(cx - tickSize, ty);
      ctx.lineTo(cx + tickSize, ty);
    }
  }
  ctx.stroke();

  ctx.save();
  ctx.font = '600 11px Inter, sans-serif';
  ctx.fillStyle = shape.strokeColor || '#1e1e1e';
  ctx.fillText('X', x + width - 11, cy - 6);
  ctx.fillText('Y', cx + 6, y + 11);
  ctx.fillText('O', cx - 11, cy + 12);
  ctx.restore();
}

export function drawTrapezoid(ctx, shape) {
  const { x, y, width, height } = shape;
  const inset = Math.abs(width) * 0.22;
  ctx.beginPath();
  ctx.moveTo(x + inset, y);
  ctx.lineTo(x + width - inset, y);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.closePath();
  if (shape.fillColor && shape.fillColor !== 'transparent') ctx.fill();
  ctx.stroke();
}

export function drawCube(ctx, shape) {
  const { x, y, width, height } = shape;
  const dx = width * 0.28;
  const dy = height * 0.28;
  const fw = width * 0.72;
  const fh = height * 0.72;
  const fx = x;
  const fy = y + dy;

  ctx.beginPath();
  ctx.rect(fx, fy, fw, fh);
  if (shape.fillColor && shape.fillColor !== 'transparent') ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(fx, fy);
  ctx.lineTo(fx + dx, fy - dy);
  ctx.lineTo(fx + fw + dx, fy - dy);
  ctx.lineTo(fx + fw, fy);
  ctx.closePath();
  if (shape.fillColor && shape.fillColor !== 'transparent') ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(fx + fw, fy);
  ctx.lineTo(fx + fw + dx, fy - dy);
  ctx.lineTo(fx + fw + dx, fy + fh - dy);
  ctx.lineTo(fx + fw, fy + fh);
  ctx.closePath();
  if (shape.fillColor && shape.fillColor !== 'transparent') ctx.fill();
  ctx.stroke();
}

export function drawCone(ctx, shape) {
  const { x, y, width, height } = shape;
  const cx = x + width / 2;
  const rx = Math.abs(width) / 2;
  const ry = Math.min(Math.abs(height) * 0.2, 26);
  const baseY = y + height - ry;

  ctx.beginPath();
  ctx.moveTo(cx, y);
  ctx.lineTo(x, baseY);
  ctx.ellipse(cx, baseY, rx, ry, 0, Math.PI, 0, true);
  ctx.lineTo(cx, y);
  ctx.closePath();
  if (shape.fillColor && shape.fillColor !== 'transparent') ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(cx, baseY, rx, ry, 0, 0, Math.PI);
  ctx.stroke();

  ctx.save();
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.ellipse(cx, baseY, rx, ry, 0, Math.PI, 0);
  ctx.stroke();
  ctx.restore();
}

export function drawBrowserWindow(ctx, shape) {
  const { x, y, width, height } = shape;
  const headerHeight = Math.min(34, Math.max(24, Math.abs(height) * 0.14));
  const radius = Math.min(10, Math.abs(width) / 4, Math.abs(height) / 4);

  // Outer Window Frame
  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    ctx.rect(x, y, width, height);
  }
  ctx.fillStyle = shape.fillColor && shape.fillColor !== 'transparent' ? shape.fillColor : '#ffffff';
  ctx.fill();
  ctx.stroke();

  // Header Bar Top Background
  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, headerHeight, [radius, radius, 0, 0]);
  } else {
    ctx.rect(x, y, width, headerHeight);
  }
  ctx.fillStyle = '#f1f5f9';
  ctx.fill();
  ctx.restore();

  // Header bottom border line
  ctx.beginPath();
  ctx.moveTo(x, y + headerHeight);
  ctx.lineTo(x + width, y + headerHeight);
  ctx.stroke();

  // Window Traffic Light Dots (Close, Minimize, Expand)
  const dotRadius = 3.5;
  const dotY = y + headerHeight / 2;
  const dotColors = ['#ef4444', '#f59e0b', '#10b981'];
  dotColors.forEach((color, i) => {
    ctx.beginPath();
    ctx.arc(x + 14 + i * 11, dotY, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });

  // URL / Address Pill in header
  if (Math.abs(width) > 160) {
    const urlX = x + 54;
    const urlW = Math.max(60, width - 100);
    const urlH = Math.max(14, headerHeight - 12);
    const urlY = y + (headerHeight - urlH) / 2;
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(urlX, urlY, urlW, urlH, urlH / 2);
    } else {
      ctx.rect(urlX, urlY, urlW, urlH);
    }
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const displayUrl = shape.url || (shape.text ? `https://${shape.text.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : 'https://myapp.dev');
    ctx.save();
    ctx.beginPath();
    ctx.rect(urlX + 4, urlY, urlW - 8, urlH);
    ctx.clip();
    ctx.fillText(displayUrl, urlX + 8, urlY + urlH / 2);
    ctx.restore();
    ctx.restore();
  }
  ctx.restore();
}

export function drawUiButton(ctx, shape) {
  const { x, y, width, height } = shape;
  const radius = shape.cornerRadius !== undefined ? shape.cornerRadius : Math.min(8, Math.abs(height) / 2);
  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    ctx.rect(x, y, width, height);
  }
  ctx.fillStyle = shape.fillColor && shape.fillColor !== 'transparent' ? shape.fillColor : '#4f46e5';
  ctx.fill();
  ctx.stroke();

  // Button text
  const label = shape.text || 'Action Button';
  ctx.fillStyle = shape.textColor || (shape.fillColor && shape.fillColor !== 'transparent' && shape.fillColor !== '#ffffff' ? '#ffffff' : '#0f172a');
  ctx.font = `600 ${shape.fontSize || 13}px ${shape.fontFamily || 'Inter, sans-serif'}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + width / 2, y + height / 2);
  ctx.restore();
}

export function drawUiInput(ctx, shape) {
  const { x, y, width, height } = shape;
  const radius = shape.cornerRadius !== undefined ? shape.cornerRadius : 6;
  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    ctx.rect(x, y, width, height);
  }
  ctx.fillStyle = shape.fillColor && shape.fillColor !== 'transparent' ? shape.fillColor : '#ffffff';
  ctx.fill();
  ctx.stroke();

  // Placeholder / input text
  const placeholder = shape.text || 'Enter text...';
  ctx.fillStyle = shape.textColor || '#94a3b8';
  ctx.font = `400 ${shape.fontSize || 13}px ${shape.fontFamily || 'Inter, sans-serif'}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const textX = x + 10;
  const textY = y + height / 2;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 4, y + 2, width - 8, height - 4);
  ctx.clip();
  ctx.fillText(placeholder, textX, textY);
  ctx.restore();
  ctx.restore();
}

export function drawImagePlaceholder(ctx, shape) {
  const { x, y, width, height } = shape;
  const radius = 6;
  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    ctx.rect(x, y, width, height);
  }
  ctx.fillStyle = shape.fillColor && shape.fillColor !== 'transparent' ? shape.fillColor : '#f8fafc';
  ctx.fill();
  ctx.stroke();

  // Diagonal crosses
  ctx.save();
  ctx.strokeStyle = shape.strokeColor ? `${shape.strokeColor}33` : '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y + height);
  ctx.moveTo(x + width, y);
  ctx.lineTo(x, y + height);
  ctx.stroke();

  // Center picture icon badge
  const cx = x + width / 2;
  const cy = y + height / 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 13, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = shape.strokeColor || '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - 6, cy + 4);
  ctx.lineTo(cx - 2, cy - 3);
  ctx.lineTo(cx + 2, cy + 2);
  ctx.lineTo(cx + 4, cy - 1);
  ctx.lineTo(cx + 7, cy + 5);
  ctx.closePath();
  ctx.fillStyle = '#94a3b8';
  ctx.fill();

  ctx.restore();
  ctx.restore();
}

export function drawToggleSwitch(ctx, shape) {
  const { x, y, width, height } = shape;
  const radius = Math.abs(height) / 2;
  const isOn = shape.active !== undefined ? shape.active : true;

  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    ctx.rect(x, y, width, height);
  }
  ctx.fillStyle = isOn ? (shape.fillColor && shape.fillColor !== 'transparent' ? shape.fillColor : '#4f46e5') : '#e2e8f0';
  ctx.fill();
  ctx.stroke();

  // Switch Thumb circle
  const thumbR = Math.max(3, radius - 3);
  const thumbX = isOn ? x + width - radius : x + radius;
  const thumbY = y + height / 2;

  ctx.beginPath();
  ctx.arc(thumbX, thumbY, thumbR, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();
}

export function drawShape(ctx, shape) {
  ctx.save();
  ctx.strokeStyle = shape.strokeColor || '#1e1e1e';
  ctx.fillStyle = shape.fillColor || 'transparent';
  ctx.lineWidth = shape.strokeWidth || 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const opacityVal = (shape.opacity !== undefined ? shape.opacity : 100) / 100;
  ctx.globalAlpha = opacityVal;

  if (shape.strokeStyle === 'dashed') {
    ctx.setLineDash([8, 8]);
  } else if (shape.strokeStyle === 'dotted') {
    ctx.setLineDash([3, 5]);
  } else {
    ctx.setLineDash([]);
  }

  const { x, y, width, height } = shape;

  switch (shape.type) {
    case 'rectangle': {
      const radius = shape.cornerRadius !== undefined
        ? Math.min(Math.max(0, shape.cornerRadius), Math.abs(width) / 2, Math.abs(height) / 2)
        : 8;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, width, height, radius);
      } else {
        ctx.rect(x, y, width, height);
      }
      if (shape.fillColor && shape.fillColor !== 'transparent') ctx.fill();
      ctx.stroke();
      break;
    }

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

    case 'database':
      drawDatabase(ctx, shape);
      break;

    case 'cloud':
      drawCloud(ctx, shape);
      break;

    case 'right_triangle':
      drawRightTriangle(ctx, shape);
      break;

    case 'coordinate_axis':
      drawCoordinateAxis(ctx, shape);
      break;

    case 'trapezoid':
      drawTrapezoid(ctx, shape);
      break;

    case 'cube':
      drawCube(ctx, shape);
      break;

    case 'cone':
      drawCone(ctx, shape);
      break;

    case 'pen':
      if (shape.points && shape.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        for (let i = 1; i < shape.points.length - 1; i++) {
          const mx = (shape.points[i].x + shape.points[i + 1].x) / 2;
          const my = (shape.points[i].y + shape.points[i + 1].y) / 2;
          ctx.quadraticCurveTo(shape.points[i].x, shape.points[i].y, mx, my);
        }
        const last = shape.points[shape.points.length - 1];
        ctx.lineTo(last.x, last.y);
        ctx.stroke();
      }
      break;

    case 'text':
      if (shape.text) {
        ctx.fillStyle = shape.textColor || shape.strokeColor || '#1e1e1e';
        const weight = shape.fontWeight ? `${shape.fontWeight} ` : '';
        const style = shape.fontStyle ? `${shape.fontStyle} ` : '';
        ctx.font = `${style}${weight}${shape.fontSize || 18}px ${shape.fontFamily || 'Inter, sans-serif'}`;
        ctx.textAlign = shape.textAlign || 'left';
        ctx.textBaseline = 'top';
        ctx.setLineDash([]);
        ctx.fillText(shape.text, x, y);
      }
      break;

    case 'arrow':
    case 'line': {
      const endX = x + width;
      const endY = y + height;

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
        ctx.setLineDash([]);
        drawSolidArrowhead(ctx, x, y, endX, endY, arrowSize);
      }
      break;
    }

    case 'browser':
      drawBrowserWindow(ctx, shape);
      break;

    case 'ui_button':
      drawUiButton(ctx, shape);
      break;

    case 'ui_input':
      drawUiInput(ctx, shape);
      break;

    case 'image_placeholder':
      drawImagePlaceholder(ctx, shape);
      break;

    case 'toggle_switch':
      drawToggleSwitch(ctx, shape);
      break;

    default:
      break;
  }

  const isSelfText =
    shape.type === 'text' ||
    shape.type === 'ui_button' ||
    shape.type === 'ui_input' ||
    shape.type === 'browser' ||
    shape.type === 'image_placeholder' ||
    shape.type === 'toggle_switch';

  if (shape.text && !isSelfText) {
    ctx.setLineDash([]);
    ctx.fillStyle = shape.textColor || shape.strokeColor || '#1e1e1e';
    ctx.font = `600 ${shape.fontSize || 15}px ${shape.fontFamily || 'Inter, sans-serif'}`;
    ctx.textAlign = shape.textAlign || 'center';
    ctx.textBaseline = 'middle';

    const textX =
      shape.textAlign === 'left' ? x + 12 :
      shape.textAlign === 'right' ? x + width - 12 :
      x + width / 2;

    let textY = y + height / 2;
    if (shape.type === 'database') {
      const ry = Math.min(20, Math.abs(height) / 4);
      textY = y + height / 2 + ry * 0.45;
    } else if (shape.type === 'triangle') {
      textY = y + height * 0.6;
    } else if (shape.type === 'cone') {
      textY = y + height * 0.55;
    }

    const padding = 8;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + padding, y + padding, Math.abs(width) - padding * 2, Math.abs(height) - padding * 2);
    ctx.clip();
    ctx.fillText(shape.text, textX, textY);
    ctx.restore();
  }

  ctx.restore();
}

export function drawSelectionBox(ctx, shape) {
  const { x, y, width, height } = shape;

  ctx.save();
  ctx.strokeStyle = '#6366f1';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 1.8;

  const padding = 8;
  const minX = Math.min(x, x + width) - padding;
  const minY = Math.min(y, y + height) - padding;
  const w = Math.max(Math.abs(width) + padding * 2, 16);
  const h = Math.max(Math.abs(height) + padding * 2, 16);

  ctx.setLineDash([5, 4]);
  ctx.strokeRect(minX, minY, w, h);
  ctx.setLineDash([]);

  if (shape.type === 'arrow' || shape.type === 'line') {
    const endX = x + width;
    const endY = y + height;
    [{ x, y }, { x: endX, y: endY }].forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
    ctx.restore();
    return;
  }

  const handles = [
    { x: minX,         y: minY },
    { x: minX + w / 2, y: minY },
    { x: minX + w,     y: minY },
    { x: minX + w,     y: minY + h / 2 },
    { x: minX + w,     y: minY + h },
    { x: minX + w / 2, y: minY + h },
    { x: minX,         y: minY + h },
    { x: minX,         y: minY + h / 2 },
  ];

  handles.forEach((pt) => {
    ctx.beginPath();
    ctx.rect(pt.x - 4.5, pt.y - 4.5, 9, 9);
    ctx.fill();
    ctx.stroke();
  });

  ctx.restore();
}

export function drawHoverBox(ctx, shape) {
  const { x, y, width, height } = shape;
  ctx.save();
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.55)';
  ctx.lineWidth = 1.5;
  const padding = 6;
  const minX = Math.min(x, x + width) - padding;
  const minY = Math.min(y, y + height) - padding;
  const w = Math.max(Math.abs(width) + padding * 2, 12);
  const h = Math.max(Math.abs(height) + padding * 2, 12);

  ctx.setLineDash([4, 4]);
  ctx.strokeRect(minX, minY, w, h);
  ctx.restore();
}

export function drawShapeAnchors(ctx, shape, activeAnchor = null) {
  const minX = Math.min(shape.x, shape.x + shape.width);
  const maxX = Math.max(shape.x, shape.x + shape.width);
  const minY = Math.min(shape.y, shape.y + shape.height);
  const maxY = Math.max(shape.y, shape.y + shape.height);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  const anchors = [
    { name: 'top',    x: cx,   y: minY, shapeId: shape.id },
    { name: 'bottom', x: cx,   y: maxY, shapeId: shape.id },
    { name: 'left',   x: minX, y: cy,   shapeId: shape.id },
    { name: 'right',  x: maxX, y: cy,   shapeId: shape.id },
  ];

  anchors.forEach((a) => {
    const isTarget = activeAnchor && activeAnchor.shapeId === a.shapeId && activeAnchor.name === a.name;
    ctx.save();
    ctx.beginPath();
    ctx.arc(a.x, a.y, isTarget ? 6.5 : 4, 0, Math.PI * 2);
    ctx.fillStyle = isTarget ? '#4f46e5' : '#ffffff';
    ctx.strokeStyle = isTarget ? '#ffffff' : '#6366f1';
    ctx.lineWidth = isTarget ? 2.5 : 1.5;
    ctx.fill();
    ctx.stroke();

    if (isTarget) {
      ctx.beginPath();
      ctx.arc(a.x, a.y, 11, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.45)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();
  });
}

export function drawSelectionOutline(ctx, shape) {
  const { x, y, width, height } = shape;
  ctx.save();
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.6)';
  ctx.lineWidth = 1.4;
  const padding = 5;
  const minX = Math.min(x, x + width) - padding;
  const minY = Math.min(y, y + height) - padding;
  const w = Math.max(Math.abs(width) + padding * 2, 10);
  const h = Math.max(Math.abs(height) + padding * 2, 10);

  ctx.setLineDash([4, 4]);
  ctx.strokeRect(minX, minY, w, h);
  ctx.restore();
}

export function drawMultiSelectionBox(ctx, shapes, isGrouped = false) {
  if (!shapes || shapes.length === 0) return;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  shapes.forEach((s) => {
    const sx1 = Math.min(s.x, s.x + s.width);
    const sy1 = Math.min(s.y, s.y + s.height);
    const sx2 = Math.max(s.x, s.x + s.width);
    const sy2 = Math.max(s.y, s.y + s.height);
    if (sx1 < minX) minX = sx1;
    if (sy1 < minY) minY = sy1;
    if (sx2 > maxX) maxX = sx2;
    if (sy2 > maxY) maxY = sy2;
  });

  const padding = 10;
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;
  const w = maxX - minX;
  const h = maxY - minY;

  ctx.save();
  ctx.strokeStyle = '#6366f1';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 1.8;

  if (isGrouped) {
    ctx.setLineDash([]);
  } else {
    ctx.setLineDash([6, 4]);
  }
  ctx.strokeRect(minX, minY, w, h);
  ctx.setLineDash([]);

  const cornerHandles = [
    { x: minX, y: minY },
    { x: maxX, y: minY },
    { x: minX, y: maxY },
    { x: maxX, y: maxY },
  ];

  cornerHandles.forEach((pt) => {
    ctx.beginPath();
    ctx.rect(pt.x - 4.5, pt.y - 4.5, 9, 9);
    ctx.fill();
    ctx.stroke();
  });

  const badgeText = isGrouped ? `Group · ${shapes.length} items` : `${shapes.length} items`;
  ctx.font = '600 11px system-ui, -apple-system, sans-serif';
  const textMetrics = ctx.measureText(badgeText);
  const badgeWidth = textMetrics.width + 16;
  const badgeHeight = 20;
  const badgeX = minX;
  const badgeY = minY - badgeHeight - 6;

  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 5);
  } else {
    ctx.rect(badgeX, badgeY, badgeWidth, badgeHeight);
  }
  ctx.fillStyle = isGrouped ? '#4338ca' : '#4f46e5';
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, badgeX + 8, badgeY + badgeHeight / 2);

  ctx.restore();
}
