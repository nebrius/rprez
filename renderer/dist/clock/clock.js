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
const elapsedTimeLabel = document.getElementById('clock-elapsedTime');
if (!elapsedTimeLabel) {
    throw new Error(createInternalError('elapsedTimeLabel is unexpectedly null'));
}
addMessageListener((msg) => {
    switch (msg.type) {
        case MessageType.TimerUpdated:
            const time = new Date(msg.elapsedTime);
            elapsedTimeLabel.innerText =
                `${numToString(time.getUTCHours())}:${numToString(time.getUTCMinutes())}:${numToString(time.getUTCSeconds())}`;
            break;
    }
});
const presentationWindowReadyMessage = {
    type: MessageType.PresentationWindowReady,
};
sendMessage(presentationWindowReadyMessage);
//# sourceMappingURL=clock.js.map