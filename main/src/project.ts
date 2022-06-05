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

import { dirname } from 'path';
import { promisify } from 'util';
import { exists, promises } from 'fs';
const { readFile } = promises;
import { Validator } from 'jsonschema';
import {
  MessageType,
  IProject,
  ICurrentSlideUpdatedMessage,
  ProjectSchema
} from './common/message';
import { createInternalError } from './common/util';
import {
  sendMessageToPresentationWindows,
  setProjectDirectory
} from './server';

let currentProjectDirectory: string | undefined;
let currentProject: IProject | null = null;
let currentSlide = 0;

export function getCurrentProjectDirectory(): string | undefined {
  return currentProjectDirectory;
}

export function getCurrentProject(): IProject | null {
  return currentProject;
}

export async function loadProject(
  pathToProjectFile: string
): Promise<IProject> {
  const presentationFileExists = await promisify(exists)(pathToProjectFile);
  if (!presentationFileExists) {
    throw new Error(`Presentation file ${pathToProjectFile} does not exist`);
  }

  let data: Buffer;
  try {
    data = await readFile(pathToProjectFile);
  } catch (err) {
    throw new Error(
      `Unable to read presentation file ${pathToProjectFile}: ${err}`
    );
  }

  try {
    currentProject = JSON.parse(data.toString());
  } catch (err) {
    throw new Error(
      `Could not parse project file ${pathToProjectFile}: ${err}`
    );
  }

  const results = new Validator().validate(currentProject, ProjectSchema);
  if (!results.valid) {
    throw new Error(
      `Invalid project file ${pathToProjectFile}:\n${results.errors.join('\n')}`
    );
  }

  currentProjectDirectory = dirname(pathToProjectFile);
  setProjectDirectory(currentProjectDirectory);

  (currentProject as IProject).slides = (currentProject as IProject).slides.map(
    (slide) => ({
      slide: `/presentation/${slide.slide}`,
      notes: slide.notes && `/presentation/${slide.notes}`
    })
  );

  return currentProject as IProject;
}

export function sendSlideUpdatedMessage() {
  if (currentProject === null) {
    throw new Error(
      createInternalError('"currentProject" is unexpectedly null')
    );
  }
  const message: ICurrentSlideUpdatedMessage = {
    type: MessageType.CurrentSlideUpdated,
    currentSlideIndex: currentSlide + 1, // Need 1 based, not 0 based index
    numSlides: currentProject.slides.length,
    currentSlideUrl: currentProject.slides[currentSlide].slide,
    currentNotesUrl: currentProject.slides[currentSlide].notes,
    nextSlideUrl:
      currentProject.slides[currentSlide + 1] &&
      currentProject.slides[currentSlide + 1].slide
  };
  sendMessageToPresentationWindows(message);
}

export function getSlideNumber(): number {
  return currentSlide;
}

export function setSlideNumber(newSlideNumber: number): void {
  currentSlide = newSlideNumber;
  sendSlideUpdatedMessage();
}
