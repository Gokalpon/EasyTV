const path = require("path");
const { app, BrowserWindow, shell, ipcMain } = require("electron");

app.commandLine.appendSwitch("high-dpi-support", "1");
app.commandLine.appendSwitch("force-device-scale-factor", "1");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 980,
    minHeight: 720,
    backgroundColor: "#000000",
    autoHideMenuBar: true,
    title: "EasyTV Hub",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  win.loadFile(path.join(__dirname, "..", "index.html"));
  win.webContents.on("did-finish-load", () => {
    win.webContents.setZoomFactor(1);
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (event, url) => {
    const isFileNav = url.startsWith("file://");
    if (!isFileNav) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
}

ipcMain.handle("desktop:open-external", async (_event, url) => {
  if (!url || typeof url !== "string") {
    return false;
  }
  try {
    await shell.openExternal(url);
    return true;
  } catch (error) {
    return false;
  }
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
