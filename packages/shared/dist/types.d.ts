export interface Vector2 {
    x: number;
    y: number;
}
export interface Player {
    id: string;
    name: string;
    position: Vector2;
    avatarUrl?: string;
}
export interface GameState {
    players: Record<string, Player>;
}
export declare const SOCKET_EVENTS: {
    readonly CONNECT: "connect";
    readonly DISCONNECT: "disconnect";
    readonly JOIN_ROOM: "join_room";
    readonly LEAVE_ROOM: "leave_room";
    readonly PLAYER_MOVED: "player_moved";
    readonly PLAYER_JOINED: "player_joined";
    readonly PLAYER_LEFT: "player_left";
    readonly STATE_UPDATE: "state_update";
};
