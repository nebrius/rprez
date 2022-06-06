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
  Message,
  CurrentSlideUpdatedMessage,
  TimerUpdatedMessage
} from '../common/message.js';
import { numToString } from '../common/util.js';
import { addMessageListener, sendMessage } from '../messaging.js';
import { getElement } from '../util.js';

const currentSlideIframe = getElement(
  'speaker-currentSlide-iframe'
) as HTMLIFrameElement;
const nextSlideIframe = getElement(
  'speaker-nextSlide-iframe'
) as HTMLIFrameElement;
const notesIframe = getElement('speaker-notes-iframe') as HTMLIFrameElement;

const slideCountLabel = getElement('speaker-slideCount');
const elapsedTimeLabel = getElement('speaker-elapsedTime');
const clockTimeLabel = getElement('speaker-clockTime');

const clockControlButton = getElement('speaker-clockControl');
clockControlButton.onclick = () => {
  const message: Message = {
    type:
      clockControlButton.innerText === '⏯'
        ? MessageType.RequestStartTimer
        : MessageType.RequestPauseTimer
  };
  sendMessage(message);
};

const clockResetButton = getElement('speaker-clockReset');
clockResetButton.onclick = () => {
  const message: Message = {
    type: MessageType.RequestResetTimer
  };
  sendMessage(message);
};

function formateDate(time: Date): string {
  return `${numToString(time.getHours())}:${numToString(
    time.getMinutes()
  )}:${numToString(time.getSeconds())}`;
}

function formateDateUTC(time: Date): string {
  return `${numToString(time.getUTCHours())}:${numToString(
    time.getUTCMinutes()
  )}:${numToString(time.getUTCSeconds())}`;
}

setInterval(() => {
  clockTimeLabel.innerText = formateDate(new Date());
}, 1000);

addMessageListener((msg) => {
  switch (msg.type) {
    case MessageType.CurrentSlideUpdated: {
      const currentSldeUpdatedMessage = msg as CurrentSlideUpdatedMessage;
      currentSlideIframe.src = currentSldeUpdatedMessage.currentSlideUrl;
      nextSlideIframe.src = currentSldeUpdatedMessage.nextSlideUrl || '';
      notesIframe.src = currentSldeUpdatedMessage.currentNotesUrl || '';
      slideCountLabel.innerText = `${currentSldeUpdatedMessage.currentSlideIndex}/${currentSldeUpdatedMessage.numSlides}`;
      console.log(
        `Slide changed to ${
          (msg as CurrentSlideUpdatedMessage).currentSlideIndex
        }`
      );
      break;
    }

    case MessageType.TimerUpdated: {
      const time = new Date((msg as TimerUpdatedMessage).elapsedTime);
      elapsedTimeLabel.innerText = formateDateUTC(time);
      break;
    }

    case MessageType.TimerStarted: {
      clockControlButton.innerText = '⏸';
      break;
    }

    case MessageType.TimerPaused: {
      clockControlButton.innerText = '⏯';
      break;
    }
  }
});

const presentatonWindowReadyMessage: Message = {
  type: MessageType.PresentationWindowReady
};
sendMessage(presentatonWindowReadyMessage);
