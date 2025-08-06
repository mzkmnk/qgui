import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { WebSocketGateway } from './websocket.gateway';
import { PTYManagerService } from './pty-manager.service';
import { CommandFilterService } from '../services/command-filter.service';
import { PtyCleanupService } from '../services/pty-cleanup.service';
import { BufferLimitService } from '../services/buffer-limit.service';

@Module({
  imports: [],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    WebSocketGateway,
    PTYManagerService,
    CommandFilterService,
    PtyCleanupService,
    BufferLimitService,
  ],
})
export class AppModule {}
