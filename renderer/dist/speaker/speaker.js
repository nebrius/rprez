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
import { MessageType } from '../common/message.js';
import { numToString } from '../common/util.js';
import { addMessageListener, sendMessage } from '../messaging.js';
import { getElement } from '../util.js';
const currentSlideIframe = getElement('speaker-currentSlide-iframe');
const nextSlideIframe = getElement('speaker-nextSlide-iframe');
const notesIframe = getElement('speaker-notes-iframe');
const slideCountLabel = getElement('speaker-slideCount');
const elapsedTimeLabel = getElement('speaker-elapsedTime');
const clockTimeLabel = getElement('speaker-clockTime');
const clockControlButton = getElement('speaker-clockControl');
clockControlButton.onclick = () => {
    const message = {
        type: clockControlButton.innerText === '⏯'
            ? MessageType.RequestStartTimer
            : MessageType.RequestPauseTimer
    };
    sendMessage(message);
};
const clockResetButton = getElement('speaker-clockReset');
clockResetButton.onclick = () => {
    const message = {
        type: MessageType.RequestResetTimer
    };
    sendMessage(message);
};
function formateDate(time) {
    return `${numToString(time.getHours())}:${numToString(time.getMinutes())}:${numToString(time.getSeconds())}`;
}
function formateDateUTC(time) {
    return `${numToString(time.getUTCHours())}:${numToString(time.getUTCMinutes())}:${numToString(time.getUTCSeconds())}`;
}
setInterval(() => {
    clockTimeLabel.innerText = formateDate(new Date());
}, 1000);
addMessageListener((msg) => {
    switch (msg.type) {
        case MessageType.CurrentSlideUpdated: {
            const currentSlideUpdatedMessage = msg;
            currentSlideIframe.src = currentSlideUpdatedMessage.currentSlideUrl;
            nextSlideIframe.src = currentSlideUpdatedMessage.nextSlideUrl || '';
            notesIframe.src = currentSlideUpdatedMessage.currentNotesUrl || '';
            slideCountLabel.innerText = `${currentSlideUpdatedMessage.currentSlideIndex}/${currentSlideUpdatedMessage.numSlides}`;
            console.log(`Slide changed to ${msg.currentSlideIndex}`);
            break;
        }
        case MessageType.TimerUpdated: {
            const time = new Date(msg.elapsedTime);
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
const presentationWindowReadyMessage = {
    type: MessageType.PresentationWindowReady
};
sendMessage(presentationWindowReadyMessage);
//# sourceMappingURL=speaker.js.map