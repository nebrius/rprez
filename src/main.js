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

const { app, BrowserWindow, ipcMain, IpcMessageEvent } = require('electron');
const { join } = require('path');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let managerWindow;
let presenterWindow;
let showWindow;

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

function createPresenterWindow() {
  // Create the browser window.
  presenterWindow = new BrowserWindow({ width: 800, height: 600 });

  // and load the index.html of the app.
  presenterWindow.loadFile(join(__dirname, 'ui', 'presenter', 'presenter.html'));

  // Open the DevTools.
  presenterWindow.webContents.openDevTools();

  presenterWindow.maximize();

  // Emitted when the window is closed.
  presenterWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    presenterWindow = null;
  });
}

function createShowWindow() {
  // Create the browser window.
  showWindow = new BrowserWindow({ width: 800, height: 600 });

  // and load the index.html of the app.
  showWindow.loadFile(join(__dirname, 'ui', 'show', 'show.html'));

  // Open the DevTools.
  showWindow.webContents.openDevTools();

  showWindow.maximize();

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
app.on('ready', createManagerWindow);

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

ipcMain.on('asynchronous-message', (event, message) => {
  switch (message.type) {
    case 'request-open-presentation':
      createPresenterWindow();
      createShowWindow();
      break;

    case 'request-slide-next':
      const reply = { type: 'slide-next' };
      if (presenterWindow) {
        presenterWindow.webContents.send('asynchronous-reply', reply);
      }
      if (showWindow) {
        showWindow.webContents.send('asynchronous-reply', reply);
      }
      break;
    default:
      throw new Error(`Unknown event "${event}"`);
  }
});
