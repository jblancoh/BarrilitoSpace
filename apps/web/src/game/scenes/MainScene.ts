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
    private meetingZones: { id: string, zone: Phaser.GameObjects.Zone }[] = [];
    private deskZones: { id: string, zone: Phaser.GameObjects.Zone }[] = [];
    private playerZones: Map<string, string | null> = new Map(); // playerID -> zoneID (null if in public)

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
        this.load.image('desk', 'assets/desk.png');
        this.load.image('carpet', 'assets/carpet.png');
        this.load.image('table', 'assets/table.png');
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
        this.createWorkspace();
    }

    private createWorkspace() {
        // Meeting Room 1: Main Lounge
        const room1Pos = { x: -400, y: -400 };
        const carpet1 = this.add.image(room1Pos.x, room1Pos.y, 'carpet');
        carpet1.setDisplaySize(300, 300);
        carpet1.setDepth(0);

        const table1 = this.add.image(room1Pos.x, room1Pos.y, 'table');
        table1.setDisplaySize(180, 100);
        table1.setDepth(1);
        this.physics.add.existing(table1, true); // Obstacle

        const zone1 = this.add.zone(room1Pos.x, room1Pos.y, 300, 300);
        this.meetingZones.push({ id: 'room_lounge', zone: zone1 });

        // Debug: visualize zones (only for development)
        const graphics = this.add.graphics().setDepth(0).setAlpha(0.2);
        graphics.fillStyle(0x00ff00);
        graphics.fillRect(room1Pos.x - 150, room1Pos.y - 150, 300, 300);

        // Desk Area 1
        const desks = [
            { x: 400, y: -400 }, { x: 400, y: -250 }, { x: 400, y: -100 }
        ];

        desks.forEach((pos, index) => {
            const desk = this.add.image(pos.x, pos.y, 'desk');
            desk.setDisplaySize(80, 80);
            desk.setDepth(1);
            this.physics.add.existing(desk, true);

            const zone = this.add.zone(pos.x, pos.y, 100, 100);
            this.deskZones.push({ id: `desk_${index}`, zone: zone });

            // Debug desk zones
            graphics.fillStyle(0x0000ff);
            graphics.fillRect(pos.x - 50, pos.y - 50, 100, 100);

            // Visual label for private zone
            this.add.text(pos.x, pos.y + 45, 'PRIVATE', {
                fontSize: '10px',
                color: '#6366f1'
            }).setOrigin(0.5);
        });

        this.add.text(room1Pos.x, room1Pos.y - 170, 'CONFERENCE AREA', {
            fontSize: '20px',
            fontFamily: 'Inter, Arial',
            color: '#ffffff',
            backgroundColor: '#6366f1',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
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

        this.updatePlayerZones();
        this.updateSpatialAudio();
    }

    private updatePlayerZones() {
        if (this.meetingZones.length === 0) return; // Wait for initialization

        this.players.forEach((container, id) => {
            let currentZone: string | null = null;
            const px = container.x;
            const py = container.y;

            // Check meeting zones
            for (const { id: zoneId, zone } of this.meetingZones) {
                const bounds = zone.getBounds();
                if (Phaser.Geom.Rectangle.Contains(bounds, px, py)) {
                    currentZone = zoneId;
                    break;
                }
            }

            // Check desks (private zones)
            if (!currentZone) {
                for (const { id: zoneId, zone } of this.deskZones) {
                    const bounds = zone.getBounds();
                    if (Phaser.Geom.Rectangle.Contains(bounds, px, py)) {
                        currentZone = zoneId;
                        break;
                    }
                }
            }

            this.playerZones.set(id, currentZone);
        });
    }

    private updateSpatialAudio() {
        if (!this.myPlayerId || !this.players.has(this.myPlayerId)) return;

        const myPos = this.players.get(this.myPlayerId)!;
        const myZone = this.playerZones.get(this.myPlayerId);
        const hearingRadius = 400;

        this.players.forEach((otherContainer, otherId) => {
            if (otherId === this.myPlayerId) return;

            const otherZone = this.playerZones.get(otherId);
            const distance = Phaser.Math.Distance.Between(
                myPos.x, myPos.y,
                otherContainer.x, otherContainer.y
            );

            let volume = 0;

            // AUDIO LOGIC:
            // 1. If in the same meeting zone -> Full volume (1.0) regardless of distance
            // 2. If one is in a meeting zone and the other is not -> Muffled (0.2 max)
            // 3. If both are in public -> Standard falloff
            // 4. If in different private zones (desks) -> Muffled

            if (myZone && otherZone && myZone === otherZone) {
                volume = 1.0;
            } else if (distance < hearingRadius) {
                const baseVolume = 1 - (distance / hearingRadius);

                // Muffling if zones don't match or one is in a private area
                if (myZone !== otherZone) {
                    volume = baseVolume * 0.3; // Muffled
                } else {
                    volume = baseVolume;
                }
            }

            this.gameManager.mediaManager.setParticipantVolume(otherId, volume);

            // Also set visibility for video (simple toggle)
            const videoElement = document.querySelector(`video[data-participant-id="${otherId}"]`) as HTMLVideoElement;
            if (videoElement) {
                // Video follows similar logic, but more strict on visibility
                const shouldSee = (myZone === otherZone && myZone !== null) || distance < 200;
                videoElement.style.opacity = shouldSee ? '1' : '0.2';
                videoElement.style.filter = shouldSee ? 'none' : 'blur(5px)';
                videoElement.style.pointerEvents = shouldSee ? 'auto' : 'none';
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
