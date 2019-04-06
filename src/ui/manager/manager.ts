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
import { MessageType, IRequestPresentShowMessage, IMessage, IScreenUpdatedMessage } from '../../message';
import { createInternalError } from '../../util';

function createScreenOptions(parentName: string, screenMessage: IScreenUpdatedMessage, defaultScreen: number): void {
  const parent = document.getElementById(parentName);
  if (!parent) {
    throw new Error(createInternalError(`"${parentName}" is unexpectedly null`));
  }
  for (const child of parent.children) {
    parent.removeChild(child);
  }
  const noneOption = document.createElement('option');
  noneOption.value = '0';
  noneOption.innerText = 'None';
  if (defaultScreen >= screenMessage.screens.length) {
    noneOption.selected = true;
  }
  parent.appendChild(noneOption);
  for (let i = 0; i < screenMessage.screens.length; i++) {
    const screen = screenMessage.screens[i];
    const option = document.createElement('option');
    option.value = screen.id.toString();
    option.innerText = `${i}: ${screen.width}x${screen.height}`;
    if (i === defaultScreen) {
      option.selected = true;
    }
    parent.appendChild(option);
  }
}

ipcRenderer.on('asynchronous-message', (event: IpcMessageEvent, msg: IMessage) => {
  switch (msg.type) {
    case MessageType.ScreenUpdated:
      createScreenOptions('speakerViewMonitorSelect', msg as IScreenUpdatedMessage, 0);
      createScreenOptions('audienceViewMonitorSelect', msg as IScreenUpdatedMessage, 1);
      break;
    default:
      throw new Error(createInternalError(`Received unexpected message type ${msg.type}`));
  }
});

function getScreenIdFromElement(elementName: string): number | undefined {
  const select = document.getElementById(elementName);
  if (!select) {
    throw new Error(createInternalError(`"${elementName}" is unexpectedly null`));
  }
  const value = parseInt((select as HTMLSelectElement).selectedOptions[0].value, 10);
  if (value) {
    return value;
  } else {
    return undefined;
  }
}

function requestPresenterShow() {

  const message: IRequestPresentShowMessage = {
    type: MessageType.RequestPresentShow,
    speakerMonitor: getScreenIdFromElement('speakerViewMonitorSelect'),
    audienceMonitor: getScreenIdFromElement('audienceViewMonitorSelect')
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
