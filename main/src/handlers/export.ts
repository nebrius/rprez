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

import { dialog } from 'electron';
import * as ElectronPDF from 'electron-pdf';
import { getCurrentProject, getCurrentProjectDirectory } from '../project';
import { IProjectSlide } from 'src/common/message';
import { normalize, join } from 'path';

const exporter = new ElectronPDF();
exporter.start();

function exportSlides(outputFile: string): void {
  console.log(`Export presentation slides to ${outputFile}`);
  const project = getCurrentProject();
  const projectDirectory = getCurrentProjectDirectory();
  if (!project || !projectDirectory) {
    throw new Error('"handleRequestExportSlides" called before project was loaded');
  }
  const slides: IProjectSlide[] = project.slides.map((slide) => ({
    slide: normalize(join(projectDirectory, slide.slide.replace(/^\/presentation\//, ''))),
    notes: slide.notes
  }));
  console.log(slides);
  exporter
}

export async function handleRequestExportSlides(): Promise<void> {
  const projectDirectory = getCurrentProjectDirectory();
  if (typeof projectDirectory !== 'string') {
    throw new Error('"handleRequestExportSlides" called before project was loaded');
  }
  const result = await dialog.showSaveDialog({
    title: 'Select export file path',
    defaultPath: getCurrentProjectDirectory(),
    buttonLabel: 'Export',
    filters: [{
      name: 'PDF',
      extensions: [ 'pdf' ]
    }]
  });
  if (!result.canceled && result.filePath) {
    exportSlides(result.filePath);
  }
}
