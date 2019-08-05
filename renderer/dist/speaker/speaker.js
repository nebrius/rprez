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
import { MessageType } from '../common/message.js';
import { createInternalError, numToString } from '../common/util.js';
import { addMessageListener, sendMessage } from '../messaging.js';
connectKeyHandlers(document);
const currentSlideIframe = document.getElementById('speaker-currentSlide-iframe');
if (!currentSlideIframe) {
    throw new Error(createInternalError('currentSlideIframe is unexpectedly null'));
}
if (!currentSlideIframe.contentWindow) {
    throw new Error(createInternalError('currentSlideIframe.contentWindow is unexpectedly null'));
}
const nextSlideIframe = document.getElementById('speaker-nextSlide-iframe');
if (!nextSlideIframe) {
    throw new Error(createInternalError('nextSlideIframe is unexpectedly null'));
}
if (!nextSlideIframe.contentWindow) {
    throw new Error(createInternalError('nextSlideIframe.contentWindow is unexpectedly null'));
}
const notesIframe = document.getElementById('speaker-notes-iframe');
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
    const message = {
        type: clockControlButton.innerText === '⏯' ? MessageType.RequestStartTimer : MessageType.RequestPauseTimer
    };
    sendMessage(message);
};
addMessageListener((msg) => {
    switch (msg.type) {
        case MessageType.CurrentSlideUpdated:
            const currentSlideUpdatedMessage = msg;
            currentSlideIframe.src = currentSlideUpdatedMessage.currentSlideUrl;
            nextSlideIframe.src = currentSlideUpdatedMessage.nextSlideUrl || '';
            notesIframe.src = currentSlideUpdatedMessage.currentNotesUrl;
            console.log(`Slide changed to ${msg.currentSlideIndex}`);
            break;
        case MessageType.TimerUpdated:
            const time = new Date(msg.elapsedTime);
            elapsedTimeLabel.innerText =
                `${numToString(time.getUTCHours())}:${numToString(time.getUTCMinutes())}:${numToString(time.getUTCSeconds())}`;
            break;
        case MessageType.TimerStarted:
            clockControlButton.innerText = '⏸';
            break;
        case MessageType.TimerPaused:
            clockControlButton.innerText = '⏯';
            break;
    }
});
const presentationWindowReadyMessage = {
    type: MessageType.PresentationWindowReady,
};
sendMessage(presentationWindowReadyMessage);
//# sourceMappingURL=speaker.js.map