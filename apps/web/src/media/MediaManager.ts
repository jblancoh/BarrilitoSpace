import { Room, RoomEvent, RemoteParticipant, RemoteTrack } from 'livekit-client';

export class MediaManager {
    public room: Room;

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

    private attachTrack(track: RemoteTrack, _participant: RemoteParticipant) {
        if (track.kind === 'video' || track.kind === 'audio') {
            const element = track.attach();
            document.body.appendChild(element); // Simple attachment for now
        }
    }

    private detachTrack(track: RemoteTrack) {
        track.detach().forEach((el) => el.remove());
    }
}
