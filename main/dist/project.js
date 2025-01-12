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
exports.getCurrentProjectDirectory = getCurrentProjectDirectory;
exports.getCurrentProject = getCurrentProject;
exports.loadProject = loadProject;
exports.sendSlideUpdatedMessage = sendSlideUpdatedMessage;
exports.getSlideNumber = getSlideNumber;
exports.setSlideNumber = setSlideNumber;
const path_1 = require("path");
const jsonschema_1 = require("jsonschema");
const message_1 = require("./common/message");
const util_1 = require("./common/util");
const server_1 = require("./server");
const promises_1 = require("fs/promises");
const util_2 = require("./util");
let currentProjectDirectory;
let currentProject = null;
let currentSlide = 0;
function getCurrentProjectDirectory() {
    return currentProjectDirectory;
}
function getCurrentProject() {
    return currentProject;
}
async function loadProject(pathToProjectFile) {
    const presentationFileExists = await (0, util_2.exists)(pathToProjectFile);
    if (!presentationFileExists) {
        throw new Error(`Presentation file ${pathToProjectFile} does not exist`);
    }
    // Read in the presentation file
    let data;
    try {
        data = await (0, promises_1.readFile)(pathToProjectFile);
    }
    catch (err) {
        throw new Error(`Unable to read presentation file ${pathToProjectFile}: ${err}`);
    }
    // Parse the presentation file
    try {
        currentProject = JSON.parse(data.toString());
    }
    catch (err) {
        throw new Error(`Could not parse project file ${pathToProjectFile}: ${err}`);
    }
    // Make sure the file contents matches the schema
    const results = new jsonschema_1.Validator().validate(currentProject, message_1.ProjectSchema);
    if (!results.valid) {
        throw new Error(`Invalid project file ${pathToProjectFile}:\n${results.errors.join('\n')}`);
    }
    // Set the project directory for use later
    currentProjectDirectory = (0, path_1.dirname)(pathToProjectFile);
    (0, server_1.setProjectDirectory)(currentProjectDirectory);
    // Format the slide data to match our internal URL scheme and validate the files exist
    for (let i = 0; i < currentProject.slides.length; i++) {
        const slide = currentProject.slides[i];
        if (!slide) {
            throw new Error('Internal Error: slide is unexpectedly undefined');
        }
        const resolvedFilePath = (0, path_1.join)(currentProjectDirectory, slide.slide);
        if (!(await (0, util_2.exists)(resolvedFilePath))) {
            throw new Error(`Could not find slide ${resolvedFilePath}`);
        }
        currentProject.slides[i] = {
            slide: `/presentation/${slide.slide}`,
            notes: slide.notes && `/presentation/${slide.notes}`
        };
    }
    return currentProject;
}
function sendSlideUpdatedMessage() {
    if (currentProject === null) {
        throw new Error((0, util_1.createInternalError)('"currentProject" is unexpectedly null'));
    }
    const currentSlideContent = currentProject.slides[currentSlide];
    const nextSlideContent = currentProject.slides[currentSlide + 1];
    if (!currentSlideContent) {
        throw new Error('Internal Error: could not get current/next slides');
    }
    const message = {
        type: 'CurrentSlideUpdated',
        currentSlideIndex: currentSlide + 1, // Need 1 based, not 0 based index
        numSlides: currentProject.slides.length,
        currentSlideUrl: currentSlideContent.slide,
        currentNotesUrl: currentSlideContent.notes,
        nextSlideUrl: nextSlideContent && nextSlideContent.slide
    };
    (0, server_1.sendMessageToPresentationWindows)(message);
}
function getSlideNumber() {
    return currentSlide;
}
function setSlideNumber(newSlideNumber) {
    currentSlide = newSlideNumber;
    sendSlideUpdatedMessage();
}
//# sourceMappingURL=project.js.map