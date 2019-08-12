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

import {
  MessageType,
  IMessage,
  IScreenUpdatedMessage,
  IRequestPresentShowMessage,
  IRequestLoadPresentationMessage,
  IScreenInfo,
  MonitorViews
} from '../common/message.js';
import { createInternalError } from '../common/util.js';
import { addMessageListener, sendMessage } from '../messaging.js';

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

addMessageListener((msg) => {
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

    case MessageType.ProjectLoaded:
      const presentationView = document.getElementById('presentationView');
      if (!presentationView) {
        throw new Error(createInternalError('presentationView is unexpectedly null'));
      }
      const loadView = document.getElementById('loadView');
      if (!loadView) {
        throw new Error(createInternalError('loadView is unexpectedly null'));
      }
      presentationView.style.display = 'inherit';
      loadView.style.display = 'none';
      break;

    default:
      throw new Error(createInternalError(`Received unexpected message type ${msg.type}`));
  }
});

function selectPresentationFile() {
  const selectedFile = document.getElementById('presentationInput');
  if (!selectedFile) {
    throw new Error(createInternalError('"selectedFile" is unexpectedly null'));
  }
  const filenames = (selectedFile as HTMLInputElement).files;
  if (!filenames) {
    throw new Error(createInternalError('"filenames" is unexpectedly null'));
  }
  const message: IRequestLoadPresentationMessage = {
    type: MessageType.RequestLoadPresentation,
    filename: (filenames[0] as any).path
  };
  sendMessage(message);
}

function requestPresenterShow() {
  const screenAssignments: { [ id: number ]: MonitorViews } = {};
  const monitorListElement = document.getElementById('monitorList');
  if (!monitorListElement) {
    throw new Error(createInternalError('"monitorListElement" is unexpectedly null'));
  }
  const developerModeCheckboxElement = document.getElementById('developerModeCheckbox');
  if (!developerModeCheckboxElement) {
    throw new Error(createInternalError('"developerModeCheckboxElement" is unexpectedly null'));
  }
  for (const monitorSelect of document.querySelectorAll('#monitorList select')) {
    const monitorView = (monitorSelect as HTMLSelectElement).selectedOptions[0].value as MonitorViews;
    const monitorId = parseInt(monitorSelect.getAttribute('data-screenid') as string, 10);
    screenAssignments[monitorId] = monitorView;
  }
  const message: IRequestPresentShowMessage = {
    type: MessageType.RequestPresentShow,
    developerMode: (developerModeCheckboxElement as HTMLInputElement).checked,
    screenAssignments
  };
  sendMessage(message);
}

const presentationInput = document.getElementById('presentationInput');
if (!presentationInput) {
  throw new Error(createInternalError('"presentationInput" is unexpectedly null'));
}
presentationInput.onchange = selectPresentationFile;

const presentButton = document.getElementById('presentButton');
if (!presentButton) {
  throw new Error(createInternalError('"presentButton" is unexpectedly null'));
}
presentButton.onclick = requestPresenterShow;

const managerReadyMessage: IMessage = {
  type: MessageType.ManagerReady,
};
sendMessage(managerReadyMessage);
