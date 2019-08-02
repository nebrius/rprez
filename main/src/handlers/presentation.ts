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

import {
  MessageType,
  IRequestLoadPresentationMessage,
  IRequestPresentShowMessage,
  IProjectLoadedMessage,
  MonitorViews
} from '../common/message';
import { loadProject, setSlideNumber, sendSlideUpdatedMessage } from '../project';
import { createPresentationWindow, closePresentationWindows, getDisplayForId } from '../windows';
import { sendMessageToManager } from '../server';

export async function handleRequestLoadPresentation(loadMessage: IRequestLoadPresentationMessage): Promise<void> {
  console.log(`Loading presentation at ${loadMessage.filename}`);

  let presentationProject;
  try {
    presentationProject = await loadProject(loadMessage.filename);
  } catch (err) {
    // TODO: display error in the UI
    console.error(err);
    return;
  }

  setSlideNumber(0);
  const message: IProjectLoadedMessage = {
    type: MessageType.ProjectLoaded,
    project: presentationProject
  };
  sendMessageToManager(message);
}

export function handleRequestPresentShow(presentMessage: IRequestPresentShowMessage) {
  console.log('Starting presentation');
  for (const monitorId in presentMessage.screenAssignments) {
    if (!presentMessage.screenAssignments.hasOwnProperty(monitorId)) {
      continue;
    }
    const screenAssignment = presentMessage.screenAssignments[monitorId];
    const display = getDisplayForId(parseInt(monitorId, 10));
    console.log(`Opening ${MonitorViews[screenAssignment]} view on monitor ` +
      `${monitorId} (${display.bounds.width}x${display.bounds.height})`);
    createPresentationWindow(screenAssignment, display.bounds.x, display.bounds.y);
    setTimeout(sendSlideUpdatedMessage, 1000);
  }
}

export function handleRequestExitShow() {
  console.log('Exiting presentation');
  closePresentationWindows();
}
