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
        this.load.image('floor', 'assets/floor.png');
        this.load.image('crate', 'assets/crate.png');
        this.load.image('avatar', 'assets/avatar.png');
    }

    create() {
        this.cursors = this.input.keyboard!.createCursorKeys();

        // Check if already connected
        if (this.gameManager.socket.connected) {
            this.myPlayerId = this.gameManager.socket.id || null;
            console.log('MainScene started, already connected. My ID:', this.myPlayerId);
        }

        // Create a tiled background using our floor texture
        this.add.tileSprite(0, 0, 4000, 4000, 'floor')
            .setOrigin(0.5)
            .setDepth(-1)
            .setAlpha(0.3);

        // Optional: keep grid for visual reference on top
        this.add.grid(0, 0, 4000, 4000, 64, 64, 0, 0, 0x333355, 0.2)
            .setOrigin(0.5)
            .setDepth(-0.9);

        // Set world bounds (larger)
        this.physics.world.setBounds(-2000, -2000, 4000, 4000);
        this.cameras.main.setBounds(-2000, -2000, 4000, 4000);
        this.cameras.main.setBackgroundColor('#0f0f1a');

        // Create a title in the world
        this.add.text(0, -200, 'Barrilito Lounge', {
            fontSize: '48px',
            fontFamily: 'Inter, Arial, sans-serif',
            color: '#6366f1',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Add some "decorations"
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(-1000, 1000);
            const y = Phaser.Math.Between(-1000, 1000);
            const size = Phaser.Math.Between(10, 30);
            this.add.circle(x, y, size, 0x333333, 0.5).setDepth(-0.5);
        }

        // Set up socket listeners via GameManager
        this.setupSocketListeners();

        // Clean up listeners on scene shutdown
        this.events.on('shutdown', () => {
            this.cleanupSocketListeners();
        });

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
            const crate = this.add.image(pos.x, pos.y, 'crate');
            crate.setDisplaySize(100, 100);
            this.physics.add.existing(crate, true);
            obstacles.add(crate);
        });
    }

    update() {
        if (!this.myPlayerId || !this.players.has(this.myPlayerId)) return;

        const myContainer = this.players.get(this.myPlayerId)!;
        const speed = 200;
        const body = myContainer.body as Phaser.Physics.Arcade.Body;

        if (!body) return;

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

        // Clear existing listeners
        socket.off(SOCKET_EVENTS.CONNECT);
        socket.off(SOCKET_EVENTS.CURRENT_PLAYERS);
        socket.off(SOCKET_EVENTS.NEW_PLAYER);
        socket.off(SOCKET_EVENTS.PLAYER_LEFT);
        socket.off(SOCKET_EVENTS.PLAYER_MOVED);

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

    private cleanupSocketListeners() {
        const socket = this.gameManager.socket;
        socket.off(SOCKET_EVENTS.CONNECT);
        socket.off(SOCKET_EVENTS.CURRENT_PLAYERS);
        socket.off(SOCKET_EVENTS.NEW_PLAYER);
        socket.off(SOCKET_EVENTS.PLAYER_LEFT);
        socket.off(SOCKET_EVENTS.PLAYER_MOVED);
        console.log('Socket listeners cleaned up');
    }

    private addPlayer(playerData: Player) {
        if (!this.add) return;
        if (this.players.has(playerData.id)) return;

        const container = this.add.container(playerData.position.x, playerData.position.y);
        container.setDepth(100);
        container.setSize(40, 40);

        // Character Sprite
        const sprite = this.add.sprite(0, 0, 'avatar');
        sprite.setDisplaySize(44, 44);

        // Colored ring for player identity
        const colorRing = this.add.circle(0, 0, 24);
        colorRing.setStrokeStyle(3, parseInt((playerData.color || '#6366f1').replace('#', '0x')));

        container.add([colorRing, sprite]);

        // Name tag
        const text = this.add.text(0, -35, playerData.name, {
            fontSize: '14px',
            fontFamily: 'Inter, Arial, sans-serif',
            color: '#ffffff',
            backgroundColor: '#000000aa',
            padding: { x: 6, y: 3 }
        }).setOrigin(0.5).setDepth(101);
        container.add(text);

        this.physics.world.enable(container);
        const body = container.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setCollideWorldBounds(true);
            body.setOffset(-20, -20);
            body.setSize(40, 40);
        }

        this.players.set(playerData.id, container);

        if (playerData.id === this.myPlayerId || playerData.id === this.gameManager.socket.id) {
            this.cameras.main.startFollow(container, true, 0.1, 0.1);
            this.myPlayerId = playerData.id;
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
            this.tweens.add({
                targets: container,
                x: position.x,
                y: position.y,
                duration: 50,
            });
        }
    }

    private emitMovement(x: number, y: number) {
        if (!this.myPlayerId) return;
        this.gameManager.socket.emit(SOCKET_EVENTS.PLAYER_MOVED, {
            id: this.myPlayerId,
            position: { x, y },
        });
    }
}
