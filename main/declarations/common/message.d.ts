export declare enum MessageType {
    ManagerReady = "ManagerReady",
    PresentationWindowReady = "PresentationWindowReady",
    ScreenUpdated = "ScreenUpdated",
    RequestLoadPresentation = "RequestLoadPresentation",
    ProjectLoaded = "ProjectLoaded",
    RequestPresentShow = "RequestPresentShow",
    RequestExistShow = "RequestExistShow",
    RequestNextSlide = "RequestNextSlide",
    RequestPreviousSlide = "RequestPreviousSlide",
    CurrentSlideUpdated = "CurrentSlideUpdated",
    TimerUpdated = "TimerUpdated",
    TimerStarted = "TimerStarted",
    TimerPaused = "TimerPaused",
    RequestStartTimer = "RequestStartTimer",
    RequestPauseTimer = "RequestPauseTimer",
    KeyPressed = "KeyPressed"
}
export interface IMessage {
    type: MessageType;
}
export interface IScreenInfo {
    width: number;
    height: number;
    id: number;
}
export declare enum MonitorViews {
    None = "None",
    Speaker = "Speaker",
    Audience = "Audience",
    Clock = "Clock"
}
export interface IScreenUpdatedMessage extends IMessage {
    screens: IScreenInfo[];
}
export interface IRequestPresentShowMessage extends IMessage {
    screenAssignments: {
        [id: number]: MonitorViews;
    };
}
export interface IRequestLoadPresentationMessage extends IMessage {
    filename: string;
}
export interface IProjectLoadedMessage extends IMessage {
    project: IProject;
}
export interface ITimerUpdatedMessage extends IMessage {
    elapsedTime: number;
}
export interface ICurrentSlideUpdatedMessage extends IMessage {
    currentSlideIndex: number;
    currentSlideUrl: string;
    currentNotesUrl: string;
    nextSlideUrl?: string;
}
export interface IProjectSlide {
    slide: string;
    notes: string;
}
export interface IProject {
    slides: IProjectSlide[];
}
export declare const ProjectSchema: {
    type: string;
    properties: {
        slides: {
            type: string;
            items: {
                type: string;
                properties: {
                    slide: {
                        type: string;
                    };
                    notes: {
                        type: string;
                    };
                };
                required: string[];
            };
        };
    };
    required: string[];
};
