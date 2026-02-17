import React, { useEffect, useRef } from 'react';
import { RemoteTrack, RemoteParticipant } from 'livekit-client';

interface VideoGridProps {
    tracks: Array<{ track: RemoteTrack; participant: RemoteParticipant }>;
}

export const VideoGrid: React.FC<VideoGridProps> = ({ tracks }) => {
    return (
        <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            pointerEvents: 'none'
        }}>
            {tracks.map(({ track, participant }) => (
                <VideoItem key={track.sid} track={track} participant={participant} />
            ))}
        </div>
    );
};

const VideoItem: React.FC<{ track: RemoteTrack; participant: RemoteParticipant }> = ({ track, participant }) => {
    const videoRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = track.attach();
        el.setAttribute('data-participant-id', participant.identity);
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.objectFit = 'cover';
        el.style.borderRadius = '8px';

        if (videoRef.current) {
            videoRef.current.appendChild(el);
        }

        return () => {
            track.detach(el);
            el.remove();
        };
    }, [track, participant]);

    return (
        <div
            ref={videoRef}
            style={{
                width: '160px',
                height: '120px',
                background: '#000',
                borderRadius: '8px',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                overflow: 'hidden',
                position: 'relative',
                pointerEvents: 'auto',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }}
        >
            <div style={{
                position: 'absolute',
                bottom: '4px',
                left: '4px',
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '4px'
            }}>
                {participant.identity}
            </div>
        </div>
    );
};
