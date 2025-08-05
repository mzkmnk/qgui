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
  private lastUrl: string | null = null;
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

  private readonly messageSubject = new Subject<
    components['schemas']['WebSocketMessage']
  >();
  private readonly connectionStateSubject = new Subject<
    components['schemas']['ConnectionState']
  >();
  private readonly errorSubject = new Subject<
    components['schemas']['ErrorData']
  >();

  readonly connectionState: Signal<components['schemas']['ConnectionState']> =
    this._connectionState.asReadonly();
  readonly lastMessage: Signal<
    components['schemas']['WebSocketMessage'] | null
  > = this._lastMessage.asReadonly();
  readonly error: Signal<components['schemas']['ErrorData'] | null> =
    this._error.asReadonly();

  async connect(
    url: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _config?: WebSocketConnectionConfig
  ): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      try {
        if (this.socket) {
          this.socket.disconnect();
        }

        this.lastUrl = url;
        this.socket = io(url, {
          transports: ['websocket'],
          autoConnect: true,
        });

        const connecting = {
          status: 'connecting' as const,
          connectedAt: new Date().toISOString(),
        };
        this._connectionState.set(connecting);
        this.connectionStateSubject.next(connecting);

        this.socket.on('connect', () => {
          const state = {
            status: 'connected' as const,
            connectedAt: new Date().toISOString(),
          };
          this._connectionState.set(state);
          this.connectionStateSubject.next(state);
          resolve(true);
        });

        this.socket.on('connect_error', () => {
          const state = {
            status: 'disconnected' as const,
            connectedAt: new Date().toISOString(),
          };
          this._connectionState.set(state);
          this.connectionStateSubject.next(state);
          const err = {
            code: 'CONNECTION_FAILED' as const,
            message: 'WebSocket接続エラーが発生しました',
            severity: 'error' as const,
            retryable: true,
          };
          this._error.set(err);
          this.errorSubject.next(err);
          resolve(false);
        });

        this.socket.on(
          'message',
          (data: components['schemas']['WebSocketMessage']) => {
            this._lastMessage.set(data);
            this.messageSubject.next(data);
          }
        );

        this.socket.on('disconnect', () => {
          const state = {
            status: 'disconnected' as const,
            connectedAt: new Date().toISOString(),
          };
          this._connectionState.set(state);
          this.connectionStateSubject.next(state);
        });
      } catch (error) {
        const state = {
          status: 'disconnected' as const,
          connectedAt: new Date().toISOString(),
        };
        this._connectionState.set(state);
        this.connectionStateSubject.next(state);
        const err = {
          code: 'CONNECTION_FAILED' as const,
          message: error instanceof Error ? error.message : 'Unknown error',
          severity: 'error' as const,
          retryable: false,
        };
        this._error.set(err);
        this.errorSubject.next(err);
        resolve(false);
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  disconnect(_reason?: string): void {
    if (this.socket) {
      this.socket.disconnect();
      const state = {
        status: 'disconnected' as const,
        connectedAt: new Date().toISOString(),
      };
      this._connectionState.set(state);
      this.connectionStateSubject.next(state);
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }

  destroy(): void {
    this.disconnect();
    this.messageSubject.complete();
    this.connectionStateSubject.complete();
    this.errorSubject.complete();
  }

  sendMessage(message: components['schemas']['WebSocketMessage']): boolean {
    if (!this.isConnected()) {
      const err = {
        code: 'CONNECTION_FAILED' as const,
        message: 'WebSocketが接続されていません',
        severity: 'error' as const,
        retryable: true,
      };
      this._error.set(err);
      this.errorSubject.next(err);
      return false;
    }

    try {
      if (this.socket) {
        this.socket.emit('message', message);
        return true;
      }
      return false;
    } catch (error) {
      const err = {
        code: 'CONNECTION_FAILED' as const,
        message:
          error instanceof Error
            ? error.message
            : 'メッセージ送信に失敗しました',
        severity: 'error' as const,
        retryable: true,
      };
      this._error.set(err);
      this.errorSubject.next(err);
      return false;
    }
  }

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
    return this.connectionStateSubject.asObservable();
  }

  onError(): Observable<components['schemas']['ErrorData']> {
    return this.errorSubject.asObservable();
  }

  async reconnect(): Promise<boolean> {
    if (!this.lastUrl) return false;
    this.disconnect();
    return this.connect(this.lastUrl);
  }

  sendHeartbeat(): boolean {
    if (!this.isConnected() || !this.socket) return false;
    try {
      this.socket.emit('heartbeat', { timestamp: new Date().toISOString() });
      return true;
    } catch {
      return false;
    }
  }
}
