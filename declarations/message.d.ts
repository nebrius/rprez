export declare enum MessageType {
    RequestPresentShow = 0,
    RequestNext = 1,
    RequestPrevious = 2,
    ScreenUpdated = 3
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
    }>;
}
