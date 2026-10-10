import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header/Header';
import { Toolbar } from './components/Toolbar/Toolbar';
import { Canvas } from './components/Canvas/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel/PropertiesPanel';
import { DocsPanel } from './components/DocsPanel/DocsPanel';
import { useCanvasViewport } from './hooks/useCanvasViewport';
import { useHistory } from './hooks/useHistory';
import { TOOLS, DEFAULT_STYLE, CANVAS_BACKGROUNDS } from './constants/tools';

const INITIAL_SHAPES = [
  {
    id: 'node_root',
    type: 'rectangle',
    x: 520,
    y: 120,
    width: 220,
    height: 60,
    strokeColor: '#1e1e1e',
    fillColor: '#fecdd3',
    strokeWidth: 2,
    strokeStyle: 'solid',
    text: 'Types of ML / System',
    fontSize: 16,
    textAlign: 'center',
  },
  {
    id: 'node_sup',
    type: 'rectangle',
    x: 320,
    y: 280,
    width: 180,
    height: 60,
    strokeColor: '#1e1e1e',
    fillColor: '#bbf7d0',
    strokeWidth: 2,
    strokeStyle: 'dashed',
    text: 'Supervised Learning',
    fontSize: 15,
    textAlign: 'center',
  },
  {
    id: 'node_unsup',
    type: 'rectangle',
    x: 550,
    y: 280,
    width: 190,
    height: 60,
    strokeColor: '#1e1e1e',
    fillColor: '#bbf7d0',
    strokeWidth: 2,
    strokeStyle: 'dashed',
    text: 'Unsupervised Learning',
    fontSize: 15,
    textAlign: 'center',
  },
  {
    id: 'node_db',
    type: 'database',
    x: 790,
    y: 260,
    width: 170,
    height: 100,
    strokeColor: '#1e1e1e',
    fillColor: '#bfdbfe',
    strokeWidth: 2,
    strokeStyle: 'solid',
    text: 'Training Dataset DB',
    fontSize: 14,
    textAlign: 'center',
  },
  {
    id: 'arrow_1',
    type: 'arrow',
    x: 560,
    y: 180,
    width: -150,
    height: 100,
    strokeColor: '#1e1e1e',
    strokeWidth: 2,
    strokeStyle: 'dashed',
  },
  {
    id: 'arrow_2',
    type: 'arrow',
    x: 630,
    y: 180,
    width: 10,
    height: 100,
    strokeColor: '#1e1e1e',
    strokeWidth: 2,
    strokeStyle: 'dashed',
  },
  {
    id: 'arrow_3',
    type: 'arrow',
    x: 700,
    y: 180,
    width: 160,
    height: 80,
    strokeColor: '#1e1e1e',
    strokeWidth: 2,
    strokeStyle: 'dashed',
  },
];

const INITIAL_DOCS = `# Technical Architecture & Concept Notes

## Overview
Visual diagrams along with structured documentation in a single desktop workspace.

- **Types of ML:** Supervised, Unsupervised, and Reinforcement models.
- **Data Persistence:** Vector embeddings & training dataset stored in DB.
- **Desktop Engine:** Electron native sandbox + React 19 + HTML5 Canvas.
`;

export default function App() {
  const {
    state: shapes,
    set: setShapes,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory(INITIAL_SHAPES);

  const [activeTool, setActiveTool] = useState(TOOLS.SELECT);
  const [selectedId, setSelectedId] = useState(null);
  const [currentStyle, setCurrentStyle] = useState(DEFAULT_STYLE);
  const [docName, setDocName] = useState('Machine Learning & Architecture');
  const [docsContent, setDocsContent] = useState(INITIAL_DOCS);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [canvasBg, setCanvasBg] = useState(CANVAS_BACKGROUNDS[0]);
  const [isToolLocked, setIsToolLocked] = useState(false);

  const viewport = useCanvasViewport();
  const selectedShape = shapes.find((s) => s.id === selectedId);

  const updateSelectedShape = (updates) => {
    if (!selectedId) return;
    setShapes((prev) =>
      prev.map((s) => (s.id === selectedId ? { ...s, ...updates } : s))
    );
    setCurrentStyle((prev) => ({ ...prev, ...updates }));
  };

  const deleteSelectedShape = () => {
    if (!selectedId) return;
    setShapes((prev) => prev.filter((s) => s.id !== selectedId));
    setSelectedId(null);
  };

  const duplicateSelectedShape = useCallback(() => {
    if (!selectedShape) return;
    const newShape = {
      ...selectedShape,
      id: 'shape_' + Date.now(),
      x: selectedShape.x + 20,
      y: selectedShape.y + 20,
    };
    setShapes((prev) => [...prev, newShape]);
    setSelectedId(newShape.id);
  }, [selectedShape, setShapes]);

  const bringToFront = () => {
    if (!selectedShape) return;
    setShapes((prev) => [...prev.filter((s) => s.id !== selectedId), selectedShape]);
  };

  const sendToBack = () => {
    if (!selectedShape) return;
    setShapes((prev) => [selectedShape, ...prev.filter((s) => s.id !== selectedId)]);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (modKey && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      if ((modKey && e.key.toLowerCase() === 'y') || (modKey && e.shiftKey && e.key.toLowerCase() === 'z')) {
        e.preventDefault();
        redo();
        return;
      }

      if (modKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateSelectedShape();
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'v': setActiveTool(TOOLS.SELECT); break;
        case 'h': setActiveTool(TOOLS.PAN); break;
        case 'r': setActiveTool(TOOLS.RECTANGLE); break;
        case 'd': if (!modKey) setActiveTool(TOOLS.DIAMOND); break;
        case 'o': setActiveTool(TOOLS.ELLIPSE); break;
        case 'a': if (!modKey) setActiveTool(TOOLS.ARROW); break;
        case 'l': setActiveTool(TOOLS.LINE); break;
        case 'p': setActiveTool(TOOLS.PEN); break;
        case 't': setActiveTool(TOOLS.TEXT); break;
        case 'e': setActiveTool(TOOLS.ERASER); break;
        case 'b': setActiveTool(TOOLS.DATABASE); break;
        case 'c': if (!modKey) setActiveTool(TOOLS.CLOUD); break;
        case 'g': setActiveTool(TOOLS.TRIANGLE); break;
        case 'x': setActiveTool(TOOLS.HEXAGON); break;
        case 'q': setActiveTool(TOOLS.PARALLELOGRAM); break;
        case 'k': setActiveTool(TOOLS.STAR); break;
        default: break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, duplicateSelectedShape]);

  const handleSave = async () => {
    const projectData = JSON.stringify(
      {
        docName,
        version: '1.0.0',
        canvasBg: canvasBg.id,
        shapes,
        docsContent,
        updatedAt: new Date().toISOString(),
      },
      null,
      2
    );

    if (window.electronAPI?.saveFile) {
      const result = await window.electronAPI.saveFile(
        projectData,
        `${docName.toLowerCase().replace(/\s+/g, '-')}.eraser`
      );
      if (result.success) {
        alert('Project saved successfully to disk!');
      }
    } else {
      const blob = new Blob([projectData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${docName.toLowerCase().replace(/\s+/g, '-')}.eraser`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleOpen = async () => {
    if (window.electronAPI?.openFile) {
      const result = await window.electronAPI.openFile();
      if (result?.success && result.content) {
        try {
          const parsed = JSON.parse(result.content);
          if (parsed.shapes) setShapes(parsed.shapes);
          if (parsed.docName) setDocName(parsed.docName);
          if (parsed.docsContent) setDocsContent(parsed.docsContent);
          if (parsed.canvasBg) {
            const foundBg = CANVAS_BACKGROUNDS.find((b) => b.id === parsed.canvasBg);
            if (foundBg) setCanvasBg(foundBg);
          }
          setSelectedId(null);
        } catch {
          alert('Failed to parse diagram project file.');
        }
      }
    } else {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.eraser,.json';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const parsed = JSON.parse(event.target.result);
            if (parsed.shapes) setShapes(parsed.shapes);
            if (parsed.docName) setDocName(parsed.docName);
            if (parsed.docsContent) setDocsContent(parsed.docsContent);
            if (parsed.canvasBg) {
              const foundBg = CANVAS_BACKGROUNDS.find((b) => b.id === parsed.canvasBg);
              if (foundBg) setCanvasBg(foundBg);
            }
            setSelectedId(null);
          } catch {
            alert('Invalid project file.');
          }
        };
        reader.readAsText(file);
      };
      input.click();
    }
  };

  const handleExportPNG = async () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');

    if (window.electronAPI?.saveImage) {
      const result = await window.electronAPI.saveImage(
        dataUrl,
        `${docName.toLowerCase().replace(/\s+/g, '-')}.png`
      );
      if (result?.success) {
        alert('Diagram exported as PNG successfully!');
      }
    } else {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${docName.toLowerCase().replace(/\s+/g, '-')}.png`;
      a.click();
    }
  };

  const handleCopyImage = async () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');

    if (window.electronAPI?.copyImageToClipboard) {
      const res = await window.electronAPI.copyImageToClipboard(dataUrl);
      if (res?.success) {
        alert('Diagram image copied to clipboard!');
      }
    } else {
      canvas.toBlob((blob) => {
        if (blob) {
          navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).then(() => {
            alert('Diagram copied to clipboard!');
          });
        }
      });
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the entire whiteboard?')) {
      setShapes([]);
      setSelectedId(null);
    }
  };

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-white select-none">
      <Header
        docName={docName}
        setDocName={setDocName}
        onSave={handleSave}
        onOpen={handleOpen}
        onExport={handleExportPNG}
        onCopyImage={handleCopyImage}
        onClear={handleClear}
        isDocsOpen={isDocsOpen}
        setIsDocsOpen={setIsDocsOpen}
        canvasBg={canvasBg}
        setCanvasBg={setCanvasBg}
      />

      <div className="flex flex-1 relative overflow-hidden w-full h-[calc(100vh-48px)]">
        {isDocsOpen && (
          <DocsPanel
            docsContent={docsContent}
            setDocsContent={setDocsContent}
            onClose={() => setIsDocsOpen(false)}
          />
        )}

        <Toolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          isToolLocked={isToolLocked}
          setIsToolLocked={setIsToolLocked}
        />

        <PropertiesPanel
          selectedShape={selectedShape}
          updateSelectedShape={updateSelectedShape}
          deleteSelectedShape={deleteSelectedShape}
          duplicateSelectedShape={duplicateSelectedShape}
          bringToFront={bringToFront}
          sendToBack={sendToBack}
          onClose={() => setSelectedId(null)}
        />

        <Canvas
          shapes={shapes}
          setShapes={setShapes}
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          currentStyle={currentStyle}
          pan={viewport.pan}
          setPan={viewport.setPan}
          zoom={viewport.zoom}
          zoomAtPoint={viewport.zoomAtPoint}
          zoomIn={viewport.zoomIn}
          zoomOut={viewport.zoomOut}
          resetView={viewport.resetView}
          canvasBg={canvasBg}
          undo={undo}
          redo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          isToolLocked={isToolLocked}
        />
      </div>
    </div>
  );
}
