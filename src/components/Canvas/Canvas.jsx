// src/components/Canvas/Canvas.jsx
import { useRef, useEffect, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Undo2, Redo2 } from 'lucide-react';
import { TOOLS } from '../../constants/tools';
import { screenToCanvas } from '../../utils/coordinates';
import { drawGrid, drawShape, drawSelectionBox } from '../../utils/renderer';

// Shapes that are "containers" — click places them with a default size
const CLICK_TO_PLACE_SIZE = { width: 140, height: 90 };

// Shapes that get constrained proportions (square / circle) on Shift
const PROPORTIONAL_SHAPES = new Set([
  TOOLS.RECTANGLE, TOOLS.ELLIPSE, TOOLS.DIAMOND,
  TOOLS.TRIANGLE,  TOOLS.HEXAGON, TOOLS.STAR,
  TOOLS.PARALLELOGRAM,
]);

/**
 * 🌟 Excalidraw Interactive Canvas — Day 2 Update
 * + Shift-lock for perfect square/circle
 * + Click-to-place (no drag needed)
 * + 8-point selection gizmo (renderer)
 * + Smooth bezier pen strokes
 */
export function Canvas({
  shapes,
  setShapes,
  activeTool,
  setActiveTool,
  selectedId,
  setSelectedId,
  currentStyle,
  pan,
  setPan,
  zoom,
  zoomAtPoint,
  zoomIn,
  zoomOut,
  resetView,
  canvasBg,
  undo,
  redo,
  canUndo,
  canRedo,
  isToolLocked,
}) {
  const canvasRef = useRef(null);
  const isInteracting  = useRef(false);
  const isDragging     = useRef(false);   // true once mouse moves >4px
  const dragStart      = useRef({ x: 0, y: 0 });
  const isShiftHeld    = useRef(false);

  const [currentShape, setCurrentShape]   = useState(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // ─── High-DPI Rendering Loop ────────────────────────────────────────────────
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width  = canvas.width;
    const height = canvas.height;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = canvasBg?.color || '#ffffff';
    ctx.fillRect(0, 0, width, height);

    drawGrid(ctx, width, height, pan, zoom * dpr, canvasBg?.dotColor || '#e5e7eb');
    ctx.setTransform(zoom * dpr, 0, 0, zoom * dpr, pan.x * dpr, pan.y * dpr);

    shapes.forEach((shape) => {
      drawShape(ctx, shape);
      if (shape.id === selectedId) drawSelectionBox(ctx, shape);
    });

    if (currentShape) drawShape(ctx, currentShape);
  }, [shapes, currentShape, selectedId, pan, zoom, canvasBg]);

  useEffect(() => {
    let id = requestAnimationFrame(render);
    return () => cancelAnimationFrame(id);
  }, [render]);

  // ─── Resize Observer ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleResize = () => {
      const dpr  = window.devicePixelRatio || 1;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width  = rect.width  * dpr;
      canvas.height = rect.height * dpr;
      render();
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [render]);

  // ─── Keyboard Listeners ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Shift') isShiftHeld.current = true;
      if (e.code === 'Space' && !e.repeat && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {
        setIsSpacePressed(true);
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {
        setShapes((prev) => prev.filter((s) => s.id !== selectedId));
        setSelectedId(null);
      }
    };
    const handleKeyUp = (e) => {
      if (e.key === 'Shift')   isShiftHeld.current = false;
      if (e.code === 'Space')  setIsSpacePressed(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup',   handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup',   handleKeyUp);
    };
  }, [selectedId, setShapes, setSelectedId]);

  // ─── Hit Testing ──────────────────────────────────────────────────────────────
  const findShapeAtPoint = useCallback((worldX, worldY) => {
    for (let i = shapes.length - 1; i >= 0; i--) {
      const s = shapes[i];
      const minX = Math.min(s.x, s.x + s.width);
      const maxX = Math.max(s.x, s.x + s.width);
      const minY = Math.min(s.y, s.y + s.height);
      const maxY = Math.max(s.y, s.y + s.height);
      if (worldX >= minX && worldX <= maxX && worldY >= minY && worldY <= maxY) return s;
    }
    return null;
  }, [shapes]);

  // ─── Mouse Down ──────────────────────────────────────────────────────────────
  const handleMouseDown = (e) => {
    if (e.button !== 0 && e.button !== 1) return;
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    isInteracting.current = true;
    isDragging.current    = false;
    dragStart.current     = { x: screenX, y: screenY };

    if (isSpacePressed || activeTool === TOOLS.PAN || e.button === 1) return;

    const world = screenToCanvas(screenX, screenY, pan, zoom);

    // Eraser
    if (activeTool === TOOLS.ERASER) {
      const target = findShapeAtPoint(world.x, world.y);
      if (target) {
        setShapes((prev) => prev.filter((s) => s.id !== target.id));
        if (selectedId === target.id) setSelectedId(null);
      }
      return;
    }

    // Select / Move
    if (activeTool === TOOLS.SELECT) {
      const clicked = findShapeAtPoint(world.x, world.y);
      if (clicked) {
        setSelectedId(clicked.id);
        dragStart.current = { x: world.x, y: world.y };
      } else {
        setSelectedId(null);
      }
      return;
    }

    // Text Tool
    if (activeTool === TOOLS.TEXT) {
      const textVal = prompt('Enter text:');
      if (textVal) {
        const shape = {
          id: 'shape_' + Date.now(),
          type: TOOLS.TEXT,
          x: world.x, y: world.y,
          width: 200, height: 30,
          text: textVal,
          ...currentStyle,
        };
        setShapes((prev) => [...prev, shape]);
        setSelectedId(shape.id);
        if (!isToolLocked) setActiveTool(TOOLS.SELECT);
      }
      isInteracting.current = false;
      return;
    }

    // Begin shape drawing
    const newShapeId = 'shape_' + Date.now();
    const base = {
      id: newShapeId,
      type: activeTool,
      x: world.x, y: world.y,
      width: 0, height: 0,
      ...currentStyle,
    };
    if (activeTool === TOOLS.PEN) base.points = [{ x: world.x, y: world.y }];
    setCurrentShape(base);
  };

  // ─── Mouse Move ───────────────────────────────────────────────────────────────
  const handleMouseMove = (e) => {
    if (!isInteracting.current) return;
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const dx = screenX - dragStart.current.x;
    const dy = screenY - dragStart.current.y;

    // Mark as true drag once we move > 4px
    if (!isDragging.current && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      isDragging.current = true;
    }

    // Viewport Pan
    if (isSpacePressed || activeTool === TOOLS.PAN || e.buttons === 4) {
      setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      dragStart.current = { x: screenX, y: screenY };
      return;
    }

    const world = screenToCanvas(screenX, screenY, pan, zoom);

    // Eraser drag
    if (activeTool === TOOLS.ERASER) {
      const target = findShapeAtPoint(world.x, world.y);
      if (target) {
        setShapes((prev) => prev.filter((s) => s.id !== target.id));
        if (selectedId === target.id) setSelectedId(null);
      }
      return;
    }

    // Move selected shape
    if (activeTool === TOOLS.SELECT && selectedId) {
      const worldDx = world.x - dragStart.current.x;
      const worldDy = world.y - dragStart.current.y;
      setShapes((prev) =>
        prev.map((s) => s.id === selectedId ? { ...s, x: s.x + worldDx, y: s.y + worldDy } : s)
      );
      dragStart.current = { x: world.x, y: world.y };
      return;
    }

    // Resize current in-progress shape
    if (currentShape) {
      if (currentShape.type === TOOLS.PEN) {
        setCurrentShape((prev) => ({
          ...prev,
          points: [...prev.points, { x: world.x, y: world.y }],
        }));
      } else {
        let newW = world.x - currentShape.x;
        let newH = world.y - currentShape.y;

        // Shift-lock: constrain to square (equal sides)
        if (isShiftHeld.current && PROPORTIONAL_SHAPES.has(currentShape.type)) {
          const side = Math.max(Math.abs(newW), Math.abs(newH));
          newW = newW < 0 ? -side : side;
          newH = newH < 0 ? -side : side;
        }

        // Shift-lock for arrows/lines: snap to 45° increments
        if (isShiftHeld.current && (currentShape.type === TOOLS.ARROW || currentShape.type === TOOLS.LINE)) {
          const angle  = Math.atan2(newH, newW);
          const snap   = Math.PI / 4;
          const snapped = Math.round(angle / snap) * snap;
          const dist   = Math.sqrt(newW * newW + newH * newH);
          newW = dist * Math.cos(snapped);
          newH = dist * Math.sin(snapped);
        }

        setCurrentShape((prev) => ({ ...prev, width: newW, height: newH }));
      }
    }
  };

  // ─── Mouse Up ─────────────────────────────────────────────────────────────────
  const handleMouseUp = () => {
    isInteracting.current = false;

    if (currentShape) {
      const isPen   = currentShape.type === TOOLS.PEN;
      const isTiny  = !isPen && Math.abs(currentShape.width) < 5 && Math.abs(currentShape.height) < 5;

      if (isTiny && !isDragging.current) {
        // ✨ Click-to-place: user clicked without dragging → use default size
        const finalShape = {
          ...currentShape,
          width:  CLICK_TO_PLACE_SIZE.width,
          height: CLICK_TO_PLACE_SIZE.height,
          // Center the shape on the click point
          x: currentShape.x - CLICK_TO_PLACE_SIZE.width  / 2,
          y: currentShape.y - CLICK_TO_PLACE_SIZE.height / 2,
        };
        setShapes((prev) => [...prev, finalShape]);
        setSelectedId(finalShape.id);
        if (!isToolLocked) setActiveTool(TOOLS.SELECT);
      } else if (!isTiny || isPen) {
        setShapes((prev) => [...prev, currentShape]);
        setSelectedId(currentShape.id);
        if (!isToolLocked) setActiveTool(TOOLS.SELECT);
      }

      setCurrentShape(null);
      isDragging.current = false;
    }
  };

  // ─── Wheel Zoom ────────────────────────────────────────────────────────────────
  const handleWheel = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    zoomAtPoint(e.deltaY, e.clientX - rect.left, e.clientY - rect.top);
  };

  // ─── Cursor ───────────────────────────────────────────────────────────────────
  const getCursor = () => {
    if (isSpacePressed || activeTool === TOOLS.PAN) return 'grab';
    if (activeTool === TOOLS.SELECT)  return 'default';
    if (activeTool === TOOLS.ERASER)  return 'not-allowed';
    return 'crosshair';
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
        onWheel={handleWheel}
        className="block w-full h-full"
      />

      {/* 🌟 Excalidraw Bottom-Left Zoom & Undo/Redo Pill */}
      <div className="absolute bottom-5 left-5 z-20 flex items-center gap-1 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04)] border border-zinc-200/90 rounded-2xl p-1.5 backdrop-blur-md select-none">
        <button
          onClick={zoomOut}
          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-zinc-100 text-zinc-600 transition-colors cursor-pointer"
          title="Zoom Out (-)"
        >
          <ZoomOut size={16} />
        </button>

        <button
          onClick={resetView}
          className="px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 rounded-lg min-w-[52px] text-center transition-colors cursor-pointer"
          title="Reset to 100%"
        >
          {Math.round(zoom * 100)}%
        </button>

        <button
          onClick={zoomIn}
          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-zinc-100 text-zinc-600 transition-colors cursor-pointer"
          title="Zoom In (+)"
        >
          <ZoomIn size={16} />
        </button>

        <button
          onClick={resetView}
          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
          title="Reset Origin"
        >
          <RotateCcw size={14} />
        </button>

        <div className="w-px h-4 bg-zinc-200 mx-1" />

        <button
          onClick={undo}
          disabled={!canUndo}
          className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${
            canUndo ? 'hover:bg-zinc-100 text-zinc-600 cursor-pointer active:scale-95' : 'text-zinc-300 cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={16} />
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${
            canRedo ? 'hover:bg-zinc-100 text-zinc-600 cursor-pointer active:scale-95' : 'text-zinc-300 cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={16} />
        </button>
      </div>
    </div>
  );
}
