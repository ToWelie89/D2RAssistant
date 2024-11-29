// preload.js

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // from main to renderer
    sendMessage: (callback) => ipcRenderer.on('sendMessage', callback),
    // from renderer to main
    saveAsFile: (data) => ipcRenderer.send('save-as-file', data),
    saveSettings: (data) => ipcRenderer.send('save-settings', data),
    quit: () => ipcRenderer.send('quit'),
});

// All the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const dependency of ['chrome', 'node', 'electron']) {
        replaceText(`${dependency}-version`, process.versions[dependency])
    }
});