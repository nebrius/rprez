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

import { connectKeyHandlers } from '../keyHandlers.js';
import { MessageType, IMessage, ICurrentSlideUpdatedMessage, ITimerUpdatedMessage } from '../common/message.js';
import { createInternalError, numToString } from '../common/util.js';
import { addMessageListener, sendMessage } from '../messaging.js';

connectKeyHandlers(document);

const currentSlideIframe: HTMLIFrameElement | null =
  document.getElementById('speaker-currentSlide-iframe') as HTMLIFrameElement | null;
if (!currentSlideIframe) {
  throw new Error(createInternalError('currentSlideIframe is unexpectedly null'));
}
if (!currentSlideIframe.contentWindow) {
  throw new Error(createInternalError('currentSlideIframe.contentWindow is unexpectedly null'));
}

const nextSlideIframe: HTMLIFrameElement | null =
  document.getElementById('speaker-nextSlide-iframe') as HTMLIFrameElement | null;
if (!nextSlideIframe) {
  throw new Error(createInternalError('nextSlideIframe is unexpectedly null'));
}
if (!nextSlideIframe.contentWindow) {
  throw new Error(createInternalError('nextSlideIframe.contentWindow is unexpectedly null'));
}

const notesIframe: HTMLIFrameElement | null =
  document.getElementById('speaker-notes-iframe') as HTMLIFrameElement | null;
if (!notesIframe) {
  throw new Error(createInternalError('notesIframe is unexpectedly null'));
}
if (!notesIframe.contentWindow) {
  throw new Error(createInternalError('notesIframe.contentWindow is unexpectedly null'));
}

const elapsedTimeLabel = document.getElementById('speaker-elapsedTime');
if (!elapsedTimeLabel) {
  throw new Error(createInternalError('elapsedTimeLabel is unexpectedly null'));
}

const clockControlButton = document.getElementById('speaker-clockControl');
if (!clockControlButton) {
  throw new Error(createInternalError('clockControlButton is unexpectedly null'));
}
clockControlButton.onclick = () => {
  const message: IMessage = {
    type: clockControlButton.innerText === '⏯' ? MessageType.RequestStartTimer : MessageType.RequestPauseTimer
  };
  sendMessage(message);
};

addMessageListener((msg) => {
  switch (msg.type) {
    case MessageType.CurrentSlideUpdated:
      const currentSlideUpdatedMessage = msg as ICurrentSlideUpdatedMessage;
      currentSlideIframe.src = currentSlideUpdatedMessage.currentSlideUrl;
      nextSlideIframe.src = currentSlideUpdatedMessage.nextSlideUrl || '';
      notesIframe.src = currentSlideUpdatedMessage.currentNotesUrl;
      console.log(`Slide changed to ${(msg as ICurrentSlideUpdatedMessage).currentSlideIndex}`);
      break;

    case MessageType.TimerUpdated:
      const time = new Date((msg as ITimerUpdatedMessage).elapsedTime);
      elapsedTimeLabel.innerText =
      `${numToString(time.getUTCHours())}:${numToString(time.getUTCMinutes())}:${numToString(time.getUTCSeconds())}`;
      break;

    case MessageType.TimerStarted:
      clockControlButton.innerText = '⏸';
      break;

    case MessageType.TimerPaused:
      clockControlButton.innerText = '⏯';
      break;

    default:
      throw new Error(createInternalError(`Received unexpected message type ${msg.type}`));
  }
});

const presentationWindowReadyMessage: IMessage = {
  type: MessageType.PresentationWindowReady,
};
sendMessage(presentationWindowReadyMessage);
