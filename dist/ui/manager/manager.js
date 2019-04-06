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
function createScreenOptions(parentName, screenMessage, defaultScreen) {
    const parent = document.getElementById(parentName);
    if (!parent) {
        throw new Error(util_1.createInternalError(`"${parentName}" is unexpectedly null`));
    }
    for (const child of parent.children) {
        parent.removeChild(child);
    }
    const noneOption = document.createElement('option');
    noneOption.value = '0';
    noneOption.innerText = 'None';
    if (defaultScreen >= screenMessage.screens.length) {
        noneOption.selected = true;
    }
    parent.appendChild(noneOption);
    for (let i = 0; i < screenMessage.screens.length; i++) {
        const screen = screenMessage.screens[i];
        const option = document.createElement('option');
        option.value = screen.id.toString();
        option.innerText = `${i}: ${screen.width}x${screen.height}`;
        if (i === defaultScreen) {
            option.selected = true;
        }
        parent.appendChild(option);
    }
}
electron_1.ipcRenderer.on('asynchronous-message', (event, msg) => {
    switch (msg.type) {
        case message_1.MessageType.ScreenUpdated:
            createScreenOptions('speakerViewMonitorSelect', msg, 0);
            createScreenOptions('audienceViewMonitorSelect', msg, 1);
            break;
        default:
            throw new Error(util_1.createInternalError(`Received unexpected message type ${msg.type}`));
    }
});
function getScreenIdFromElement(elementName) {
    const select = document.getElementById(elementName);
    if (!select) {
        throw new Error(util_1.createInternalError(`"${elementName}" is unexpectedly null`));
    }
    const value = parseInt(select.selectedOptions[0].value, 10);
    if (value) {
        return value;
    }
    else {
        return undefined;
    }
}
function requestPresenterShow() {
    const message = {
        type: message_1.MessageType.RequestPresentShow,
        speakerMonitor: getScreenIdFromElement('speakerViewMonitorSelect'),
        audienceMonitor: getScreenIdFromElement('audienceViewMonitorSelect')
    };
    electron_1.ipcRenderer.send('asynchronous-message', message);
}
const presentButton = document.getElementById('presentButton');
if (!presentButton) {
    throw new Error(util_1.createInternalError('"presentButton" is unexpectedly null'));
}
presentButton.onclick = requestPresenterShow;
const managerReadyMessage = {
    type: message_1.MessageType.ManagerReady,
};
electron_1.ipcRenderer.send('asynchronous-message', managerReadyMessage);
//# sourceMappingURL=manager.js.map