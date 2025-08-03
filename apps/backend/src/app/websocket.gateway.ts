import { Injectable } from '@nestjs/common';
import {
  WebSocketGateway as NestWebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  IWebSocketGateway,
  WebSocketClient,
} from './interfaces/websocket-gateway.interface';
import { components } from '@qgui/shared';

@Injectable()
@NestWebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
export class WebSocketGateway
  implements Partial<IWebSocketGateway>, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private connectedClients: Map<
    string,
    {
      client: WebSocketClient;
      connectionState: components['schemas']['ConnectionState'];
    }
  > = new Map();

  private connectionHistory: Set<string> = new Set();

  async handleConnection(
    client: Socket | WebSocketClient
  ): Promise<void> {
    // Socket.ioのSocketをWebSocketClientとして扱う
    const webSocketClient: WebSocketClient = this.isSocket(client)
      ? this.socketToWebSocketClient(client)
      : client;
    // 再接続かどうかを判定
    const isReconnection = this.connectionHistory.has(webSocketClient.id);

    // 接続履歴に追加
    this.connectionHistory.add(webSocketClient.id);

    // 接続状態を作成
    const connectionState: components['schemas']['ConnectionState'] = {
      status: 'connected',
      connectedAt: new Date().toISOString(),
      reconnectAttempts: 0,
    };

    // クライアントを保存
    this.connectedClients.set(webSocketClient.id, {
      client: webSocketClient,
      connectionState,
    });

    // 接続データを作成
    const connectionData: components['schemas']['ConnectionData'] = {
      clientId: webSocketClient.id,
      status: isReconnection ? 'reconnected' : 'connected',
      userAgent: webSocketClient.handshake.headers['user-agent'],
    };

    // 接続イベントを作成
    const connectionEvent = {
      type: 'connection' as const,
      timestamp: new Date().toISOString(),
      data: connectionData,
    };

    // クライアントに接続イベントを送信
    webSocketClient.emit('connection', connectionEvent);
  }

  async handleDisconnect(
    client: Socket | WebSocketClient
  ): Promise<void> {
    // Socket.ioのSocketをWebSocketClientとして扱う
    const webSocketClient: WebSocketClient = this.isSocket(client)
      ? this.socketToWebSocketClient(client)
      : client;

    // クライアントを削除
    this.connectedClients.delete(webSocketClient.id);
  }

  // TODO: 以下のメソッドは必要になったときに実装する（YAGNI原則）
  // - handleMessage
  // - handleHeartbeat  
  // - sendToClient
  // - broadcast
  // - sendError

  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  async getClientConnectionState(
    clientId: string
  ): Promise<components['schemas']['ConnectionState'] | null> {
    const clientData = this.connectedClients.get(clientId);
    return clientData ? clientData.connectionState : null;
  }

  // ヘルパーメソッド
  private isSocket(client: Socket | WebSocketClient): client is Socket {
    return 'nsp' in client && 'adapter' in client;
  }

  private socketToWebSocketClient(socket: Socket): WebSocketClient {
    return {
      id: socket.id,
      connected: socket.connected,
      handshake: {
        address: socket.handshake.address,
        headers: socket.handshake.headers as Record<string, string>,
        query: socket.handshake.query as Record<string, string>,
      },
      emit: (event: string, data: unknown) => socket.emit(event, data),
      disconnect: (close?: boolean) => socket.disconnect(close),
      join: (room: string) => socket.join(room),
      leave: (room: string) => socket.leave(room),
    };
  }
}
