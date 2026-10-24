import { useRef, useEffect, useState, useCallback } from 'react';
import { Compass, ChevronDown, RotateCcw } from 'lucide-react';

const MINIMAP_WIDTH = 210;
const MINIMAP_HEIGHT = 135;

export function Minimap({
  shapes = [],
  pan = { x: 0, y: 0 },
  setPan,
  zoom = 1,
  resetView,
  canvasBg,
  containerRef,
  isInspectorOpen = false,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const canvasRef = useRef(null);
  const isDragging = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const mapGeometry = useRef({
    scale: 1,
    minX: 0,
    minY: 0,
    offsetX: 0,
    offsetY: 0,
    vpMiniX: 0,
    vpMiniY: 0,
    vpMiniW: 0,
    vpMiniH: 0,
  });

  const getContainerSize = useCallback(() => {
    if (containerRef?.current) {
      const rect = containerRef.current.getBoundingClientRect();
      return { width: rect.width || window.innerWidth, height: rect.height || window.innerHeight };
    }
    return { width: window.innerWidth, height: window.innerHeight };
  }, [containerRef]);

  // Render Minimap Frame
  const renderMinimap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isOpen) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    canvas.width = MINIMAP_WIDTH * dpr;
    canvas.height = MINIMAP_HEIGHT * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Background
    ctx.fillStyle = canvasBg?.color || '#ffffff';
    ctx.fillRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);

    // Calculate container and world bounds
    const container = getContainerSize();
    const viewWorldX = -pan.x / zoom;
    const viewWorldY = -pan.y / zoom;
    const viewWorldW = container.width / zoom;
    const viewWorldH = container.height / zoom;

    let minX = viewWorldX;
    let maxX = viewWorldX + viewWorldW;
    let minY = viewWorldY;
    let maxY = viewWorldY + viewWorldH;

    shapes.forEach((s) => {
      const sx1 = Math.min(s.x, s.x + (s.width || 0));
      const sx2 = Math.max(s.x, s.x + (s.width || 0));
      const sy1 = Math.min(s.y, s.y + (s.height || 0));
      const sy2 = Math.max(s.y, s.y + (s.height || 0));

      if (sx1 < minX) minX = sx1;
      if (sx2 > maxX) maxX = sx2;
      if (sy1 < minY) minY = sy1;
      if (sy2 > maxY) maxY = sy2;
    });

    // World Padding around bounds
    const pad = 160;
    minX -= pad;
    maxX += pad;
    minY -= pad;
    maxY += pad;

    const totalW = Math.max(maxX - minX, 400);
    const totalH = Math.max(maxY - minY, 260);

    const scale = Math.min(
      (MINIMAP_WIDTH - 16) / totalW,
      (MINIMAP_HEIGHT - 16) / totalH
    );

    const offsetX = (MINIMAP_WIDTH - totalW * scale) / 2;
    const offsetY = (MINIMAP_HEIGHT - totalH * scale) / 2;

    const toMiniX = (wx) => offsetX + (wx - minX) * scale;
    const toMiniY = (wy) => offsetY + (wy - minY) * scale;

    // Subtle grid/bounds indicator
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)';
    ctx.lineWidth = 1;
    ctx.strokeRect(offsetX, offsetY, totalW * scale, totalH * scale);

    // Draw miniature shapes
    shapes.forEach((s) => {
      const mx = toMiniX(s.x);
      const my = toMiniY(s.y);
      const mw = (s.width || 0) * scale;
      const mh = (s.height || 0) * scale;

      ctx.save();
      const fill = s.fillColor && s.fillColor !== 'transparent' ? s.fillColor : 'rgba(99, 102, 241, 0.2)';
      const stroke = s.strokeColor || '#6366f1';

      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;

      if (s.type === 'ellipse') {
        const cx = mx + mw / 2;
        const cy = my + mh / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.max(Math.abs(mw) / 2, 2), Math.max(Math.abs(mh) / 2, 2), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (s.type === 'diamond') {
        ctx.beginPath();
        ctx.moveTo(mx + mw / 2, my);
        ctx.lineTo(mx + mw, my + mh / 2);
        ctx.lineTo(mx + mw / 2, my + mh);
        ctx.lineTo(mx, my + mh / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (s.type === 'arrow' || s.type === 'line') {
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(mx + mw, my + mh);
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (s.type === 'pen' && s.points?.length > 1) {
        ctx.beginPath();
        s.points.forEach((pt, pIdx) => {
          const px = toMiniX(pt.x);
          const py = toMiniY(pt.y);
          if (pIdx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
      } else {
        // Rectangle, Database, etc.
        const rx = Math.min(mx, mx + mw);
        const ry = Math.min(my, my + mh);
        const rw = Math.max(Math.abs(mw), 2.5);
        const rh = Math.max(Math.abs(mh), 2.5);

        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(rx, ry, rw, rh, 2);
        else ctx.rect(rx, ry, rw, rh);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    });

    // Viewport Visible Indicator Box
    const vpMiniX = toMiniX(viewWorldX);
    const vpMiniY = toMiniY(viewWorldY);
    const vpMiniW = viewWorldW * scale;
    const vpMiniH = viewWorldH * scale;

    ctx.save();
    ctx.fillStyle = 'rgba(99, 102, 241, 0.16)';
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 1.8;

    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(vpMiniX, vpMiniY, vpMiniW, vpMiniH, 3);
    } else {
      ctx.rect(vpMiniX, vpMiniY, vpMiniW, vpMiniH);
    }
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Cache geometry for interaction
    mapGeometry.current = {
      scale,
      minX,
      minY,
      offsetX,
      offsetY,
      vpMiniX,
      vpMiniY,
      vpMiniW,
      vpMiniH,
    };
  }, [shapes, pan, zoom, canvasBg, isOpen, getContainerSize]);

  useEffect(() => {
    let animId = requestAnimationFrame(renderMinimap);
    return () => cancelAnimationFrame(animId);
  }, [renderMinimap]);

  // Mouse Interaction: Click or Drag Viewport
  const handleMouseDown = (e) => {
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickMiniX = e.clientX - rect.left;
    const clickMiniY = e.clientY - rect.top;

    const { scale, minX, minY, offsetX, offsetY, vpMiniX, vpMiniY, vpMiniW, vpMiniH } = mapGeometry.current;
    if (!scale) return;

    const container = getContainerSize();
    isDragging.current = true;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...pan };

    const isInsideViewport =
      clickMiniX >= vpMiniX &&
      clickMiniX <= vpMiniX + vpMiniW &&
      clickMiniY >= vpMiniY &&
      clickMiniY <= vpMiniY + vpMiniH;

    if (!isInsideViewport) {
      // Clicked outside: immediately center screen to that world point
      const targetWorldX = minX + (clickMiniX - offsetX) / scale;
      const targetWorldY = minY + (clickMiniY - offsetY) / scale;

      const newPanX = container.width / 2 - targetWorldX * zoom;
      const newPanY = container.height / 2 - targetWorldY * zoom;

      panStart.current = { x: newPanX, y: newPanY };
      setPan({ x: newPanX, y: newPanY });
    }

    const onMouseMove = (moveEvent) => {
      if (!isDragging.current) return;
      const dMiniX = moveEvent.clientX - dragStartPos.current.x;
      const dMiniY = moveEvent.clientY - dragStartPos.current.y;

      const dWorldX = dMiniX / scale;
      const dWorldY = dMiniY / scale;

      setPan({
        x: panStart.current.x - dWorldX * zoom,
        y: panStart.current.y - dWorldY * zoom,
      });
    };

    const onMouseUp = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  if (!isOpen) {
    return (
      <div
        className="absolute bottom-5 z-20 select-none transition-all duration-300 ease-out"
        style={{ right: isInspectorOpen ? '295px' : '20px' }}
      >
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-white/95 hover:bg-white text-zinc-700 hover:text-indigo-600 shadow-[0_8px_30px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04)] border border-zinc-200/90 rounded-2xl backdrop-blur-md text-xs font-semibold transition-all cursor-pointer group"
          title="Show Minimap Radar"
        >
          <Compass size={15} className="text-indigo-600 group-hover:rotate-45 transition-transform duration-300" />
          <span>Minimap</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className="absolute bottom-5 z-20 select-none bg-white/95 border border-zinc-200/90 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-all duration-300 ease-out"
      style={{ right: isInspectorOpen ? '295px' : '20px' }}
    >
      {/* Minimap Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-50/90 border-b border-zinc-100 text-[11px] font-semibold text-zinc-600">
        <div className="flex items-center gap-1.5">
          <Compass size={13} className="text-indigo-600" />
          <span>Radar View</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={resetView}
            title="Reset View"
            className="p-1 rounded-md hover:bg-zinc-200/60 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
          >
            <RotateCcw size={12} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            title="Collapse Minimap"
            className="p-1 rounded-md hover:bg-zinc-200/60 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
          >
            <ChevronDown size={13} />
          </button>
        </div>
      </div>

      {/* Minimap Canvas */}
      <div className="relative cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          style={{ width: MINIMAP_WIDTH, height: MINIMAP_HEIGHT }}
          className="block"
        />
        <div className="absolute bottom-1 left-2 pointer-events-none text-[9px] text-zinc-400 font-mono">
          Drag to Pan
        </div>
      </div>
    </div>
  );
}
