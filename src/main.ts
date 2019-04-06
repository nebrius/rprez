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

import { app, BrowserWindow, ipcMain, IpcMessageEvent } from 'electron';
import { join } from 'path';
import { MessageType, IMessage, IRequestPresentShowMessage, IScreenUpdatedMessage, MonitorViews } from './message';
import { createInternalError } from './util';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let managerWindow: Electron.BrowserWindow | null = null;

// TODO: this doesn't work for showing multiple windows of the same type. Need dynamic system
let presenterWindow: Electron.BrowserWindow | null = null;
let showWindow: Electron.BrowserWindow | null = null;
let clockWindow: Electron.BrowserWindow | null = null;

let screenModule: Electron.Screen | null = null;

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

function createSpeakerWindow(x: number, y: number) {
  // Create the browser window.
  presenterWindow = new BrowserWindow({ width: 800, height: 600, x, y });

  // and load the index.html of the app.
  presenterWindow.loadFile(join(__dirname, 'ui', 'presenter', 'presenter.html'));

  // Open the DevTools.
  presenterWindow.webContents.openDevTools();

  presenterWindow.setFullScreen(true);

  // Emitted when the window is closed.
  presenterWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    presenterWindow = null;
  });
}

function createAudienceWindow(x: number, y: number) {
  // Create the browser window.
  showWindow = new BrowserWindow({ width: 800, height: 600, x, y });

  // and load the index.html of the app.
  showWindow.loadFile(join(__dirname, 'ui', 'show', 'show.html'));

  // Open the DevTools.
  showWindow.webContents.openDevTools();

  showWindow.setFullScreen(true);

  // Emitted when the window is closed.
  showWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    showWindow = null;
  });
}

function createClockWindow(x: number, y: number) {
  // Create the browser window.
  clockWindow = new BrowserWindow({ width: 800, height: 600, x, y });

  // and load the index.html of the app.
  clockWindow.loadFile(join(__dirname, 'ui', 'clock', 'clock.html'));

  // Open the DevTools.
  clockWindow.webContents.openDevTools();

  clockWindow.setFullScreen(true);

  // Emitted when the window is closed.
  clockWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    clockWindow = null;
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
  console.log(presentMessage);
  for (const monitorId in presentMessage.screenAssignments) {
    if (!presentMessage.screenAssignments.hasOwnProperty(monitorId)) {
      continue;
    }
    const screenAssignment = presentMessage.screenAssignments[monitorId];
    const display = getDisplayForId(parseInt(monitorId, 10));
    switch (screenAssignment) {
      case MonitorViews.Audience:
        console.log(`Showing audience view on monitor ${monitorId}`);
        createAudienceWindow(display.bounds.x, display.bounds.y);
        break;
      case MonitorViews.Speaker:
        console.log(`Showing speaker view on monitor ${monitorId}`);
        createSpeakerWindow(display.bounds.x, display.bounds.y);
        break;
      case MonitorViews.Clock:
        console.log(`Showing clock view on monitor ${monitorId}`);
        createClockWindow(display.bounds.x, display.bounds.y);
        break;
      case MonitorViews.None:
        console.log(`Not showing anything on monitor ${monitorId}`);
        break;
    }
  }
}

function handleRequestExitShow() {
  if (presenterWindow) {
    presenterWindow.close();
  }
  if (showWindow) {
    showWindow.close();
  }
  if (clockWindow) {
    clockWindow.close();
  }
}

ipcMain.on('asynchronous-message', (event: IpcMessageEvent, msg: IMessage) => {
  switch (msg.type) {
    case MessageType.ManagerReady:
      handleManagerReadyMessage();
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
