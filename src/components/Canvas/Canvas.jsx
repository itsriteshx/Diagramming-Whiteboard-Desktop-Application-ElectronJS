import { useRef, useEffect, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Undo2, Redo2 } from 'lucide-react';
import { TOOLS } from '../../constants/tools';
import { Minimap } from './Minimap';
import {
  isPointInShape,
  findNearestAnchor,
  updateBoundArrows,
  isShapeIntersectingBox,
  getGroupMemberIds,
  updateBoundArrowsForMoved,
} from '../../utils/coordinates';
import {
  drawGrid,
  drawShape,
  drawSelectionBox,
  drawHoverBox,
  drawShapeAnchors,
  drawSelectionOutline,
  drawMultiSelectionBox,
} from '../../utils/renderer';

function getClickToPlaceSize(type) {
  switch (type) {
    case TOOLS.BROWSER:
      return { width: 500, height: 320 };
    case TOOLS.UI_BUTTON:
      return { width: 140, height: 42 };
    case TOOLS.UI_INPUT:
      return { width: 220, height: 42 };
    case TOOLS.IMAGE_PLACEHOLDER:
      return { width: 180, height: 120 };
    case TOOLS.TOGGLE_SWITCH:
      return { width: 56, height: 28 };
    default:
      return { width: 140, height: 90 };
  }
}

const PROPORTIONAL_SHAPES = new Set([
  TOOLS.RECTANGLE, TOOLS.ELLIPSE, TOOLS.DIAMOND,
  TOOLS.TRIANGLE, TOOLS.HEXAGON, TOOLS.STAR, TOOLS.PARALLELOGRAM,
  TOOLS.RIGHT_TRIANGLE, TOOLS.TRAPEZOID, TOOLS.CUBE, TOOLS.CONE, TOOLS.COORDINATE_AXIS,
  TOOLS.BROWSER, TOOLS.UI_BUTTON, TOOLS.UI_INPUT, TOOLS.IMAGE_PLACEHOLDER, TOOLS.TOGGLE_SWITCH,
]);

function getSelectionHandles(shape) {
  if (!shape) return [];
  const { x, y, width, height } = shape;

  if (shape.type === 'arrow' || shape.type === 'line') {
    return [
      { id: 'start', x, y, cursor: 'crosshair' },
      { id: 'end',   x: x + width, y: y + height, cursor: 'crosshair' },
    ];
  }

  const padding = 8;
  const minX = Math.min(x, x + width) - padding;
  const minY = Math.min(y, y + height) - padding;
  const w = Math.max(Math.abs(width) + padding * 2, 16);
  const h = Math.max(Math.abs(height) + padding * 2, 16);

  return [
    { id: 'tl', x: minX,         y: minY,         cursor: 'nwse-resize' },
    { id: 'tc', x: minX + w / 2, y: minY,         cursor: 'ns-resize'   },
    { id: 'tr', x: minX + w,     y: minY,         cursor: 'nesw-resize' },
    { id: 'mr', x: minX + w,     y: minY + h / 2, cursor: 'ew-resize'   },
    { id: 'br', x: minX + w,     y: minY + h,     cursor: 'nwse-resize' },
    { id: 'bc', x: minX + w / 2, y: minY + h,     cursor: 'ns-resize'   },
    { id: 'bl', x: minX,         y: minY + h,     cursor: 'nesw-resize' },
    { id: 'ml', x: minX,         y: minY + h / 2, cursor: 'ew-resize'   },
  ];
}

function hitTestHandles(shape, worldX, worldY, zoom) {
  if (!shape) return null;
  const handles = getSelectionHandles(shape);
  const threshold = Math.max(12 / zoom, 12);
  for (const h of handles) {
    const dist = Math.hypot(worldX - h.x, worldY - h.y);
    if (dist <= threshold) return h;
  }
  return null;
}

export function Canvas({
  shapes, setShapes,
  activeTool, setActiveTool,
  selectedId, setSelectedId,
  selectedIds, setSelectedIds,
  currentStyle,
  pan, setPan,
  zoom, zoomAtPoint, zoomIn, zoomOut, resetView,
  canvasBg,
  undo, redo, canUndo, canRedo,
  isToolLocked,
  peers = {},
  reactions = [],
  onSendCursor,
}) {
  const canvasRef = useRef(null);
  const textareaRef = useRef(null);

  const isDown = useRef(false);
  const hasDragged = useRef(false);
  const isShift = useRef(false);
  const isSpace = useRef(false);

  const dragMode = useRef(null);
  const activeHandle = useRef(null);
  const initialShape = useRef(null);
  const initialShapes = useRef([]);
  const dragWorldOrigin = useRef({ x: 0, y: 0 });
  const dragScreenOrigin = useRef({ x: 0, y: 0 });

  const activeSnapAnchor = useRef(null);

  const [marquee, setMarquee] = useState(null);
  const marqueeRef = useRef(null);
  useEffect(() => { marqueeRef.current = marquee; }, [marquee]);

  const [hoveredId, setHoveredId] = useState(null);
  const [hoverCursor, setHoverCursor] = useState('default');

  const effectiveSelectedIds = selectedIds || (selectedId ? [selectedId] : []);

  const updateSelection = useCallback((ids) => {
    if (setSelectedIds) setSelectedIds(ids);
    if (setSelectedId) setSelectedId(ids.length > 0 ? ids[0] : null);
  }, [setSelectedIds, setSelectedId]);

  const R = useRef({
    shapes, activeTool, selectedId, selectedIds: effectiveSelectedIds, pan, zoom, currentStyle, isToolLocked,
  });
  useEffect(() => {
    R.current = { shapes, activeTool, selectedId, selectedIds: effectiveSelectedIds, pan, zoom, currentStyle, isToolLocked };
  });

  const [currentShape, setCurrentShape] = useState(null);
  const currentShapeRef = useRef(null);
  useEffect(() => { currentShapeRef.current = currentShape; }, [currentShape]);

  const [isSpaceState, setIsSpaceState] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [editingPos, setEditingPos] = useState(null);
  const editingIdRef = useRef(null);
  useEffect(() => { editingIdRef.current = editingId; }, [editingId]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = canvasBg?.color || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid(ctx, canvas.width, canvas.height, pan, zoom * dpr, canvasBg?.dotColor || '#e5e7eb');
    ctx.setTransform(zoom * dpr, 0, 0, zoom * dpr, pan.x * dpr, pan.y * dpr);

    const activeIds = R.current.selectedIds || [];
    const isMultiSelect = activeIds.length > 1;

    shapes.forEach((shape) => {
      const s = shape.id === editingId ? { ...shape, text: '' } : shape;
      drawShape(ctx, s);
      if (activeIds.includes(shape.id)) {
        if (!isMultiSelect) {
          drawSelectionBox(ctx, shape);
        } else {
          drawSelectionOutline(ctx, shape);
        }
      } else if (shape.id === hoveredId) {
        drawHoverBox(ctx, shape);
      }
    });

    if (isMultiSelect) {
      const selectedShapes = shapes.filter((s) => activeIds.includes(s.id));
      const isGrouped =
        selectedShapes.length > 1 &&
        selectedShapes.every((s) => s.groupId && s.groupId === selectedShapes[0].groupId);
      drawMultiSelectionBox(ctx, selectedShapes, isGrouped);
    }

    const isConnecting =
      activeTool === TOOLS.ARROW ||
      activeTool === TOOLS.LINE ||
      (currentShape && (currentShape.type === TOOLS.ARROW || currentShape.type === TOOLS.LINE)) ||
      (dragMode.current === 'resize' && initialShape.current && (initialShape.current.type === 'arrow' || initialShape.current.type === 'line'));

    if (isConnecting) {
      shapes.forEach((shape) => {
        if (shape.type !== 'arrow' && shape.type !== 'line' && shape.type !== 'pen') {
          drawShapeAnchors(ctx, shape, activeSnapAnchor.current);
        }
      });
    }

    if (currentShape) drawShape(ctx, currentShape);

    if (marquee && (marquee.width > 2 || marquee.height > 2)) {
      ctx.save();
      ctx.strokeStyle = '#6366f1';
      ctx.fillStyle = 'rgba(99, 102, 241, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.fillRect(marquee.x, marquee.y, marquee.width, marquee.height);
      ctx.strokeRect(marquee.x, marquee.y, marquee.width, marquee.height);
      ctx.restore();
    }
  }, [shapes, currentShape, effectiveSelectedIds, hoveredId, pan, zoom, canvasBg, editingId, marquee, activeTool]);

  useEffect(() => {
    let id = requestAnimationFrame(render);
    return () => cancelAnimationFrame(id);
  }, [render]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    const onDown = (e) => {
      if (e.key === 'Shift') isShift.current = true;
      if (e.code === 'Space' && !e.repeat && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {
        isSpace.current = true;
        setIsSpaceState(true);
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {
        const activeIds = R.current.selectedIds || [];
        if (activeIds.length > 0) {
          setShapes(prev => prev.filter(s => !activeIds.includes(s.id)));
          updateSelection([]);
        }
      }
    };
    const onUp = (e) => {
      if (e.key === 'Shift') isShift.current = false;
      if (e.code === 'Space') { isSpace.current = false; setIsSpaceState(false); }
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); };
  }, [setShapes, updateSelection]);

  useEffect(() => {
    if (editingId && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editingId]);

  const getScreenPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { sx: e.clientX - rect.left, sy: e.clientY - rect.top };
  };

  const toWorld = (sx, sy) => {
    const { pan, zoom } = R.current;
    return { x: (sx - pan.x) / zoom, y: (sy - pan.y) / zoom };
  };

  const hitTest = (worldX, worldY) => {
    const { shapes } = R.current;
    for (let i = shapes.length - 1; i >= 0; i--) {
      const s = shapes[i];
      if (isPointInShape(worldX, worldY, s)) return s;
    }
    return null;
  };

  const commitEdit = useCallback(() => {
    const id = editingIdRef.current;
    if (!id) return;
    setShapes(prev => prev.map(s => s.id === id ? { ...s, text: editingText } : s));
    setEditingId(null);
    setEditingText('');
    setEditingPos(null);
  }, [editingText, setShapes]);

  const handleMouseDown = (e) => {
    if (editingIdRef.current) { commitEdit(); return; }
    if (e.button !== 0 && e.button !== 1) return;

    const { sx, sy } = getScreenPos(e);
    isDown.current = true;
    hasDragged.current = false;
    dragScreenOrigin.current = { x: sx, y: sy };

    const { activeTool, selectedId, shapes, zoom } = R.current;

    if (isSpace.current || activeTool === TOOLS.PAN || e.button === 1) {
      dragMode.current = 'pan';
      setHoveredId(null);
      return;
    }

    const world = toWorld(sx, sy);
    dragWorldOrigin.current = { x: world.x, y: world.y };

    if (activeTool === TOOLS.ERASER) {
      const t = hitTest(world.x, world.y);
      if (t) {
        setShapes(prev => prev.filter(s => s.id !== t.id));
        if (selectedId === t.id) setSelectedId(null);
      }
      setHoveredId(null);
      return;
    }

    if (activeTool === TOOLS.SELECT) {
      const activeSelectedIds = R.current.selectedIds || [];

      if (activeSelectedIds.length === 1) {
        const selectedShape = shapes.find(s => s.id === activeSelectedIds[0]);
        if (selectedShape) {
          const handle = hitTestHandles(selectedShape, world.x, world.y, zoom);
          if (handle) {
            dragMode.current = 'resize';
            activeHandle.current = handle.id;
            initialShape.current = { ...selectedShape };
            setHoveredId(null);
            return;
          }
        }
      }

      const hit = hitTest(world.x, world.y);
      if (hit) {
        const isShiftHeld = e.shiftKey || isShift.current;
        let newSelection = [];

        if (isShiftHeld) {
          const hitIds = hit.groupId ? getGroupMemberIds(shapes, [hit.id]) : [hit.id];
          const hasHit = hitIds.some(id => activeSelectedIds.includes(id));
          if (hasHit) {
            newSelection = activeSelectedIds.filter(id => !hitIds.includes(id));
          } else {
            newSelection = Array.from(new Set([...activeSelectedIds, ...hitIds]));
          }
        } else {
          if (activeSelectedIds.includes(hit.id)) {
            newSelection = activeSelectedIds;
          } else {
            newSelection = hit.groupId ? getGroupMemberIds(shapes, [hit.id]) : [hit.id];
          }
        }

        updateSelection(newSelection);
        dragMode.current = 'move';
        initialShapes.current = shapes.filter(s => newSelection.includes(s.id)).map(s => ({ ...s }));
        setHoveredId(null);
        return;
      }

      if (!e.shiftKey && !isShift.current) {
        updateSelection([]);
      }
      setHoveredId(null);
      dragMode.current = 'marquee';
      setMarquee({ x: world.x, y: world.y, width: 0, height: 0 });
      return;
    }

    if (activeTool === TOOLS.TEXT) {
      const newShape = {
        id: 'shape_' + Date.now(),
        type: TOOLS.TEXT,
        x: world.x,
        y: world.y,
        width: 220,
        height: 36,
        text: '',
        ...R.current.currentStyle,
      };
      setShapes(prev => [...prev, newShape]);
      setSelectedId(newShape.id);
      setEditingId(newShape.id);
      setEditingText('');
      setEditingPos({ left: sx, top: sy, width: 220, height: 36 });
      if (!R.current.isToolLocked) setActiveTool(TOOLS.SELECT);
      isDown.current = false;
      setHoveredId(null);
      return;
    }

    dragMode.current = 'draw';
    setHoveredId(null);

    let startX = world.x;
    let startY = world.y;
    let startBinding = null;

    if (activeTool === TOOLS.ARROW || activeTool === TOOLS.LINE) {
      const snap = findNearestAnchor(world.x, world.y, shapes);
      if (snap) {
        startX = snap.x;
        startY = snap.y;
        startBinding = { shapeId: snap.shapeId, anchor: snap.name };
        activeSnapAnchor.current = snap;
      }
    }

    const base = {
      id: 'shape_' + Date.now(),
      type: activeTool,
      x: startX,
      y: startY,
      width: 0,
      height: 0,
      startBinding,
      endBinding: null,
      ...R.current.currentStyle,
    };
    if (activeTool === TOOLS.PEN) base.points = [{ x: world.x, y: world.y }];
    setCurrentShape(base);
  };

  const handleMouseMove = (e) => {
    const { sx, sy } = getScreenPos(e);
    const world = toWorld(sx, sy);
    const { activeTool, selectedId, shapes, zoom } = R.current;

    onSendCursor?.(world.x, world.y, activeTool);

    if (!isDown.current) {
      if (isSpace.current || activeTool === TOOLS.PAN) {
        setHoverCursor('grab');
        setHoveredId(null);
      } else if (activeTool === TOOLS.SELECT) {
        const activeSelectedIds = R.current.selectedIds || [];
        if (activeSelectedIds.length === 1) {
          const selectedShape = shapes.find(s => s.id === activeSelectedIds[0]);
          if (selectedShape) {
            const handle = hitTestHandles(selectedShape, world.x, world.y, zoom);
            if (handle) {
              setHoverCursor(handle.cursor);
              setHoveredId(null);
              return;
            }
          }
        }
        const hitAny = hitTest(world.x, world.y);
        if (hitAny) {
          if (activeSelectedIds.includes(hitAny.id)) {
            setHoverCursor('move');
            setHoveredId(null);
          } else {
            setHoveredId(hitAny.id);
            setHoverCursor('pointer');
          }
        } else {
          setHoveredId(null);
          setHoverCursor('default');
        }
      } else if (activeTool === TOOLS.ERASER) {
        setHoverCursor('not-allowed');
        setHoveredId(null);
      } else {
        setHoverCursor('crosshair');
        setHoveredId(null);
        if (activeTool === TOOLS.ARROW || activeTool === TOOLS.LINE) {
          const snap = findNearestAnchor(world.x, world.y, shapes);
          activeSnapAnchor.current = snap;
        }
      }
      return;
    }

    const screenDx = sx - dragScreenOrigin.current.x;
    const screenDy = sy - dragScreenOrigin.current.y;

    if (!hasDragged.current && (Math.abs(screenDx) > 3 || Math.abs(screenDy) > 3)) {
      hasDragged.current = true;
    }

    if (dragMode.current === 'pan' || isSpace.current || activeTool === TOOLS.PAN || e.buttons === 4) {
      setPan(prev => ({ x: prev.x + screenDx, y: prev.y + screenDy }));
      dragScreenOrigin.current = { x: sx, y: sy };
      return;
    }

    if (activeTool === TOOLS.ERASER) {
      const t = hitTest(world.x, world.y);
      if (t) {
        setShapes(prev => prev.filter(s => s.id !== t.id));
        if (selectedId === t.id) setSelectedId(null);
      }
      return;
    }

    if (dragMode.current === 'marquee') {
      const x1 = Math.min(dragWorldOrigin.current.x, world.x);
      const y1 = Math.min(dragWorldOrigin.current.y, world.y);
      const x2 = Math.max(dragWorldOrigin.current.x, world.x);
      const y2 = Math.max(dragWorldOrigin.current.y, world.y);
      setMarquee({ x: x1, y: y1, width: x2 - x1, height: y2 - y1 });
      return;
    }

    if (dragMode.current === 'resize' && selectedId && initialShape.current) {
      const orig = initialShape.current;
      const hId = activeHandle.current;
      const dx = world.x - dragWorldOrigin.current.x;
      const dy = world.y - dragWorldOrigin.current.y;

      let newX = orig.x;
      let newY = orig.y;
      let newW = orig.width;
      let newH = orig.height;
      let newStartBinding = orig.startBinding;
      let newEndBinding = orig.endBinding;

      if (orig.type === 'arrow' || orig.type === 'line') {
        if (hId === 'start') {
          let targetX = orig.x + dx;
          let targetY = orig.y + dy;
          const snap = findNearestAnchor(targetX, targetY, shapes, orig.endBinding?.shapeId);
          if (snap) {
            targetX = snap.x;
            targetY = snap.y;
            newStartBinding = { shapeId: snap.shapeId, anchor: snap.name };
            activeSnapAnchor.current = snap;
          } else {
            newStartBinding = null;
            activeSnapAnchor.current = null;
          }
          newX = targetX;
          newY = targetY;
          newW = (orig.x + orig.width) - targetX;
          newH = (orig.y + orig.height) - targetY;
        } else if (hId === 'end') {
          let targetX = orig.x + orig.width + dx;
          let targetY = orig.y + orig.height + dy;
          const snap = findNearestAnchor(targetX, targetY, shapes, orig.startBinding?.shapeId);
          if (snap) {
            targetX = snap.x;
            targetY = snap.y;
            newEndBinding = { shapeId: snap.shapeId, anchor: snap.name };
            activeSnapAnchor.current = snap;
          } else {
            newEndBinding = null;
            activeSnapAnchor.current = null;
          }
          newW = targetX - orig.x;
          newH = targetY - orig.y;
        }
      } else {
        switch (hId) {
          case 'br':
            newW = orig.width + dx;
            newH = orig.height + dy;
            break;
          case 'tr':
            newY = orig.y + dy;
            newW = orig.width + dx;
            newH = orig.height - dy;
            break;
          case 'tl':
            newX = orig.x + dx;
            newY = orig.y + dy;
            newW = orig.width - dx;
            newH = orig.height - dy;
            break;
          case 'bl':
            newX = orig.x + dx;
            newW = orig.width - dx;
            newH = orig.height + dy;
            break;
          case 'mr':
            newW = orig.width + dx;
            break;
          case 'ml':
            newX = orig.x + dx;
            newW = orig.width - dx;
            break;
          case 'bc':
            newH = orig.height + dy;
            break;
          case 'tc':
            newY = orig.y + dy;
            newH = orig.height - dy;
            break;
          default:
            break;
        }

        if (isShift.current && PROPORTIONAL_SHAPES.has(orig.type)) {
          const side = Math.max(Math.abs(newW), Math.abs(newH));
          newW = newW < 0 ? -side : side;
          newH = newH < 0 ? -side : side;
        }
      }

      const updatedShape = {
        ...orig,
        x: newX,
        y: newY,
        width: newW,
        height: newH,
        startBinding: newStartBinding,
        endBinding: newEndBinding,
      };

      setShapes(prev => updateBoundArrows(prev, updatedShape));
      return;
    }

    if (dragMode.current === 'move') {
      const activeInitialShapes = initialShapes.current.length > 0
        ? initialShapes.current
        : (initialShape.current ? [initialShape.current] : []);

      if (activeInitialShapes.length > 0) {
        const worldDx = world.x - dragWorldOrigin.current.x;
        const worldDy = world.y - dragWorldOrigin.current.y;

        const movedMap = new Map();
        activeInitialShapes.forEach((s) => {
          movedMap.set(s.id, {
            ...s,
            x: s.x + worldDx,
            y: s.y + worldDy,
          });
        });

        setShapes((prev) => updateBoundArrowsForMoved(prev, movedMap));
        return;
      }
    }

    const cs = currentShapeRef.current;
    if (dragMode.current === 'draw' && cs) {
      if (cs.type === TOOLS.PEN) {
        setCurrentShape(prev => ({ ...prev, points: [...prev.points, { x: world.x, y: world.y }] }));
      } else {
        let newW = world.x - cs.x;
        let newH = world.y - cs.y;
        let endBinding = null;

        if (cs.type === TOOLS.ARROW || cs.type === TOOLS.LINE) {
          const snap = findNearestAnchor(world.x, world.y, shapes, cs.startBinding?.shapeId);
          if (snap) {
            newW = snap.x - cs.x;
            newH = snap.y - cs.y;
            endBinding = { shapeId: snap.shapeId, anchor: snap.name };
            activeSnapAnchor.current = snap;
          } else {
            activeSnapAnchor.current = null;
          }
        }

        if (isShift.current && PROPORTIONAL_SHAPES.has(cs.type)) {
          const side = Math.max(Math.abs(newW), Math.abs(newH));
          newW = newW < 0 ? -side : side;
          newH = newH < 0 ? -side : side;
        }
        if (isShift.current && (cs.type === TOOLS.ARROW || cs.type === TOOLS.LINE) && !endBinding) {
          const dist = Math.sqrt(newW * newW + newH * newH);
          const snapAngle = Math.round(Math.atan2(newH, newW) / (Math.PI / 4)) * (Math.PI / 4);
          newW = dist * Math.cos(snapAngle);
          newH = dist * Math.sin(snapAngle);
        }

        setCurrentShape(prev => ({ ...prev, width: newW, height: newH, endBinding }));
      }
    }
  };

  const handleMouseUp = () => {
    isDown.current = false;
    activeSnapAnchor.current = null;

    if (dragMode.current === 'marquee') {
      const mq = marqueeRef.current;
      if (mq && (mq.width > 3 || mq.height > 3)) {
        const currentShapes = R.current.shapes;
        const intersected = currentShapes.filter((s) => isShapeIntersectingBox(s, mq));
        const intersectedIds = intersected.map((s) => s.id);
        const expandedIds = getGroupMemberIds(currentShapes, intersectedIds);

        const isShiftHeld = isShift.current;
        const activeSelectedIds = R.current.selectedIds || [];
        if (isShiftHeld) {
          updateSelection(Array.from(new Set([...activeSelectedIds, ...expandedIds])));
        } else {
          updateSelection(expandedIds);
        }
      }
      setMarquee(null);
    }

    dragMode.current = null;
    activeHandle.current = null;
    initialShape.current = null;
    initialShapes.current = [];

    const cs = currentShapeRef.current;
    if (!cs) {
      hasDragged.current = false;
      return;
    }

    const isPen = cs.type === TOOLS.PEN;
    const isTiny = !isPen && Math.abs(cs.width) < 5 && Math.abs(cs.height) < 5;

    if (isTiny && !hasDragged.current) {
      const placeSize = getClickToPlaceSize(cs.type);
      const placed = {
        ...cs,
        width: placeSize.width,
        height: placeSize.height,
        x: cs.x - placeSize.width / 2,
        y: cs.y - placeSize.height / 2,
      };
      setShapes(prev => [...prev, placed]);
      updateSelection([placed.id]);
      if (!R.current.isToolLocked) setActiveTool(TOOLS.SELECT);
    } else if (!isTiny || isPen) {
      setShapes(prev => [...prev, cs]);
      updateSelection([cs.id]);
      if (!R.current.isToolLocked) setActiveTool(TOOLS.SELECT);
    }

    setCurrentShape(null);
    hasDragged.current = false;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (editingIdRef.current) commitEdit();
    const { sx, sy } = getScreenPos(e);
    zoomAtPoint(e.deltaY, sx, sy);
  };

  const handleDoubleClick = (e) => {
    const { sx, sy } = getScreenPos(e);
    const world = toWorld(sx, sy);
    const hit = hitTest(world.x, world.y);
    if (!hit || ['arrow','line','pen'].includes(hit.type)) return;

    const { pan, zoom } = R.current;
    const minX = Math.min(hit.x, hit.x + hit.width);
    const minY = Math.min(hit.y, hit.y + hit.height);
    const shW = Math.abs(hit.width);
    const shH = Math.abs(hit.height);

    setEditingId(hit.id);
    setEditingText(hit.text || '');
    setEditingPos({
      left: minX * zoom + pan.x + 4,
      top: minY * zoom + pan.y + 4,
      width: Math.max(shW * zoom - 8, 80),
      height: Math.max(shH * zoom - 8, 28),
    });
    updateSelection([hit.id]);
  };

  const handleTextareaKeyDown = (e) => {
    if (e.key === 'Escape') { setEditingId(null); setEditingText(''); setEditingPos(null); return; }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); commitEdit(); }
    e.stopPropagation();
  };

  const getCursor = () => {
    if (isSpaceState || activeTool === TOOLS.PAN) return 'grab';
    if (isDown.current && dragMode.current === 'resize' && activeHandle.current) {
      return hoverCursor;
    }
    if (isDown.current && dragMode.current === 'move') {
      return 'move';
    }
    if (isDown.current && dragMode.current === 'marquee') {
      return 'crosshair';
    }
    return hoverCursor;
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none"
      style={{ cursor: getCursor(), backgroundColor: canvasBg?.color || '#ffffff' }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        className="block w-full h-full"
      />

      {/* 🌟 Remote Peer Cursors Layer */}
      {Object.values(peers).map((peer) => {
        if (!peer.cursor) return null;
        const screenX = peer.cursor.x * zoom + pan.x;
        const screenY = peer.cursor.y * zoom + pan.y;
        const peerColor = peer.color || '#6366f1';

        return (
          <div
            key={peer.id}
            className="pointer-events-none absolute z-30 transition-transform duration-75 ease-out select-none will-change-transform"
            style={{
              transform: `translate(${screenX}px, ${screenY}px)`,
              left: 0,
              top: 0,
            }}
          >
            {/* Smooth SVG Cursor Pointer */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="drop-shadow-md"
            >
              <path
                d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
                fill={peerColor}
                stroke="#ffffff"
                strokeWidth="1.2"
              />
            </svg>

            {/* Peer Name Pill */}
            <div
              className="ml-3.5 -mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white whitespace-nowrap shadow-lg flex items-center gap-1 border border-white/20"
              style={{ backgroundColor: peerColor }}
            >
              <span>{peer.name || 'Collaborator'}</span>
              {peer.cursor.activeTool && peer.cursor.activeTool !== 'select' && (
                <span className="opacity-80 text-[8px] uppercase tracking-wider font-mono">
                  [{peer.cursor.activeTool}]
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* 🌟 Floating Live Reactions Layer */}
      {reactions.map((r) => {
        const screenX = (r.x !== undefined ? r.x : 0) * zoom + pan.x;
        const screenY = (r.y !== undefined ? r.y : 0) * zoom + pan.y;
        return (
          <div
            key={r.id}
            className="pointer-events-none absolute z-40 select-none animate-bounce"
            style={{
              left: screenX,
              top: screenY - 28,
            }}
          >
            <div className="flex flex-col items-center">
              <span className="text-3xl filter drop-shadow-xl transform hover:scale-125 transition-transform">
                {r.emoji}
              </span>
              {r.user && (
                <span
                  className="text-[9px] font-bold text-white px-1.5 py-0.2 rounded-full shadow border border-white/20 -mt-1"
                  style={{ backgroundColor: r.user.color || '#6366f1' }}
                >
                  {r.user.name}
                </span>
              )}
            </div>
          </div>
        );
      })}

      {editingId && editingPos && (
        <div className="absolute z-50 pointer-events-none" style={{ left: editingPos.left, top: editingPos.top, width: editingPos.width, height: editingPos.height }}>
          <textarea
            ref={textareaRef}
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleTextareaKeyDown}
            placeholder="Type here…"
            className="pointer-events-auto w-full h-full resize-none outline-none bg-transparent border-none p-1 text-center leading-tight"
            style={{ font: `600 ${currentStyle.fontSize || 15}px ${currentStyle.fontFamily || 'Inter, sans-serif'}`, color: currentStyle.strokeColor || '#1e1e1e', caretColor: '#6366f1', overflow: 'hidden' }}
          />
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-zinc-400 bg-white border border-zinc-200 rounded-lg px-2 py-0.5 shadow-sm select-none">
            ↵ new line · ⌘↵ done · Esc cancel
          </div>
        </div>
      )}

      <div className="absolute bottom-5 left-5 z-20 flex items-center gap-1 bg-zinc-900/90 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] border border-zinc-700/60 rounded-xl p-1 select-none">
        <button onClick={zoomOut} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-700/80 text-zinc-400 hover:text-white transition-colors cursor-pointer" title="Zoom Out (-)"><ZoomOut size={14} /></button>
        <button onClick={resetView} className="h-7 px-2 flex items-center justify-center text-[11px] font-semibold text-zinc-200 hover:bg-zinc-700/80 rounded-lg min-w-[46px] leading-none transition-colors cursor-pointer" title="Reset View">{Math.round(zoom * 100)}%</button>
        <button onClick={zoomIn} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-700/80 text-zinc-400 hover:text-white transition-colors cursor-pointer" title="Zoom In (+)"><ZoomIn size={14} /></button>
        <button onClick={resetView} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-700/80 text-zinc-500 hover:text-white transition-colors cursor-pointer" title="Reset Origin"><RotateCcw size={12} /></button>
        <div className="w-px h-3.5 bg-zinc-700 mx-0.5" />
        <button onClick={undo} disabled={!canUndo} className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${canUndo ? 'hover:bg-zinc-700/80 text-zinc-400 hover:text-white cursor-pointer active:scale-95' : 'text-zinc-700 cursor-not-allowed'}`} title="Undo (Ctrl+Z)"><Undo2 size={14} /></button>
        <button onClick={redo} disabled={!canRedo} className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${canRedo ? 'hover:bg-zinc-700/80 text-zinc-400 hover:text-white cursor-pointer active:scale-95' : 'text-zinc-700 cursor-not-allowed'}`} title="Redo (Ctrl+Y)"><Redo2 size={14} /></button>
      </div>

      <Minimap
        shapes={shapes}
        pan={pan}
        setPan={setPan}
        zoom={zoom}
        resetView={resetView}
        canvasBg={canvasBg}
        containerRef={canvasRef}
      />
    </div>
  );
}
