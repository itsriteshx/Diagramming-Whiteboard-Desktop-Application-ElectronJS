# EraserBoard — Diagramming & Whiteboard Desktop Application

[![Electron](https://img.shields.io/badge/Electron-41.x-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows%20%7C%20Linux-brightgreen)](https://github.com/itsriteshx/Diagramming-Whiteboard-Desktop-Application-ElectronJS)

> **Problem Statement (2501010578):**
> *Diagramming and Collaborative Whiteboard Desktop Application: A desktop-based visual collaboration application inspired by Eraser.io, designed for creating diagrams, system architectures, flowcharts, wireframes, and technical documentation through an interactive canvas.*

---

## 📌 Executive Overview

**EraserBoard** is a high-performance desktop diagramming and technical whiteboard studio engineered for software architects, systems engineers, and product designers. Inspired by **Eraser.io**, EraserBoard bridges the gap between **visual canvas architecture** and **technical documentation specifications** by embedding a synchronized Markdown engine directly alongside an infinite interactive canvas.

Unlike traditional sketch-based doodle whiteboards, EraserBoard provides developers with a dedicated **Dark Studio Workspace**, precision system architecture primitives, an interactive **UI Wireframing Suite**, automated engineering templates, and native desktop persistence.

---

## ✨ Key Feature Highlights

### 1. 📝 Dual-Pane Technical Documentation Engine (`DocsPanel`)
- **Live Markdown Editor**: Embedded collapsible side-panel for writing technical specifications, database schemas, API route contracts, and SLA matrices alongside diagrams.
- **Rich Markdown Formatting**: Native rendering for code blocks, GitHub-style callouts (`[!NOTE]`, `[!WARNING]`, `[!TIP]`), tables, checklist tasks, bold/italics, and blockquotes.
- **Template Synchronization**: Loading any system template automatically synchronizes comprehensive architecture documents into the Docs Panel.

### 2. ☁️ System Architecture & Cloud Engineering Suite
- **Custom Infrastructure Primitives**:
  - **Database Cylinder**: 3D perspective storage cylinder with centered label positioning.
  - **Cloud Infrastructure**: Cloud boundary container for distributed VPCs and clusters.
  - **3D Server Cube**: Perspective isometric server/compute node.
  - **3D Gateway Cone**: Microservice ingress and edge gateway primitive.
  - **X-Y Coordinate Axis**: Cartesian reference plane with directional arrowheads and tick marks.
- **Smart Magnetic Connectors**: Arrows and lines dynamically anchor to card bounds with proximity snapping.

### 3. 🖥️ Interactive UI Wireframing Suite
- **Browser Window Frame**: Desktop container with traffic light controls (*Close, Minimize, Expand*), clean title bar, and customizable URL address capsule (`https://myapp.dev`).
- **UI Action Buttons**: Rounded interactive buttons with custom fill colors, hover highlights, and bold centered labels.
- **Form Input Fields**: Styled text fields with search/placeholder text and input bounding box.
- **Image / Media Placeholders**: Blueprint wireframe boxes featuring cross guidelines and central iconography.
- **Toggle Switches**: Modern pill switches with state toggles.

### 4. 🔀 Flowcharts & Decision Logic
- **Standard Flowchart Primitives**: Decision Diamonds, Process Rectangles, Start/End Ellipses, Input/Output Parallelograms, and Right Triangles.
- **Smart Connectors**: Solid, dashed, and dotted arrow styles with vector arrowheads.

### 5. 🎨 Modern Studio Workspace & Design System
- **Dark Studio Header**: Sleek `zinc-900` gradient header with live document title rename, "Unsaved" dirty tracking, and quick action bar.
- **Bottom Floating Studio Dock**: Ergonomic tool dock with categorized popover menus:
  - 🖱️ **Pointer**: Select & Transform (`V`), Hand Pan (`H`), Laser Pointer (`W`)
  - 🔷 **Shapes**: Rectangle (`R`), Diamond (`D`), Ellipse (`O`), Triangle (`G`), Hexagon (`X`), Star (`K`), Parallelogram (`Q`), Right Triangle, Trapezoid
  - 🔀 **Flow**: Smart Arrow Connector (`A`), Straight Line (`L`)
  - 🖥️ **System Architecture**: Database (`B`), Cloud (`C`), 3D Cube, 3D Cone, Coordinate Axis
  - 📱 **Wireframe**: Browser Frame, UI Button, Form Input, Image Placeholder, Toggle Switch
  - ✏️ **Annotate**: Freehand Pen (`P`), Text Label (`T`), Eraser (`E`)
- **Right-Side Studio Inspector (`PropertiesPanel`)**:
  - Native Hex Eyedropper / Color Picker (`<input type="color">`) alongside curated modern developer palettes.
  - **Corner Radius Control**: Sharp (`0px`), Smooth (`8px`), Round (`16px`), and Pill (`999px`).
  - **Border Weights**: Thin (`1px`), Normal (`2px`), Bold (`4px`).
  - **Border Styles**: Solid, Dashed, Dotted.
  - **Typography Controls**: Font size scale (XS to XL), Text alignment (Left, Center, Right).
  - **Layer Management**: Bring Forward, Send Backward, Group (`⌘G`), Ungroup (`⇧⌘G`).

### 6. 🗺️ Infinite Canvas & Radar Minimap
- **Infinite Viewport**: Ultra-smooth zooming from `10%` to `500%`, momentum panning, and coordinate translation.
- **Radar Minimap**: Collapsible bottom-right viewport tracker showing real-time bounds and interactive drag-to-pan box.
- **Multi-Selection Alignment Bar**: Floating tool pill for 1-click object alignment (*Left, Center, Right, Top, Middle, Bottom*) and equal vertical/horizontal distribution.

### 7. 📚 Pre-Built Engineering Template Library
1. **SaaS Web App & Analytics Dashboard Wireframe**: Browser shell, navigation rail, KPI metric cards, data chart placeholder, and invite modal with full UX documentation.
2. **Microservices Cloud Architecture**: API Gateway, Auth, Orders, Payment services, Kafka event bus, Redis cache, and PostgreSQL cluster.
3. **User Authentication & Decision Logic**: End-to-end OAuth2/JWT registration decision tree with validation error branches.
4. **Cloud-Native Engineering Mindmap**: Radial architecture strategy mapping Frontend, DevOps, Microservices, and AI tracks.
5. **Automated CI/CD Delivery Pipeline**: Zero-downtime deployment pipeline with container builds, staging verification, and canary rollouts.

### 8. 💾 Desktop File System & Autosave Recovery
- **Native File Dialogs**: Direct `.eraser` / `.json` diagram export and open via Electron IPC.
- **Recent Files Menu**: Tracks recently opened projects with quick access.
- **Crash-Resilient Autosave**: Automatic local session backups with a 1-click restore banner on launch.

### 9. 📤 Multi-Format Export Engine
- **Scalable Vector SVG**: Crisp vector code export with pure SVG shapes, texts, and embedded styling.
- **High-Density Raster (PNG)**: 1x, 2x (Retina), 3x, and 4x (Ultra HD) resolution rendering with optional transparent canvas backgrounds.
- **Markdown Document Export**: Download technical documentation as standalone `.md` files.
- **Instant Clipboard Copy**: 1-click copy diagram directly as an image to paste into Slack, Notion, or GitHub.

### 10. 🌐 Live Visual Collaboration Suite (Real-Time Multi-User)
- **Zero-Configuration Mesh Synchronization**: Ultra-fast peer communication powered by HTML5 `BroadcastChannel` and room sessions with zero external setup.
- **Live Remote Cursors**: Real-time cursor tracking with participant names, distinct avatar color pills, and active tool badges moving seamlessly across pan and zoom.
- **Synchronized Canvas & Docs**: Edits to diagram shapes, colors, connectors, and Markdown technical notes propagate instantly to all connected collaborators.
- **Instant Room Codes & Sharing**: Auto-generated human-readable room IDs (`ERASER-XXXX`) with 1-click invite link and room code copying.
- **Live Canvas Reactions**: Send floating emoji pings (👍, ❤️, 🚀, 🎉, 💡, 🔥) that float over the whiteboard at cursor coordinates.
- **Multi-Window Side-by-Side Testing**: Electron IPC command to spawn a second collaborator window to test multi-user collaboration locally.

---

## ⌨️ Keyboard Shortcuts Reference

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| `V` | **Select Tool** | Select, move, and transform canvas shapes |
| `H` / `Space + Drag` | **Hand Tool** | Pan canvas freely |
| `R` | **Rectangle** | Draw standard process or container box |
| `D` | **Diamond** | Draw decision logic node |
| `O` | **Ellipse** | Draw circular start/end shape |
| `A` | **Arrow** | Smart magnetic connector arrow |
| `L` | **Line** | Straight line divider |
| `B` | **Database** | 3D Database cylinder component |
| `C` | **Cloud** | Cloud infrastructure boundary |
| `P` | **Pen** | Freehand annotation pen |
| `T` | **Text** | Add typography label |
| `E` | **Eraser** | Delete shapes on hover/click |
| `⌘K` | **Command Palette** | Global spotlight search for tools, templates, and actions |
| `⌘Z` / `⌘Y` | **Undo / Redo** | Traverse canvas history stack |
| `⌘G` / `⇧⌘G` | **Group / Ungroup** | Combine or separate multi-selected shapes |
| `⌘D` | **Duplicate** | Clone selected element with smart offset |
| `⌘S` / `⇧⌘S` | **Save / Save As** | Save native project file to disk |
| `⌘O` | **Open File** | Load diagram from local filesystem |
| `Alt + T` | **Templates** | Open architecture template library |
| `Alt + E` | **Export** | Open export dialog (PNG, SVG, MD, JSON) |
| `?` or `⌘/` | **Shortcuts Guide** | Open interactive keyboard cheatsheet |

---

## 🛠️ Technology Stack

- **Runtime & Desktop Shell**: [Electron.js 41](https://www.electronjs.org/) (macOS Cocoa / Windows Win32 / Linux GTK)
- **Frontend Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/)
- **Graphics Engine**: HTML5 Canvas 2D Context API with sub-pixel DPR scaling
- **Icons**: [Lucide React](https://lucide.dev/)
- **IPC Architecture**: Secure Context Isolation via Electron `preload.cjs`

---

## 📂 Project Architecture

```
Diagramming-Whiteboard-Desktop-Application-ElectronJS/
├── electron/
│   ├── main.cjs               # Electron main process (IPC handlers, windows, native dialogs)
│   └── preload.cjs            # Secure contextBridge exposure for renderer
├── src/
│   ├── components/
│   │   ├── Canvas/            # Infinite canvas engine, Minimap, Anchor snapping
│   │   ├── Header/            # Workspace header, File menu, Theme switcher
│   │   ├── Toolbar/           # Floating studio dock with popover sub-drawers
│   │   ├── PropertiesPanel/   # Right-side studio inspector (Colors, Borders, Radius, Layers)
│   │   ├── DocsPanel/         # Markdown technical documentation editor & renderer
│   │   ├── CommandPalette/    # Spotlight search overlay (Cmd+K)
│   │   ├── TemplatesModal/    # Architecture & Wireframe template library modal
│   │   ├── ExportModal/       # PNG, SVG, Markdown, and JSON export dialog
│   │   └── ShortcutsModal/    # Interactive keyboard shortcut keycaps guide
│   ├── constants/
│   │   ├── tools.js           # Tools registry, curated palettes, and default styles
│   │   ├── templates.js       # Pre-configured architecture & wireframe templates + docs
│   │   └── shortcuts.js       # Keyboard shortcuts mapping and categorization
│   ├── hooks/
│   │   ├── useCanvasViewport.js # Pan, Zoom, Reset, and Fit-to-screen logic
│   │   └── useHistory.js        # Undo/Redo canvas snapshot history stack
│   ├── utils/
│   │   ├── renderer.js        # 2D Canvas rendering for shapes, wireframes, and anchors
│   │   ├── coordinates.js     # Hit testing, segment distance, polygon bounding box
│   │   ├── exportCanvas.js    # Multi-scale PNG rasterization engine
│   │   ├── exportSvg.js       # Scalable vector graphics (SVG) generator
│   │   └── recentFiles.js     # LocalStorage & IPC recent file persistence
│   ├── App.jsx                # Application root container & state orchestration
│   ├── index.css              # TailwindCSS v4 design tokens & typography
│   └── main.jsx               # React entry point
└── package.json               # Dependencies and scripts configuration
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version `18.x` or higher recommended)
- `npm` or `yarn`

### 1. Clone the Repository
```bash
git clone https://github.com/itsriteshx/Diagramming-Whiteboard-Desktop-Application-ElectronJS.git
cd Diagramming-Whiteboard-Desktop-Application-ElectronJS
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server (Electron + Vite)
```bash
npm run dev:all
```
*This starts Vite HMR on `http://localhost:5173` and automatically launches the Electron desktop application window.*

### 4. Build Production Bundle
```bash
npm run build
```

---

## 📄 License
This project is open-source and available under the **MIT License**.
