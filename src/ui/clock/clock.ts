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

import { ipcRenderer, IpcMessageEvent } from 'electron';
import { connectKeyHandlers } from '../keyHandlers';
import { MessageType, IMessage, ITimerUpdatedMessage } from '../../message';
import { createInternalError, numToString } from '../../util';

connectKeyHandlers(document);

const elapsedTimeLabel = document.getElementById('clock-elapsedTime');
if (!elapsedTimeLabel) {
  throw new Error(createInternalError('elapsedTimeLabel is unexpectedly null'));
}

ipcRenderer.on('asynchronous-message', (event: IpcMessageEvent, msg: IMessage) => {
  switch (msg.type) {
    case MessageType.TimerUpdated:
      const time = new Date((msg as ITimerUpdatedMessage).elapsedTime);
      elapsedTimeLabel.innerText =
        `${numToString(time.getUTCHours())}:${numToString(time.getUTCMinutes())}:${numToString(time.getUTCSeconds())}`;
      break;
  }
});
