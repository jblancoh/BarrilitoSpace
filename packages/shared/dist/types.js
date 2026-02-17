"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOCKET_EVENTS = void 0;
exports.SOCKET_EVENTS = {
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    JOIN_ROOM: 'join_room',
    LEAVE_ROOM: 'leave_room',
    PLAYER_MOVED: 'player_moved',
    PLAYER_JOINED: 'player_joined',
    PLAYER_LEFT: 'player_left',
    STATE_UPDATE: 'state_update', // Full state sync if needed
};
