// electron/preload.cjs
const { contextBridge, ipcRenderer } = require("electron");

/**
 * 🌟 Secure Preload Bridge with Deep Electron Capabilities
 */
contextBridge.exposeInMainWorld("electronAPI", {
  // Project save dialog (JSON / .eraser format)
  saveFile: (content, defaultName, filePath, saveAs) =>
    ipcRenderer.invoke("save-file", { content, defaultName, filePath, saveAs }),

  // Project open dialog
  openFile: () => ipcRenderer.invoke("open-file"),

  // Read project file by specific path (Recent files)
  readFilePath: (filePath) => ipcRenderer.invoke("read-file-path", filePath),

  // Export image dialog (PNG)
  saveImage: (dataUrl, defaultName) => ipcRenderer.invoke("save-image", { dataUrl, defaultName }),

  // Export Scalable Vector Graphic (SVG)
  saveSvg: (content, defaultName) => ipcRenderer.invoke("save-svg", { content, defaultName }),

  // Export Technical Markdown Documentation (.md)
  saveMarkdown: (content, defaultName) => ipcRenderer.invoke("save-markdown", { content, defaultName }),

  // Native System Clipboard Copy (PNG image)
  copyImageToClipboard: (dataUrl) => ipcRenderer.invoke("copy-image-to-clipboard", dataUrl),

  // Native System Clipboard Copy (Text / SVG)
  copyTextToClipboard: (text) => ipcRenderer.invoke("copy-text-to-clipboard", text),

  // Reveal File in macOS Finder / Windows Explorer
  showInFolder: (filePath) => ipcRenderer.invoke("show-in-folder", filePath),

  // Native Menu Listeners (macOS Top Menu clicks)
  onMenuNew: (callback) => ipcRenderer.on("menu-new-file", callback),
  onMenuSave: (callback) => ipcRenderer.on("menu-save-file", callback),
  onMenuSaveAs: (callback) => ipcRenderer.on("menu-save-as-file", callback),
  onMenuOpen: (callback) => ipcRenderer.on("menu-open-file", callback),
  onMenuExport: (callback) => ipcRenderer.on("menu-export-png", callback),

  // Platform info
  platform: process.platform,
});
