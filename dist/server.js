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
const message_1 = require("./message");
const util_1 = require("./util");
const http_1 = require("http");
const ws_1 = require("ws");
const express = require("express");
const manager_1 = require("./handlers/manager");
const presentation_1 = require("./handlers/presentation");
const navigation_1 = require("./handlers/navigation");
const timer_1 = require("./handlers/timer");
const app = express();
const PORT = 3087;
const httpServer = http_1.createServer(app);
const webSocketServer = new ws_1.Server({ server: httpServer });
function sendMessageToManager(msg) {
    // if (managerWindow === null) {
    //   throw new Error(createInternalError('"managerWindow" is unexpectedly null'));
    // }
    // managerWindow.webContents.send('asynchronous-message', msg);
}
exports.sendMessageToManager = sendMessageToManager;
function sendMessageToPresentationWindows(msg) {
    // for (const win of presentationWindows) {
    //   win.webContents.send('asynchronous-message', msg);
    // }
}
exports.sendMessageToPresentationWindows = sendMessageToPresentationWindows;
webSocketServer.on('connection', (wsClient, request) => {
    console.log(request);
    wsClient.on('message', (msg) => {
        const parsedMessage = JSON.parse(msg.toString());
        switch (parsedMessage.type) {
            case message_1.MessageType.ManagerReady:
                manager_1.handleManagerReadyMessage();
                break;
            case message_1.MessageType.RequestLoadPresentation:
                presentation_1.handleRequestLoadPresentation(parsedMessage);
                break;
            case message_1.MessageType.RequestPresentShow:
                presentation_1.handleRequestPresentShow(parsedMessage);
                break;
            case message_1.MessageType.RequestExistShow:
                presentation_1.handleRequestExitShow();
                break;
            case message_1.MessageType.RequestNextSlide:
                navigation_1.handleRequestNextSlide();
                break;
            case message_1.MessageType.RequestPreviousSlide:
                navigation_1.handleRequestPreviousSlide();
                break;
            case message_1.MessageType.RequestStartTimer:
                timer_1.handleRequestStartTimer();
                break;
            case message_1.MessageType.RequestPauseTimer:
                timer_1.handleRequestPauseTimer();
                break;
            default:
                throw new Error(util_1.createInternalError(`Received unexpected message type ${parsedMessage.type}`));
        }
    });
});
app.use('/rprez', express.static('public'));
httpServer.listen(PORT, () => {
    console.log(`Backing server started on port ${PORT} :)`);
});
//# sourceMappingURL=server.js.map