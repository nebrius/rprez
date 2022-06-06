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

export type MessageType =
  | 'ManagerReady'
  | 'PresentationWindowReady'
  | 'ClientWindowReady'
  | 'ScreenUpdated'
  | 'RequestLoadPresentation'
  | 'RequestReloadPresentation'
  | 'RequestExportSlides'
  | 'ExportSlidesProgress'
  | 'ExportSlidesCompleted'
  | 'ProjectLoaded'
  | 'RequestPresentShow'
  | 'RequestExistShow'
  | 'RequestNextSlide'
  | 'RequestPreviousSlide'
  | 'CurrentSlideUpdated'
  | 'TimerUpdated'
  | 'TimerStarted'
  | 'TimerPaused'
  | 'RequestStartTimer'
  | 'RequestPauseTimer'
  | 'RequestResetTimer'
  | 'ClentMessage';

export interface Message {
  type: MessageType;
}

export interface ScreenInfo {
  width: number;
  height: number;
  id: number;
}

export type MonitorViews = 'None' | 'Speaker' | 'Audience' | 'Clock';

export interface ScreenUpdatedMessage extends Message {
  type: 'ScreenUpdated';
  screens: ScreenInfo[];
}

export interface RequestPresentShowMessage extends Message {
  type: 'RequestPresentShow';
  screenAssignments: { [id: number]: MonitorViews };
  developerMode: boolean;
}

export interface RequestLoadPresentationMessage extends Message {
  type: 'RequestLoadPresentation';
  filename: string;
}

export interface ProjectLoadedMessage extends Message {
  type: 'ProjectLoaded';
  project: Project;
}

export interface ExportSlidesProgress extends Message {
  type: 'ExportSlidesProgress';
  percentage: number;
}

export interface TimerUpdatedMessage extends Message {
  type: 'TimerUpdated';
  elapsedTime: number;
}

export interface CurrentSlideUpdatedMessage extends Message {
  type: 'CurrentSlideUpdated';
  currentSlideIndex: number;
  numSlides: number;
  currentSlideUrl: string;
  currentNotesUrl: string;
  nextSlideUrl: string | undefined;
}

export interface ProjectSlide {
  slide: string;
  notes: string;
}

export interface Project {
  slides: ProjectSlide[];
}

export const ProjectSchema = {
  type: 'object',
  properties: {
    slides: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          slide: {
            type: 'string'
          },
          notes: {
            type: 'string'
          }
        },
        required: ['slide']
      }
    }
  },
  required: ['slides']
};
