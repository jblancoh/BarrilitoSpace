import { Controller, Get, Query } from '@nestjs/common';
import { AccessToken } from 'livekit-server-sdk';
import { ConfigService } from '@nestjs/config';

@Controller('livekit')
export class LivekitController {
    constructor(private configService: ConfigService) { }

    @Get('token')
    async getToken(@Query('room') room: string, @Query('username') username: string) {
        const apiKey = this.configService.get<string>('LIVEKIT_API_KEY') || 'devkey';
        const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET') || 'secret';
        const wsUrl = this.configService.get<string>('LIVEKIT_URL') || 'wss://your-livekit-url.io';

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
