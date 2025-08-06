import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WebSocketService } from './websocket.service';

@Injectable({
  providedIn: 'root',
})
export class TerminalWebSocketService {
  constructor(private websocketService: WebSocketService) {}

  async connect(url: string): Promise<boolean> {
    const connected = await this.websocketService.connect(url);
    if (connected) {
      // PTYセッションを開始
      this.websocketService.sendMessage({
        type: 'pty:start',
        data: {},
      });
    }
    return connected;
  }

  disconnect(): void {
    if (this.websocketService.isConnected()) {
      // PTYセッションを終了
      this.websocketService.sendMessage({
        type: 'pty:stop',
        data: {},
      });
    }
    this.websocketService.disconnect();
  }

  sendCommand(command: string): boolean {
    if (!this.websocketService.isConnected()) {
      return false;
    }

    return this.websocketService.sendMessage({
      type: 'pty:input',
      data: command,
    });
  }

  onPtyOutput(): Observable<string> {
    return this.websocketService.onMessage('pty:output').pipe(
      map((message) => message.data as string)
    );
  }

  resize(cols: number, rows: number): boolean {
    if (!this.websocketService.isConnected()) {
      return false;
    }

    return this.websocketService.sendMessage({
      type: 'pty:resize',
      data: { cols, rows },
    });
  }

  isConnected(): boolean {
    return this.websocketService.isConnected();
  }
}