// src/components/Canvas/Canvas.jsx
import { useRef, useEffect, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Undo2, Redo2 } from 'lucide-react';
import { TOOLS } from '../../constants/tools';
import { screenToCanvas } from '../../utils/coordinates';
import { drawGrid, drawShape, drawSelectionBox } from '../../utils/renderer';

/**
 * 🌟 Excalidraw Interactive Canvas
 * High-DPI 60FPS rendering, clean background, zoom, pan, undo/redo controls.
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
  const isInteracting = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [currentShape, setCurrentShape] = useState(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // High-DPI Canvas Rendering Loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const width = canvas.width;
    const height = canvas.height;

    // Reset transform & clear screen with chosen canvas background (default white)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = canvasBg?.color || '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Dynamic grid dots
    drawGrid(ctx, width, height, pan, zoom * dpr, canvasBg?.dotColor || '#e5e7eb');

    // Apply Pan & Zoom transformation matrix
    ctx.setTransform(zoom * dpr, 0, 0, zoom * dpr, pan.x * dpr, pan.y * dpr);

    // Draw all completed shapes
    shapes.forEach((shape) => {
      drawShape(ctx, shape);
      if (shape.id === selectedId) {
        drawSelectionBox(ctx, shape);
      }
    });

    // Draw current in-progress shape
    if (currentShape) {
      drawShape(ctx, currentShape);
    }
  }, [shapes, currentShape, selectedId, pan, zoom, canvasBg]);

  // Animation frame loop
  useEffect(() => {
    let animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [render]);

  // Window resize handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      render();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [render]);

  // Spacebar pan toggle & Delete key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !e.repeat && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        setIsSpacePressed(true);
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        setShapes((prev) => prev.filter((s) => s.id !== selectedId));
        setSelectedId(null);
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedId, setShapes, setSelectedId]);

  // Hit Testing: Find clicked shape
  const findShapeAtPoint = (worldX, worldY) => {
    for (let i = shapes.length - 1; i >= 0; i--) {
      const s = shapes[i];
      const minX = Math.min(s.x, s.x + s.width);
      const maxX = Math.max(s.x, s.x + s.width);
      const minY = Math.min(s.y, s.y + s.height);
      const maxY = Math.max(s.y, s.y + s.height);

      if (worldX >= minX && worldX <= maxX && worldY >= minY && worldY <= maxY) {
        return s;
      }
    }
    return null;
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0 && e.button !== 1) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    isInteracting.current = true;
    dragStart.current = { x: screenX, y: screenY };

    if (isSpacePressed || activeTool === TOOLS.PAN || e.button === 1) {
      return;
    }

    const world = screenToCanvas(screenX, screenY, pan, zoom);

    // Eraser Tool
    if (activeTool === TOOLS.ERASER) {
      const target = findShapeAtPoint(world.x, world.y);
      if (target) {
        setShapes((prev) => prev.filter((s) => s.id !== target.id));
        if (selectedId === target.id) setSelectedId(null);
      }
      return;
    }

    // Select Mode
    if (activeTool === TOOLS.SELECT) {
      const clickedShape = findShapeAtPoint(world.x, world.y);
      if (clickedShape) {
        setSelectedId(clickedShape.id);
        dragStart.current = { x: world.x, y: world.y };
      } else {
        setSelectedId(null);
      }
      return;
    }

    // Text Tool (Instant creation)
    if (activeTool === TOOLS.TEXT) {
      const textVal = prompt('Enter text:');
      if (textVal) {
        const textShape = {
          id: 'shape_' + Date.now(),
          type: TOOLS.TEXT,
          x: world.x,
          y: world.y,
          width: 140,
          height: 30,
          text: textVal,
          ...currentStyle,
        };
        setShapes((prev) => [...prev, textShape]);
        setSelectedId(textShape.id);
        if (!isToolLocked) setActiveTool(TOOLS.SELECT);
      }
      isInteracting.current = false;
      return;
    }

    // New Shape Creation
    const newShapeId = 'shape_' + Date.now();
    const baseProps = {
      id: newShapeId,
      type: activeTool,
      x: world.x,
      y: world.y,
      width: 0,
      height: 0,
      ...currentStyle,
    };

    if (activeTool === TOOLS.PEN) {
      baseProps.points = [{ x: world.x, y: world.y }];
    }

    setCurrentShape(baseProps);
  };

  const handleMouseMove = (e) => {
    if (!isInteracting.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    // Viewport Pan
    if (isSpacePressed || activeTool === TOOLS.PAN || e.buttons === 4) {
      const dx = screenX - dragStart.current.x;
      const dy = screenY - dragStart.current.y;
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

    // Move Selected Shape
    if (activeTool === TOOLS.SELECT && selectedId) {
      const dx = world.x - dragStart.current.x;
      const dy = world.y - dragStart.current.y;
      setShapes((prev) =>
        prev.map((s) => (s.id === selectedId ? { ...s, x: s.x + dx, y: s.y + dy } : s))
      );
      dragStart.current = { x: world.x, y: world.y };
      return;
    }

    // Drag to resize new shape
    if (currentShape) {
      if (currentShape.type === TOOLS.PEN) {
        setCurrentShape((prev) => ({
          ...prev,
          points: [...prev.points, { x: world.x, y: world.y }],
        }));
      } else {
        setCurrentShape((prev) => ({
          ...prev,
          width: world.x - prev.x,
          height: world.y - prev.y,
        }));
      }
    }
  };

  const handleMouseUp = () => {
    isInteracting.current = false;

    if (currentShape) {
      const isTiny =
        currentShape.type !== TOOLS.PEN &&
        Math.abs(currentShape.width) < 5 &&
        Math.abs(currentShape.height) < 5;

      if (!isTiny) {
        setShapes((prev) => [...prev, currentShape]);
        setSelectedId(currentShape.id);
        if (!isToolLocked) {
          setActiveTool(TOOLS.SELECT);
        }
      }
      setCurrentShape(null);
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    zoomAtPoint(e.deltaY, e.clientX - rect.left, e.clientY - rect.top);
  };

  const getCursor = () => {
    if (isSpacePressed || activeTool === TOOLS.PAN) return 'grab';
    if (activeTool === TOOLS.SELECT) return 'default';
    if (activeTool === TOOLS.ERASER) return 'not-allowed';
    return 'crosshair';
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none"
      style={{
        cursor: getCursor(),
        backgroundColor: canvasBg?.color || '#ffffff',
      }}
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

        {/* Undo & Redo */}
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${
            canUndo
              ? 'hover:bg-zinc-100 text-zinc-600 cursor-pointer active:scale-95'
              : 'text-zinc-300 cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={16} />
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${
            canRedo
              ? 'hover:bg-zinc-100 text-zinc-600 cursor-pointer active:scale-95'
              : 'text-zinc-300 cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={16} />
        </button>
      </div>
    </div>
  );
}
