/*
Copyright (c) Bryan Hughes <bryan@nebri.us>

This file is part of MDPrez.

MDPrez is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

MDPrez is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with MDPrez.  If not, see <http://www.gnu.org/licenses/>.
*/

export enum MessageType {
  ManagerReady,
  RequestPresentShow,
  RequestNext,
  RequestPrevious,
  ScreenUpdated
}

export interface IMessage {
  type: MessageType;
}

export interface IRequestPresentShowMessage extends IMessage {
  speakerMonitor?: number;
  audienceMonitor?: number;
}

export interface IScreenUpdatedMessage extends IMessage {
  screens: Array<{ width: number, height: number, id: number }>;
}
