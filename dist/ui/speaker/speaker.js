"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const keyHandlers_1 = require("../keyHandlers");
const message_1 = require("../../message");
const util_1 = require("../../util");
keyHandlers_1.connectKeyHandlers(document);
const currentSlideIframe = document.getElementById('speaker-currentSlide-iframe');
if (!currentSlideIframe) {
    throw new Error(util_1.createInternalError('currentSlideIframe is unexpectedly null'));
}
if (!currentSlideIframe.contentWindow) {
    throw new Error(util_1.createInternalError('currentSlideIframe.contentWindow is unexpectedly null'));
}
keyHandlers_1.connectKeyHandlers(currentSlideIframe.contentWindow.document);
const nextSlideIframe = document.getElementById('speaker-nextSlide-iframe');
if (!nextSlideIframe) {
    throw new Error(util_1.createInternalError('nextSlideIframe is unexpectedly null'));
}
if (!nextSlideIframe.contentWindow) {
    throw new Error(util_1.createInternalError('nextSlideIframe.contentWindow is unexpectedly null'));
}
keyHandlers_1.connectKeyHandlers(nextSlideIframe.contentWindow.document);
const notesIframe = document.getElementById('speaker-notes-iframe');
if (!notesIframe) {
    throw new Error(util_1.createInternalError('notesIframe is unexpectedly null'));
}
if (!notesIframe.contentWindow) {
    throw new Error(util_1.createInternalError('notesIframe.contentWindow is unexpectedly null'));
}
keyHandlers_1.connectKeyHandlers(notesIframe.contentWindow.document);
electron_1.ipcRenderer.on('asynchronous-message', (event, msg) => {
    switch (msg.type) {
        case message_1.MessageType.currentSlideUpdated: {
            const currentSlideUpdatedMessage = msg;
            currentSlideIframe.src = currentSlideUpdatedMessage.currentSlideUrl;
            nextSlideIframe.src = currentSlideUpdatedMessage.nextSlideUrl || '';
            notesIframe.src = currentSlideUpdatedMessage.currentNotesUrl;
            console.log(`Slide changed to ${msg.currentSlideIndex}`);
            break;
        }
        default:
            throw new Error(util_1.createInternalError(`Received unexpected message type ${msg.type}`));
    }
});
//# sourceMappingURL=speaker.js.map