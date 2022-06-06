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

export enum MessageType {
  ManagerReady = 'ManagerReady',
  PresentationWindowReady = 'PresentationWindowReady',
  ClientWindowReady = 'ClientWindowReady',
  ScreenUpdated = 'ScreenUpdated',
  RequestLoadPresentation = 'RequestLoadPresentation',
  RequestReloadPresentation = 'RequestReloadPresentation',
  RequestExportSlides = 'RequestExportSlides',
  ExportSlidesProgress = 'ExportSlidesProgress',
  ExportSlidesCompleted = 'ExportSlidesCompleted',
  ProjectLoaded = 'ProjectLoaded',
  RequestPresentShow = 'RequestPresentShow',
  RequestExistShow = 'RequestExistShow',
  RequestNextSlide = 'RequestNextSlide',
  RequestPreviousSlide = 'RequestPreviousSlide',
  CurrentSlideUpdated = 'CurrentSlideUpdated',
  TimerUpdated = 'TimerUpdated',
  TimerStarted = 'TimerStarted',
  TimerPaused = 'TimerPaused',
  RequestStartTimer = 'RequestStartTimer',
  RequestPauseTimer = 'RequestPauseTimer',
  RequestResetTimer = 'RequestResetTimer',
  ClentMessage = 'ClentMessage'
}

export interface Message {
  type: MessageType;
}

export interface ScreenInfo {
  width: number;
  height: number;
  id: number;
}

export enum MonitorViews {
  None = 'None',
  Speaker = 'Speaker',
  Audience = 'Audience',
  Clock = 'Clock'
}

export interface ScreenUpdatedMessage extends Message {
  screens: ScreenInfo[];
}

export interface RequestPresentShowMessage extends Message {
  screenAssignments: { [id: number]: MonitorViews };
  developerMode: boolean;
}

export interface RequestLoadPresentationMessage extends Message {
  filename: string;
}

export interface ProjectLoadedMessage extends Message {
  project: IProject;
}

export interface IExportSlidesProgress extends Message {
  percentage: number;
}

export interface TimerUpdatedMessage extends Message {
  elapsedTime: number;
}

export interface CurrentSlideUpdatedMessage extends Message {
  currentSlideIndex: number;
  numSlides: number;
  currentSlideUrl: string;
  currentNotesUrl: string;
  nextSlideUrl: string | undefined;
}

export interface IProjectSlide {
  slide: string;
  notes: string;
}

export interface IProject {
  slides: IProjectSlide[];
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
