import { IRequestLoadPresentationMessage, IRequestPresentShowMessage } from '../message';
export declare function handleRequestLoadPresentation(loadMessage: IRequestLoadPresentationMessage): Promise<void>;
export declare function handleRequestPresentShow(presentMessage: IRequestPresentShowMessage): void;
export declare function handleRequestExitShow(): void;
