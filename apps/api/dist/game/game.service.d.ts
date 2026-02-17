import { GameState, Player, Vector2 } from '@barrilitospace/shared';
export declare class GameService {
    private gameState;
    addPlayer(id: string, name: string, avatarUrl?: string): Player;
    removePlayer(id: string): void;
    movePlayer(id: string, position: Vector2): void;
    getGameState(): GameState;
}
