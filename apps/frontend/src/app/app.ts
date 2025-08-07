import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { ChatComponent } from './components/chat/chat.component';
import { CommandPaletteComponent } from './components/command-palette/command-palette.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { WebSocketService } from './services/websocket.service';
import { Subscription } from 'rxjs';

// ChatSession型の定義（SidebarComponentと共有）
interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
  isActive?: boolean;
}

@Component({
  imports: [
    RouterModule,
    ChatComponent,
    CommandPaletteComponent,
    SidebarComponent,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App implements OnInit, OnDestroy {
  protected title = 'Qgui - AI Assistant';
  private wsService = inject(WebSocketService);
  private subscription?: Subscription;

  @ViewChild(CommandPaletteComponent) commandPalette?: CommandPaletteComponent;

  isSidebarCollapsed = signal(false);

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

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

  toggleSidebar(): void {
    this.isSidebarCollapsed.update((collapsed) => !collapsed);
  }

  onNewChat(): void {
    // 新しいチャットが作成された時の処理
    console.log('新しいチャットを作成');
  }

  onSessionSelected(session: ChatSession): void {
    // セッションが選択された時の処理
    console.log('セッション選択:', session);
  }

  openCommandPalette(): void {
    if (this.commandPalette) {
      this.commandPalette.open();
    }
  }
}
