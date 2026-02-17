import { Injectable } from '@nestjs/common';
import { GameState, Player, Vector2 } from '@barrilitospace/shared';

@Injectable()
export class GameService {
  private gameState: GameState = {
    players: {},
  };

  addPlayer(id: string, name: string, avatarUrl?: string): Player {
    const newPlayer: Player = {
      id,
      name,
      position: { x: 400, y: 300 }, // Default spawn
      avatarUrl,
      color: '#' + Math.floor(Math.random() * 16777215).toString(16), // Random color
    };
    this.gameState.players[id] = newPlayer;
    return newPlayer;
  }

  removePlayer(id: string): void {
    delete this.gameState.players[id];
  }

  movePlayer(id: string, position: Vector2): void {
    if (this.gameState.players[id]) {
      this.gameState.players[id].position = position;
    }
  }

  getGameState(): GameState {
    return this.gameState;
  }
}
