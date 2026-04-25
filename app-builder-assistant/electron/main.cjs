const path = require("path");
const { app, BrowserWindow, ipcMain } = require("electron");

const isDev = !app.isPackaged;

function createMainWindow() {
  const window = new BrowserWindow({
    width: 1580,
    height: 980,
    minWidth: 1180,
    minHeight: 760,
    backgroundColor: "#06080f",
    autoHideMenuBar: true,
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    window.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    window.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }

  if (isDev) {
    window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  }
}

ipcMain.handle("app:run-command", async (_event, command) => {
  const now = new Date().toLocaleTimeString("tr-TR", { hour12: false });

  return [
    `[${now}] Komut alındı: ${command}`,
    `[${now}] Analiz: Uygulama planı üretildi.`,
    `[${now}] Çıktı: İşlem simülasyonu başarıyla tamamlandı.`
  ];
});

app.whenReady().then(() => {
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
