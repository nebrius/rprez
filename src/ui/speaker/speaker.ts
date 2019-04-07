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

import { ipcRenderer, IpcMessageEvent } from 'electron';
import { connectKeyHandlers } from '../keyHandlers';
import { MessageType, IMessage, ICurrentSlideUpdatedMessage } from '../../message';
import { createInternalError } from '../../util';

connectKeyHandlers();

const currentSlideIframe: HTMLIFrameElement | null =
  document.getElementById('speaker-currentSlide-iframe') as HTMLIFrameElement | null;
if (!currentSlideIframe) {
  throw new Error(createInternalError('currentSlideIframe is unexpectedly null'));
}
const nextSlideIframe: HTMLIFrameElement | null =
  document.getElementById('speaker-nextSlide-iframe') as HTMLIFrameElement | null;
if (!nextSlideIframe) {
  throw new Error(createInternalError('nextSlideIframe is unexpectedly null'));
}
const notesIframe: HTMLIFrameElement | null =
  document.getElementById('speaker-notes-iframe') as HTMLIFrameElement | null;
if (!notesIframe) {
  throw new Error(createInternalError('notesIframe is unexpectedly null'));
}

ipcRenderer.on('asynchronous-message', (event: IpcMessageEvent, msg: IMessage) => {
  switch (msg.type) {
    case MessageType.currentSlideUpdated: {
      const currentSlideUpdatedMessage = msg as ICurrentSlideUpdatedMessage;
      currentSlideIframe.src = currentSlideUpdatedMessage.currentSlideUrl;
      nextSlideIframe.src = currentSlideUpdatedMessage.nextSlideUrl || '';
      notesIframe.src = currentSlideUpdatedMessage.currentNotesUrl;
      console.log(currentSlideIframe.src);
      console.log(nextSlideIframe.src);
      console.log(notesIframe.src);
      console.log(`Slide changed to ${(msg as ICurrentSlideUpdatedMessage).currentSlideIndex}`);
      break;
    }

    default:
      throw new Error(createInternalError(`Received unexpected message type ${msg.type}`));
  }
});
