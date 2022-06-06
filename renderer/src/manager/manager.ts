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
  Message,
  ScreenUpdatedMessage,
  RequestPresentShowMessage,
  RequestLoadPresentationMessage,
  ExportSlidesProgress,
  ScreenInfo,
  MonitorViews
} from '../common/message.js';
import { createInternalError } from '../common/util.js';
import { addMessageListener, sendMessage } from '../messaging.js';
import { getElement } from '../util.js';

let screens: ScreenInfo[] = [];

function createMonitorEntry(
  parent: HTMLElement,
  screenInfo: ScreenInfo,
  screenIndex: number,
  defaultOption: MonitorViews | undefined
): void {
  const container = document.createElement('div');

  const label = document.createElement('span');
  label.innerText = `Screen ${screenIndex} (${screenInfo.width}x${screenInfo.height})`;
  container.appendChild(label);

  const select = document.createElement('select');
  select.setAttribute('data-screenid', screenInfo.id.toString());
  const monitorViews: MonitorViews[] = ['None', 'Speaker', 'Audience', 'Clock'];
  for (const monitorView of monitorViews) {
    const noneOption = document.createElement('option');
    noneOption.value = monitorView;
    noneOption.innerText = monitorView;
    if (defaultOption === monitorView) {
      noneOption.selected = true;
    }
    select.appendChild(noneOption);
  }
  container.appendChild(select);

  parent.appendChild(container);
}

getElement('presentationInput').onchange = () => {
  const selectedFile = getElement('presentationInput') as HTMLInputElement;
  const filenames = selectedFile.files;
  if (!filenames) {
    throw new Error(createInternalError('"filenames" is unexpectedly null'));
  }
  const message: RequestLoadPresentationMessage = {
    type: 'RequestLoadPresentation',
    // TODO: figure out why 'path' isn't a valid property
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filename: (filenames[0] as any).path
  };
  sendMessage(message);
};

getElement('reloadShowButton').onclick = () => {
  const message: Message = {
    type: 'RequestReloadPresentation'
  };
  sendMessage(message);
};

getElement('presentButton').onclick = () => {
  const screenAssignments: { [id: number]: MonitorViews } = {};
  const developerModeCheckboxElement = getElement('developerModeCheckbox');
  for (const monitorSelect of document.querySelectorAll(
    '#monitorList select'
  )) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const monitorView = (monitorSelect as HTMLSelectElement).selectedOptions[0]!
      .value as MonitorViews;
    const monitorId = parseInt(
      monitorSelect.getAttribute('data-screenid') as string,
      10
    );
    screenAssignments[monitorId] = monitorView;
  }
  const message: RequestPresentShowMessage = {
    type: 'RequestPresentShow',
    developerMode: (developerModeCheckboxElement as HTMLInputElement).checked,
    screenAssignments
  };
  sendMessage(message);
};

getElement('exportSlidesButton').onclick = () => {
  const message: Message = {
    type: 'RequestExportSlides'
  };
  sendMessage(message);
};

addMessageListener((msg) => {
  switch (msg.type) {
    case 'ScreenUpdated': {
      const monitorListContainer = getElement('monitorList');
      for (const child of monitorListContainer.childNodes) {
        monitorListContainer.removeChild(child);
      }
      screens = (msg as ScreenUpdatedMessage).screens;
      for (let i = 0; i < screens.length; i++) {
        let defaultScreen: MonitorViews | undefined;
        if (i === 0) {
          defaultScreen = 'Audience';
        } else if (i === 1) {
          defaultScreen = 'Speaker';
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        createMonitorEntry(monitorListContainer, screens[i]!, i, defaultScreen);
      }
      break;
    }

    case 'ProjectLoaded': {
      const presentationView = getElement('presentationView');
      const loadView = getElement('loadView');
      presentationView.style.display = 'inherit';
      loadView.style.display = 'none';
      break;
    }

    case 'ExportSlidesProgress': {
      const exportSlidesProgress = getElement(
        'exportSlidesProgress'
      ) as HTMLProgressElement;
      exportSlidesProgress.style.display = 'inherit';
      exportSlidesProgress.value = (msg as ExportSlidesProgress).percentage;
      break;
    }

    case 'ExportSlidesCompleted': {
      alert('Slide export complete');
      getElement('exportSlidesProgress').style.display = 'none';
      break;
    }

    default: {
      throw new Error(
        createInternalError(`Received unexpected message type ${msg.type}`)
      );
    }
  }
});

const managerReadyMessage: Message = {
  type: 'ManagerReady'
};
sendMessage(managerReadyMessage);
