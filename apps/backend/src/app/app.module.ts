import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { WebSocketGateway } from './websocket.gateway';
import { PTYManagerService } from './pty-manager.service';

@Module({
  imports: [],
  controllers: [AppController, HealthController],
  providers: [AppService, WebSocketGateway, PTYManagerService],
})
export class AppModule {}
