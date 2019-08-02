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
exports.PORT = 3087;
var MessageType;
(function (MessageType) {
    MessageType[MessageType["ManagerReady"] = 0] = "ManagerReady";
    MessageType[MessageType["ScreenUpdated"] = 1] = "ScreenUpdated";
    MessageType[MessageType["RequestLoadPresentation"] = 2] = "RequestLoadPresentation";
    MessageType[MessageType["ProjectLoaded"] = 3] = "ProjectLoaded";
    MessageType[MessageType["RequestPresentShow"] = 4] = "RequestPresentShow";
    MessageType[MessageType["RequestExistShow"] = 5] = "RequestExistShow";
    MessageType[MessageType["RequestNextSlide"] = 6] = "RequestNextSlide";
    MessageType[MessageType["RequestPreviousSlide"] = 7] = "RequestPreviousSlide";
    MessageType[MessageType["CurrentSlideUpdated"] = 8] = "CurrentSlideUpdated";
    MessageType[MessageType["TimerUpdated"] = 9] = "TimerUpdated";
    MessageType[MessageType["TimerStarted"] = 10] = "TimerStarted";
    MessageType[MessageType["TimerPaused"] = 11] = "TimerPaused";
    MessageType[MessageType["RequestStartTimer"] = 12] = "RequestStartTimer";
    MessageType[MessageType["RequestPauseTimer"] = 13] = "RequestPauseTimer";
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