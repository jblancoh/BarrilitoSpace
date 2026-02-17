import { Controller, Get, Query } from '@nestjs/common';
import { AccessToken } from 'livekit-server-sdk';

@Controller('livekit')
export class LivekitController {
    @Get('token')
    async getToken(@Query('room') room: string, @Query('username') username: string) {
        // TODO: Move secrets to env variables
        const apiKey = process.env.LIVEKIT_API_KEY || 'devkey';
        const apiSecret = process.env.LIVEKIT_API_SECRET || 'secret';
        const wsUrl = process.env.LIVEKIT_URL || 'wss://your-livekit-url.io';

        const at = new AccessToken(apiKey, apiSecret, {
            identity: username,
        });

        at.addGrant({ roomJoin: true, room: room });

        return {
            token: await at.toJwt(),
            url: wsUrl,
        };
    }
}
