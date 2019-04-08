export declare enum MessageType {
    ManagerReady = 0,
    ScreenUpdated = 1,
    RequestLoadPresentation = 2,
    ProjectLoaded = 3,
    RequestPresentShow = 4,
    RequestExistShow = 5,
    RequestNextSlide = 6,
    RequestPreviousSlide = 7,
    CurrentSlideUpdated = 8,
    TimerUpdated = 9,
    TimerStarted = 10,
    TimerPaused = 11,
    RequestStartTimer = 12,
    RequestPauseTimer = 13
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
