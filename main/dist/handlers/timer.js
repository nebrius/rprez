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
exports.handleRequestStartTimer = handleRequestStartTimer;
exports.handleRequestPauseTimer = handleRequestPauseTimer;
exports.handleRequestResetTimer = handleRequestResetTimer;
const server_1 = require("../server");
let elapsedTime = 0;
let timerInterval;
function handleRequestStartTimer() {
    clearInterval(timerInterval);
    let previousTime = Date.now();
    timerInterval = setInterval(() => {
        const currentTime = Date.now();
        elapsedTime += currentTime - previousTime;
        previousTime = currentTime;
        const tmerUpdatedMessage = {
            type: 'TimerUpdated',
            elapsedTime
        };
        (0, server_1.sendMessageToPresentationWindows)(tmerUpdatedMessage);
    }, 100);
    const message = {
        type: 'TimerStarted'
    };
    (0, server_1.sendMessageToPresentationWindows)(message);
}
function handleRequestPauseTimer() {
    clearInterval(timerInterval);
    const message = {
        type: 'TimerPaused'
    };
    (0, server_1.sendMessageToPresentationWindows)(message);
}
function handleRequestResetTimer() {
    elapsedTime = 0;
    const tmerUpdatedMessage = {
        type: 'TimerUpdated',
        elapsedTime
    };
    (0, server_1.sendMessageToPresentationWindows)(tmerUpdatedMessage);
}
//# sourceMappingURL=timer.js.map