const {
    app,
    BrowserWindow,
    Menu,
    MenuItem,
    globalShortcut,
    dialog,
    shell,
    ipcMain,
} = require("electron");
const path = require("path");
const { electron } = require("process");
require("@electron/remote/main").initialize();

if (require("electron-squirrel-startup")) {
    // eslint-disable-line global-require
    app.quit();
}
let mainWindow;
const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 940,
        minHeight: 560,
        frame: false,
        backgroundColor: "#272727",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            // preload: path.join(__dirname, 'app.js')
        },
    });
    mainWindow.maximize();
    mainWindow.loadURL(path.join(__dirname, "/index.html"));
    mainWindow.setMenuBarVisibility(false);
    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
    });
    ipcMain.on("closeApp", () => {
        mainWindow.close();
    });
    ipcMain.on("minimizeApp", () => {
        mainWindow.minimize();
    });
    ipcMain.on("maximizeApp", () => {
        mainWindow.maximize();
    });
    ipcMain.on("restoreDownApp", () => {
        mainWindow.restore();
    });
    ipcMain.on("maximizeRestoreApp", () => {
        if (mainWindow.isMaximized()) {
            mainWindow.restore();
            return;
        }
        mainWindow.maximize();
    });
    mainWindow.on("maximize", () => {
        mainWindow.webContents.send("isMaximized");
    });
    mainWindow.on("unmaximize", () => {
        mainWindow.webContents.send("isRestored");
    });
};

app.on("ready", () => {
    createWindow();
    dialog.showMessageBoxSync({
        title: "note",
        message: "This is not fully build version.\nMany features doesnt work.",
    });
    globalShortcut.register("f1", () => {
        shell.openExternal("https://github.com/SukoonT/manga-reader");
    });
    const template = [
        {
            label: "Edit",
            submenu: [
                { role: "undo" },
                { role: "redo" },
                { role: "cut" },
                { role: "copy" },
                { role: "paste" },
                { role: "pasteandmatchstyle" },
                { role: "selectall" },
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
                { role: "zoomIn", accelerator: "CommandOrControl+=" },
                { role: "zoomOut" },
                { type: "separator" },
                { role: "togglefullscreen" },
            ],
        },
    ];
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
});

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
