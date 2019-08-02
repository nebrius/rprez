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
  handleRequestPresentShow,
  handleRequestExitShow
} from './handlers/presentation';
import { handleRequestNextSlide, handleRequestPreviousSlide } from './handlers/navigation';
import { handleRequestStartTimer, handleRequestPauseTimer } from './handlers/timer';

const app = express();
app.use('/rprez', express.static(join(__dirname, '../../renderer/dist/')));

const httpServer = createServer(app);
const webSocketServer = new Server({ server: httpServer });

let managerConnection: any;
const presentationWindowConnections: any[] = [];

export function sendMessageToManager(msg: IMessage): void {
  if (!managerConnection) {
    throw new Error(createInternalError('"managerWindow" is unexpectedly null'));
  }
  managerConnection.send(JSON.stringify(msg));
}

export function sendMessageToPresentationWindows(msg: IMessage): void {
  for (const connection of presentationWindowConnections) {
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
        presentationWindowConnections.push(wsClient);
        break;

      case MessageType.RequestLoadPresentation:
        handleRequestLoadPresentation(parsedMessage as IRequestLoadPresentationMessage);
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

      default:
        throw new Error(createInternalError(`Received unexpected message type ${parsedMessage.type}`));
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Backing server started on port ${PORT}`);
});
