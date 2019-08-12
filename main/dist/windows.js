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
const util_1 = require("./common/util");
const message_1 = require("./common/message");
// Keep a global reference of the variouswindow objects. If you don't, the window
// will be closed automatically when the JavaScript object is garbage collected.
let managerWindow = null;
const presentationWindows = [];
let screenModule = null;
function getDisplays() {
    if (screenModule === null) {
        throw util_1.createInternalError(`"screenModule" is null but shouldn't be`);
    }
    return screenModule.getAllDisplays();
}
exports.getDisplays = getDisplays;
function getDisplayForId(id) {
    const displays = getDisplays();
    for (const display of displays) {
        if (display.id === id) {
            return display;
        }
    }
    throw new Error(util_1.createInternalError(`Could not find display for id ${id}`));
}
exports.getDisplayForId = getDisplayForId;
// Manager window methods
async function createManagerWindow() {
    const mod = await Promise.resolve().then(() => require('electron'));
    screenModule = mod.screen;
    // Create the browser window.
    managerWindow = new electron_1.BrowserWindow({ width: 800, height: 600 });
    // and load the index.html of the app.
    managerWindow.loadURL(`http://localhost:${util_1.PORT}/rprez/manager/manager.html`);
    managerWindow.maximize();
    // Emitted when the window is closed.
    managerWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        managerWindow = null;
    });
}
exports.createManagerWindow = createManagerWindow;
// Presentation window methods
function createPresentationWindow(type, x, y, developerMode) {
    // Create the browser window.
    const win = new electron_1.BrowserWindow({ width: 800, height: 600, x, y });
    // and load the index.html of the app.
    const filebase = message_1.MonitorViews[type].toLowerCase();
    win.loadURL(`http://localhost:${util_1.PORT}/rprez/${filebase}/${filebase}.html`);
    if (developerMode) {
        win.webContents.openDevTools();
        win.maximize();
    }
    else {
        win.setFullScreen(true);
    }
    win.setMenu(null);
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
exports.createPresentationWindow = createPresentationWindow;
function closePresentationWindows() {
    for (const win of presentationWindows) {
        win.close();
    }
}
exports.closePresentationWindows = closePresentationWindows;
//# sourceMappingURL=windows.js.map