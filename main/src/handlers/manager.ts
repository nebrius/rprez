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

import { getDisplays } from '../windows';
import { ScreenUpdatedMessage } from '../common/message';
import { sendMessageToManager } from '../server';

export function handleManagerReadyMessage(): void {
  console.log('Manager Ready');
  const displays = getDisplays();
  const screenUpdatedMessage: ScreenUpdatedMessage = {
    type: 'ScreenUpdated',
    screens: displays.map((display) => ({
      width: Math.floor(display.bounds.width * display.scaleFactor),
      height: Math.floor(display.bounds.height * display.scaleFactor),
      id: display.id
    }))
  };
  sendMessageToManager(screenUpdatedMessage);
}
