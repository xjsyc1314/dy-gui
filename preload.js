const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getDouyinCookies: () => ipcRenderer.invoke('get-douyin-cookies'),
    startDownload: (params) => ipcRenderer.invoke('start-download', params),
    stopDownload: () => ipcRenderer.send('stop-download'),
    onDownloadLog: (callback) => ipcRenderer.on('download-log', (event, message) => callback(message)),
    onNavigateToUrl: (callback) => ipcRenderer.on('navigate-to-url', (event, url) => callback(url)),
    selectFolder: () => ipcRenderer.invoke('select-folder'),
    onLoadSettings: (callback) => ipcRenderer.on('load-settings', (event, settings) => callback(settings)),
    saveSettings: (settings) => ipcRenderer.send('save-settings', settings),
    getDefaultDownloadPath: () => ipcRenderer.invoke('get-default-download-path'),
});