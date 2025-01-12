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

import { Message, TimerUpdatedMessage } from '../common/message';
import { sendMessageToPresentationWindows } from '../server';

let elapsedTime = 0;
let timerInterval: NodeJS.Timeout;

export function handleRequestStartTimer() {
  clearInterval(timerInterval);
  let previousTime = Date.now();
  timerInterval = setInterval(() => {
    const currentTime = Date.now();
    elapsedTime += currentTime - previousTime;
    previousTime = currentTime;
    const tmerUpdatedMessage: TimerUpdatedMessage = {
      type: 'TimerUpdated',
      elapsedTime
    };
    sendMessageToPresentationWindows(tmerUpdatedMessage);
  }, 100);
  const message: Message = {
    type: 'TimerStarted'
  };
  sendMessageToPresentationWindows(message);
}

export function handleRequestPauseTimer() {
  clearInterval(timerInterval);
  const message: Message = {
    type: 'TimerPaused'
  };
  sendMessageToPresentationWindows(message);
}

export function handleRequestResetTimer() {
  elapsedTime = 0;
  const tmerUpdatedMessage: TimerUpdatedMessage = {
    type: 'TimerUpdated',
    elapsedTime
  };
  sendMessageToPresentationWindows(tmerUpdatedMessage);
}
