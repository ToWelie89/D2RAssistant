// Modules to control application life and create native browser window
const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron')
const path = require('node:path');
const fs = require('node:fs');
const { mainModule } = require('node:process');

const DEFAULT_SETTINGS = {
    "additionalRuns": [],
    "additionalItemsInDictionary": [],
    "nextHotkey": "f9",
    "stopHotkey": "f11"
};

const createWindow = (settings) => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        frame: false,
        minWidth: 200,
        width: 480,
        height: 600,
        maximizable: false,
        minimizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.webContents.session.clearCache();

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')
    mainWindow.setAspectRatio(0.8)
    // Open the DevTools.
    mainWindow.webContents.openDevTools()

    mainWindow.once('ready-to-show', () => {
        mainWindow.webContents.setZoomFactor(1)
    });

    mainWindow.on("resize", () => {
        const currentWidth = mainWindow.getSize()[0];
        const percentage = currentWidth / 480;
        mainWindow.webContents.setZoomFactor(percentage)
    });
    mainWindow.webContents.on("zoom-changed", (event, zoomDirection) => {
        console.log(event, zoomDirection)
        mainWindow.webContents.setZoomFactor(1);
    });

    mainWindow.setMenu(null);
    //mainWindow.setAlwaysOnTop(true);

    globalShortcut.register('f5', () => {
        console.log('F5 was pressed, refreshing window.');
        mainWindow.reload();
    });
    globalShortcut.register(settings.nextHotkey, () => {
        console.log('F9 was pressed, emit NEXT command.');
        mainWindow.webContents.send('sendMessage', {
            command: 'next'
        });
    });
    globalShortcut.register(settings.stopHotkey, () => {
        console.log('F11 was pressed, emit STOP command.');
        mainWindow.webContents.send('sendMessage', {
            command: 'stop'
        });
    });
    ipcMain.on('quit', () => {
        app.quit();
    });
    ipcMain.on('save-as-file', (event, data) => {
        console.log(data);

        const date = new Date(data.date);
        let month = date.getMonth() >= 10 ? date.getMonth() : `0${date.getMonth()}`;
        let day = date.getDate() >= 10 ? date.getDate() : `0${date.getDate()}`;
        let year = date.getFullYear();
        let hours = date.getHours() >= 10 ? date.getHours() : `0${date.getHours()}`;
        let minutes = date.getMinutes() >= 10 ? date.getMinutes() : `0${date.getMinutes()}`;
        let seconds = date.getSeconds() >= 10 ? date.getSeconds() : `0${date.getSeconds()}`;
        const dateAndTimestamp = `${month}-${day}-${year}---${hours}-${minutes}-${seconds}`;

        if (!fs.existsSync('logs')) {
            fs.mkdirSync('logs');
        }
        fs.writeFile(`logs/d2rassistant_log_${dateAndTimestamp}.json`, JSON.stringify(data, null, 4), err => {
            if (err) {
                console.error(err);
            }
            // file written successfully
        });
    });
}

const getSettings = async () => {
    if (fs.existsSync('settings.json')) {
        const data = fs.readFileSync('settings.json', 'utf8');
        const settings = JSON.parse(data);
        console.log(settings);
        return settings;
    } else {
        fs.writeFileSync('settings.json', DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
    const settings = await getSettings();

    createWindow(settings);
    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow(settings)
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.