const { app, BrowserWindow, Menu, MenuItem } = require("electron");
const path = require("path");

if (require("electron-squirrel-startup")) {
    // eslint-disable-line global-require
    app.quit();
}
let mainWindow;
const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
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

    // mainWindow.webContents.openDevTools();
    // mainWindow.removeMenu();
    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
    });
};

app.on("ready", () => {
    createWindow();
    // const contextMenu = new Menu();
    // contextMenu.append(
    //     new MenuItem({
    //         label: "abc1",
    //     })
    // );
    // mainWindow.webContents.on("context-menu", (e, params) => {
    //     contextMenu.popup(mainWindow, params.x, params.y);
    // });
    // const template = [
    //     {
    //         label: "demo",
    //         submenu: [
    //             {
    //                 label: "opt1",
    //             },
    //             {
    //                 label: "opt1",
    //             },
    //         ],
    //     },
    // ];
    // const menu = Menu.buildFromTemplate(template);
    // Menu.setApplicationMenu(menu);
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
console.log(app.getPath("appData"));
