export interface Vector2 {
    x: number;
    y: number;
}

export interface Player {
    id: string;
    name: string;
    position: Vector2;
    avatarUrl?: string; // Optional for now
}

export interface GameState {
    players: Record<string, Player>;
}

export const SOCKET_EVENTS = {
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    JOIN_ROOM: 'join_room',
    LEAVE_ROOM: 'leave_room',
    PLAYER_MOVED: 'player_moved',
    PLAYER_JOINED: 'player_joined',
    PLAYER_LEFT: 'player_left',
    STATE_UPDATE: 'state_update', // Full state sync if needed
} as const;
