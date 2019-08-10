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

function getElement(name: string): HTMLElement {
  const element = document.getElementById(name);
  if (!element) {
    throw new Error(createInternalError(`${name} is unexpectedly null`));
  }
  return element;
}

const currentSlideIframe = getElement('speaker-currentSlide-iframe') as HTMLIFrameElement;
const nextSlideIframe = getElement('speaker-nextSlide-iframe') as HTMLIFrameElement;
const notesIframe = getElement('speaker-notes-iframe') as HTMLIFrameElement;

const slideCountLabel = getElement('speaker-slideCount');
const elapsedTimeLabel = getElement('speaker-elapsedTime');
const clockTimeLabel = getElement('speaker-clockTime');

const clockControlButton = getElement('speaker-clockControl');
clockControlButton.onclick = () => {
  const message: IMessage = {
    type: clockControlButton.innerText === '⏯' ? MessageType.RequestStartTimer : MessageType.RequestPauseTimer
  };
  sendMessage(message);
};

function formateDate(time: Date): string {
  return `${numToString(time.getHours())}:${numToString(time.getMinutes())}:${numToString(time.getSeconds())}`;
}

function formateDateUTC(time: Date): string {
  return `${numToString(time.getUTCHours())}:${numToString(time.getUTCMinutes())}:${numToString(time.getUTCSeconds())}`;
}

setInterval(() => {
  clockTimeLabel.innerText = formateDate(new Date());
}, 1000);

addMessageListener((msg) => {
  switch (msg.type) {
    case MessageType.CurrentSlideUpdated:
      const currentSlideUpdatedMessage = msg as ICurrentSlideUpdatedMessage;
      currentSlideIframe.src = currentSlideUpdatedMessage.currentSlideUrl;
      nextSlideIframe.src = currentSlideUpdatedMessage.nextSlideUrl || '';
      notesIframe.src = currentSlideUpdatedMessage.currentNotesUrl || '';
      slideCountLabel.innerText =
        `${currentSlideUpdatedMessage.currentSlideIndex}/${currentSlideUpdatedMessage.numSlides}`;
      console.log(`Slide changed to ${(msg as ICurrentSlideUpdatedMessage).currentSlideIndex}`);
      break;

    case MessageType.TimerUpdated:
      const time = new Date((msg as ITimerUpdatedMessage).elapsedTime);
      elapsedTimeLabel.innerText = formateDateUTC(time);
      break;

    case MessageType.TimerStarted:
      clockControlButton.innerText = '⏸';
      break;

    case MessageType.TimerPaused:
      clockControlButton.innerText = '⏯';
      break;
  }
});

const presentationWindowReadyMessage: IMessage = {
  type: MessageType.PresentationWindowReady,
};
sendMessage(presentationWindowReadyMessage);
