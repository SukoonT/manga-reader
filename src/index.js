//@ts-ignore
const { app, BrowserWindow, Menu, MenuItem, globalShortcut, dialog, shell, ipcMain, } = require("electron");
//@ts-ignore
const path = require("path");
// const { electron } = require("process");
const fetch = require("node-fetch");
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
async function checkforupdate() {
    let rawdata = await fetch("https://raw.githubusercontent.com/SukoonT/manga-reader/main/package.json").then((data) => data.json());
    let latestVersion = await rawdata.version.split(".");
    let currentAppVersion = app.getVersion().split(".");
    if (latestVersion[0] > currentAppVersion[0] ||
        latestVersion[1] > currentAppVersion[1]) {
        dialog
            .showMessageBox(new BrowserWindow({
            show: false,
            alwaysOnTop: true,
        }), {
            title: "New Version Available",
            message: "New Version Available.\nGo to github?",
            buttons: ["Yes", "No"],
        })
            .then((response) => {
            if (response.response === 0) {
                shell.openExternal("https://github.com/SukoonT/manga-reader");
            }
        });
    }
}
checkforupdate();
app.on("ready", () => {
    setTimeout(() => {
        createWindow();
    }, 2000);
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
