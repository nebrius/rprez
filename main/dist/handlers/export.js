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
const ElectronPDF = require("electron-pdf");
const project_1 = require("../project");
const path_1 = require("path");
function exportSlides(outputFile) {
    console.log(`Export presentation slides to ${outputFile}`);
    const project = project_1.getCurrentProject();
    const projectDirectory = project_1.getCurrentProjectDirectory();
    if (!project || !projectDirectory) {
        throw new Error('"handleRequestExportSlides" called before project was loaded');
    }
    const slides = project.slides.map((slide) => ({
        slide: path_1.normalize(path_1.join(projectDirectory, slide.slide.replace(/^\/presentation\//, ''))),
        notes: slide.notes
    }));
    console.log(slides);
    const exporter = new ElectronPDF();
    exporter.on('charged', () => {
        // DO stuff
    });
    exporter.start();
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
        exportSlides(result.filePath);
    }
}
exports.handleRequestExportSlides = handleRequestExportSlides;
//# sourceMappingURL=export.js.map