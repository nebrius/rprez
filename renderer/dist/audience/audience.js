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
import { createInternalError } from '../common/util.js';
import { addMessageListener, sendMessage } from '../messaging.js';
function getIFrame(id) {
    const iframe = document.getElementById(id);
    if (!iframe) {
        throw new Error(createInternalError('iframe is unexpectedly null'));
    }
    return iframe;
}
const iframe1 = getIFrame('audience-currentSlide-iframe-1');
const iframe2 = getIFrame('audience-currentSlide-iframe-2');
let currentIFRame = 1;
let frontIframe;
let backIFrame;
addMessageListener((msg) => {
    switch (msg.type) {
        case MessageType.CurrentSlideUpdated:
            const currentSlideUpdatedMessage = msg;
            if (currentIFRame === 1) {
                currentIFRame = 2;
                frontIframe = iframe2;
                backIFrame = iframe1;
            }
            else {
                currentIFRame = 1;
                frontIframe = iframe1;
                backIFrame = iframe2;
            }
            frontIframe.src = currentSlideUpdatedMessage.currentSlideUrl;
            console.log(`Slide changed to ${msg.currentSlideIndex}`);
            break;
        case MessageType.ClientWindowReady:
            frontIframe.style.zIndex = '1';
            backIFrame.style.zIndex = '0';
            break;
    }
});
const presentationWindowReadyMessage = {
    type: MessageType.PresentationWindowReady,
};
sendMessage(presentationWindowReadyMessage);
