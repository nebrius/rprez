import { IMessage } from './common/message.js';
export declare function sendMessage(msg: IMessage): void;
export declare function addMessageListener(cb: (msg: IMessage) => void): void;
