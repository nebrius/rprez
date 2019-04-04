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
import { MessageType, IRequestPresentShowMessage, IMessage } from '../../message';
import { createInternalError } from '../../util';

ipcRenderer.on('asynchronous-reply', (event: IpcMessageEvent, msg: IMessage) => {
  switch (msg.type) {
    case MessageType.ScreenUpdated:
      const speakerViewMonitorSelect = document.getElementById('speakerViewMonitorSelect');
      if (!speakerViewMonitorSelect) {
        throw new Error(createInternalError('"speakerViewMonitorSelect" is unexpectedly null'));
      }

      const audienceViewMonitorSelect = document.getElementById('audienceViewMonitorSelect');
      if (!audienceViewMonitorSelect) {
        throw new Error(createInternalError('"audienceViewMonitorSelect" is unexpectedly null'));
      }

      break;
    default:
      throw new Error(createInternalError(`Received unexpected message type ${msg.type}`));
  }
});

function requestPresenterShow() {
  const message: IRequestPresentShowMessage = {
    type: MessageType.RequestPresentShow,
  };
  ipcRenderer.send('asynchronous-message', message);
}

const presentButton = document.getElementById('presentButton');
if (!presentButton) {
  throw new Error(createInternalError('"presentButton" is unexpectedly null'));
}
presentButton.onclick = requestPresenterShow;
