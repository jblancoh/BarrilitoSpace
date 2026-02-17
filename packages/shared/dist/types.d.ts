export interface Vector2 {
    x: number;
    y: number;
}
export interface Player {
    id: string;
    name: string;
    position: Vector2;
    targetPosition?: Vector2;
    avatarUrl?: string;
    color?: string;
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
    readonly CURRENT_PLAYERS: "current_players";
    readonly NEW_PLAYER: "new_player";
};
export interface JoinRoomPayload {
    name: string;
    avatarUrl?: string;
}
export interface PlayerMovedPayload {
    id: string;
    position: Vector2;
}
export interface PlayerJoinedPayload extends Player {
}
export interface PlayerLeftPayload {
    id: string;
}
