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
  RIGHT_TRIANGLE: 'right_triangle',
  COORDINATE_AXIS: 'coordinate_axis',
  TRAPEZOID: 'trapezoid',
  CUBE: 'cube',
  CONE: 'cone',
  LASER: 'laser',
  BROWSER: 'browser',
  UI_BUTTON: 'ui_button',
  UI_INPUT: 'ui_input',
  IMAGE_PLACEHOLDER: 'image_placeholder',
  TOGGLE_SWITCH: 'toggle_switch',
};

export const STROKE_COLORS = [
  '#0f172a', // Slate 900
  '#4f46e5', // Indigo 600
  '#0284c7', // Sky 600
  '#059669', // Emerald 600
  '#d97706', // Amber 600
  '#e11d48', // Rose 600
  '#7c3aed', // Purple 600
  '#64748b', // Slate 500
];

export const FILL_COLORS = [
  'transparent',
  '#e0e7ff', // Indigo 100
  '#e0f2fe', // Sky 100
  '#d1fae5', // Emerald 100
  '#fef3c7', // Amber 100
  '#ffe4e6', // Rose 100
  '#ede9fe', // Purple 100
  '#f1f5f9', // Slate 100
  '#0f172a', // Slate 900
];

export const CANVAS_BACKGROUNDS = [
  { id: 'white', label: 'Clean White', color: '#ffffff', dotColor: '#e5e7eb' },
  { id: 'cream', label: 'Warm Light', color: '#fbfbf9', dotColor: '#e2e2de' },
  { id: 'gray', label: 'Subtle Gray', color: '#f8fafc', dotColor: '#cbd5e1' },
  { id: 'dark', label: 'Dark Studio', color: '#09090b', dotColor: '#27272a' },
];

export const DEFAULT_STYLE = {
  strokeColor: '#0f172a',
  fillColor: 'transparent',
  strokeWidth: 2,
  strokeStyle: 'solid',
  opacity: 100,
  cornerRadius: 8,
  fontSize: 16,
  fontFamily: 'Inter, sans-serif',
  textAlign: 'center',
  textColor: '#0f172a',
};
