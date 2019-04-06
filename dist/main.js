"use strict";
/*
Copyright (c) Bryan Hughes <bryan@nebri.us>

This file is part of RPrez.

RPrez is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

RPrez is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with RPrez.  If not, see <http://www.gnu.org/licenses/>.
*/
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const message_1 = require("./message");
const util_1 = require("./util");
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let managerWindow = null;
const presentationWindows = [];
let screenModule = null;
function getDisplays() {
    if (screenModule === null) {
        throw util_1.createInternalError(`"screenModule" is null but shouldn't be`);
    }
    return screenModule.getAllDisplays();
}
function createManagerWindow() {
    // Create the browser window.
    managerWindow = new electron_1.BrowserWindow({ width: 800, height: 600 });
    // and load the index.html of the app.
    managerWindow.loadFile(path_1.join(__dirname, 'ui', 'manager', 'manager.html'));
    // Open the DevTools.
    managerWindow.webContents.openDevTools();
    managerWindow.maximize();
    // Emitted when the window is closed.
    managerWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        managerWindow = null;
    });
}
function createPresentationWindow(type, x, y) {
    // Create the browser window.
    const win = new electron_1.BrowserWindow({ width: 800, height: 600, x, y });
    // and load the index.html of the app.
    win.loadFile(path_1.join(__dirname, 'ui', 'presenter', 'presenter.html'));
    // Open the DevTools.
    win.webContents.openDevTools();
    win.setFullScreen(true);
    presentationWindows.push(win);
    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        const winIndex = presentationWindows.indexOf(win);
        if (winIndex === -1) {
            throw new Error(util_1.createInternalError('Presentation window is unexepctedly missing from 2'));
        }
        presentationWindows.splice(winIndex, 1);
    });
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.on('ready', () => {
    Promise.resolve().then(() => require('electron')).then((mod) => {
        screenModule = mod.screen;
        createManagerWindow();
    });
});
// Quit when all windows are closed.
electron_1.app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (managerWindow === null) {
        createManagerWindow();
    }
});
function handleManagerReadyMessage() {
    console.log('Manager Ready');
    if (managerWindow === null) {
        throw new Error(util_1.createInternalError('"managerWindow" is unexpectedly null'));
    }
    const displays = getDisplays();
    const screenUpdatedMessage = {
        type: message_1.MessageType.ScreenUpdated,
        screens: displays.map((display) => ({
            width: Math.floor(display.bounds.width * display.scaleFactor),
            height: Math.floor(display.bounds.height * display.scaleFactor),
            id: display.id
        }))
    };
    managerWindow.webContents.send('asynchronous-message', screenUpdatedMessage);
}
function getDisplayForId(id) {
    const displays = getDisplays();
    for (const display of displays) {
        if (display.id === id) {
            return display;
        }
    }
    throw new Error(util_1.createInternalError(`Could not find display for id ${id}`));
}
function handleRequestPresentShow(presentMessage) {
    for (const monitorId in presentMessage.screenAssignments) {
        if (!presentMessage.screenAssignments.hasOwnProperty(monitorId)) {
            continue;
        }
        const screenAssignment = presentMessage.screenAssignments[monitorId];
        const display = getDisplayForId(parseInt(monitorId, 10));
        console.log(`Opening ${message_1.MonitorViews[screenAssignment]} view on monitor ` +
            `${monitorId} (${display.bounds.width}x${display.bounds.height})`);
        createPresentationWindow(screenAssignment, display.bounds.x, display.bounds.y);
    }
}
function handleRequestExitShow() {
    for (const win of presentationWindows) {
        win.close();
    }
}
electron_1.ipcMain.on('asynchronous-message', (event, msg) => {
    switch (msg.type) {
        case message_1.MessageType.ManagerReady:
            handleManagerReadyMessage();
            break;
        case message_1.MessageType.RequestPresentShow:
            handleRequestPresentShow(msg);
            break;
        case message_1.MessageType.RequestExistShow:
            handleRequestExitShow();
            break;
        default:
            throw new Error(util_1.createInternalError(`Received unexpected message type ${msg.type}`));
    }
});
//# sourceMappingURL=main.js.map