export declare enum MessageType {
    ManagerReady = 0,
    RequestPresentShow = 1,
    RequestExistShow = 2,
    RequestNextSlide = 3,
    RequestPreviousSlide = 4,
    ScreenUpdated = 5
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
