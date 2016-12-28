/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

/// <reference path="typings/index.d.ts" />

"use strict";

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
let mainWindow = null;
let mainModule = require('./system/main.js');

app.commandLine.appendSwitch("--enable-experimental-web-platform-features");

let ipc = electron.ipcMain;
let template = [
    {
        label: "Application",
        submenu: [
            {label: "About Application", selector: "orderFrontStandardAboutPanel:"},
            {type: "separator"},
            {
                label: "Quit", accelerator: "Command+Q", click: () => {
                app.quit();
            }
            }
        ]
    },
    {
        label: 'File',
        submenu: [
            {label: 'New...', accelerator: "Command+N", click: () => onFileNewClicked()},
            {label: 'Open...', accelerator: "Command+O", click: () => onFileOpenClicked()},
            {type: "separator"},
            {label: 'Save', accelerator: "Command+S", click: () => onFileSaveClicked()},
            {type: "separator"},
            {label: 'SaveAs...', click: () => onFileSaveAsClicked()},
            {type: "separator"},
            {label: 'Close', click: () => onFileCloseClicked()}
        ]
    },
    {
        label: "Edit",
        submenu: [
            {label: "Undo", accelerator: "CmdOrCtrl+Z", click: () => onUndoClicked()},
            {label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", click: () => onRedoClicked()},
            {type: "separator"},
            {label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:"},
            {label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:"},
            {label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:"},
            {label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:"},
            {type: "separator"},
            {label: "Delete", click: () => onDeleteShapeClicked()},
        ]
    },
    {
        label: 'Draw',
        submenu: [
            {
                label: 'Mode',
                submenu: [
                    {label: 'move', click: () => onModeClicked('move')},
                    {label: 'draw', click: () => onModeClicked('draw')},
                    {label: 'bezier', click: () => onModeClicked('bezier')},
                ]
            },
            {
                label: 'Shape',
                submenu: [
                    {label: 'text', click: () => onAddShapeClicked('text')},
                    {label: 'rectangle', click: () => onAddShapeClicked('rect')},
                    {label: 'image', click: () => onAddShapeClicked('image')},
                    {label: 'bezier', click: () => onAddShapeClicked('bezier')}
                ]
            }
        ]
    },
    {
        label: 'Arrange',
        submenu: [
            {label: 'ToTop', click: () => onArrangeClicked('top')},
            {label: 'ToBottom', click: () => onArrangeClicked('bottom')},
            {label: 'Lock', click: () => onArrangeClicked('lock')},
            {label: 'UnLockAll', click: () => onArrangeClicked('unlock')},
            {label: 'Group', click: () => onArrangeClicked('group')},
            {label: 'Ungroup', click: () => onArrangeClicked('ungroup')},
            {
                label: 'Reload', accelerator: 'Command+R', click: function () {
                BrowserWindow.getFocusedWindow().reloadIgnoringCache();
            }
            },
            {
                label: 'Toggle DevTools', accelerator: 'Alt+Command+I', click: function () {
                BrowserWindow.getFocusedWindow().toggleDevTools();
            }
            }
        ]
    }


];

let menu = Menu.buildFromTemplate(template);
let menu_new = menu.items[1].submenu.items[0];
let menu_open = menu.items[1].submenu.items[1];
let menu_save = menu.items[1].submenu.items[3];
let menu_save_as = menu.items[1].submenu.items[5];
let menu_close = menu.items[1].submenu.items[7];
menu_new.enabled = true;
menu_open.enabled = true;
menu_save.enabled = false;
menu_save_as.enabled = false;
menu_close.enabled = false;

let main = new mainModule.Main();

function openWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.loadURL("file://" + __dirname + "/client/views/index.html");
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

function onFileNewClicked(): void {

    let cover_letter: any = {
        "type": "Canvas",
        "shapes": {
            "type": "Shapes",
            "locked": "false",
            "rectangle": {"type": "Size", "location": {"type": "Location", "x": 0, "y": 0, "miter": 0}, "size": {"type": "Size", "w": 0, "h": 0}},
            "property": {
                "type": "ShapeProperty",
                "text": "",
                "textwidth": [],
                "path": "",
                "fillstyle": {"type": "RGBAColor", "r": 0, "g": 0, "b": 0, "a": 0},
                "strokestyle": {"type": "RGBAColor", "r": 0, "g": 0, "b": 0, "a": 0},
                "strokewidth": 0,
                "font": {"style": "", "variant": "", "weight": "", "size": 0, "keyword": "sans-serif", "family": []},
                "align": "",
                "linejoin": "miter",
                "description": {}
            },
            "shapes": []
        },
        "width": 600,
        "height": 600
    };

    let data = JSON.stringify(cover_letter);

    main.new(data);

    menu_new.enabled = false;
    menu_open.enabled = false;
    menu_save.enabled = true;
    menu_save_as.enabled = true;
    menu_close.enabled = true;

    mainWindow.webContents.send('new', data);
}

function onFileOpenClicked(): void {
    main.open((error, data) => {
        if (!error) {
            menu_new.enabled = false;
            menu_open.enabled = false;
            menu_save.enabled = true;
            menu_save_as.enabled = true;
            menu_close.enabled = true;

            mainWindow.webContents.send('open', data);
        }
    });
}

function onFileCloseClicked(): void {
    main.close((error, data) => {
        if (!error) {
            menu_new.enabled = true;
            menu_open.enabled = true;
            menu_save.enabled = false;
            menu_save_as.enabled = false;
            menu_close.enabled = false;

            mainWindow.webContents.send('close', data);
        }
    })
}

function onFileSaveClicked(): void { //ping-pong pattern

    ipc.on('value', (event: any, data: string) => {
        main.save(data);
    });

    mainWindow.webContents.send('save', '');
}

function onFileSaveAsClicked(): void {  //ping-pong pattern

    ipc.on('value', (event: any, data: string) => {
        main.save_as(data);
    });

    mainWindow.webContents.send('save', '');
}

function onUndoClicked(): void {
    mainWindow.webContents.send('undo', '');
}

function onRedoClicked(): void {
    mainWindow.webContents.send('redo', '');
}

function onArrangeClicked(shape: string): void {
    mainWindow.webContents.send('arrange', shape);
}

function onAddShapeClicked(shape: string): void {
    mainWindow.webContents.send('add', shape);
}

function onDeleteShapeClicked(): void {
    mainWindow.webContents.send('delete', null);
}

function onModeClicked(mode: string): void {
    mainWindow.webContents.send('mode', mode);
}

ipc.on('status', (event: any, data: string): void => { //ping-pong
    mainWindow.webContents.send('status', {filename: main.current_file});
});

ipc.on('open', (event: any, filename: string): void => { //ping-pong
    menu_new.enabled = false;
    menu_open.enabled = false;
    menu_save.enabled = true;
    menu_save_as.enabled = true;
    menu_close.enabled = true;

    mainWindow.webContents.send('open', main.open_as(filename));
});


app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('ready', function () {
    Menu.setApplicationMenu(menu);
    openWindow();
});

app.on('gpu-process-crashed', () => {
});

app.on('login', () => {
});

app.on('certificate-error', () => {
});

app.on('web-contents-created', () => {
});

app.on('browser-window-created', () => {
});

app.on('browser-window-focus', () => {
});

app.on('browser-window-blur', () => {
});

app.on('before-quit', () => {
});

app.on('will-quit', () => {
});

app.on('quit', () => {
});


//# sourceMappingURL=index.js.map