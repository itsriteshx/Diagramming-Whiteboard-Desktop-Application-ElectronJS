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
    const rx = Math.abs(width) / 2;
    const ry = Math.abs(height) / 2;
    const verts = [];
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI / 5) * i - Math.PI / 2;
      const rX = i % 2 === 0 ? rx : rx * 0.4;
      const rY = i % 2 === 0 ? ry : ry * 0.4;
      verts.push({ x: cx + rX * Math.cos(angle), y: cy + rY * Math.sin(angle) });
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

export function getBoundingBox(shapes) {
  if (!shapes || shapes.length === 0) return null;

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

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    minX,
    minY,
    maxX,
    maxY,
  };
}

export function isShapeIntersectingBox(shape, box) {
  const sx1 = Math.min(shape.x, shape.x + shape.width);
  const sy1 = Math.min(shape.y, shape.y + shape.height);
  const sx2 = Math.max(shape.x, shape.x + shape.width);
  const sy2 = Math.max(shape.y, shape.y + shape.height);

  const bx1 = Math.min(box.x, box.x + box.width);
  const by1 = Math.min(box.y, box.y + box.height);
  const bx2 = Math.max(box.x, box.x + box.width);
  const by2 = Math.max(box.y, box.y + box.height);

  return bx1 <= sx2 && bx2 >= sx1 && by1 <= sy2 && by2 >= sy1;
}

export function getGroupMemberIds(shapes, targetShapeIds) {
  const targetIdSet = new Set(targetShapeIds);
  const targetGroupIds = new Set();

  shapes.forEach((s) => {
    if (targetIdSet.has(s.id) && s.groupId) {
      targetGroupIds.add(s.groupId);
    }
  });

  if (targetGroupIds.size === 0) {
    return Array.from(targetIdSet);
  }

  const resultIds = new Set(targetIdSet);
  shapes.forEach((s) => {
    if (s.groupId && targetGroupIds.has(s.groupId)) {
      resultIds.add(s.id);
    }
  });

  return Array.from(resultIds);
}

export function updateBoundArrowsForMoved(shapes, movedShapesMap) {
  return shapes.map((s) => {
    if (movedShapesMap.has(s.id)) {
      return movedShapesMap.get(s.id);
    }

    if (s.type !== 'arrow' && s.type !== 'line') return s;

    let updated = { ...s };
    let changed = false;

    if (s.startBinding && movedShapesMap.has(s.startBinding.shapeId)) {
      const movedShape = movedShapesMap.get(s.startBinding.shapeId);
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

    if (s.endBinding && movedShapesMap.has(s.endBinding.shapeId)) {
      const movedShape = movedShapesMap.get(s.endBinding.shapeId);
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

export function alignShapes(shapes, selectedIds, alignment) {
  const selectedShapes = shapes.filter((s) => selectedIds.includes(s.id));
  if (selectedShapes.length < 2) return shapes;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  selectedShapes.forEach((s) => {
    const sx1 = Math.min(s.x, s.x + s.width);
    const sx2 = Math.max(s.x, s.x + s.width);
    const sy1 = Math.min(s.y, s.y + s.height);
    const sy2 = Math.max(s.y, s.y + s.height);

    if (sx1 < minX) minX = sx1;
    if (sx2 > maxX) maxX = sx2;
    if (sy1 < minY) minY = sy1;
    if (sy2 > maxY) maxY = sy2;
  });

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  const movedMap = new Map();

  selectedShapes.forEach((s) => {
    const sx1 = Math.min(s.x, s.x + s.width);
    const sx2 = Math.max(s.x, s.x + s.width);
    const sy1 = Math.min(s.y, s.y + s.height);
    const sy2 = Math.max(s.y, s.y + s.height);
    const sw = sx2 - sx1;
    const sh = sy2 - sy1;

    let deltaX = 0;
    let deltaY = 0;

    switch (alignment) {
      case 'left':
        deltaX = minX - sx1;
        break;
      case 'center':
        deltaX = centerX - (sx1 + sw / 2);
        break;
      case 'right':
        deltaX = maxX - sx2;
        break;
      case 'top':
        deltaY = minY - sy1;
        break;
      case 'middle':
        deltaY = centerY - (sy1 + sh / 2);
        break;
      case 'bottom':
        deltaY = maxY - sy2;
        break;
      default:
        break;
    }

    if (deltaX !== 0 || deltaY !== 0) {
      movedMap.set(s.id, {
        ...s,
        x: s.x + deltaX,
        y: s.y + deltaY,
      });
    }
  });

  if (movedMap.size === 0) return shapes;
  return updateBoundArrowsForMoved(shapes, movedMap);
}

export function distributeShapes(shapes, selectedIds, direction) {
  const selectedShapes = shapes.filter((s) => selectedIds.includes(s.id));
  if (selectedShapes.length < 3) return shapes;

  const movedMap = new Map();

  if (direction === 'horizontal') {
    const sorted = [...selectedShapes].sort((a, b) => {
      const ax = Math.min(a.x, a.x + a.width);
      const bx = Math.min(b.x, b.x + b.width);
      return ax - bx;
    });

    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const firstLeft = Math.min(first.x, first.x + first.width);
    const lastRight = Math.max(last.x, last.x + last.width);
    const totalSpan = lastRight - firstLeft;

    let totalWidth = 0;
    sorted.forEach((s) => {
      totalWidth += Math.abs(s.width);
    });

    const totalGap = totalSpan - totalWidth;

    if (totalGap >= 0) {
      const gap = totalGap / (sorted.length - 1);
      let currX = firstLeft;

      sorted.forEach((s, idx) => {
        const sx1 = Math.min(s.x, s.x + s.width);
        const sw = Math.abs(s.width);

        if (idx !== 0 && idx !== sorted.length - 1) {
          const deltaX = currX - sx1;
          if (deltaX !== 0) {
            movedMap.set(s.id, { ...s, x: s.x + deltaX });
          }
        }
        currX += sw + gap;
      });
    } else {
      const firstCenter = firstLeft + Math.abs(first.width) / 2;
      const lastCenter = Math.min(last.x, last.x + last.width) + Math.abs(last.width) / 2;
      const step = (lastCenter - firstCenter) / (sorted.length - 1);

      sorted.forEach((s, idx) => {
        if (idx !== 0 && idx !== sorted.length - 1) {
          const targetCenter = firstCenter + idx * step;
          const currentCenter = Math.min(s.x, s.x + s.width) + Math.abs(s.width) / 2;
          const deltaX = targetCenter - currentCenter;
          if (deltaX !== 0) {
            movedMap.set(s.id, { ...s, x: s.x + deltaX });
          }
        }
      });
    }
  } else if (direction === 'vertical') {
    const sorted = [...selectedShapes].sort((a, b) => {
      const ay = Math.min(a.y, a.y + a.height);
      const by = Math.min(b.y, b.y + b.height);
      return ay - by;
    });

    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const firstTop = Math.min(first.y, first.y + first.height);
    const lastBottom = Math.max(last.y, last.y + last.height);
    const totalSpan = lastBottom - firstTop;

    let totalHeight = 0;
    sorted.forEach((s) => {
      totalHeight += Math.abs(s.height);
    });

    const totalGap = totalSpan - totalHeight;

    if (totalGap >= 0) {
      const gap = totalGap / (sorted.length - 1);
      let currY = firstTop;

      sorted.forEach((s, idx) => {
        const sy1 = Math.min(s.y, s.y + s.height);
        const sh = Math.abs(s.height);

        if (idx !== 0 && idx !== sorted.length - 1) {
          const deltaY = currY - sy1;
          if (deltaY !== 0) {
            movedMap.set(s.id, { ...s, y: s.y + deltaY });
          }
        }
        currY += sh + gap;
      });
    } else {
      const firstCenter = firstTop + Math.abs(first.height) / 2;
      const lastCenter = Math.min(last.y, last.y + last.height) + Math.abs(last.height) / 2;
      const step = (lastCenter - firstCenter) / (sorted.length - 1);

      sorted.forEach((s, idx) => {
        if (idx !== 0 && idx !== sorted.length - 1) {
          const targetCenter = firstCenter + idx * step;
          const currentCenter = Math.min(s.y, s.y + s.height) + Math.abs(s.height) / 2;
          const deltaY = targetCenter - currentCenter;
          if (deltaY !== 0) {
            movedMap.set(s.id, { ...s, y: s.y + deltaY });
          }
        }
      });
    }
  }

  if (movedMap.size === 0) return shapes;
  return updateBoundArrowsForMoved(shapes, movedMap);
}

