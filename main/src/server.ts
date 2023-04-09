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

import { join } from 'path';
import { createServer } from 'http';
import WebSocket, { Server } from 'ws';
import express from 'express';

import {
  Message,
  RequestLoadPresentationMessage,
  RequestPresentShowMessage
} from './common/message';
import { createInternalError, PORT } from './common/util';

import { handleManagerReadyMessage } from './handlers/manager';
import {
  handleRequestLoadPresentation,
  handleRequestReloadPresentation,
  handleRequestPresentShow,
  handleRequestExitShow
} from './handlers/presentation';
import {
  handleRequestNextSlide,
  handleRequestPreviousSlide
} from './handlers/navigation';
import {
  handleRequestStartTimer,
  handleRequestPauseTimer,
  handleRequestResetTimer
} from './handlers/timer';
import {
  handleClientWindowReady,
  handleClientMessage
} from './handlers/client';
import { handleRequestExportSlides } from './handlers/export';

const app = express();
app.use('/rprez', express.static(join(__dirname, '../../renderer/dist/')));

const httpServer = createServer(app);
const webSocketServer = new Server({ server: httpServer });

let managerConnection: WebSocket;
const presentationWindowConnections = new Map<WebSocket, boolean>();
const clientWindowConnections = new Map<WebSocket, boolean>();

export function sendMessageToManager(msg: Message): void {
  if (!managerConnection) {
    throw new Error(
      createInternalError('"managerWindow" is unexpectedly null')
    );
  }
  managerConnection.send(JSON.stringify(msg));
}

export function sendMessageToPresentationWindows(msg: Message): void {
  for (const [connection] of presentationWindowConnections) {
    connection.send(JSON.stringify(msg));
  }
}

export function sendMessageToClientWindows(msg: Message): void {
  for (const [connection] of clientWindowConnections) {
    connection.send(JSON.stringify(msg));
  }
}

export function setProjectDirectory(dir: string): void {
  app.use('/presentation', express.static(dir));
}

webSocketServer.on('connection', (wsClient) => {
  wsClient.on('message', (msg) => {
    const parsedMessage: Message = JSON.parse(msg.toString());
    switch (parsedMessage.type) {
      case 'ManagerReady':
        managerConnection = wsClient;
        handleManagerReadyMessage();
        break;

      case 'PresentationWindowReady':
        presentationWindowConnections.set(wsClient, true);
        break;

      case 'RequestLoadPresentation':
        handleRequestLoadPresentation(
          parsedMessage as RequestLoadPresentationMessage
        );
        break;

      case 'RequestReloadPresentation':
        handleRequestReloadPresentation();
        break;

      case 'RequestPresentShow':
        handleRequestPresentShow(parsedMessage as RequestPresentShowMessage);
        break;

      case 'RequestExistShow':
        handleRequestExitShow();
        break;

      case 'RequestExportSlides':
        handleRequestExportSlides();
        break;

      case 'RequestNextSlide':
        handleRequestNextSlide();
        break;

      case 'RequestPreviousSlide':
        handleRequestPreviousSlide();
        break;

      case 'RequestStartTimer':
        handleRequestStartTimer();
        break;

      case 'RequestPauseTimer':
        handleRequestPauseTimer();
        break;

      case 'RequestResetTimer':
        handleRequestResetTimer();
        break;

      case 'ClientWindowReady':
        clientWindowConnections.set(wsClient, true);
        handleClientWindowReady(parsedMessage);
        break;

      case 'ClentMessage':
        handleClientMessage(parsedMessage);
        break;

      default:
        throw new Error(
          createInternalError(
            `Received unexpected message type ${parsedMessage.type}`
          )
        );
    }
  });
  wsClient.on('close', () => {
    presentationWindowConnections.delete(wsClient);
    clientWindowConnections.delete(wsClient);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Backing server started on port ${PORT}`);
});
