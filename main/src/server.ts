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
import { Server } from 'ws';
import * as express from 'express';

import {
  MessageType,
  IMessage,
  IRequestLoadPresentationMessage,
  IRequestPresentShowMessage
} from './common/message';
import { createInternalError, PORT } from './common/util';

import { handleManagerReadyMessage } from './handlers/manager';
import {
  handleRequestLoadPresentation,
  handleRequestReloadPresentation,
  handleRequestPresentShow,
  handleRequestExitShow
} from './handlers/presentation';
import { handleRequestNextSlide, handleRequestPreviousSlide } from './handlers/navigation';
import { handleRequestStartTimer, handleRequestPauseTimer, handleRequestResetTimer } from './handlers/timer';
import { handleClientWindowReady, handleClientMessage } from './handlers/client';

const app = express();
app.use('/rprez', express.static(join(__dirname, '../../renderer/dist/')));

const httpServer = createServer(app);
const webSocketServer = new Server({ server: httpServer });

// The browser version collides with the ws version, and ws doesn't expose this interface, booo.
interface IWebSocket {
  send(msg: string): void;
}

let managerConnection: any;
const presentationWindowConnections = new Map<IWebSocket, boolean>();
const clientWindowConnections = new Map<IWebSocket, boolean>();

export function sendMessageToManager(msg: IMessage): void {
  if (!managerConnection) {
    throw new Error(createInternalError('"managerWindow" is unexpectedly null'));
  }
  managerConnection.send(JSON.stringify(msg));
}

export function sendMessageToPresentationWindows(msg: IMessage): void {
  for (const [ connection ] of presentationWindowConnections) {
    connection.send(JSON.stringify(msg));
  }
}

export function sendMessageToClientWindows(msg: IMessage): void {
  for (const [ connection ] of clientWindowConnections) {
    connection.send(JSON.stringify(msg));
  }
}

export function setProjectDirectory(dir: string): void {
  app.use('/presentation', express.static(dir));
}

webSocketServer.on('connection', (wsClient) => {
  wsClient.on('message', (msg) => {
    const parsedMessage: IMessage = JSON.parse(msg.toString());
    switch (parsedMessage.type) {
      case MessageType.ManagerReady:
        managerConnection = wsClient;
        handleManagerReadyMessage();
        break;

      case MessageType.PresentationWindowReady:
        presentationWindowConnections.set(wsClient, true);
        break;

      case MessageType.RequestLoadPresentation:
        handleRequestLoadPresentation(parsedMessage as IRequestLoadPresentationMessage);
        break;

      case MessageType.RequestReloadPresentation:
        handleRequestReloadPresentation();
        break;

      case MessageType.RequestPresentShow:
        handleRequestPresentShow(parsedMessage as IRequestPresentShowMessage);
        break;

      case MessageType.RequestExistShow:
        handleRequestExitShow();
        break;

      case MessageType.RequestNextSlide:
        handleRequestNextSlide();
        break;

      case MessageType.RequestPreviousSlide:
        handleRequestPreviousSlide();
        break;

      case MessageType.RequestStartTimer:
        handleRequestStartTimer();
        break;

      case MessageType.RequestPauseTimer:
        handleRequestPauseTimer();
        break;

      case MessageType.RequestResetTimer:
        handleRequestResetTimer();
        break;

      case MessageType.ClientWindowReady:
        clientWindowConnections.set(wsClient, true);
        handleClientWindowReady(parsedMessage);
        break;

      case MessageType.ClientMessage:
        handleClientMessage(parsedMessage);
        break;

      default:
        throw new Error(createInternalError(`Received unexpected message type ${parsedMessage.type}`));
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
