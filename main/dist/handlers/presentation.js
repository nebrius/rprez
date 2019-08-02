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
const path_1 = require("path");
const message_1 = require("../common/message");
const project_1 = require("../project");
const windows_1 = require("../windows");
const server_1 = require("../server");
async function handleRequestLoadPresentation(loadMessage) {
    console.log(`Loading presentation at ${loadMessage.filename}`);
    let presentationProject;
    try {
        presentationProject = await project_1.loadProject(loadMessage.filename);
    }
    catch (err) {
        // TODO: display error in the UI
        console.error(err);
        return;
    }
    const projectDir = path_1.dirname(loadMessage.filename);
    presentationProject.slides = presentationProject.slides.map((slide) => ({
        slide: path_1.resolve(projectDir, slide.slide),
        notes: slide.notes && path_1.resolve(projectDir, slide.notes)
    }));
    project_1.setSlideNumber(0);
    const message = {
        type: message_1.MessageType.ProjectLoaded,
        project: presentationProject
    };
    server_1.sendMessageToManager(message);
}
exports.handleRequestLoadPresentation = handleRequestLoadPresentation;
function handleRequestPresentShow(presentMessage) {
    console.log('Starting presentation');
    for (const monitorId in presentMessage.screenAssignments) {
        if (!presentMessage.screenAssignments.hasOwnProperty(monitorId)) {
            continue;
        }
        const screenAssignment = presentMessage.screenAssignments[monitorId];
        const display = windows_1.getDisplayForId(parseInt(monitorId, 10));
        console.log(`Opening ${message_1.MonitorViews[screenAssignment]} view on monitor ` +
            `${monitorId} (${display.bounds.width}x${display.bounds.height})`);
        windows_1.createPresentationWindow(screenAssignment, display.bounds.x, display.bounds.y);
        setTimeout(project_1.sendSlideUpdatedMessage, 1000);
    }
}
exports.handleRequestPresentShow = handleRequestPresentShow;
function handleRequestExitShow() {
    console.log('Exiting presentation');
    windows_1.closePresentationWindows();
}
exports.handleRequestExitShow = handleRequestExitShow;
//# sourceMappingURL=presentation.js.map