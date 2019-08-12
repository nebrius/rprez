import { MonitorViews } from './common/message';
export declare function getDisplays(): Electron.Display[];
export declare function getDisplayForId(id: number): Electron.Display;
export declare function createManagerWindow(): Promise<void>;
export declare function createPresentationWindow(type: MonitorViews, x: number, y: number, developerMode: boolean): void;
export declare function closePresentationWindows(): void;
