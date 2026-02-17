import { io, Socket } from 'socket.io-client';
import Phaser from 'phaser';
import * as Shared from '@barrilitospace/shared';
import type { JoinRoomPayload } from '@barrilitospace/shared';
import { MainScene } from './scenes/MainScene';
import { MediaManager } from '../media/MediaManager';

const { SOCKET_EVENTS } = Shared;

export class GameManager {
    public socket: Socket;
    public game: Phaser.Game | null = null;
    public mediaManager: MediaManager;

    constructor() {
        this.socket = io('http://localhost:3000', {
            autoConnect: false,
        });
        this.mediaManager = new MediaManager();
    }

    connect() {
        if (!this.socket.connected) {
            this.socket.connect();
        }
    }

    disconnect() {
        if (this.socket.connected) {
            this.socket.disconnect();
        }
    }

    initGame(containerId: string) {
        if (this.game) return;

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            parent: containerId,
            backgroundColor: '#2d2d2d',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { x: 0, y: 0 }, // Top down game, no gravity
                    debug: true,
                },
            },
            scene: [MainScene],
            callbacks: {
                preBoot: (game) => {
                    // Pass gameManager instance to scenes
                    game.registry.set('gameManager', this);
                }
            }
        };

        this.game = new Phaser.Game(config);
        // Passing data to scene via registry or scene start is cleaner, 
        // but in Phaser 3 constructor injection isn't standard for scenes managed by SceneManager.
        // We'll use the scene's init method or registry.
        this.game.scene.start('MainScene', { gameManager: this });
    }

    destroyGame() {
        if (this.game) {
            this.game.destroy(true);
            this.game = null;
        }
    }

    async joinGame(name: string, avatarUrl?: string) {
        const payload: JoinRoomPayload = { name, avatarUrl };
        this.socket.emit(SOCKET_EVENTS.JOIN_ROOM, payload);

        // Fetch token and connect to LiveKit
        // In a real app, this should be done via a proper API call, not hardcoded fetch
        try {
            const response = await fetch(`http://localhost:3000/livekit/token?room=lobby&username=${name}`);
            const data = await response.json();
            if (data.token) {
                await this.mediaManager.connect(data.url, data.token);
            }
        } catch (e) {
            console.error("Failed to fetch LiveKit token", e);
        }
    }
}
