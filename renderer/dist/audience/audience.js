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
import { createInternalError } from '../common/util.js';
import { addMessageListener, sendMessage } from '../messaging.js';
connectKeyHandlers(document);
const currentSlideIframe = document.getElementById('audience-currentSlide-iframe');
if (!currentSlideIframe) {
    throw new Error(createInternalError('currentSlideIframe is unexpectedly null'));
}
if (!currentSlideIframe.contentWindow) {
    throw new Error(createInternalError('currentSlideIframe.contentWindow is unexpectedly null/undefined'));
}
if (!currentSlideIframe.contentWindow.document) {
    throw new Error(createInternalError('currentSlideIframe.contentWindow.document is unexpectedly null/undefined'));
}
connectKeyHandlers(currentSlideIframe.contentWindow.document);
addMessageListener((msg) => {
    switch (msg.type) {
        case MessageType.CurrentSlideUpdated:
            const currentSlideUpdatedMessage = msg;
            currentSlideIframe.src = currentSlideUpdatedMessage.currentSlideUrl;
            console.log(`Slide changed to ${msg.currentSlideIndex}`);
            break;
        case MessageType.TimerUpdated:
        case MessageType.TimerStarted:
        case MessageType.TimerPaused:
            // Do nothing
            break;
        default:
            throw new Error(createInternalError(`Received unexpected message type ${msg.type}`));
    }
});
const presentationWindowReadyMessage = {
    type: MessageType.PresentationWindowReady,
};
sendMessage(presentationWindowReadyMessage);
//# sourceMappingURL=audience.js.map