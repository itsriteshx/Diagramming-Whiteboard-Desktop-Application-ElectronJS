const { app, BrowserWindow } = require("electron");

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
    });

    const devUrl = "http://localhost:5173";

    const loadWithRetry = () => {
        win.loadURL(devUrl).catch(() => {
            console.log("Waiting for Vite dev server at " + devUrl + "...");
            setTimeout(loadWithRetry, 1000);
        });
    };

    loadWithRetry();
}

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