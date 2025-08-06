import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { WebSocketGateway } from './websocket.gateway';
import { PTYManagerService } from './pty-manager.service';
import { CommandFilterService } from '../services/command-filter.service';

@Module({
  imports: [],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    WebSocketGateway,
    PTYManagerService,
    CommandFilterService,
  ],
})
export class AppModule {}
