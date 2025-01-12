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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageToManager = sendMessageToManager;
exports.sendMessageToPresentationWindows = sendMessageToPresentationWindows;
exports.sendMessageToClientWindows = sendMessageToClientWindows;
exports.setProjectDirectory = setProjectDirectory;
const path_1 = require("path");
const http_1 = require("http");
const ws_1 = require("ws");
const express_1 = __importDefault(require("express"));
const util_1 = require("./common/util");
const manager_1 = require("./handlers/manager");
const presentation_1 = require("./handlers/presentation");
const navigation_1 = require("./handlers/navigation");
const timer_1 = require("./handlers/timer");
const client_1 = require("./handlers/client");
const export_1 = require("./handlers/export");
const app = (0, express_1.default)();
app.use('/rprez', express_1.default.static((0, path_1.join)(__dirname, '../../renderer/dist/')));
const httpServer = (0, http_1.createServer)(app);
const webSocketServer = new ws_1.Server({ server: httpServer });
let managerConnection;
const presentationWindowConnections = new Map();
const clientWindowConnections = new Map();
function sendMessageToManager(msg) {
    if (!managerConnection) {
        throw new Error((0, util_1.createInternalError)('"managerWindow" is unexpectedly null'));
    }
    managerConnection.send(JSON.stringify(msg));
}
function sendMessageToPresentationWindows(msg) {
    for (const [connection] of presentationWindowConnections) {
        connection.send(JSON.stringify(msg));
    }
}
function sendMessageToClientWindows(msg) {
    for (const [connection] of clientWindowConnections) {
        connection.send(JSON.stringify(msg));
    }
}
function setProjectDirectory(dir) {
    app.use('/presentation', express_1.default.static(dir));
}
webSocketServer.on('connection', (wsClient) => {
    wsClient.on('message', (msg) => {
        const parsedMessage = JSON.parse(msg.toString());
        switch (parsedMessage.type) {
            case 'ManagerReady':
                managerConnection = wsClient;
                (0, manager_1.handleManagerReadyMessage)();
                break;
            case 'PresentationWindowReady':
                presentationWindowConnections.set(wsClient, true);
                break;
            case 'RequestLoadPresentation':
                (0, presentation_1.handleRequestLoadPresentation)(parsedMessage);
                break;
            case 'RequestReloadPresentation':
                (0, presentation_1.handleRequestReloadPresentation)();
                break;
            case 'RequestPresentShow':
                (0, presentation_1.handleRequestPresentShow)(parsedMessage);
                break;
            case 'RequestExistShow':
                (0, presentation_1.handleRequestExitShow)();
                break;
            case 'RequestExportSlides':
                (0, export_1.handleRequestExportSlides)();
                break;
            case 'RequestNextSlide':
                (0, navigation_1.handleRequestNextSlide)();
                break;
            case 'RequestPreviousSlide':
                (0, navigation_1.handleRequestPreviousSlide)();
                break;
            case 'RequestStartTimer':
                (0, timer_1.handleRequestStartTimer)();
                break;
            case 'RequestPauseTimer':
                (0, timer_1.handleRequestPauseTimer)();
                break;
            case 'RequestResetTimer':
                (0, timer_1.handleRequestResetTimer)();
                break;
            case 'ClientWindowReady':
                clientWindowConnections.set(wsClient, true);
                (0, client_1.handleClientWindowReady)(parsedMessage);
                break;
            case 'ClentMessage':
                (0, client_1.handleClientMessage)(parsedMessage);
                break;
            default:
                throw new Error((0, util_1.createInternalError)(`Received unexpected message type ${parsedMessage.type}`));
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