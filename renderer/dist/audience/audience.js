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
import { addMessageListener, sendMessage } from '../messaging.js';
import { getElement, isDeveloperMode } from '../util.js';
const iframe1 = getElement('audience-currentSlide-iframe-1');
const iframe2 = getElement('audience-currentSlide-iframe-2');
let currentIFRame = 1;
let frontIframe;
let backIFrame;
addMessageListener((msg) => {
    switch (msg.type) {
        case 'CurrentSlideUpdated': {
            const currentSldeUpdatedMessage = msg;
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
            frontIframe.src = `${currentSldeUpdatedMessage.currentSlideUrl}?developerMode=${isDeveloperMode()}`;
            console.log(`Slide changed to ${msg.currentSlideIndex}`);
            break;
        }
        case 'ClientWindowReady': {
            frontIframe.style.zIndex = '1';
            backIFrame.style.zIndex = '0';
            break;
        }
    }
});
const presentatonWindowReadyMessage = {
    type: 'PresentationWindowReady'
};
sendMessage(presentatonWindowReadyMessage);
//# sourceMappingURL=audience.js.map