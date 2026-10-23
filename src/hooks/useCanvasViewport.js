import { useState, useCallback } from 'react';

export function useCanvasViewport() {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const zoomAtPoint = useCallback((deltaY, clientX, clientY) => {
    setZoom((prevZoom) => {
      const zoomFactor = deltaY < 0 ? 1.05 : 0.95;
      const nextZoom = Math.min(Math.max(prevZoom * zoomFactor, 0.2), 3.0);

      const worldX = (clientX - pan.x) / prevZoom;
      const worldY = (clientY - pan.y) / prevZoom;

      setPan({
        x: clientX - worldX * nextZoom,
        y: clientY - worldY * nextZoom,
      });

      return nextZoom;
    });
  }, [pan]);

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(Number((z + 0.1).toFixed(2)), 3.0));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((z) => Math.max(Number((z - 0.1).toFixed(2)), 0.2));
  }, []);

  const resetView = useCallback(() => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  const fitToScreen = useCallback((shapes, screenWidth = window.innerWidth, screenHeight = window.innerHeight) => {
    if (!shapes || shapes.length === 0) {
      setPan({ x: 0, y: 0 });
      setZoom(1);
      return;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    shapes.forEach((s) => {
      const x = s.x ?? 0;
      const y = s.y ?? 0;
      const w = Math.abs(s.width ?? 0);
      const h = Math.abs(s.height ?? 0);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);

      if (s.points && Array.isArray(s.points)) {
        s.points.forEach((p) => {
          minX = Math.min(minX, p.x);
          minY = Math.min(minY, p.y);
          maxX = Math.max(maxX, p.x);
          maxY = Math.max(maxY, p.y);
        });
      }
    });

    if (minX === Infinity || maxX === -Infinity) return;

    const padding = 100;
    const contentWidth = Math.max(100, maxX - minX);
    const contentHeight = Math.max(100, maxY - minY);

    const availableWidth = Math.max(200, screenWidth - padding * 2);
    const availableHeight = Math.max(200, screenHeight - padding * 2);

    const zoomScale = Math.min(
      Math.max(Math.min(availableWidth / contentWidth, availableHeight / contentHeight), 0.25),
      2.0
    );

    const centerX = minX + contentWidth / 2;
    const centerY = minY + contentHeight / 2;

    setZoom(Number(zoomScale.toFixed(2)));
    setPan({
      x: screenWidth / 2 - centerX * zoomScale,
      y: screenHeight / 2 - centerY * zoomScale,
    });
  }, []);

  return {
    pan,
    setPan,
    zoom,
    setZoom,
    zoomAtPoint,
    zoomIn,
    zoomOut,
    resetView,
    fitToScreen,
  };
}
