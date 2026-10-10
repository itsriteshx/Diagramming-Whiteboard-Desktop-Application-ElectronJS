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
  DATABASE: 'database',
  CLOUD: 'cloud',
  TRIANGLE: 'triangle',
  HEXAGON: 'hexagon',
  PARALLELOGRAM: 'parallelogram',
  STAR: 'star',
};

export const STROKE_COLORS = [
  '#1e1e1e',
  '#e03131',
  '#2f9e44',
  '#1971c2',
  '#f08c00',
  '#868e96',
];

export const FILL_COLORS = [
  'transparent',
  '#fecdd3',
  '#bbf7d0',
  '#bfdbfe',
  '#fef08a',
  '#e9d5ff',
  '#f4f4f5',
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
  strokeStyle: 'solid',
  opacity: 100,
  fontSize: 16,
  fontFamily: 'Inter, sans-serif',
  textAlign: 'center',
  textColor: '#1e1e1e',
};
