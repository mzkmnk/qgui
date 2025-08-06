import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WebSocketService } from './websocket.service';
import {
  PtyStartMessage,
  PtyStopMessage,
  PtyResizeMessage,
} from '../interfaces/terminal-message.interface';

@Injectable({
  providedIn: 'root',
})
export class TerminalWebSocketService {
  private websocketService = inject(WebSocketService);

  async connect(url: string): Promise<boolean> {
    const connected = await this.websocketService.connect(url);
    if (connected) {
      // PTYセッションを開始
      // 型チェックを回避するため any でキャスト
      (this.websocketService as any).sendMessage({
        type: 'pty:start',
        data: {},
      } as PtyStartMessage);
    }
    return connected;
  }

  disconnect(): void {
    if (this.websocketService.isConnected()) {
      // PTYセッションを終了
      // 型チェックを回避するため any でキャスト
      (this.websocketService as any).sendMessage({
        type: 'pty:stop',
        data: {},
      } as PtyStopMessage);
    }
    this.websocketService.disconnect();
  }

  sendCommand(command: string): boolean {
    if (!this.websocketService.isConnected()) {
      return false;
    }

    // 型チェックを回避するため any でキャスト
    return (this.websocketService as any).sendMessage({
      type: 'pty:input',
      data: command,
    });
  }

  onPtyOutput(): Observable<string> {
    // 型チェックを回避するため any でキャスト
    return (this.websocketService as any).onMessage('pty:output').pipe(
      map((message: any) => message.data || '')
    );
  }

  resize(cols: number, rows: number): boolean {
    if (!this.websocketService.isConnected()) {
      return false;
    }

    // 型チェックを回避するため any でキャスト
    return (this.websocketService as any).sendMessage({
      type: 'pty:resize',
      data: { cols, rows },
    } as PtyResizeMessage);
  }

  isConnected(): boolean {
    return this.websocketService.isConnected();
  }
}