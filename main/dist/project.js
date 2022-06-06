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
exports.setSlideNumber = exports.getSlideNumber = exports.sendSldeUpdatedMessage = exports.loadProject = exports.getCurrentProject = exports.getCurrentProjectDirectory = void 0;
const path_1 = require("path");
const util_1 = require("util");
const fs_1 = require("fs");
const { readFile } = fs_1.promises;
const jsonschema_1 = require("jsonschema");
const message_1 = require("./common/message");
const util_2 = require("./common/util");
const server_1 = require("./server");
let currentProjectDirectory;
let currentProject = null;
let currentSlide = 0;
function getCurrentProjectDirectory() {
    return currentProjectDirectory;
}
exports.getCurrentProjectDirectory = getCurrentProjectDirectory;
function getCurrentProject() {
    return currentProject;
}
exports.getCurrentProject = getCurrentProject;
async function loadProject(pathToProjectFile) {
    const presentationFileExists = await (0, util_1.promisify)(fs_1.exists)(pathToProjectFile);
    if (!presentationFileExists) {
        throw new Error(`Presentation file ${pathToProjectFile} does not exist`);
    }
    let data;
    try {
        data = await readFile(pathToProjectFile);
    }
    catch (err) {
        throw new Error(`Unable to read presentation file ${pathToProjectFile}: ${err}`);
    }
    try {
        currentProject = JSON.parse(data.toString());
    }
    catch (err) {
        throw new Error(`Could not parse project file ${pathToProjectFile}: ${err}`);
    }
    const results = new jsonschema_1.Validator().validate(currentProject, message_1.ProjectSchema);
    if (!results.valid) {
        throw new Error(`Invalid project file ${pathToProjectFile}:\n${results.errors.join('\n')}`);
    }
    currentProjectDirectory = (0, path_1.dirname)(pathToProjectFile);
    (0, server_1.setProjectDirectory)(currentProjectDirectory);
    currentProject.slides = currentProject.slides.map((slide) => ({
        slide: `/presentation/${slide.slide}`,
        notes: slide.notes && `/presentation/${slide.notes}`
    }));
    return currentProject;
}
exports.loadProject = loadProject;
function sendSldeUpdatedMessage() {
    if (currentProject === null) {
        throw new Error((0, util_2.createInternalError)('"currentProject" is unexpectedly null'));
    }
    const currentSlideContent = currentProject.slides[currentSlide];
    const nextSlideContent = currentProject.slides[currentSlide + 1];
    if (!currentSlideContent) {
        throw new Error('Internal Error: could not get current/next slides');
    }
    const message = {
        type: message_1.MessageType.CurrentSlideUpdated,
        currentSlideIndex: currentSlide + 1,
        numSlides: currentProject.slides.length,
        currentSlideUrl: currentSlideContent.slide,
        currentNotesUrl: currentSlideContent.notes,
        nextSlideUrl: nextSlideContent && nextSlideContent.slide
    };
    (0, server_1.sendMessageToPresentationWindows)(message);
}
exports.sendSldeUpdatedMessage = sendSldeUpdatedMessage;
function getSlideNumber() {
    return currentSlide;
}
exports.getSlideNumber = getSlideNumber;
function setSlideNumber(newSlideNumber) {
    currentSlide = newSlideNumber;
    sendSldeUpdatedMessage();
}
exports.setSlideNumber = setSlideNumber;
//# sourceMappingURL=project.js.map