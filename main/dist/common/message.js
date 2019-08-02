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
var MessageType;
(function (MessageType) {
    MessageType[MessageType["ManagerReady"] = 0] = "ManagerReady";
    MessageType[MessageType["PresentationWindowReady"] = 1] = "PresentationWindowReady";
    MessageType[MessageType["ScreenUpdated"] = 2] = "ScreenUpdated";
    MessageType[MessageType["RequestLoadPresentation"] = 3] = "RequestLoadPresentation";
    MessageType[MessageType["ProjectLoaded"] = 4] = "ProjectLoaded";
    MessageType[MessageType["RequestPresentShow"] = 5] = "RequestPresentShow";
    MessageType[MessageType["RequestExistShow"] = 6] = "RequestExistShow";
    MessageType[MessageType["RequestNextSlide"] = 7] = "RequestNextSlide";
    MessageType[MessageType["RequestPreviousSlide"] = 8] = "RequestPreviousSlide";
    MessageType[MessageType["CurrentSlideUpdated"] = 9] = "CurrentSlideUpdated";
    MessageType[MessageType["TimerUpdated"] = 10] = "TimerUpdated";
    MessageType[MessageType["TimerStarted"] = 11] = "TimerStarted";
    MessageType[MessageType["TimerPaused"] = 12] = "TimerPaused";
    MessageType[MessageType["RequestStartTimer"] = 13] = "RequestStartTimer";
    MessageType[MessageType["RequestPauseTimer"] = 14] = "RequestPauseTimer";
    MessageType["KeyPressed"] = "KeyPressed";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
var MonitorViews;
(function (MonitorViews) {
    MonitorViews["None"] = "None";
    MonitorViews["Speaker"] = "Speaker";
    MonitorViews["Audience"] = "Audience";
    MonitorViews["Clock"] = "Clock";
})(MonitorViews = exports.MonitorViews || (exports.MonitorViews = {}));
exports.ProjectSchema = {
    type: 'object',
    properties: {
        slides: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    slide: {
                        type: 'string'
                    },
                    notes: {
                        type: 'string'
                    }
                },
                required: ['slide']
            }
        }
    },
    required: ['slides']
};
//# sourceMappingURL=message.js.map