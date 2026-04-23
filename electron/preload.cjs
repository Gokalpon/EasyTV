const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("easytvDesktop", {
  isDesktop: true,
  platform: process.platform,
  openExternal: (url) => ipcRenderer.invoke("desktop:open-external", url)
});
