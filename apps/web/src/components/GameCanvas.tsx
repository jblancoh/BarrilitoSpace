import React, { useEffect, useRef, useState } from 'react';
import { GameManager } from '../game/GameManager';
import { VideoGrid } from './VideoGrid';
import { RemoteTrack, RemoteParticipant } from 'livekit-client';

const gameManager = new GameManager();

interface GameCanvasProps {
    username: string;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ username }) => {
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const [remoteTracks, setRemoteTracks] = useState<Array<{ track: RemoteTrack; participant: RemoteParticipant }>>([]);

    useEffect(() => {
        if (gameContainerRef.current) {
            // Handle media tracks
            gameManager.mediaManager.onTrack = (track, participant, attach) => {
                if (attach) {
                    setRemoteTracks(prev => [...prev, { track, participant }]);
                } else {
                    setRemoteTracks(prev => prev.filter(t => t.track.sid !== track.sid));
                }
            };

            gameManager.connect();
            gameManager.initGame(gameContainerRef.current.id);

            // Use a small delay or event to ensure game is initialized before joining
            // For simplicity, joining here:
            gameManager.joinGame(username);
        }

        return () => {
            gameManager.destroyGame();
            gameManager.disconnect();
        };
    }, []);

    return (
        <div id="game-container" ref={gameContainerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
            <VideoGrid tracks={remoteTracks} />
        </div>
    );
};
