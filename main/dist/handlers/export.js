"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const project_1 = require("../project");
const util_1 = require("../common/util");
const pdfjs_1 = require("pdfjs");
const fs_1 = require("fs");
async function exportSlides(outputFile) {
    console.log(`Export presentation slides to ${outputFile}`);
    // Create the list of slide files
    const project = project_1.getCurrentProject();
    const projectDirectory = project_1.getCurrentProjectDirectory();
    if (!project || !projectDirectory) {
        throw new Error('"handleRequestExportSlides" called before project was loaded');
    }
    const slides = project.slides.map((slide) => `http://localhost:${util_1.PORT}${slide.slide}`);
    // Calculate slide dimensions in microns
    const dpi = process.platform === 'darwin' ? 72 : 96;
    const width = 1921 / dpi / 0.000039370;
    const height = 1081 / dpi / 0.000039370;
    const pages = [];
    await Promise.all(slides.map((slideUrl, index) => new Promise(async (resolve) => {
        // Create a hidden renderer window. We'll use this window to load a page containing the slide in question,
        // and then "print" them to a PDF, which is stored in a buffer
        const renderWindow = new electron_1.BrowserWindow({ width: 2000, height: 1200, show: false });
        renderWindow.setMenu(null);
        renderWindow.loadURL(slideUrl);
        // TODO: convert this hacky crap into proper message-based loading complete timing
        await util_1.sleep(10000);
        // Convert the single slide to a PDF and store it for later use
        console.log(`Converting slide ${slideUrl}`);
        const data = await renderWindow.webContents.printToPDF({
            printBackground: true,
            marginsType: 1,
            pageSize: { width, height }
        });
        pages[index] = new pdfjs_1.ExternalDocument(data);
        renderWindow.close();
        console.log(`Finished converting slide ${slideUrl}`);
        resolve();
    }))).catch((err) => console.error(err));
    // Create a new empty document, and merge all slides into it, then write to a file
    const mergedPdf = new pdfjs_1.Document();
    for (const page of pages) {
        mergedPdf.addPagesOf(page);
    }
    const mergedPdfBuffer = await mergedPdf.asBuffer();
    await fs_1.promises.writeFile(outputFile, mergedPdfBuffer);
    console.log('done');
}
async function handleRequestExportSlides() {
    const projectDirectory = project_1.getCurrentProjectDirectory();
    if (typeof projectDirectory !== 'string') {
        throw new Error('"handleRequestExportSlides" called before project was loaded');
    }
    const result = await electron_1.dialog.showSaveDialog({
        title: 'Select export file path',
        defaultPath: project_1.getCurrentProjectDirectory(),
        buttonLabel: 'Export',
        filters: [{
                name: 'PDF',
                extensions: ['pdf']
            }]
    });
    if (!result.canceled && result.filePath) {
        await exportSlides(result.filePath);
    }
}
exports.handleRequestExportSlides = handleRequestExportSlides;
//# sourceMappingURL=export.js.map