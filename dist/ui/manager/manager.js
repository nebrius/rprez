"use strict";
/*
Copyright (c) Bryan Hughes <bryan@nebri.us>

This file is part of MDPrez.

MDPrez is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

MDPrez is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with MDPrez.  If not, see <http://www.gnu.org/licenses/>.
*/
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const message_1 = require("../../message");
const util_1 = require("../../util");
electron_1.ipcRenderer.on('asynchronous-reply', (event, msg) => {
    switch (msg.type) {
        case message_1.MessageType.ScreenUpdated:
            const speakerViewMonitorSelect = document.getElementById('speakerViewMonitorSelect');
            if (!speakerViewMonitorSelect) {
                throw new Error(util_1.createInternalError('"speakerViewMonitorSelect" is unexpectedly null'));
            }
            const audienceViewMonitorSelect = document.getElementById('audienceViewMonitorSelect');
            if (!audienceViewMonitorSelect) {
                throw new Error(util_1.createInternalError('"audienceViewMonitorSelect" is unexpectedly null'));
            }
            break;
        default:
            throw new Error(util_1.createInternalError(`Received unexpected message type ${msg.type}`));
    }
});
function requestPresenterShow() {
    const message = {
        type: message_1.MessageType.RequestPresentShow,
    };
    electron_1.ipcRenderer.send('asynchronous-message', message);
}
const presentButton = document.getElementById('presentButton');
if (!presentButton) {
    throw new Error(util_1.createInternalError('"presentButton" is unexpectedly null'));
}
presentButton.onclick = requestPresenterShow;
//# sourceMappingURL=manager.js.map