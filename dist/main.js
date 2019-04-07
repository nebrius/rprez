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
const fs_1 = require("fs");
const path_1 = require("path");
const electron_1 = require("electron");
const jsonschema_1 = require("jsonschema");
const message_1 = require("./message");
const util_1 = require("./util");
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let managerWindow = null;
const presentationWindows = [];
let screenModule = null;
let currentProject = null;
let currentSlide = 0;
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
    const filebase = message_1.MonitorViews[type].toLowerCase();
    win.loadFile(path_1.join(__dirname, 'ui', filebase, `${filebase}.html`));
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
function handleRequestLoadPresentation(loadMessage) {
    console.log(`Loading presentation at ${loadMessage.filename}`);
    fs_1.exists(loadMessage.filename, (presentationFileExists) => {
        if (!presentationFileExists) {
            // TODO: display error in the UI
            console.error(`Presentation file ${loadMessage.filename} does not exist`);
            return;
        }
        fs_1.readFile(loadMessage.filename, (err, data) => {
            if (err) {
                // TODO: display error in the UI
                console.error(`Unable to read presentation file ${loadMessage.filename}`);
                console.error(err);
                return;
            }
            let presentationProject;
            try {
                presentationProject = JSON.parse(data.toString());
            }
            catch (e) {
                // TODO: display error in the UI
                console.error(`Could not parse project file ${loadMessage.filename}`);
                console.error(e.message);
                return;
            }
            const results = (new jsonschema_1.Validator()).validate(presentationProject, message_1.ProjectSchema);
            if (!results.valid) {
                // TODO: display error in the UI
                console.error('Invalid project file:');
                console.error(results.errors.join('\n'));
                return;
            }
            if (managerWindow === null) {
                throw new Error(util_1.createInternalError('"managerWindow" is unexpectedly null'));
            }
            const projectDir = path_1.dirname(loadMessage.filename);
            presentationProject.slides = presentationProject.slides.map((slide) => ({
                slide: path_1.resolve(projectDir, slide.slide),
                notes: slide.notes && path_1.resolve(projectDir, slide.notes)
            }));
            console.log(projectDir);
            currentProject = presentationProject;
            currentSlide = 0;
            const message = {
                type: message_1.MessageType.ProjectLoaded,
                project: presentationProject
            };
            managerWindow.webContents.send('asynchronous-message', message);
        });
    });
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
    console.log('Starting presentation');
    for (const monitorId in presentMessage.screenAssignments) {
        if (!presentMessage.screenAssignments.hasOwnProperty(monitorId)) {
            continue;
        }
        const screenAssignment = presentMessage.screenAssignments[monitorId];
        const display = getDisplayForId(parseInt(monitorId, 10));
        console.log(`Opening ${message_1.MonitorViews[screenAssignment]} view on monitor ` +
            `${monitorId} (${display.bounds.width}x${display.bounds.height})`);
        createPresentationWindow(screenAssignment, display.bounds.x, display.bounds.y);
        setTimeout(sendSlideUpdatedMessage, 1000);
    }
}
function handleRequestExitShow() {
    console.log('Exiting presentation');
    for (const win of presentationWindows) {
        win.close();
    }
}
function sendSlideUpdatedMessage() {
    if (currentProject === null) {
        throw new Error(util_1.createInternalError('"currentProject" is unexpectedly null'));
    }
    const message = {
        type: message_1.MessageType.currentSlideUpdated,
        currentSlideIndex: currentSlide,
        currentSlideUrl: currentProject.slides[currentSlide].slide,
        currentNotesUrl: currentProject.slides[currentSlide].notes,
        nextSlideUrl: currentProject.slides[currentSlide + 1] && currentProject.slides[currentSlide + 1].slide
    };
    for (const win of presentationWindows) {
        win.webContents.send('asynchronous-message', message);
    }
}
function handleRequestNextSlide() {
    if (!currentProject) {
        return;
    }
    if (currentSlide < currentProject.slides.length - 1) {
        currentSlide++;
        sendSlideUpdatedMessage();
    }
}
function handleRequestPreviousSlide() {
    if (!currentProject) {
        return;
    }
    if (currentSlide > 0) {
        currentSlide--;
        sendSlideUpdatedMessage();
    }
}
electron_1.ipcMain.on('asynchronous-message', (event, msg) => {
    switch (msg.type) {
        case message_1.MessageType.ManagerReady:
            handleManagerReadyMessage();
            break;
        case message_1.MessageType.RequestLoadPresentation:
            handleRequestLoadPresentation(msg);
            break;
        case message_1.MessageType.RequestPresentShow:
            handleRequestPresentShow(msg);
            break;
        case message_1.MessageType.RequestExistShow:
            handleRequestExitShow();
            break;
        case message_1.MessageType.RequestNextSlide:
            handleRequestNextSlide();
            break;
        case message_1.MessageType.RequestPreviousSlide:
            handleRequestPreviousSlide();
            break;
        default:
            throw new Error(util_1.createInternalError(`Received unexpected message type ${msg.type}`));
    }
});
//# sourceMappingURL=main.js.map