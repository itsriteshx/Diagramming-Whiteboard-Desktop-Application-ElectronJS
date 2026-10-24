import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Group,
  Ungroup,
  Copy,
  Trash2,
  AlignLeft,
  AlignCenterHorizontal,
  AlignRight,
  AlignStartHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignHorizontalSpaceBetween,
  AlignVerticalSpaceBetween,
  Clock,
} from 'lucide-react';
import { Header } from './components/Header/Header';
import { Toolbar } from './components/Toolbar/Toolbar';
import { Canvas } from './components/Canvas/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel/PropertiesPanel';
import { DocsPanel } from './components/DocsPanel/DocsPanel';
import { TemplatesModal } from './components/TemplatesModal/TemplatesModal';
import { ExportModal } from './components/ExportModal/ExportModal';
import { CommandPalette } from './components/CommandPalette/CommandPalette';
import { ShortcutsModal } from './components/ShortcutsModal/ShortcutsModal';
import { CollabModal } from './components/CollabModal/CollabModal';
import { useCanvasViewport } from './hooks/useCanvasViewport';
import { useHistory } from './hooks/useHistory';
import { useCollaboration } from './hooks/useCollaboration';
import { TOOLS, DEFAULT_STYLE, CANVAS_BACKGROUNDS } from './constants/tools';
import { alignShapes, distributeShapes } from './utils/coordinates';
import { getRecentFiles, addRecentFile, clearRecentFiles } from './utils/recentFiles';

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
    startBinding: { shapeId: 'node_root', anchor: 'bottom' },
    endBinding: { shapeId: 'node_sup', anchor: 'top' },
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
    startBinding: { shapeId: 'node_root', anchor: 'bottom' },
    endBinding: { shapeId: 'node_unsup', anchor: 'top' },
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
    startBinding: { shapeId: 'node_root', anchor: 'bottom' },
    endBinding: { shapeId: 'node_db', anchor: 'top' },
  },
];

const INITIAL_DOCS = `# Machine Learning System Architecture

Visual whiteboard workspace coupled with structured technical documentation.

> [!NOTE]
> Notes autosync with your diagram state and export as standalone .md specifications.

## Architecture Components

| Module | Core Responsibility | Stack |
| :--- | :--- | :--- |
| **Canvas Engine** | 2D Vector Rendering & Math Hit Detection | HTML5 Canvas 2D |
| **Desktop Shell** | Native Window & OS Integration | Electron v41 |
| **State & History** | Viewport Pan/Zoom & Infinite Undo/Redo | React 19 Hooks |

## Engineering Milestones
- [x] Canvas viewport transformation (Pan & Zoom Math)
- [x] Smart sticky flowchart connectors & magnetic anchors
- [x] Multi-selection marquee & element grouping
- [x] Alignment & distribution suite (Horiz & Vert)
- [x] Rich Markdown docs panel with live split-view preview
- [ ] Export to SVG, PDF, and high-res PNG

## Flowchart Snapping Logic
\`\`\`javascript
// Compute magnetic anchor points for node
const anchors = getShapeAnchors(node);
const nearest = findNearestAnchor(cursor.x, cursor.y, shapes);
if (nearest) {
  arrow.endBinding = { shapeId: nearest.shapeId, anchor: nearest.name };
}
\`\`\`
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
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentStyle, setCurrentStyle] = useState(DEFAULT_STYLE);
  const [docName, setDocName] = useState('Machine Learning & Architecture');
  const [docsContent, setDocsContent] = useState(INITIAL_DOCS);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [canvasBg, setCanvasBg] = useState(CANVAS_BACKGROUNDS[0]);
  const [isToolLocked, setIsToolLocked] = useState(false);
  const [isCollabOpen, setIsCollabOpen] = useState(false);

  // 🌟 Real-time Visual Collaboration Engine
  const collab = useCollaboration({
    shapes,
    docName,
    docsContent,
    canvasBg,
    setShapes,
    setDocName,
    setDocsContent,
    setCanvasBg,
  });

  // Day 10: File I/O, Autosave & Dirty State
  const [isDirty, setIsDirty] = useState(false);
  const [currentFilePath, setCurrentFilePath] = useState(null);
  const [recentFiles, setRecentFiles] = useState(() => getRecentFiles());
  const [autosaveCandidate, setAutosaveCandidate] = useState(null);
  const isFirstRender = useRef(true);

  // Track unsaved modifications
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setIsDirty(true);
  }, [shapes]);

  // Window title updater with dirty asterisk
  useEffect(() => {
    document.title = `${isDirty ? '● ' : ''}${docName} - EraserBoard`;
  }, [isDirty, docName]);

  // Check for previous autosaved session on launch
  useEffect(() => {
    try {
      const raw = localStorage.getItem('eraserboard_autosave');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.shapes) && parsed.shapes.length > 0 && parsed.timestamp) {
          if (Date.now() - parsed.timestamp < 7 * 24 * 60 * 60 * 1000) {
            setAutosaveCandidate(parsed);
          }
        }
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  // Debounced autosave backup every 1.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          'eraserboard_autosave',
          JSON.stringify({
            shapes,
            docName,
            docsContent,
            canvasBg: canvasBg.id,
            timestamp: Date.now(),
          })
        );
      } catch {
        // Ignore storage quota
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [shapes, docName, docsContent, canvasBg]);

  const restoreAutosave = () => {
    if (!autosaveCandidate) return;
    if (autosaveCandidate.shapes) setShapes(autosaveCandidate.shapes);
    if (autosaveCandidate.docName) setDocName(autosaveCandidate.docName);
    if (autosaveCandidate.docsContent) setDocsContent(autosaveCandidate.docsContent);
    if (autosaveCandidate.canvasBg) {
      const foundBg = CANVAS_BACKGROUNDS.find((b) => b.id === autosaveCandidate.canvasBg);
      if (foundBg) setCanvasBg(foundBg);
    }
    setAutosaveCandidate(null);
    setIsDirty(true);
  };

  const dismissAutosave = () => {
    setAutosaveCandidate(null);
  };

  const viewport = useCanvasViewport();
  const selectedShapes = shapes.filter((s) => selectedIds.includes(s.id));
  const selectedShape = selectedShapes[0] || null;
  const selectedId = selectedIds[0] || null;
  const setSelectedId = (id) => setSelectedIds(id ? [id] : []);

  const isSelectionGrouped =
    selectedShapes.length > 1 &&
    selectedShapes.every((s) => s.groupId && s.groupId === selectedShapes[0].groupId);

  const updateSelectedShape = (updates) => {
    if (selectedIds.length === 0) return;
    setShapes((prev) =>
      prev.map((s) => (selectedIds.includes(s.id) ? { ...s, ...updates } : s))
    );
    setCurrentStyle((prev) => ({ ...prev, ...updates }));
  };

  const deleteSelectedShape = useCallback(() => {
    if (selectedIds.length === 0) return;
    setShapes((prev) => prev.filter((s) => !selectedIds.includes(s.id)));
    setSelectedIds([]);
  }, [selectedIds, setShapes]);

  const duplicateSelectedShape = useCallback(() => {
    if (selectedIds.length === 0) return;

    const groupMapping = {};
    const newShapes = [];
    const newIds = [];

    shapes.forEach((s) => {
      if (selectedIds.includes(s.id)) {
        let newGroupId = undefined;
        if (s.groupId) {
          if (!groupMapping[s.groupId]) {
            groupMapping[s.groupId] = 'grp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
          }
          newGroupId = groupMapping[s.groupId];
        }

        const newId = 'shape_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        const dup = {
          ...s,
          id: newId,
          x: s.x + 24,
          y: s.y + 24,
          ...(newGroupId ? { groupId: newGroupId } : {}),
        };
        newShapes.push(dup);
        newIds.push(newId);
      }
    });

    setShapes((prev) => [...prev, ...newShapes]);
    setSelectedIds(newIds);
  }, [selectedIds, shapes, setShapes]);

  const groupSelectedShapes = useCallback(() => {
    if (selectedIds.length <= 1) return;
    const newGroupId = 'grp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    setShapes((prev) =>
      prev.map((s) => (selectedIds.includes(s.id) ? { ...s, groupId: newGroupId } : s))
    );
  }, [selectedIds, setShapes]);

  const ungroupSelectedShapes = useCallback(() => {
    if (selectedIds.length === 0) return;
    setShapes((prev) =>
      prev.map((s) => {
        if (!selectedIds.includes(s.id)) return s;
        const copy = { ...s };
        delete copy.groupId;
        return copy;
      })
    );
  }, [selectedIds, setShapes]);

  const bringToFront = () => {
    if (selectedIds.length === 0) return;
    const activeSet = new Set(selectedIds);
    const nonSelected = shapes.filter((s) => !activeSet.has(s.id));
    const selected = shapes.filter((s) => activeSet.has(s.id));
    setShapes([...nonSelected, ...selected]);
  };

  const sendToBack = () => {
    if (selectedIds.length === 0) return;
    const activeSet = new Set(selectedIds);
    const nonSelected = shapes.filter((s) => !activeSet.has(s.id));
    const selected = shapes.filter((s) => activeSet.has(s.id));
    setShapes([...selected, ...nonSelected]);
  };

  const selectAll = useCallback(() => {
    setSelectedIds(shapes.map((s) => s.id));
  }, [shapes]);

  const deselectAll = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const handleAlign = useCallback(
    (alignment) => {
      if (selectedIds.length < 2) return;
      setShapes((prev) => alignShapes(prev, selectedIds, alignment));
    },
    [selectedIds, setShapes]
  );

  const handleDistribute = useCallback(
    (direction) => {
      if (selectedIds.length < 3) return;
      setShapes((prev) => distributeShapes(prev, selectedIds, direction));
    },
    [selectedIds, setShapes]
  );

  const handleNew = useCallback(() => {
    if (isDirty) {
      const confirmNew = window.confirm(
        'You have unsaved changes on this whiteboard. Start a new diagram anyway?'
      );
      if (!confirmNew) return;
    }
    setShapes([]);
    setDocName('Untitled Diagram');
    setDocsContent('');
    setCurrentFilePath(null);
    setIsDirty(false);
    setSelectedIds([]);
    viewport.resetView();
  }, [isDirty, setShapes, viewport]);

  const handleSave = useCallback(async () => {
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
        `${docName.toLowerCase().replace(/\s+/g, '-')}.eraser`,
        currentFilePath,
        false
      );
      if (result?.success && result.filePath) {
        setCurrentFilePath(result.filePath);
        setIsDirty(false);
        const updated = addRecentFile(result.filePath, docName);
        setRecentFiles(updated);
      }
    } else {
      const blob = new Blob([projectData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${docName.toLowerCase().replace(/\s+/g, '-')}.eraser`;
      a.click();
      URL.revokeObjectURL(url);
      setIsDirty(false);
    }
  }, [docName, canvasBg.id, shapes, docsContent, currentFilePath]);

  const handleSaveAs = useCallback(async () => {
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
        `${docName.toLowerCase().replace(/\s+/g, '-')}.eraser`,
        currentFilePath,
        true
      );
      if (result?.success && result.filePath) {
        setCurrentFilePath(result.filePath);
        setIsDirty(false);
        const updated = addRecentFile(result.filePath, docName);
        setRecentFiles(updated);
      }
    } else {
      handleSave();
    }
  }, [docName, canvasBg.id, shapes, docsContent, currentFilePath, handleSave]);

  const handleOpen = useCallback(async () => {
    if (isDirty) {
      const confirmOpen = window.confirm(
        'You have unsaved changes. Opening another file will replace current whiteboard. Continue?'
      );
      if (!confirmOpen) return;
    }

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
          if (result.filePath) {
            setCurrentFilePath(result.filePath);
            const updated = addRecentFile(result.filePath, parsed.docName || docName);
            setRecentFiles(updated);
          }
          setIsDirty(false);
          setSelectedIds([]);
          viewport.resetView();
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
            setIsDirty(false);
            setSelectedIds([]);
            viewport.resetView();
          } catch {
            alert('Invalid project file.');
          }
        };
        reader.readAsText(file);
      };
      input.click();
    }
  }, [isDirty, docName, setShapes, viewport]);

  const handleOpenRecent = useCallback(async (filePath) => {
    if (!filePath) return;
    if (isDirty) {
      const confirmOpen = window.confirm(
        'You have unsaved changes. Opening another project will replace your current whiteboard. Continue?'
      );
      if (!confirmOpen) return;
    }

    if (window.electronAPI?.readFilePath) {
      const result = await window.electronAPI.readFilePath(filePath);
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
          setCurrentFilePath(filePath);
          setIsDirty(false);
          setSelectedIds([]);
          const updated = addRecentFile(filePath, parsed.docName || docName);
          setRecentFiles(updated);
          viewport.resetView();
        } catch {
          alert('Failed to parse recent project file.');
        }
      } else {
        alert('Could not find file at: ' + filePath);
      }
    }
  }, [isDirty, docName, setShapes, viewport]);

  const handleClearRecent = useCallback(() => {
    clearRecentFiles();
    setRecentFiles([]);
  }, []);

  const handleOpenExport = useCallback(() => {
    setIsExportOpen(true);
  }, []);

  // Listen to native macOS/Windows top menu actions
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onMenuNew?.(handleNew);
      window.electronAPI.onMenuSave?.(handleSave);
      window.electronAPI.onMenuSaveAs?.(handleSaveAs);
      window.electronAPI.onMenuOpen?.(handleOpen);
      window.electronAPI.onMenuExport?.(handleOpenExport);
    }
  }, [handleNew, handleSave, handleSaveAs, handleOpen, handleOpenExport]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (modKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
        return;
      }

      if (e.key === '?' || (modKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
        return;
      }

      if (isPaletteOpen || isShortcutsOpen) return;

      if (e.altKey && e.shiftKey) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); handleAlign('left'); return; }
        if (e.key === 'ArrowRight') { e.preventDefault(); handleAlign('right'); return; }
        if (e.key === 'ArrowUp') { e.preventDefault(); handleAlign('top'); return; }
        if (e.key === 'ArrowDown') { e.preventDefault(); handleAlign('bottom'); return; }
        if (e.key.toLowerCase() === 'c') { e.preventDefault(); handleAlign('center'); return; }
        if (e.key.toLowerCase() === 'm') { e.preventDefault(); handleAlign('middle'); return; }
        if (e.key.toLowerCase() === 'h') { e.preventDefault(); handleDistribute('horizontal'); return; }
        if (e.key.toLowerCase() === 'v') { e.preventDefault(); handleDistribute('vertical'); return; }
      }

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

      if (modKey && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handleOpenExport();
        return;
      }

      if (modKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (e.shiftKey) {
          handleSaveAs();
        } else {
          handleSave();
        }
        return;
      }

      if (modKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleOpen();
        return;
      }

      if (modKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNew();
        return;
      }

      if (modKey && e.key.toLowerCase() === 'a' && !e.shiftKey) {
        e.preventDefault();
        selectAll();
        return;
      }

      if (modKey && e.key.toLowerCase() === 'g' && !e.shiftKey) {
        e.preventDefault();
        groupSelectedShapes();
        return;
      }

      if (modKey && e.key.toLowerCase() === 'g' && e.shiftKey) {
        e.preventDefault();
        ungroupSelectedShapes();
        return;
      }

      if (e.key === 'Escape') {
        deselectAll();
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
        case 'g': if (!modKey) setActiveTool(TOOLS.TRIANGLE); break;
        case 'x': setActiveTool(TOOLS.HEXAGON); break;
        case 'q': setActiveTool(TOOLS.PARALLELOGRAM); break;
        case 'k': if (!modKey) setActiveTool(TOOLS.STAR); break;
        default: break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, duplicateSelectedShape, groupSelectedShapes, ungroupSelectedShapes, selectAll, deselectAll, handleAlign, handleDistribute, handleSave, handleSaveAs, handleOpen, handleNew, handleOpenExport, isPaletteOpen, isShortcutsOpen]);

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

  const handleLoadTemplate = (template, mode = 'replace') => {
    if (!template || !template.shapes) return;

    const idMap = {};
    template.shapes.forEach((s) => {
      idMap[s.id] = 'shape_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    });

    if (mode === 'replace') {
      const newShapes = template.shapes.map((s) => ({
        ...s,
        id: idMap[s.id] || s.id,
        startBinding: s.startBinding
          ? { ...s.startBinding, shapeId: idMap[s.startBinding.shapeId] || s.startBinding.shapeId }
          : null,
        endBinding: s.endBinding
          ? { ...s.endBinding, shapeId: idMap[s.endBinding.shapeId] || s.endBinding.shapeId }
          : null,
      }));

      setShapes(newShapes);
      setSelectedIds([]);
      if (template.docs) setDocsContent(template.docs);
      if (template.title) setDocName(template.title);
      setIsDirty(true);
      setCurrentFilePath(null);
      viewport.resetView();
      setIsTemplatesOpen(false);
      return;
    }

    if (mode === 'append') {
      let offsetX = 0;
      let offsetY = 0;

      if (shapes.length > 0) {
        const maxX = Math.max(...shapes.map((s) => (s.x || 0) + (s.width || 0)));
        const minTplX = Math.min(...template.shapes.map((s) => s.x || 0));
        offsetX = Math.max(0, maxX + 100 - minTplX);
      }

      const newShapes = template.shapes.map((s) => ({
        ...s,
        id: idMap[s.id] || s.id,
        x: (s.x || 0) + offsetX,
        y: (s.y || 0) + offsetY,
        startBinding: s.startBinding
          ? { ...s.startBinding, shapeId: idMap[s.startBinding.shapeId] || s.startBinding.shapeId }
          : null,
        endBinding: s.endBinding
          ? { ...s.endBinding, shapeId: idMap[s.endBinding.shapeId] || s.endBinding.shapeId }
          : null,
      }));

      setShapes((prev) => [...prev, ...newShapes]);
      setSelectedIds(newShapes.map((s) => s.id));
      if (template.docs) {
        setDocsContent((prev) =>
          prev ? `${prev}\n\n---\n\n${template.docs}` : template.docs
        );
      }
      setIsDirty(true);
      setIsTemplatesOpen(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the entire whiteboard?')) {
      setShapes([]);
      setSelectedIds([]);
      setIsDirty(true);
    }
  };

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-white select-none">
      <Header
        docName={docName}
        setDocName={(name) => {
          setDocName(name);
          setIsDirty(true);
        }}
        isDirty={isDirty}
        currentFilePath={currentFilePath}
        onNew={handleNew}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onOpen={handleOpen}
        onOpenRecent={handleOpenRecent}
        recentFiles={recentFiles}
        onClearRecent={handleClearRecent}
        onExport={handleOpenExport}
        onCopyImage={handleCopyImage}
        onClear={handleClear}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenCommandPalette={() => setIsPaletteOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenCollab={() => setIsCollabOpen(true)}
        isCollabConnected={collab.isConnected}
        collabPeersCount={collab.peersCount}
        collabRoomId={collab.roomId}
        isDocsOpen={isDocsOpen}
        setIsDocsOpen={setIsDocsOpen}
        canvasBg={canvasBg}
        setCanvasBg={(bg) => {
          setCanvasBg(bg);
          setIsDirty(true);
        }}
      />

      {/* Autosave Recovery Banner */}
      {autosaveCandidate && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/95 text-white shadow-2xl border border-zinc-700/80 rounded-2xl px-4 py-2 flex items-center gap-3 backdrop-blur-md text-xs animate-in fade-in slide-in-from-top-2 duration-150 select-none">
          <div className="flex items-center gap-1.5 text-amber-400 font-medium shrink-0">
            <Clock size={14} />
            <span>Autosave Backup Found</span>
          </div>
          <span className="text-zinc-300 leading-none">
            Recover session from <strong>{new Date(autosaveCandidate.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>?
          </span>
          <div className="flex items-center gap-1.5 ml-1 shrink-0">
            <button
              onClick={restoreAutosave}
              className="h-6.5 px-3 flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs leading-none shadow-xs transition-colors cursor-pointer"
            >
              Restore
            </button>
            <button
              onClick={dismissAutosave}
              className="h-6.5 px-2.5 flex items-center justify-center rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs leading-none transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 relative overflow-hidden w-full h-[calc(100vh-48px)]">
        {isDocsOpen && (
          <DocsPanel
            docsContent={docsContent}
            setDocsContent={setDocsContent}
            docName={docName}
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
          selectedShapes={selectedShapes}
          updateSelectedShape={updateSelectedShape}
          deleteSelectedShape={deleteSelectedShape}
          duplicateSelectedShape={duplicateSelectedShape}
          bringToFront={bringToFront}
          sendToBack={sendToBack}
          groupSelectedShapes={groupSelectedShapes}
          ungroupSelectedShapes={ungroupSelectedShapes}
          isSelectionGrouped={isSelectionGrouped}
          onAlign={handleAlign}
          onDistribute={handleDistribute}
          onClose={() => setSelectedIds([])}
        />

        <Canvas
          shapes={shapes}
          setShapes={setShapes}
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
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
          peers={collab.peers}
          reactions={collab.reactions}
          onSendCursor={collab.sendCursor}
        />

        {selectedIds.length > 1 && (
          <div className="absolute bottom-22 left-1/2 -translate-x-1/2 z-30 bg-zinc-900/95 text-white shadow-2xl border border-zinc-700/80 rounded-2xl px-3.5 py-2 flex items-center gap-2 backdrop-blur-md select-none text-xs animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center gap-2 font-medium text-zinc-200 pr-2.5 border-r border-zinc-700">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span>{isSelectionGrouped ? `Grouped (${selectedShapes.length})` : `${selectedShapes.length} items`}</span>
            </div>

            {isSelectionGrouped ? (
              <button
                onClick={ungroupSelectedShapes}
                title="Ungroup (Cmd+Shift+G)"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                <Ungroup size={14} className="text-indigo-400" />
                <span>Ungroup</span>
                <span className="text-[10px] text-zinc-500 font-mono">⇧⌘G</span>
              </button>
            ) : (
              <button
                onClick={groupSelectedShapes}
                title="Group (Cmd+G)"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors cursor-pointer"
              >
                <Group size={14} />
                <span>Group</span>
                <span className="text-[10px] text-indigo-200 font-mono">⌘G</span>
              </button>
            )}

            <div className="flex items-center gap-0.5 px-1 py-0.5 bg-zinc-800/80 rounded-xl border border-zinc-700/50">
              <button
                onClick={() => handleAlign('left')}
                title="Align Left (Alt+Shift+Left)"
                className="w-6 h-6 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                <AlignLeft size={13} />
              </button>
              <button
                onClick={() => handleAlign('center')}
                title="Align Center Horizontal (Alt+Shift+C)"
                className="w-6 h-6 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                <AlignCenterHorizontal size={13} />
              </button>
              <button
                onClick={() => handleAlign('right')}
                title="Align Right (Alt+Shift+Right)"
                className="w-6 h-6 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                <AlignRight size={13} />
              </button>
              <div className="w-px h-3.5 bg-zinc-700 mx-0.5" />
              <button
                onClick={() => handleAlign('top')}
                title="Align Top (Alt+Shift+Up)"
                className="w-6 h-6 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                <AlignStartHorizontal size={13} />
              </button>
              <button
                onClick={() => handleAlign('middle')}
                title="Align Middle Vertical (Alt+Shift+M)"
                className="w-6 h-6 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                <AlignCenterVertical size={13} />
              </button>
              <button
                onClick={() => handleAlign('bottom')}
                title="Align Bottom (Alt+Shift+Down)"
                className="w-6 h-6 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                <AlignEndHorizontal size={13} />
              </button>
              {selectedShapes.length >= 3 && (
                <>
                  <div className="w-px h-3.5 bg-zinc-700 mx-0.5" />
                  <button
                    onClick={() => handleDistribute('horizontal')}
                    title="Distribute Horizontally (Alt+Shift+H)"
                    className="w-6 h-6 flex items-center justify-center rounded-lg text-zinc-400 hover:text-indigo-400 hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    <AlignHorizontalSpaceBetween size={13} />
                  </button>
                  <button
                    onClick={() => handleDistribute('vertical')}
                    title="Distribute Vertically (Alt+Shift+V)"
                    className="w-6 h-6 flex items-center justify-center rounded-lg text-zinc-400 hover:text-indigo-400 hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    <AlignVerticalSpaceBetween size={13} />
                  </button>
                </>
              )}
            </div>

            <button
              onClick={duplicateSelectedShape}
              title="Duplicate (Cmd+D)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <Copy size={13} />
              <span>Duplicate</span>
            </button>

            <button
              onClick={deleteSelectedShape}
              title="Delete (Backspace)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 hover:text-red-200 transition-colors cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onLoadTemplate={handleLoadTemplate}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        shapes={shapes}
        selectedIds={selectedIds}
        docName={docName}
        docsContent={docsContent}
        canvasBg={canvasBg}
      />

      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        setActiveTool={setActiveTool}
        onNew={handleNew}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onOpen={handleOpen}
        onExport={handleOpenExport}
        onClear={handleClear}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onLoadTemplate={handleLoadTemplate}
        isDocsOpen={isDocsOpen}
        setIsDocsOpen={setIsDocsOpen}
        canvasBg={canvasBg}
        setCanvasBg={(bg) => {
          setCanvasBg(bg);
          setIsDirty(true);
        }}
        zoomIn={viewport.zoomIn}
        zoomOut={viewport.zoomOut}
        resetView={viewport.resetView}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenCollab={() => setIsCollabOpen(true)}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <CollabModal
        isOpen={isCollabOpen}
        onClose={() => setIsCollabOpen(false)}
        roomId={collab.roomId}
        isConnected={collab.isConnected}
        localUser={collab.localUser}
        peers={collab.peers}
        peersCount={collab.peersCount}
        onConnect={collab.connectToRoom}
        onLeave={collab.leaveRoom}
        onUpdateProfile={collab.updateProfile}
        onSendReaction={(emoji) => {
          const cx = (-viewport.pan.x + window.innerWidth / 2) / viewport.zoom;
          const cy = (-viewport.pan.y + window.innerHeight / 2) / viewport.zoom;
          collab.broadcastReaction(emoji, cx, cy);
        }}
      />
    </div>
  );
}
