export declare enum MessageType {
    ManagerReady = 0,
    RequestPresentShow = 1,
    RequestNext = 2,
    RequestPrevious = 3,
    ScreenUpdated = 4
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
    Audience = "Audience"
}
export interface IScreenUpdatedMessage extends IMessage {
    screens: IScreenInfo[];
}
export interface IRequestPresentShowMessage extends IMessage {
    screenAssignments: {
        [id: number]: MonitorViews;
    };
}
