import { IProject } from './common/message';
export declare function getCurrentProject(): IProject | null;
export declare function loadProject(pathToProjectFile: string): Promise<IProject>;
export declare function sendSlideUpdatedMessage(): void;
export declare function getSlideNumber(): number;
export declare function setSlideNumber(newSlideNumber: number): void;
