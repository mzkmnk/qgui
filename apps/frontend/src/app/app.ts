import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommandInputComponent } from './components/command-input/command-input.component';
import { MessageDisplayComponent } from './components/message-display/message-display.component';
import { WebSocketService } from './services/websocket.service';
import { components } from '@qgui/shared';
import { Subscription } from 'rxjs';

interface Message {
  type: 'command' | 'output' | 'error';
  content: string;
}

@Component({
  imports: [RouterModule, CommandInputComponent, MessageDisplayComponent],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App implements OnInit, OnDestroy {
  protected title = 'frontend';
  protected messages = signal<Message[]>([]);
  private wsService = inject(WebSocketService);
  private subscription?: Subscription;

  ngOnInit(): void {
    // WebSocket接続
    this.connectWebSocket();

    // コマンド実行結果の受信を設定
    this.subscription = this.wsService.onMessage('message').subscribe({
      next: (message: components['schemas']['WebSocketMessage']) => {
        console.log('受信したメッセージ:', message);
        // メッセージデータを取得
        if (
          message.data &&
          typeof message.data === 'object' &&
          'output' in message.data
        ) {
          const output = message.data['output'];
          this.messages.update((msgs) => [
            ...msgs,
            { type: 'output', content: output },
          ]);
        }
      },
      error: (error) => {
        console.error('メッセージ受信エラー:', error);
        this.messages.update((msgs) => [
          ...msgs,
          { type: 'error', content: 'メッセージ受信エラーが発生しました' },
        ]);
      },
    });

    // エラーメッセージの受信も設定
    this.wsService.onMessage('error').subscribe({
      next: (message: components['schemas']['WebSocketMessage']) => {
        console.log('エラーメッセージ:', message);
        if (
          message.data &&
          typeof message.data === 'object' &&
          'error' in message.data
        ) {
          const error = message.data['error'];
          this.messages.update((msgs) => [
            ...msgs,
            { type: 'error', content: error },
          ]);
        }
      },
    });
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
      this.messages.update((msgs) => [
        ...msgs,
        {
          type: 'error',
          content:
            'WebSocket接続に失敗しました。バックエンドが起動していることを確認してください。',
        },
      ]);
    } else {
      console.log('WebSocket接続成功');
    }
  }

  onCommandSubmit(command: string): void {
    console.log('コマンド送信:', command);
    // コマンドをメッセージリストに追加
    this.messages.update((msgs) => [
      ...msgs,
      { type: 'command', content: command },
    ]);

    // WebSocket経由でコマンドを送信
    const message: components['schemas']['WebSocketMessage'] = {
      id: crypto.randomUUID(),
      type: 'message',
      timestamp: new Date().toISOString(),
      data: {
        command: command,
      },
    };

    const sent = this.wsService.sendMessage(message);
    if (!sent) {
      this.messages.update((msgs) => [
        ...msgs,
        {
          type: 'error',
          content: 'コマンド送信に失敗しました',
        },
      ]);
    }
  }
}
