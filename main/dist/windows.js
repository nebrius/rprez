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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDisplays = getDisplays;
exports.getDisplayForId = getDisplayForId;
exports.createManagerWindow = createManagerWindow;
exports.createPresentationWindow = createPresentationWindow;
exports.closePresentationWindows = closePresentationWindows;
const electron_1 = require("electron");
const util_1 = require("./common/util");
// Keep a global reference of the variouswindow objects. If you don't, the window
// will be closed automatically when the JavaScript object is garbage collected.
let managerWindow = null;
const presentationWindows = [];
let screenModule = null;
function getDisplays() {
    if (screenModule === null) {
        throw (0, util_1.createInternalError)('"screenModule" is null but shouldn\'t be');
    }
    return screenModule.getAllDisplays();
}
function getDisplayForId(id) {
    const displays = getDisplays();
    for (const display of displays) {
        if (display.id === id) {
            return display;
        }
    }
    throw new Error((0, util_1.createInternalError)(`Could not find display for id ${id}`));
}
// Manager window methods
async function createManagerWindow() {
    const mod = await Promise.resolve().then(() => __importStar(require('electron')));
    screenModule = mod.screen;
    // Create the browser window.
    managerWindow = new electron_1.BrowserWindow({ width: 800, height: 600 });
    // and load the index.html of the app.
    managerWindow.loadURL(`http://localhost:${util_1.PORT}/rprez/manager/manager.html`);
    // Emitted when the window is closed.
    managerWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        managerWindow = null;
    });
}
// Presentation window methods
function createPresentationWindow(type, x, y, developerMode, fullscreen) {
    // Create the browser window.
    const win = new electron_1.BrowserWindow({ width: 1920, height: 1080, x, y });
    // and load the index.html of the app.
    const filebase = type.toLowerCase();
    win.loadURL(`http://localhost:${util_1.PORT}/rprez/${filebase}/${filebase}.html?developerMode=${developerMode}`);
    if (developerMode) {
        win.webContents.openDevTools();
    }
    if (fullscreen) {
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
            throw new Error((0, util_1.createInternalError)('Presentation window is unexepctedly missing from 2'));
        }
        presentationWindows.splice(winIndex, 1);
    });
    win.setAspectRatio(16 / 9);
}
function closePresentationWindows() {
    for (const win of presentationWindows) {
        win.close();
    }
}
//# sourceMappingURL=windows.js.map