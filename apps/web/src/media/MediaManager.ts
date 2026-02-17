import { Room, RoomEvent, RemoteParticipant, RemoteTrack } from 'livekit-client';

export class MediaManager {
    public room: Room;
    public onTrack?: (track: RemoteTrack, participant: RemoteParticipant, attach: boolean) => void;

    constructor() {
        this.room = new Room({
            adaptiveStream: true,
            dynacast: true,
        });

        this.setupListeners();
    }

    async connect(url: string, token: string) {
        try {
            await this.room.connect(url, token);
            console.log('Connected to LiveKit room', this.room.name);

            // Publish camera and microphone by default for now
            await this.room.localParticipant.enableCameraAndMicrophone();
        } catch (error) {
            console.error('Failed to connect to LiveKit', error);
        }
    }

    disconnect() {
        this.room.disconnect();
    }

    private setupListeners() {
        this.room
            .on(RoomEvent.TrackSubscribed, (track, _publication, participant) => {
                this.attachTrack(track, participant);
            })
            .on(RoomEvent.TrackUnsubscribed, (track, _publication, _participant) => {
                this.detachTrack(track);
            });
    }

    private attachTrack(track: RemoteTrack, participant: RemoteParticipant) {
        if (this.onTrack) {
            this.onTrack(track, participant, true);
            return;
        }
        // Fallback to body append if no callback
        if (track.kind === 'video' || track.kind === 'audio') {
            const element = track.attach();
            element.setAttribute('data-participant-id', participant.identity);
            document.body.appendChild(element); // Simple attachment for now
        }
    }

    public setParticipantVolume(identity: string, volume: number) {
        const elements = document.querySelectorAll(`[data-participant-id="${identity}"]`);
        elements.forEach((el) => {
            if (el instanceof HTMLAudioElement) {
                el.volume = volume;
            }
        });
    }

    private detachTrack(track: RemoteTrack) {
        if (this.onTrack) {
            // We need participant here, but for detach we might not have it easily 
            // unless we store it or just notify track id
            // Let's modify detachTrack signature if needed, or just let UI handle it
        }
        track.detach().forEach((el) => el.remove());
    }
}
