export interface Vector2 {
  x: number;
  y: number;
}

export interface Player {
  id: string;
  name: string;
  position: Vector2; // Current position
  targetPosition?: Vector2; // For improved interpolation
  avatarUrl?: string; // Optional for now
  color?: string; // Hex color for avatar placeholder
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
  CURRENT_PLAYERS: 'current_players',
  NEW_PLAYER: 'new_player',
} as const;

export interface JoinRoomPayload {
  name: string;
  avatarUrl?: string;
}

export interface PlayerMovedPayload {
  id: string;
  position: Vector2;
}

export interface PlayerJoinedPayload extends Player {}

export interface PlayerLeftPayload {
  id: string;
}
