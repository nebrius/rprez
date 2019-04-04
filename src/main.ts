/*
Copyright (c) Bryan Hughes <bryan@nebri.us>

This file is part of MDPrez.

MDPrez is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

MDPrez is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with MDPrez.  If not, see <http://www.gnu.org/licenses/>.
*/

import { app, BrowserWindow, ipcMain, IpcMessageEvent } from 'electron';
import { join } from 'path';
import { MessageType, IMessage, IRequestPresentShowMessage, IScreenUpdatedMessage } from './message';
import { createInternalError } from './util';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let managerWindow: Electron.BrowserWindow | null = null;
let presenterWindow: Electron.BrowserWindow | null = null;
let showWindow: Electron.BrowserWindow | null = null;
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

  presenterWindow.on('show', () => {
    if (presenterWindow === null) {
      throw new Error(createInternalError('"presenterWindow" is unexpectedly null'));
    }
    const displays = getDisplays();
    const msg: IScreenUpdatedMessage = {
      type: MessageType.ScreenUpdated,
      screens: displays.map((display) => ({ width: display.bounds.width, height: display.bounds.height }))
    };
    presenterWindow.webContents.send('asynchronous-message', msg);
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

ipcMain.on('asynchronous-message', (event: IpcMessageEvent, msg: IMessage) => {
  switch (msg.type) {
    case MessageType.RequestPresentShow:
      const displays = getDisplays();
      const presentMessage = (msg as IRequestPresentShowMessage);
      if (typeof presentMessage.speakerMonitor === 'number') {
        const speakerDisplay = displays[presentMessage.speakerMonitor];
        createSpeakerWindow(speakerDisplay.bounds.x, speakerDisplay.bounds.y);
      }
      if (typeof presentMessage.audienceMonitor === 'number') {
        const audienceDisplay = displays[presentMessage.audienceMonitor];
        createAudienceWindow(audienceDisplay.bounds.x, audienceDisplay.bounds.y);
      }
      break;

    // case 'request-slide-next':
    //   const reply = { type: 'slide-next' };
    //   if (presenterWindow) {
    //     presenterWindow.webContents.send('asynchronous-reply', reply);
    //   }
    //   if (showWindow) {
    //     showWindow.webContents.send('asynchronous-reply', reply);
    //   }
    //   break;
    default:
      throw new Error(createInternalError(`Received unexpected message type ${msg.type}`));
  }
});
