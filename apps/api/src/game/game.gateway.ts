import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import {
  SOCKET_EVENTS,
  JoinRoomPayload,
  PlayerMovedPayload,
} from '@barrilitospace/shared';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly gameService: GameService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.gameService.removePlayer(client.id);
    this.server.emit(SOCKET_EVENTS.PLAYER_LEFT, { id: client.id });
  }

  @SubscribeMessage(SOCKET_EVENTS.JOIN_ROOM)
  handleJoinRoom(
    @MessageBody() payload: JoinRoomPayload,
    @ConnectedSocket() client: Socket,
  ) {
    const player = this.gameService.addPlayer(
      client.id,
      payload.name,
      payload.avatarUrl,
    );

    // Send current state to the new player
    client.emit(
      SOCKET_EVENTS.CURRENT_PLAYERS,
      this.gameService.getGameState().players,
    );

    // Broadcast new player to others
    client.broadcast.emit(SOCKET_EVENTS.NEW_PLAYER, player);

    console.log(`Player joined: ${player.name} (${player.id})`);
  }

  @SubscribeMessage(SOCKET_EVENTS.PLAYER_MOVED)
  handlePlayerMoved(@MessageBody() payload: PlayerMovedPayload) {
    this.gameService.movePlayer(payload.id, payload.position);
    this.server.emit(SOCKET_EVENTS.PLAYER_MOVED, payload);
  }
}
