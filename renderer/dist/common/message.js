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
export var MessageType;
(function (MessageType) {
    MessageType["ManagerReady"] = "ManagerReady";
    MessageType["PresentationWindowReady"] = "PresentationWindowReady";
    MessageType["ClientWindowReady"] = "ClientWindowReady";
    MessageType["ScreenUpdated"] = "ScreenUpdated";
    MessageType["RequestLoadPresentation"] = "RequestLoadPresentation";
    MessageType["ProjectLoaded"] = "ProjectLoaded";
    MessageType["RequestPresentShow"] = "RequestPresentShow";
    MessageType["RequestExistShow"] = "RequestExistShow";
    MessageType["RequestNextSlide"] = "RequestNextSlide";
    MessageType["RequestPreviousSlide"] = "RequestPreviousSlide";
    MessageType["CurrentSlideUpdated"] = "CurrentSlideUpdated";
    MessageType["TimerUpdated"] = "TimerUpdated";
    MessageType["TimerStarted"] = "TimerStarted";
    MessageType["TimerPaused"] = "TimerPaused";
    MessageType["RequestStartTimer"] = "RequestStartTimer";
    MessageType["RequestPauseTimer"] = "RequestPauseTimer";
    MessageType["ClientMessage"] = "ClientMessage";
})(MessageType || (MessageType = {}));
export var MonitorViews;
(function (MonitorViews) {
    MonitorViews["None"] = "None";
    MonitorViews["Speaker"] = "Speaker";
    MonitorViews["Audience"] = "Audience";
    MonitorViews["Clock"] = "Clock";
})(MonitorViews || (MonitorViews = {}));
export const ProjectSchema = {
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