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

import { dirname, join } from 'path';
import { Validator } from 'jsonschema';
import {
  Project,
  CurrentSlideUpdatedMessage,
  ProjectSchema
} from './common/message';
import { createInternalError } from './common/util';
import {
  sendMessageToPresentationWindows,
  setProjectDirectory
} from './server';
import { readFile } from 'fs/promises';
import { exists } from './util';

let currentProjectDirectory: string | undefined;
let currentProject: Project | null = null;
let currentSlide = 0;

export function getCurrentProjectDirectory(): string | undefined {
  return currentProjectDirectory;
}

export function getCurrentProject(): Project | null {
  return currentProject;
}

export async function loadProject(pathToProjectFile: string): Promise<Project> {
  const presentationFileExists = await exists(pathToProjectFile);
  if (!presentationFileExists) {
    throw new Error(`Presentation file ${pathToProjectFile} does not exist`);
  }

  // Read in the presentation file
  let data: Buffer;
  try {
    data = await readFile(pathToProjectFile);
  } catch (err) {
    throw new Error(
      `Unable to read presentation file ${pathToProjectFile}: ${err}`
    );
  }

  // Parse the presentation file
  try {
    currentProject = JSON.parse(data.toString()) as Project;
  } catch (err) {
    throw new Error(
      `Could not parse project file ${pathToProjectFile}: ${err}`
    );
  }

  // Make sure the file contents matches the schema
  const results = new Validator().validate(currentProject, ProjectSchema);
  if (!results.valid) {
    throw new Error(
      `Invalid project file ${pathToProjectFile}:\n${results.errors.join('\n')}`
    );
  }

  // Set the project directory for use later
  currentProjectDirectory = dirname(pathToProjectFile);
  setProjectDirectory(currentProjectDirectory);

  // Format the slide data to match our internal URL scheme and validate the files exist
  for (let i = 0; i < currentProject.slides.length; i++) {
    const slide = currentProject.slides[i];
    if (!slide) {
      throw new Error('Internal Error: slide is unexpectedly undefined');
    }
    const resolvedFilePath = join(currentProjectDirectory, slide.slide);
    if (!(await exists(resolvedFilePath))) {
      throw new Error(`Could not find slide ${resolvedFilePath}`);
    }
    currentProject.slides[i] = {
      slide: `/presentation/${slide.slide}`,
      notes: slide.notes && `/presentation/${slide.notes}`
    };
  }

  return currentProject as Project;
}

export function sendSlideUpdatedMessage() {
  if (currentProject === null) {
    throw new Error(
      createInternalError('"currentProject" is unexpectedly null')
    );
  }
  const currentSlideContent = currentProject.slides[currentSlide];
  const nextSlideContent = currentProject.slides[currentSlide + 1];
  if (!currentSlideContent) {
    throw new Error('Internal Error: could not get current/next slides');
  }
  const message: CurrentSlideUpdatedMessage = {
    type: 'CurrentSlideUpdated',
    currentSlideIndex: currentSlide + 1, // Need 1 based, not 0 based index
    numSlides: currentProject.slides.length,
    currentSlideUrl: currentSlideContent.slide,
    currentNotesUrl: currentSlideContent.notes,
    nextSlideUrl: nextSlideContent && nextSlideContent.slide
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
