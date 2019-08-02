export declare enum MessageType {
    ManagerReady = 0,
    PresentationWindowReady = 1,
    ScreenUpdated = 2,
    RequestLoadPresentation = 3,
    ProjectLoaded = 4,
    RequestPresentShow = 5,
    RequestExistShow = 6,
    RequestNextSlide = 7,
    RequestPreviousSlide = 8,
    CurrentSlideUpdated = 9,
    TimerUpdated = 10,
    TimerStarted = 11,
    TimerPaused = 12,
    RequestStartTimer = 13,
    RequestPauseTimer = 14,
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
