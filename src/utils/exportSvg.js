import { getShapesBoundingBox } from './exportCanvas';

function escapeXml(unsafe) {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getDashArray(style) {
  if (style === 'dashed') return 'stroke-dasharray="8 8"';
  if (style === 'dotted') return 'stroke-dasharray="3 5"';
  return '';
}

export function exportShapesToSvg(shapes, options = {}) {
  const {
    padding = 24,
    transparent = false,
    canvasBg = { color: '#ffffff' },
  } = options;

  const box = getShapesBoundingBox(shapes, padding);
  const ox = box.minX;
  const oy = box.minY;

  const elements = [];

  // Background
  if (!transparent) {
    elements.push(
      `  <rect x="0" y="0" width="${box.width}" height="${box.height}" fill="${canvasBg?.color || '#ffffff'}" />`
    );
  }

  shapes.forEach((s) => {
    const stroke = s.strokeColor || '#1e1e1e';
    const fill = s.fillColor && s.fillColor !== 'transparent' ? s.fillColor : 'none';
    const sw = s.strokeWidth || 2;
    const opacity = (s.opacity !== undefined ? s.opacity : 100) / 100;
    const dash = getDashArray(s.strokeStyle);

    const x = (s.x || 0) - ox;
    const y = (s.y || 0) - oy;
    const w = s.width || 0;
    const h = s.height || 0;

    switch (s.type) {
      case 'rectangle': {
        elements.push(
          `  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" ry="8" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${dash} opacity="${opacity}" />`
        );
        break;
      }

      case 'ellipse': {
        const rx = Math.abs(w / 2);
        const ry = Math.abs(h / 2);
        const cx = x + w / 2;
        const cy = y + h / 2;
        elements.push(
          `  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${dash} opacity="${opacity}" />`
        );
        break;
      }

      case 'diamond': {
        const p1 = `${x + w / 2},${y}`;
        const p2 = `${x + w},${y + h / 2}`;
        const p3 = `${x + w / 2},${y + h}`;
        const p4 = `${x},${y + h / 2}`;
        elements.push(
          `  <polygon points="${p1} ${p2} ${p3} ${p4}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${dash} opacity="${opacity}" stroke-linejoin="round" />`
        );
        break;
      }

      case 'triangle': {
        const p1 = `${x + w / 2},${y}`;
        const p2 = `${x + w},${y + h}`;
        const p3 = `${x},${y + h}`;
        elements.push(
          `  <polygon points="${p1} ${p2} ${p3}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${dash} opacity="${opacity}" stroke-linejoin="round" />`
        );
        break;
      }

      case 'right_triangle': {
        const p1 = `${x},${y}`;
        const p2 = `${x + w},${y + h}`;
        const p3 = `${x},${y + h}`;
        elements.push(
          `  <polygon points="${p1} ${p2} ${p3}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${dash} opacity="${opacity}" stroke-linejoin="round" />`
        );
        break;
      }

      case 'hexagon': {
        const cx = x + w / 2;
        const cy = y + h / 2;
        const rx = Math.abs(w / 2);
        const ry = Math.abs(h / 2);
        const pts = [];
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i - Math.PI / 6;
          pts.push(`${cx + rx * Math.cos(a)},${cy + ry * Math.sin(a)}`);
        }
        elements.push(
          `  <polygon points="${pts.join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${dash} opacity="${opacity}" stroke-linejoin="round" />`
        );
        break;
      }

      case 'parallelogram': {
        const skew = Math.abs(w) * 0.2;
        const p1 = `${x + skew},${y}`;
        const p2 = `${x + w},${y}`;
        const p3 = `${x + w - skew},${y + h}`;
        const p4 = `${x},${y + h}`;
        elements.push(
          `  <polygon points="${p1} ${p2} ${p3} ${p4}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${dash} opacity="${opacity}" stroke-linejoin="round" />`
        );
        break;
      }

      case 'trapezoid': {
        const inset = Math.abs(w) * 0.2;
        const p1 = `${x + inset},${y}`;
        const p2 = `${x + w - inset},${y}`;
        const p3 = `${x + w},${y + h}`;
        const p4 = `${x},${y + h}`;
        elements.push(
          `  <polygon points="${p1} ${p2} ${p3} ${p4}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${dash} opacity="${opacity}" stroke-linejoin="round" />`
        );
        break;
      }

      case 'database': {
        const rx = Math.abs(w) / 2;
        const ry = Math.min(20, Math.abs(h) / 4);
        const cx = x + rx;
        const bodyD = `M ${x} ${y + ry} L ${x} ${y + h - ry} A ${rx} ${ry} 0 0 0 ${x + w} ${y + h - ry} L ${x + w} ${y + ry} A ${rx} ${ry} 0 0 0 ${x} ${y + ry} Z`;
        elements.push(
          `  <path d="${bodyD}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${dash} opacity="${opacity}" />`
        );
        elements.push(
          `  <ellipse cx="${cx}" cy="${y + ry}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}" />`
        );
        break;
      }

      case 'cloud': {
        const d = `M ${x + w * 0.25} ${y + h * 0.7} C ${x} ${y + h * 0.7} ${x} ${y + h * 0.4} ${x + w * 0.2} ${y + h * 0.35} C ${x + w * 0.15} ${y + h * 0.1} ${x + w * 0.45} ${y} ${x + w * 0.55} ${y + h * 0.2} C ${x + w * 0.7} ${y + h * 0.05} ${x + w * 0.9} ${y + h * 0.2} ${x + w * 0.85} ${y + h * 0.4} C ${x + w * 1.05} ${y + h * 0.45} ${x + w * 1.02} ${y + h * 0.75} ${x + w * 0.8} ${y + h * 0.75} Z`;
        elements.push(
          `  <path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${dash} opacity="${opacity}" />`
        );
        break;
      }

      case 'pen': {
        if (s.points && s.points.length > 1) {
          let pathD = `M ${s.points[0].x - ox} ${s.points[0].y - oy}`;
          for (let i = 1; i < s.points.length - 1; i++) {
            const mx = (s.points[i].x + s.points[i + 1].x) / 2 - ox;
            const my = (s.points[i].y + s.points[i + 1].y) / 2 - oy;
            pathD += ` Q ${s.points[i].x - ox} ${s.points[i].y - oy} ${mx} ${my}`;
          }
          const last = s.points[s.points.length - 1];
          pathD += ` L ${last.x - ox} ${last.y - oy}`;
          elements.push(
            `  <path d="${pathD}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}" />`
          );
        }
        break;
      }

      case 'arrow':
      case 'line': {
        const endX = x + w;
        const endY = y + h;
        const angle = Math.atan2(endY - y, endX - x);
        const arrowSize = 13;
        const shortenBy = s.type === 'arrow' ? arrowSize * 0.6 : 0;
        const lineEndX = endX - shortenBy * Math.cos(angle);
        const lineEndY = endY - shortenBy * Math.sin(angle);

        elements.push(
          `  <line x1="${x}" y1="${y}" x2="${lineEndX}" y2="${lineEndY}" stroke="${stroke}" stroke-width="${sw}" ${dash} stroke-linecap="round" opacity="${opacity}" />`
        );

        if (s.type === 'arrow') {
          const arrowAngle = Math.PI / 6;
          const p1x = endX - arrowSize * Math.cos(angle - arrowAngle);
          const p1y = endY - arrowSize * Math.sin(angle - arrowAngle);
          const p2x = endX - arrowSize * Math.cos(angle + arrowAngle);
          const p2y = endY - arrowSize * Math.sin(angle + arrowAngle);
          elements.push(
            `  <polygon points="${endX},${endY} ${p1x},${p1y} ${p2x},${p2y}" fill="${stroke}" stroke="${stroke}" stroke-width="1" opacity="${opacity}" />`
          );
        }
        break;
      }

      case 'text': {
        if (s.text) {
          const lines = s.text.split('\n');
          const fontSize = s.fontSize || 16;
          const textColor = s.textColor || s.strokeColor || '#1e1e1e';
          const tspans = lines
            .map(
              (line, idx) =>
                `<tspan x="${x}" dy="${idx === 0 ? 0 : fontSize * 1.3}">${escapeXml(line)}</tspan>`
            )
            .join('');
          elements.push(
            `  <text x="${x}" y="${y + fontSize}" fill="${textColor}" font-family="${escapeXml(s.fontFamily || 'Inter, sans-serif')}" font-size="${fontSize}" opacity="${opacity}">${tspans}</text>`
          );
        }
        break;
      }

      default:
        break;
    }

    // Text on non-text shapes
    if (s.text && s.type !== 'text') {
      const lines = s.text.split('\n');
      const fontSize = s.fontSize || 14;
      const textColor = s.textColor || s.strokeColor || '#1e1e1e';
      const cx = x + w / 2;
      const cy = y + h / 2 - ((lines.length - 1) * (fontSize * 1.25)) / 2;

      const tspans = lines
        .map(
          (line, idx) =>
            `<tspan x="${cx}" dy="${idx === 0 ? 0 : fontSize * 1.25}">${escapeXml(line)}</tspan>`
        )
        .join('');

      elements.push(
        `  <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" fill="${textColor}" font-family="${escapeXml(s.fontFamily || 'Inter, sans-serif')}" font-size="${fontSize}" font-weight="500">${tspans}</text>`
      );
    }
  });

  const svgContent = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg width="${box.width}" height="${box.height}" viewBox="0 0 ${box.width} ${box.height}" xmlns="http://www.w3.org/2000/svg">`,
    `  <style>`,
    `    text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }`,
    `  </style>`,
    ...elements,
    `</svg>`,
  ].join('\n');

  return {
    svgString: svgContent,
    width: box.width,
    height: box.height,
    box,
  };
}
