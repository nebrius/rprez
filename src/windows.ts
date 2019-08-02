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

import { join } from 'path';
import { BrowserWindow } from 'electron';
import { createInternalError } from './util';
import { MonitorViews } from './message';

// Keep a global reference of the variouswindow objects. If you don't, the window
// will be closed automatically when the JavaScript object is garbage collected.
let managerWindow: Electron.BrowserWindow | null = null;
const presentationWindows: Electron.BrowserWindow[] = [];

let screenModule: Electron.Screen | null = null;

export function getDisplays() {
  if (screenModule === null) {
    throw createInternalError(`"screenModule" is null but shouldn't be`);
  }
  return screenModule.getAllDisplays();
}

export function getDisplayForId(id: number): Electron.Display {
  const displays = getDisplays();
  for (const display of displays) {
    if (display.id === id) {
      return display;
    }
  }
  throw new Error(createInternalError(`Could not find display for id ${id}`));
}

// Manager window methods

export async function createManagerWindow() {
  const mod = await import('electron');
  screenModule = mod.screen;

  // Create the browser window.
  managerWindow = new BrowserWindow({ width: 800, height: 600 });

  // and load the index.html of the app.
  managerWindow.loadFile(join(__dirname, 'ui', 'manager', 'manager.html'));

  // Open the DevTools.
  // managerWindow.webContents.openDevTools();

  managerWindow.maximize();

  // Emitted when the window is closed.
  managerWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    managerWindow = null;
  });
}

// Presentation window methods

export function createPresentationWindow(type: MonitorViews, x: number, y: number): void {
  // Create the browser window.
  const win = new BrowserWindow({ width: 800, height: 600, x, y });

  // and load the index.html of the app.
  const filebase = MonitorViews[type].toLowerCase();
  win.loadFile(join(__dirname, 'ui', filebase, `${filebase}.html`));

  // Open the DevTools.
  win.webContents.openDevTools();

  // win.setFullScreen(true);
  win.setMenu(null);
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

export function closePresentationWindows(): void {
  for (const win of presentationWindows) {
    win.close();
  }
}
