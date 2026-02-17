import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from './game/game.module';
import { LivekitModule } from './livekit/livekit.module';

@Module({
  imports: [GameModule, LivekitModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
