// src/constants/tools.js

export const TOOLS = {
  SELECT: 'select',
  PAN: 'pan',
  RECTANGLE: 'rectangle',
  DIAMOND: 'diamond',
  ELLIPSE: 'ellipse',
  ARROW: 'arrow',
  LINE: 'line',
  PEN: 'pen',
  TEXT: 'text',
  ERASER: 'eraser',
  // Extra Tech Architecture Tools (Eraser.io)
  DATABASE: 'database',
  CLOUD: 'cloud',
};

// Excalidraw Color Palettes
export const STROKE_COLORS = [
  '#1e1e1e', // Black/Charcoal
  '#e03131', // Red
  '#2f9e44', // Green
  '#1971c2', // Blue
  '#f08c00', // Orange/Yellow
  '#868e96', // Gray
];

export const FILL_COLORS = [
  'transparent',
  '#fecdd3', // Pastel Pink / Light Red
  '#bbf7d0', // Pastel Green (Like in screenshot)
  '#bfdbfe', // Pastel Blue
  '#fef08a', // Pastel Yellow
  '#e9d5ff', // Pastel Purple
  '#f4f4f5', // Light Gray
];

export const CANVAS_BACKGROUNDS = [
  { id: 'white', label: 'Clean White', color: '#ffffff', dotColor: '#e5e7eb' },
  { id: 'cream', label: 'Warm Light', color: '#fbfbf9', dotColor: '#e2e2de' },
  { id: 'gray', label: 'Subtle Gray', color: '#f3f4f6', dotColor: '#d1d5db' },
  { id: 'dark', label: 'Dark Mode', color: '#121214', dotColor: '#27272a' },
];

export const DEFAULT_STYLE = {
  strokeColor: '#1e1e1e',
  fillColor: 'transparent',
  strokeWidth: 2,
  strokeStyle: 'solid', // 'solid' | 'dashed' | 'dotted'
  opacity: 100, // 0 - 100
  fontSize: 16,
  fontFamily: 'Inter, sans-serif',
  textAlign: 'center',
  textColor: '#1e1e1e',
};
