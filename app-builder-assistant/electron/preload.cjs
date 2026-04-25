const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktopAPI", {
  runCommand: (command) => ipcRenderer.invoke("app:run-command", command)
});
