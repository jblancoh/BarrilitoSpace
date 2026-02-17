import { Module } from '@nestjs/common';
import { LivekitController } from './livekit.controller';

@Module({
    controllers: [LivekitController],
})
export class LivekitModule { }
