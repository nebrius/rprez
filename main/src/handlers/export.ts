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

import { dialog, BrowserWindow } from 'electron';
import { getCurrentProject, getCurrentProjectDirectory } from '../project';
import { sleep, PORT } from '../common/util';
import { Document, ExternalDocument } from 'pdfjs';
import { promises } from 'fs';
import { ExportSlidesProgress, Message } from '../common/message';
import { sendMessageToManager } from '../server';

async function exportSlides(outputFile: string): Promise<void> {
  console.log(`Export presentation slides to ${outputFile}`);
  const startTime = Date.now();

  // Create the list of slide files
  const project = getCurrentProject();
  const projectDirectory = getCurrentProjectDirectory();
  if (!project || !projectDirectory) {
    throw new Error(
      '"handleRequestExportSlides" called before project was loaded'
    );
  }
  const slides: string[] = project.slides.map(
    (slide) => `http://localhost:${PORT}${slide.slide}`
  );

  // Calculate slide dimensions in microns
  const dpi = process.platform === 'darwin' ? 72 : 96;
  const width = 1921 / dpi / 0.00003937;
  const height = 1081 / dpi / 0.00003937;

  let progressPercentage = 0;
  const pages: ExternalDocument[] = [];
  await Promise.all(
    slides.map((slideUrl, index) => async () => {
      // Create a hidden renderer window. We'll use this window to load a page containing the slide in question,
      // and then "print" them to a PDF, which is stored in a buffer
      const renderWindow = new BrowserWindow({
        width: 2000,
        height: 1200,
        show: false
      });
      renderWindow.setMenu(null);
      renderWindow.loadURL(slideUrl);

      // TODO: convert this hacky crap into proper message-based loading complete timing
      let message: ExportSlidesProgress;
      for (let i = 0; i < 10; i++) {
        await sleep(1000);
        progressPercentage += 0.05 / slides.length;
        message = {
          type: 'ExportSlidesProgress',
          percentage: progressPercentage
        };
        sendMessageToManager(message);
      }

      // Convert the single slide to a PDF and store it for later use
      console.log(`Converting slide ${slideUrl}`);
      const data: Buffer = await renderWindow.webContents.printToPDF({
        printBackground: true,
        margins: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0
        },
        pageSize: { width, height }
      });
      pages[index] = new ExternalDocument(data);
      renderWindow.close();
      progressPercentage += 0.5 / slides.length;
      message = {
        type: 'ExportSlidesProgress',
        percentage: progressPercentage
      };
      sendMessageToManager(message);
    })
  ).catch((err) => console.error(err));

  // Create a new empty document, and merge all slides into it, then write to a file
  const mergedPdf = new Document();
  for (const page of pages) {
    mergedPdf.addPagesOf(page);
  }
  const mergedPdfBuffer = await mergedPdf.asBuffer();
  await promises.writeFile(outputFile, mergedPdfBuffer);

  // Wrap up
  console.log(`Finished exporting slides in ${Date.now() - startTime}ms`);
  const completedMessage: Message = {
    type: 'ExportSlidesCompleted'
  };
  sendMessageToManager(completedMessage);
}

export async function handleRequestExportSlides(): Promise<void> {
  const projectDirectory = getCurrentProjectDirectory();
  if (typeof projectDirectory !== 'string') {
    throw new Error(
      '"handleRequestExportSlides" called before project was loaded'
    );
  }
  const result = await dialog.showSaveDialog({
    title: 'Select export file path',
    defaultPath: projectDirectory,
    buttonLabel: 'Export',
    filters: [
      {
        name: 'PDF',
        extensions: ['pdf']
      }
    ]
  });
  if (!result.canceled && result.filePath) {
    await exportSlides(result.filePath);
  }
}
