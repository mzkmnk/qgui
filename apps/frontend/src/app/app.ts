import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ChatComponent } from './components/chat/chat.component';
import { WebSocketService } from './services/websocket.service';
import { components } from '@qgui/shared';
import { Subscription } from 'rxjs';

@Component({
  imports: [RouterModule, ChatComponent],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App implements OnInit, OnDestroy {
  protected title = 'Qgui - AI Assistant';
  private wsService = inject(WebSocketService);
  private subscription?: Subscription;

  ngOnInit(): void {
    // WebSocket接続（将来的にチャットと統合）
    this.connectWebSocket();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.wsService.destroy();
  }

  private async connectWebSocket(): Promise<void> {
    // Socket.ioサーバーに接続
    const wsUrl = 'http://localhost:3000';
    const connected = await this.wsService.connect(wsUrl);

    if (!connected) {
      console.error('WebSocket接続に失敗しました');
    } else {
      console.log('WebSocket接続成功');
    }
  }
}
