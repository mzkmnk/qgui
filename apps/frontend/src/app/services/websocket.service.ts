import { Injectable, signal, Signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';
import { components } from '@qgui/shared';
import {
  IWebSocketService,
  WebSocketConnectionConfig,
} from '../interfaces/websocket-service.interface';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService implements IWebSocketService {
  private socket: Socket | null = null;
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

  // メッセージサブジェクト
  private readonly messageSubject = new Subject<
    components['schemas']['WebSocketMessage']
  >();

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
  async connect(
    url: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _config?: WebSocketConnectionConfig
  ): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      try {
        // 既存の接続があれば切断
        if (this.socket) {
          this.socket.disconnect();
        }

        // Socket.ioクライアントを作成
        this.socket = io(url, {
          transports: ['websocket'],
          autoConnect: true,
        });

        this._connectionState.set({
          status: 'connecting',
          connectedAt: new Date().toISOString(),
        });

        // 接続成功時のハンドラ
        this.socket.on('connect', () => {
          this._connectionState.set({
            status: 'connected',
            connectedAt: new Date().toISOString(),
          });
          resolve(true);
        });

        // エラー時のハンドラ
        this.socket.on('connect_error', (error) => {
          console.error('Socket.io接続エラー:', error);
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
        });

        // メッセージ受信時のハンドラ
        this.socket.on(
          'message',
          (data: components['schemas']['WebSocketMessage']) => {
            this._lastMessage.set(data);
            this.messageSubject.next(data);
          }
        );

        // 切断時のハンドラ
        this.socket.on('disconnect', () => {
          this._connectionState.set({
            status: 'disconnected',
            connectedAt: new Date().toISOString(),
          });
        });
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  disconnect(_reason?: string): void {
    if (this.socket) {
      this.socket.disconnect();
      this._connectionState.set({
        status: 'disconnected',
        connectedAt: new Date().toISOString(),
      });
      this.socket = null;
    }
  }

  /**
   * 接続が有効かチェック
   * @returns 接続の有効性
   */
  isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }

  /**
   * サービスのクリーンアップ
   */
  destroy(): void {
    this.disconnect();
    this.messageSubject.complete();
  }

  /**
   * WebSocketメッセージを送信
   * @param message - 送信するメッセージ
   * @returns 送信成功の可否
   */
  sendMessage(message: components['schemas']['WebSocketMessage']): boolean {
    if (!this.isConnected()) {
      this._error.set({
        code: 'CONNECTION_FAILED' as const,
        message: 'WebSocketが接続されていません',
        severity: 'error',
        retryable: true,
      });
      return false;
    }

    try {
      if (this.socket) {
        this.socket.emit('message', message);
        return true;
      }
      return false;
    } catch (error) {
      this._error.set({
        code: 'CONNECTION_FAILED' as const,
        message:
          error instanceof Error
            ? error.message
            : 'メッセージ送信に失敗しました',
        severity: 'error',
        retryable: true,
      });
      return false;
    }
  }

  /**
   * 特定タイプのメッセージを監視
   * @param messageType - 監視するメッセージタイプ
   * @returns メッセージのObservable
   */
  onMessage<T extends components['schemas']['WebSocketMessage']['type']>(
    messageType: T
  ): Observable<
    Extract<components['schemas']['WebSocketMessage'], { type: T }>
  > {
    return this.messageSubject
      .asObservable()
      .pipe(
        filter(
          (
            message
          ): message is Extract<
            components['schemas']['WebSocketMessage'],
            { type: T }
          > => message.type === messageType
        )
      );
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
