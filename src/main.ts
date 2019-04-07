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

import { exists, readFile } from 'fs';
import { join } from 'path';
import { app, BrowserWindow, ipcMain, IpcMessageEvent } from 'electron';
import { Validator } from 'jsonschema';
import {
  MessageType,
  IMessage,
  IRequestLoadPresentationMessage,
  IRequestPresentShowMessage,
  IScreenUpdatedMessage,
  MonitorViews,
  IProject,
  ProjectSchema
} from './message';
import { createInternalError } from './util';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let managerWindow: Electron.BrowserWindow | null = null;

const presentationWindows: Electron.BrowserWindow[] = [];
let screenModule: Electron.Screen | null = null;
let currentProject: IProject | null = null;

function getDisplays() {
  if (screenModule === null) {
    throw createInternalError(`"screenModule" is null but shouldn't be`);
  }
  return screenModule.getAllDisplays();
}

function createManagerWindow() {
  // Create the browser window.
  managerWindow = new BrowserWindow({ width: 800, height: 600 });

  // and load the index.html of the app.
  managerWindow.loadFile(join(__dirname, 'ui', 'manager', 'manager.html'));

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

function createPresentationWindow(type: MonitorViews, x: number, y: number): void {
  // Create the browser window.
  const win = new BrowserWindow({ width: 800, height: 600, x, y });

  // and load the index.html of the app.
  const filebase = MonitorViews[type].toLowerCase();
  win.loadFile(join(__dirname, 'ui', filebase, `${filebase}.html`));

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
      throw new Error(createInternalError('Presentation window is unexepctedly missing from 2'));
    }
    presentationWindows.splice(winIndex, 1);
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  import('electron').then((mod) => {
    screenModule = mod.screen;
    createManagerWindow();
  });
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (managerWindow === null) {
    createManagerWindow();
  }
});

function handleManagerReadyMessage(): void {
  console.log('Manager Ready');
  if (managerWindow === null) {
    throw new Error(createInternalError('"managerWindow" is unexpectedly null'));
  }
  const displays = getDisplays();
  const screenUpdatedMessage: IScreenUpdatedMessage = {
    type: MessageType.ScreenUpdated,
    screens: displays.map((display) => ({
      width: Math.floor(display.bounds.width * display.scaleFactor),
      height: Math.floor(display.bounds.height * display.scaleFactor),
      id: display.id
    }))
  };
  managerWindow.webContents.send('asynchronous-message', screenUpdatedMessage);
}

function handleRequestLoadPresentation(loadMessage: IRequestLoadPresentationMessage): void {
  console.log(`Loading presentation at ${loadMessage.filename}`);
  exists(loadMessage.filename, (presentationFileExists) => {
    if (!presentationFileExists) {
      // TODO: display error in the UI
      console.error(`Presentation file ${loadMessage.filename} does not exist`);
      return;
    }
    readFile(loadMessage.filename, (err, data) => {
      if (err) {
        // TODO: display error in the UI
        console.error(`Unable to read presentation file ${loadMessage.filename}`);
        console.error(err);
        return;
      }
      let presentationProject: IProject;
      try {
        presentationProject = JSON.parse(data.toString());
      } catch (e) {
        console.error(`Could not parse project file ${loadMessage.filename}`);
        console.error(e.message);
        return;
      }
      const results = (new Validator()).validate(presentationProject, ProjectSchema);
      if (!results.valid) {
        // TODO: display error in the UI
        console.error('Invalid project file:');
        console.error(results.errors.join('\n'));
        return;
      }
      currentProject = presentationProject;
      console.log(currentProject);
    });
  });
}

function getDisplayForId(id: number): Electron.Display {
  const displays = getDisplays();
  for (const display of displays) {
    if (display.id === id) {
      return display;
    }
  }
  throw new Error(createInternalError(`Could not find display for id ${id}`));
}

function handleRequestPresentShow(presentMessage: IRequestPresentShowMessage) {
  console.log('Starting presentation');
  for (const monitorId in presentMessage.screenAssignments) {
    if (!presentMessage.screenAssignments.hasOwnProperty(monitorId)) {
      continue;
    }
    const screenAssignment = presentMessage.screenAssignments[monitorId];
    const display = getDisplayForId(parseInt(monitorId, 10));
    console.log(`Opening ${MonitorViews[screenAssignment]} view on monitor ` +
      `${monitorId} (${display.bounds.width}x${display.bounds.height})`);
    createPresentationWindow(screenAssignment, display.bounds.x, display.bounds.y);
  }
}

function handleRequestExitShow() {
  console.log('Exiting presentation');
  for (const win of presentationWindows) {
    win.close();
  }
}

ipcMain.on('asynchronous-message', (event: IpcMessageEvent, msg: IMessage) => {
  switch (msg.type) {
    case MessageType.ManagerReady:
      handleManagerReadyMessage();
      break;

    case MessageType.RequestLoadPresentation:
      handleRequestLoadPresentation(msg as IRequestLoadPresentationMessage);
      break;

    case MessageType.RequestPresentShow:
      handleRequestPresentShow(msg as IRequestPresentShowMessage);
      break;

    case MessageType.RequestExistShow:
      handleRequestExitShow();
      break;

    default:
      throw new Error(createInternalError(`Received unexpected message type ${msg.type}`));
  }
});
