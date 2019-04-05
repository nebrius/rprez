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
export interface IRequestPresentShowMessage extends IMessage {
    speakerMonitor?: number;
    audienceMonitor?: number;
}
export interface IScreenUpdatedMessage extends IMessage {
    screens: Array<{
        width: number;
        height: number;
        id: number;
    }>;
}
