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
const util_1 = require("util");
const fs_1 = require("fs");
const { readFile } = fs_1.promises;
const jsonschema_1 = require("jsonschema");
const message_1 = require("./common/message");
const util_2 = require("./common/util");
const server_1 = require("./server");
let currentProject = null;
let currentSlide = 0;
function getCurrentProject() {
    return currentProject;
}
exports.getCurrentProject = getCurrentProject;
async function loadProject(pathToProjectFile) {
    const presentationFileExists = await util_1.promisify(fs_1.exists)(pathToProjectFile);
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
    const results = (new jsonschema_1.Validator()).validate(currentProject, message_1.ProjectSchema);
    if (!results.valid) {
        throw new Error(`Invalid project file ${pathToProjectFile}:\n${results.errors.join('\n')}`);
    }
    return currentProject;
}
exports.loadProject = loadProject;
function sendSlideUpdatedMessage() {
    if (currentProject === null) {
        throw new Error(util_2.createInternalError('"currentProject" is unexpectedly null'));
    }
    const message = {
        type: message_1.MessageType.CurrentSlideUpdated,
        currentSlideIndex: currentSlide,
        currentSlideUrl: currentProject.slides[currentSlide].slide,
        currentNotesUrl: currentProject.slides[currentSlide].notes,
        nextSlideUrl: currentProject.slides[currentSlide + 1] && currentProject.slides[currentSlide + 1].slide
    };
    server_1.sendMessageToPresentationWindows(message);
}
exports.sendSlideUpdatedMessage = sendSlideUpdatedMessage;
function getSlideNumber() {
    return currentSlide;
}
exports.getSlideNumber = getSlideNumber;
function setSlideNumber(newSlideNumber) {
    currentSlide = newSlideNumber;
    sendSlideUpdatedMessage();
}
exports.setSlideNumber = setSlideNumber;
//# sourceMappingURL=project.js.map