// electron/main.cjs
const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Menu,
  shell,
  clipboard,
  nativeImage,
  Notification,
} = require("electron");
const path = require("path");
const fs = require("fs").promises;
const http = require("http");

let mainWindow = null;

/**
 * 🌟 Check if Vite dev server is running on localhost:5173
 */
function checkDevServer(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(800, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 850,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: "#ffffff", // Clean white canvas background
    title: "EraserBoard - Desktop Whiteboard",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const devUrl = "http://localhost:5173";
  const distPath = path.join(__dirname, "../dist/index.html");

  // Check if Vite dev server is running, otherwise fallback to local dist/index.html
  const isDevRunning = await checkDevServer(devUrl);

  if (isDevRunning) {
    console.log("Loading from Vite Dev Server:", devUrl);
    mainWindow.loadURL(devUrl);
  } else {
    console.log("Vite server not found, loading local production build:", distPath);
    mainWindow.loadFile(distPath).catch((err) => {
      console.error("Failed to load dist/index.html:", err);
    });
  }

  // Build Native OS Application Menu
  setupNativeMenu();
}

/**
 * 🌟 NATIVE OS MENU BAR (Heavy Electron Desktop Feature)
 */
function setupNativeMenu() {
  const isMac = process.platform === "darwin";

  const template = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: "about" },
              { type: "separator" },
              { role: "services" },
              { type: "separator" },
              { role: "hide" },
              { role: "hideOthers" },
              { role: "unhide" },
              { type: "separator" },
              { role: "quit" },
            ],
          },
        ]
      : []),
    {
      label: "File",
      submenu: [
        {
          label: "New Whiteboard",
          accelerator: "CmdOrCtrl+N",
          click: () => mainWindow?.webContents.send("menu-new-file"),
        },
        {
          label: "Open Project...",
          accelerator: "CmdOrCtrl+O",
          click: () => mainWindow?.webContents.send("menu-open-file"),
        },
        {
          label: "Save Project",
          accelerator: "CmdOrCtrl+S",
          click: () => mainWindow?.webContents.send("menu-save-file"),
        },
        {
          label: "Save Project As...",
          accelerator: "CmdOrCtrl+Shift+S",
          click: () => mainWindow?.webContents.send("menu-save-as-file"),
        },
        { type: "separator" },
        {
          label: "Export PNG Image...",
          accelerator: "CmdOrCtrl+Shift+E",
          click: () => mainWindow?.webContents.send("menu-export-png"),
        },
        { type: "separator" },
        isMac ? { role: "close" } : { role: "quit" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "zoom" },
        ...(isMac
          ? [{ type: "separator" }, { role: "front" }, { type: "separator" }, { role: "window" }]
          : [{ role: "close" }]),
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ==========================================
// 📁 NATIVE IPC HANDLERS (ELECTRON DESKTOP)
// ==========================================

// 1. Save Whiteboard Project File (.eraser / .json)
ipcMain.handle("save-file", async (event, { content, defaultName = "diagram.eraser", filePath: existingPath, saveAs = false }) => {
  let targetPath = existingPath;

  if (!targetPath || saveAs) {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: saveAs ? "Save Diagram Project As" : "Save Diagram Project",
      defaultPath: targetPath || defaultName,
      filters: [
        { name: "Eraser Whiteboard (*.eraser)", extensions: ["eraser"] },
        { name: "JSON Diagram (*.json)", extensions: ["json"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });

    if (canceled || !filePath) return { canceled: true, success: false };
    targetPath = filePath;
  }

  try {
    await fs.writeFile(targetPath, content, "utf-8");

    // Native OS Notification
    if (Notification.isSupported()) {
      new Notification({
        title: "Diagram Saved",
        body: `Project saved successfully to ${path.basename(targetPath)}`,
      }).show();
    }

    return { success: true, filePath: targetPath };
  } catch (err) {
    console.error("Save file error:", err);
    return { success: false, error: err.message };
  }
});

// 2. Open Existing Whiteboard Project File
ipcMain.handle("open-file", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: "Open Diagram Project",
    properties: ["openFile"],
    filters: [
      { name: "Diagram Files (*.eraser, *.json)", extensions: ["eraser", "json"] },
      { name: "All Files", extensions: ["*"] },
    ],
  });

  if (canceled || filePaths.length === 0) return { canceled: true, success: false };

  try {
    const content = await fs.readFile(filePaths[0], "utf-8");
    return { success: true, filePath: filePaths[0], content };
  } catch (err) {
    console.error("Open file error:", err);
    return { success: false, error: err.message };
  }
});

// 2b. Read File by Specific Path (For Recent Files)
ipcMain.handle("read-file-path", async (event, filePath) => {
  if (!filePath) return { success: false, error: "No file path provided" };
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return { success: true, filePath, content };
  } catch (err) {
    console.error("Read file error:", err);
    return { success: false, error: err.message };
  }
});

// 3. Export Canvas to PNG Image
ipcMain.handle("save-image", async (event, { dataUrl, defaultName = "architecture-diagram.png" }) => {
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: "Export Diagram as PNG",
    defaultPath: defaultName,
    filters: [{ name: "PNG Image (*.png)", extensions: ["png"] }],
  });

  if (canceled || !filePath) return { success: false };

  try {
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
    await fs.writeFile(filePath, Buffer.from(base64Data, "base64"));

    // Native Desktop Notification
    if (Notification.isSupported()) {
      new Notification({
        title: "PNG Exported",
        body: `Exported successfully to ${path.basename(filePath)}`,
      }).show();
    }

    return { success: true, filePath };
  } catch (err) {
    console.error("Export image error:", err);
    return { success: false, error: err.message };
  }
});

// 3b. Export Scalable Vector Graphic (SVG)
ipcMain.handle("save-svg", async (event, { content, defaultName = "architecture-diagram.svg" }) => {
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: "Export Scalable Vector Graphic (SVG)",
    defaultPath: defaultName,
    filters: [{ name: "Scalable Vector Graphic (*.svg)", extensions: ["svg"] }],
  });

  if (canceled || !filePath) return { success: false, canceled: true };

  try {
    await fs.writeFile(filePath, content, "utf-8");

    if (Notification.isSupported()) {
      new Notification({
        title: "SVG Exported",
        body: `Vector SVG saved to ${path.basename(filePath)}`,
      }).show();
    }

    return { success: true, filePath };
  } catch (err) {
    console.error("Export SVG error:", err);
    return { success: false, error: err.message };
  }
});

// 3c. Export Technical Markdown Documentation
ipcMain.handle("save-markdown", async (event, { content, defaultName = "architecture-notes.md" }) => {
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: "Export Markdown Documentation",
    defaultPath: defaultName,
    filters: [{ name: "Markdown Document (*.md)", extensions: ["md"] }],
  });

  if (canceled || !filePath) return { success: false, canceled: true };

  try {
    await fs.writeFile(filePath, content, "utf-8");

    if (Notification.isSupported()) {
      new Notification({
        title: "Markdown Exported",
        body: `Documentation saved to ${path.basename(filePath)}`,
      }).show();
    }

    return { success: true, filePath };
  } catch (err) {
    console.error("Export Markdown error:", err);
    return { success: false, error: err.message };
  }
});

// 4. Copy PNG to System Clipboard (Native Electron Superpower!)
ipcMain.handle("copy-image-to-clipboard", async (event, dataUrl) => {
  try {
    const image = nativeImage.createFromDataURL(dataUrl);
    clipboard.writeImage(image);

    if (Notification.isSupported()) {
      new Notification({
        title: "Copied to Clipboard",
        body: "Diagram image copied! You can paste it into Slack, Docs, etc.",
      }).show();
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 4b. Copy Text / SVG to System Clipboard
ipcMain.handle("copy-text-to-clipboard", async (event, text) => {
  try {
    clipboard.writeText(text);

    if (Notification.isSupported()) {
      new Notification({
        title: "Copied to Clipboard",
        body: "SVG vector code / Markdown copied to clipboard!",
      }).show();
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 5. Reveal File in macOS Finder / Windows Explorer
ipcMain.handle("show-in-folder", async (event, filePath) => {
  if (filePath) {
    shell.showItemInFolder(filePath);
    return { success: true };
  }
  return { success: false };
});

// ==========================================
// 🔄 APP LIFECYCLE
// ==========================================
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});