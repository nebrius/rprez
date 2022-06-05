/*
Copyright (c) Bryan Hughes <bryan@nebri.us>

This file is part of RPrez.

RPrez is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

RPrez is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with RPrez.  If not, see <http://www.gnu.org/licenses/>.
*/
import { PORT } from './common/util.js';
const connection = new WebSocket(`ws://localhost:${PORT}/ws`);
let isConnected = false;
const messageQueue = [];
connection.addEventListener('open', () => {
    console.log('Connected to bridging server');
    isConnected = true;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const message = messageQueue.shift();
        if (!message) {
            break;
        }
        sendMessage(message);
    }
});
connection.addEventListener('error', (err) => {
    console.error(`Could not connect to bridging server: ${err}`);
});
export function sendMessage(msg) {
    if (!isConnected) {
        messageQueue.push(msg);
    }
    else {
        connection.send(JSON.stringify(msg));
    }
}
export function addMessageListener(cb) {
    connection.addEventListener('message', (msg) => {
        console.log(`Received message: ${msg.data}`);
        cb(JSON.parse(msg.data));
    });
}
//# sourceMappingURL=messaging.js.map