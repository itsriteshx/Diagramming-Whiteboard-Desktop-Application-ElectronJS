export function screenToCanvas(screenX, screenY, pan, zoom) {
  return {
    x: (screenX - pan.x) / zoom,
    y: (screenY - pan.y) / zoom,
  };
}

export function canvasToScreen(canvasX, canvasY, pan, zoom) {
  return {
    x: canvasX * zoom + pan.x,
    y: canvasY * zoom + pan.y,
  };
}

export function snapToGrid(value, gridSize = 20) {
  return Math.round(value / gridSize) * gridSize;
}

export function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

export function pointInPolygon(px, py, vertices) {
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i].x;
    const yi = vertices[i].y;
    const xj = vertices[j].x;
    const yj = vertices[j].y;
    const intersect = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function pointInEllipse(px, py, cx, cy, rx, ry) {
  if (rx === 0 || ry === 0) return false;
  const dx = px - cx;
  const dy = py - cy;
  return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1;
}

export function getPolygonVertices(shape) {
  const { x, y, width, height, type } = shape;

  if (type === 'triangle') {
    return [
      { x: x + width / 2, y },
      { x: x + width, y: y + height },
      { x, y: y + height },
    ];
  }

  if (type === 'right_triangle') {
    return [
      { x, y },
      { x, y: y + height },
      { x: x + width, y: y + height },
    ];
  }

  if (type === 'trapezoid') {
    const inset = Math.abs(width) * 0.22;
    return [
      { x: x + inset, y },
      { x: x + width - inset, y },
      { x: x + width, y: y + height },
      { x, y: y + height },
    ];
  }

  if (type === 'diamond') {
    return [
      { x: x + width / 2, y },
      { x: x + width, y: y + height / 2 },
      { x: x + width / 2, y: y + height },
      { x, y: y + height / 2 },
    ];
  }

  if (type === 'parallelogram') {
    const skew = Math.abs(width) * 0.2;
    return [
      { x: x + skew, y },
      { x: x + width, y },
      { x: x + width - skew, y: y + height },
      { x, y: y + height },
    ];
  }

  if (type === 'hexagon') {
    const cx = x + width / 2;
    const cy = y + height / 2;
    const rx = Math.abs(width) / 2;
    const ry = Math.abs(height) / 2;
    const verts = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      verts.push({ x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) });
    }
    return verts;
  }

  if (type === 'star') {
    const cx = x + width / 2;
    const cy = y + height / 2;
    const outerR = Math.min(Math.abs(width), Math.abs(height)) / 2;
    const innerR = outerR * 0.4;
    const verts = [];
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI / 5) * i - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : innerR;
      verts.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
    }
    return verts;
  }

  return null;
}

export function isPointInShape(px, py, shape, tolerance = 10) {
  const { x, y, width, height, type } = shape;

  if (type === 'arrow' || type === 'line') {
    return distToSegment(px, py, x, y, x + width, y + height) <= tolerance + 4;
  }

  if (type === 'coordinate_axis') {
    const cx = x + width / 2;
    const cy = y + height / 2;
    return (
      distToSegment(px, py, x, cy, x + width, cy) <= tolerance + 4 ||
      distToSegment(px, py, cx, y, cx, y + height) <= tolerance + 4
    );
  }

  if (type === 'pen' && shape.points && shape.points.length > 0) {
    for (let j = 0; j < shape.points.length - 1; j++) {
      if (distToSegment(px, py, shape.points[j].x, shape.points[j].y, shape.points[j + 1].x, shape.points[j + 1].y) <= tolerance + 4) {
        return true;
      }
    }
    return false;
  }

  if (type === 'ellipse') {
    const cx = x + width / 2;
    const cy = y + height / 2;
    const rx = Math.abs(width) / 2 + tolerance;
    const ry = Math.abs(height) / 2 + tolerance;
    return pointInEllipse(px, py, cx, cy, rx, ry);
  }

  const polygon = getPolygonVertices(shape);
  if (polygon) {
    if (pointInPolygon(px, py, polygon)) return true;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (distToSegment(px, py, polygon[i].x, polygon[i].y, polygon[j].x, polygon[j].y) <= tolerance) {
        return true;
      }
    }
    return false;
  }

  const minX = Math.min(x, x + width) - tolerance;
  const maxX = Math.max(x, x + width) + tolerance;
  const minY = Math.min(y, y + height) - tolerance;
  const maxY = Math.max(y, y + height) + tolerance;
  return px >= minX && px <= maxX && py >= minY && py <= maxY;
}

export function getShapeAnchors(shape) {
  if (!shape || shape.type === 'arrow' || shape.type === 'line' || shape.type === 'pen') {
    return [];
  }
  const minX = Math.min(shape.x, shape.x + shape.width);
  const maxX = Math.max(shape.x, shape.x + shape.width);
  const minY = Math.min(shape.y, shape.y + shape.height);
  const maxY = Math.max(shape.y, shape.y + shape.height);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  return [
    { name: 'top',    x: cx,   y: minY, shapeId: shape.id },
    { name: 'bottom', x: cx,   y: maxY, shapeId: shape.id },
    { name: 'left',   x: minX, y: cy,   shapeId: shape.id },
    { name: 'right',  x: maxX, y: cy,   shapeId: shape.id },
  ];
}

export function findNearestAnchor(worldX, worldY, shapes, excludeShapeId = null, snapRadius = 24) {
  let nearest = null;
  let minDistance = snapRadius;

  for (const s of shapes) {
    if (s.id === excludeShapeId || s.type === 'arrow' || s.type === 'line' || s.type === 'pen') continue;
    const anchors = getShapeAnchors(s);
    for (const a of anchors) {
      const d = Math.hypot(worldX - a.x, worldY - a.y);
      if (d < minDistance) {
        minDistance = d;
        nearest = a;
      }
    }
  }

  return nearest;
}

export function getAnchorPoint(shape, anchorName) {
  const anchors = getShapeAnchors(shape);
  const found = anchors.find(a => a.name === anchorName);
  return found ? { x: found.x, y: found.y } : null;
}

export function updateBoundArrows(shapes, movedShape) {
  return shapes.map(s => {
    if (s.id === movedShape.id) return movedShape;
    if (s.type !== 'arrow' && s.type !== 'line') return s;

    let updated = { ...s };
    let changed = false;

    if (s.startBinding && s.startBinding.shapeId === movedShape.id) {
      const pt = getAnchorPoint(movedShape, s.startBinding.anchor);
      if (pt) {
        const dx = pt.x - updated.x;
        const dy = pt.y - updated.y;
        updated.x = pt.x;
        updated.y = pt.y;
        updated.width = updated.width - dx;
        updated.height = updated.height - dy;
        changed = true;
      }
    }

    if (s.endBinding && s.endBinding.shapeId === movedShape.id) {
      const pt = getAnchorPoint(movedShape, s.endBinding.anchor);
      if (pt) {
        const currentEndX = updated.x + updated.width;
        const currentEndY = updated.y + updated.height;
        const dx = pt.x - currentEndX;
        const dy = pt.y - currentEndY;
        updated.width = updated.width + dx;
        updated.height = updated.height + dy;
        changed = true;
      }
    }

    return changed ? updated : s;
  });
}
