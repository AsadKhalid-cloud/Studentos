const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('studentOSDesktopAPI', {
  getBackendUrl: () => 'http://192.168.10.180:4000'
});