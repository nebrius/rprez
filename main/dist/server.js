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
const path_1 = require("path");
const http_1 = require("http");
const ws_1 = require("ws");
const express = require("express");
const message_1 = require("./common/message");
const util_1 = require("./common/util");
const manager_1 = require("./handlers/manager");
const presentation_1 = require("./handlers/presentation");
const navigation_1 = require("./handlers/navigation");
const timer_1 = require("./handlers/timer");
const client_1 = require("./handlers/client");
const app = express();
app.use('/rprez', express.static(path_1.join(__dirname, '../../renderer/dist/')));
const httpServer = http_1.createServer(app);
const webSocketServer = new ws_1.Server({ server: httpServer });
let managerConnection;
const presentationWindowConnections = new Map();
const clientWindowConnections = new Map();
function sendMessageToManager(msg) {
    if (!managerConnection) {
        throw new Error(util_1.createInternalError('"managerWindow" is unexpectedly null'));
    }
    managerConnection.send(JSON.stringify(msg));
}
exports.sendMessageToManager = sendMessageToManager;
function sendMessageToPresentationWindows(msg) {
    for (const [connection] of presentationWindowConnections) {
        connection.send(JSON.stringify(msg));
    }
}
exports.sendMessageToPresentationWindows = sendMessageToPresentationWindows;
function sendMessageToClientWindows(msg) {
    for (const [connection] of clientWindowConnections) {
        connection.send(JSON.stringify(msg));
    }
}
exports.sendMessageToClientWindows = sendMessageToClientWindows;
function setProjectDirectory(dir) {
    app.use('/presentation', express.static(dir));
}
exports.setProjectDirectory = setProjectDirectory;
webSocketServer.on('connection', (wsClient) => {
    wsClient.on('message', (msg) => {
        const parsedMessage = JSON.parse(msg.toString());
        switch (parsedMessage.type) {
            case message_1.MessageType.ManagerReady:
                managerConnection = wsClient;
                manager_1.handleManagerReadyMessage();
                break;
            case message_1.MessageType.PresentationWindowReady:
                presentationWindowConnections.set(wsClient, true);
                break;
            case message_1.MessageType.RequestLoadPresentation:
                presentation_1.handleRequestLoadPresentation(parsedMessage);
                break;
            case message_1.MessageType.RequestReloadPresentation:
                presentation_1.handleRequestReloadPresentation();
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
            case message_1.MessageType.ClientWindowReady:
                clientWindowConnections.set(wsClient, true);
                client_1.handleClientWindowReady(parsedMessage);
                break;
            case message_1.MessageType.ClientMessage:
                client_1.handleClientMessage(parsedMessage);
                break;
            default:
                throw new Error(util_1.createInternalError(`Received unexpected message type ${parsedMessage.type}`));
        }
    });
    wsClient.on('close', () => {
        presentationWindowConnections.delete(wsClient);
        clientWindowConnections.delete(wsClient);
    });
});
httpServer.listen(util_1.PORT, () => {
    console.log(`Backing server started on port ${util_1.PORT}`);
});
//# sourceMappingURL=server.js.map