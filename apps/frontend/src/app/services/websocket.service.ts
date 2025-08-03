import { Injectable, signal, Signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { components } from '@qgui/shared';
import {
  IWebSocketService,
  WebSocketConnectionConfig,
} from '../interfaces/websocket-service.interface';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService implements IWebSocketService {
  private ws: WebSocket | null = null;
  private readonly _connectionState = signal<
    components['schemas']['ConnectionState']
  >({
    status: 'disconnected',
    connectedAt: new Date().toISOString(),
  });
  private readonly _lastMessage = signal<
    components['schemas']['WebSocketMessage'] | null
  >(null);
  private readonly _error = signal<components['schemas']['ErrorData'] | null>(
    null
  );

  // 読み取り専用シグナルを公開
  readonly connectionState: Signal<components['schemas']['ConnectionState']> =
    this._connectionState.asReadonly();
  readonly lastMessage: Signal<
    components['schemas']['WebSocketMessage'] | null
  > = this._lastMessage.asReadonly();
  readonly error: Signal<components['schemas']['ErrorData'] | null> =
    this._error.asReadonly();

  /**
   * WebSocketサーバーに接続
   * @param url - 接続先URL
   * @param config - 接続設定（現在は未使用、YAGNI原則）
   * @returns 接続結果のPromise
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async connect(
    url: string,
    _config?: WebSocketConnectionConfig
  ): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      try {
        // 既存の接続があれば切断
        if (this.ws) {
          this.ws.close();
        }

        // 新しいWebSocket接続を作成
        this.ws = new WebSocket(url);
        this._connectionState.set({
          status: 'connecting',
          connectedAt: new Date().toISOString(),
        });

        // 接続成功時のハンドラ
        this.ws.onopen = () => {
          this._connectionState.set({
            status: 'connected',
            connectedAt: new Date().toISOString(),
          });
          resolve(true);
        };

        // エラー時のハンドラ
        this.ws.onerror = () => {
          this._connectionState.set({
            status: 'disconnected',
            connectedAt: new Date().toISOString(),
          });
          this._error.set({
            code: 'CONNECTION_FAILED',
            message: 'WebSocket接続エラーが発生しました',
            severity: 'error',
            retryable: true,
          });
          resolve(false);
        };

        // 切断時のハンドラ
        this.ws.onclose = () => {
          this._connectionState.set({
            status: 'disconnected',
            connectedAt: new Date().toISOString(),
          });
        };
      } catch (error) {
        this._connectionState.set({
          status: 'disconnected',
          connectedAt: new Date().toISOString(),
        });
        this._error.set({
          code: 'CONNECTION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
          severity: 'error',
          retryable: false,
        });
        resolve(false);
      }
    });
  }

  /**
   * WebSocket接続を切断
   * @param reason - 切断理由
   */
  disconnect(reason?: string): void {
    if (this.ws) {
      if (reason) {
        this.ws.close(1000, reason);
      } else {
        this.ws.close();
      }
      this._connectionState.set({
        status: 'disconnected',
        connectedAt: new Date().toISOString(),
      });
      this.ws = null;
    }
  }

  /**
   * 接続が有効かチェック
   * @returns 接続の有効性
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * サービスのクリーンアップ
   */
  destroy(): void {
    this.disconnect();
  }

  // 以下のメソッドは最小実装のため仮実装（YAGNI原則に従い、必要になったら実装）
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sendMessage(_message: components['schemas']['WebSocketMessage']): boolean {
    // 仮実装
    return false;
  }

  onMessage<T extends components['schemas']['WebSocketMessage']['type']>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _messageType: T
  ): Observable<
    Extract<components['schemas']['WebSocketMessage'], { type: T }>
  > {
    // 仮実装
    return new Subject<
      Extract<components['schemas']['WebSocketMessage'], { type: T }>
    >();
  }

  onConnectionStateChange(): Observable<
    components['schemas']['ConnectionState']
  > {
    // 仮実装
    return new Subject<components['schemas']['ConnectionState']>();
  }

  onError(): Observable<components['schemas']['ErrorData']> {
    // 仮実装
    return new Subject<components['schemas']['ErrorData']>();
  }

  async reconnect(): Promise<boolean> {
    // 仮実装
    return false;
  }

  sendHeartbeat(): boolean {
    // 仮実装
    return false;
  }
}
