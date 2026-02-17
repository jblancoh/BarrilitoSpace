import Phaser from 'phaser';
import * as Shared from '@barrilitospace/shared';
import type { Player, Vector2 } from '@barrilitospace/shared';
import type { GameManager } from '../GameManager';

const { SOCKET_EVENTS } = Shared;

export class MainScene extends Phaser.Scene {
    private players: Map<string, Phaser.GameObjects.Container> = new Map();
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private gameManager!: GameManager;
    private myPlayerId: string | null = null;

    constructor() {
        super({ key: 'MainScene' });
    }

    init(data: { gameManager: GameManager }) {
        this.gameManager = data.gameManager;
    }

    preload() {
        // Load assets here if needed
        // this.load.image('avatar', 'assets/avatar.png');
    }

    create() {
        this.cursors = this.input.keyboard!.createCursorKeys();

        // Set up socket listeners via GameManager
        this.setupSocketListeners();

        // Notify server we've joined
        this.gameManager.joinGame('Guest' + Math.floor(Math.random() * 1000));
    }

    update() {
        if (!this.myPlayerId || !this.players.has(this.myPlayerId)) return;

        const myContainer = this.players.get(this.myPlayerId)!;
        const speed = 200;
        const body = myContainer.body as Phaser.Physics.Arcade.Body;

        body.setVelocity(0);

        let moved = false;

        if (this.cursors.left.isDown) {
            body.setVelocityX(-speed);
            moved = true;
        } else if (this.cursors.right.isDown) {
            body.setVelocityX(speed);
            moved = true;
        }

        if (this.cursors.up.isDown) {
            body.setVelocityY(-speed);
            moved = true;
        } else if (this.cursors.down.isDown) {
            body.setVelocityY(speed);
            moved = true;
        }

        if (moved) {
            this.emitMovement(myContainer.x, myContainer.y);
        }
    }

    private setupSocketListeners() {
        const socket = this.gameManager.socket;

        socket.on(SOCKET_EVENTS.CONNECT, () => {
            console.log('Connected to server', socket.id);
            this.myPlayerId = socket.id || null;
        });

        socket.on(SOCKET_EVENTS.CURRENT_PLAYERS, (players: Record<string, Player>) => {
            Object.values(players).forEach((player) => this.addPlayer(player));
        });

        socket.on(SOCKET_EVENTS.NEW_PLAYER, (player: Player) => {
            this.addPlayer(player);
        });

        socket.on(SOCKET_EVENTS.PLAYER_LEFT, (payload: { id: string }) => {
            this.removePlayer(payload.id);
        });

        socket.on(SOCKET_EVENTS.PLAYER_MOVED, (payload: { id: string; position: Vector2 }) => {
            if (payload.id !== this.myPlayerId) {
                this.updatePlayerPosition(payload.id, payload.position);
            }
        });
    }

    private addPlayer(playerData: Player) {
        if (this.players.has(playerData.id)) return;

        const container = this.add.container(playerData.position.x, playerData.position.y);

        // Avatar circle
        const circle = this.add.circle(0, 0, 20, parseInt((playerData.color || '#ffffff').replace('#', '0x')));
        container.add(circle);

        // Name tag
        const text = this.add.text(0, -30, playerData.name, {
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: '#00000080',
            padding: { x: 4, y: 2 }
        }).setOrigin(0.5);
        container.add(text);

        this.physics.world.enable(container);
        const body = container.body as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true);

        this.players.set(playerData.id, container);
    }

    private removePlayer(id: string) {
        if (this.players.has(id)) {
            this.players.get(id)!.destroy();
            this.players.delete(id);
        }
    }

    private updatePlayerPosition(id: string, position: Vector2) {
        const container = this.players.get(id);
        if (container) {
            // Simple interpolation could be added here
            this.tweens.add({
                targets: container,
                x: position.x,
                y: position.y,
                duration: 50, // Update rate is usually faster, so keep this low
            });
        }
    }

    private emitMovement(x: number, y: number) {
        if (!this.myPlayerId) return;

        // Throttling could be added here
        this.gameManager.socket.emit(SOCKET_EVENTS.PLAYER_MOVED, {
            id: this.myPlayerId,
            position: { x, y },
        });
    }
}
