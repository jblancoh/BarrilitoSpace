import React, { useEffect, useRef } from 'react';
import { GameManager } from '../game/GameManager';

const gameManager = new GameManager();

export const GameCanvas: React.FC = () => {
    const gameContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (gameContainerRef.current) {
            gameManager.connect();
            gameManager.initGame(gameContainerRef.current.id);
        }

        return () => {
            gameManager.destroyGame();
            gameManager.disconnect();
        };
    }, []);

    return (
        <div
            id="phaser-game-container"
            ref={gameContainerRef}
            style={{ width: '100%', height: '100vh', overflow: 'hidden' }}
        />
    );
};
