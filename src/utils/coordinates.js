// src/utils/coordinates.js

/**
 * 🌟 VIVA CORE FORMULA #1:
 * Screen Coordinates (Mouse Click Pixels) ko Infinite Canvas World Coordinates mein convert karna.
 * 
 * Logic:
 * 1. Pan offset ko minus karte hain (kyunki canvas shift ho chuka hai).
 * 2. Zoom scale se divide karte hain (kyunki zoomed in canvas par 1 unit pixel se bada hota hai).
 */
export function screenToCanvas(screenX, screenY, pan, zoom) {
  return {
    x: (screenX - pan.x) / zoom,
    y: (screenY - pan.y) / zoom,
  };
}

/**
 * Canvas World Coordinates ko wapas Screen Pixels mein convert karna.
 * (Bounding box handles ya UI overlays draw karne ke kaam aata hai)
 */
export function canvasToScreen(canvasX, canvasY, pan, zoom) {
  return {
    x: canvasX * zoom + pan.x,
    y: canvasY * zoom + pan.y,
  };
}

/**
 * Grid Snapping (Optional alignment helper)
 * Har point ko nearest grid line (e.g. 20px) par snap karta hai.
 */
export function snapToGrid(value, gridSize = 20) {
  return Math.round(value / gridSize) * gridSize;
}
