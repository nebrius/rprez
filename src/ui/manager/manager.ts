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

import { ipcRenderer, IpcMessageEvent } from 'electron';
import {
  MessageType,
  IMessage,
  IScreenUpdatedMessage,
  IRequestPresentShowMessage,
  IScreenInfo,
  MonitorViews
} from '../../message';
import { createInternalError } from '../../util';

let screens: IScreenInfo[] = [];

function createMonitorEntry(
  parent: HTMLElement,
  screenInfo: IScreenInfo,
  screenIndex: number,
  defaultOption: MonitorViews | undefined
): void {
  const container = document.createElement('div');

  const label = document.createElement('span');
  label.innerText = `Screen ${screenIndex} (${screenInfo.width}x${screenInfo.height})`;
  container.appendChild(label);

  const select = document.createElement('select');
  select.setAttribute('data-screenid', screenInfo.id.toString());
  for (const monitorView in MonitorViews) {
    if (!MonitorViews.hasOwnProperty(monitorView)) {
      continue;
    }
    const noneOption = document.createElement('option');
    noneOption.value = monitorView;
    noneOption.innerText = monitorView;
    if (defaultOption === MonitorViews[monitorView]) {
      noneOption.selected = true;
    }
    select.appendChild(noneOption);
  }
  container.appendChild(select);

  parent.appendChild(container);
}

ipcRenderer.on('asynchronous-message', (event: IpcMessageEvent, msg: IMessage) => {
  switch (msg.type) {
    case MessageType.ScreenUpdated:
      const monitorListContainer = document.getElementById('monitorList');
      if (!monitorListContainer) {
        throw new Error(createInternalError('"monitorListContainer" is unexpectedly null'));
      }
      for (const child of monitorListContainer.childNodes) {
        monitorListContainer.removeChild(child);
      }
      screens = (msg as IScreenUpdatedMessage).screens;
      for (let i = 0; i < screens.length; i++) {
        let defaultScreen: MonitorViews | undefined;
        if (i === 0) {
          defaultScreen = MonitorViews.Audience;
        } else if (i === 1) {
          defaultScreen = MonitorViews.Speaker;
        }
        createMonitorEntry(monitorListContainer, screens[i], i, defaultScreen);
      }
      break;
    default:
      throw new Error(createInternalError(`Received unexpected message type ${msg.type}`));
  }
});

function requestPresenterShow() {
  const screenAssignments: { [ id: number ]: MonitorViews } = {};
  const monitorListElement = document.getElementById('monitorList');
  if (!monitorListElement) {
    throw new Error(createInternalError('"monitorListElement" is unexpectedly null'));
  }
  for (const monitorSelect of document.querySelectorAll('#monitorList select')) {
    const monitorView = (monitorSelect as HTMLSelectElement).selectedOptions[0].value as MonitorViews;
    const monitorId = parseInt(monitorSelect.getAttribute('data-screenid') as string, 10);
    screenAssignments[monitorId] = monitorView;
  }
  const message: IRequestPresentShowMessage = {
    type: MessageType.RequestPresentShow,
    screenAssignments
  };
  ipcRenderer.send('asynchronous-message', message);
}

const presentButton = document.getElementById('presentButton');
if (!presentButton) {
  throw new Error(createInternalError('"presentButton" is unexpectedly null'));
}
presentButton.onclick = requestPresenterShow;

const managerReadyMessage: IMessage = {
  type: MessageType.ManagerReady,
};
ipcRenderer.send('asynchronous-message', managerReadyMessage);
