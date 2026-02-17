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

        // Create a more visible grid background
        this.add.grid(0, 0, 4000, 4000, 64, 64, 0x1a1a2e, 0.5, 0x333355, 0.5)
            .setOrigin(0.5)
            .setDepth(-1);

        // Set world bounds (larger)
        this.physics.world.setBounds(-2000, -2000, 4000, 4000);
        this.cameras.main.setBounds(-2000, -2000, 4000, 4000);
        this.cameras.main.setBackgroundColor('#0f0f1a');

        // Set up socket listeners via GameManager
        this.setupSocketListeners();

        this.createObstacles();
    }

    private createObstacles() {
        const obstacles = this.physics.add.staticGroup();

        // Random obstacles for demonstration
        const positions = [
            { x: -200, y: -200 }, { x: 400, y: 100 },
            { x: -500, y: 500 }, { x: 300, y: -400 }
        ];

        positions.forEach(pos => {
            const rect = this.add.rectangle(pos.x, pos.y, 100, 100, 0x6366f1, 0.3);
            rect.setStrokeStyle(2, 0x6366f1);
            this.physics.add.existing(rect, true);
            obstacles.add(rect);
        });

        // Add collider for local player (this will be tricky since we use velocity, but let's try)
        // For now, these are just visual "markers" to test camera follow
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

        this.updateSpatialAudio();
    }

    private updateSpatialAudio() {
        if (!this.myPlayerId || !this.players.has(this.myPlayerId)) return;

        const myPos = this.players.get(this.myPlayerId)!;
        const hearingRadius = 400;

        this.players.forEach((otherContainer, otherId) => {
            if (otherId === this.myPlayerId) return;

            const distance = Phaser.Math.Distance.Between(
                myPos.x, myPos.y,
                otherContainer.x, otherContainer.y
            );

            let volume = 0;
            if (distance < hearingRadius) {
                volume = 1 - (distance / hearingRadius);
                // Linear falloff, could be changed to exponential/logarithmic
            }

            this.gameManager.mediaManager.setParticipantVolume(otherId, volume);

            // Also set visibility for video (simple toggle)
            const videoElement = document.querySelector(`video[data-participant-id="${otherId}"]`) as HTMLVideoElement;
            if (videoElement) {
                videoElement.style.opacity = volume > 0.1 ? '1' : '0';
                videoElement.style.pointerEvents = volume > 0.1 ? 'auto' : 'none';
            }
        });
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
        container.setDepth(10);
        container.setSize(40, 40);

        // Avatar circle with border
        const border = this.add.circle(0, 0, 22, 0xffffff);
        const circle = this.add.circle(0, 0, 20, parseInt((playerData.color || '#6366f1').replace('#', '0x')));
        container.add([border, circle]);

        // Name tag with better styling
        const text = this.add.text(0, -35, playerData.name, {
            fontSize: '16px',
            fontFamily: 'Inter, Arial, sans-serif',
            color: '#ffffff',
            backgroundColor: '#000000aa',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5);
        container.add(text);

        this.physics.world.enable(container);
        const body = container.body as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true);
        body.setOffset(-20, -20);
        body.setSize(40, 40);

        this.players.set(playerData.id, container);

        // If this is our player, make camera follow
        if (playerData.id === this.myPlayerId) {
            this.cameras.main.startFollow(container, true, 0.1, 0.1);
        }
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
