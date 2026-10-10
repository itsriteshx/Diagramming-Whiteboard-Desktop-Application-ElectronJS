// src/hooks/useCanvasViewport.js
import { useState, useCallback } from 'react';

/**
 * 🌟 Infinite Canvas Viewport (Smooth Pan & Zoom Math)
 * 
 * Mac Trackpad & Mouse Wheel Handling:
 * Mac trackpads emit high-frequency wheel events.
 * Isliye hum deltaY ko damp karte hain taaki zoom ekdum se 400% na bhaag jaye.
 */
export function useCanvasViewport() {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1); // Default 100%

  // Smooth cursor-centered zooming
  const zoomAtPoint = useCallback((deltaY, clientX, clientY) => {
    setZoom((prevZoom) => {
      // Gentle zoom factor (controlled scaling on Mac trackpad)
      const zoomFactor = deltaY < 0 ? 1.05 : 0.95;
      const nextZoom = Math.min(Math.max(prevZoom * zoomFactor, 0.2), 3.0);

      // World coordinate before zoom
      const worldX = (clientX - pan.x) / prevZoom;
      const worldY = (clientY - pan.y) / prevZoom;

      // Adjust pan to keep cursor point invariant
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

  return {
    pan,
    setPan,
    zoom,
    setZoom,
    zoomAtPoint,
    zoomIn,
    zoomOut,
    resetView,
  };
}
