import { components } from '@qgui/shared/types';

/**
 * WebSocketGatewayインターフェース
 * NestJSでのWebSocket通信を管理するためのインターフェース
 */
export interface IWebSocketGateway {
  /**
   * クライアント接続時の処理
   * @param client - WebSocketクライアント
   * @param payload - 接続時のペイロード（オプション）
   */
  handleConnection(client: WebSocketClient, payload?: unknown): Promise<void>;

  /**
   * クライアント切断時の処理
   * @param client - WebSocketクライアント
   * @param reason - 切断理由
   */
  handleDisconnect(client: WebSocketClient, reason?: string): Promise<void>;

  /**
   * メッセージ受信時の処理
   * @param client - WebSocketクライアント
   * @param message - 受信メッセージ
   */
  handleMessage(
    client: WebSocketClient,
    message: components['schemas']['WebSocketMessage']
  ): Promise<void>;

  /**
   * ハートビート処理
   * @param client - WebSocketクライアント
   * @param heartbeat - ハートビートデータ
   */
  handleHeartbeat(
    client: WebSocketClient,
    heartbeat: components['schemas']['HeartbeatEvent']
  ): Promise<void>;

  /**
   * 特定のクライアントにメッセージ送信
   * @param clientId - クライアントID
   * @param message - 送信メッセージ
   */
  sendToClient(
    clientId: string,
    message: components['schemas']['WebSocketMessage']
  ): Promise<boolean>;

  /**
   * 全クライアントにブロードキャスト
   * @param message - ブロードキャストメッセージ
   */
  broadcast(message: components['schemas']['WebSocketMessage']): Promise<void>;

  /**
   * エラーメッセージ送信
   * @param client - WebSocketクライアント
   * @param error - エラー情報
   */
  sendError(
    client: WebSocketClient,
    error: components['schemas']['ErrorEvent']
  ): Promise<void>;

  /**
   * 接続中のクライアント数を取得
   * @returns 接続クライアント数
   */
  getConnectedClientsCount(): number;

  /**
   * 特定のクライアントの接続状態を取得
   * @param clientId - クライアントID
   * @returns 接続状態
   */
  getClientConnectionState(
    clientId: string
  ): Promise<components['schemas']['ConnectionState'] | null>;
}

/**
 * WebSocketクライアントインターフェース
 * Socket.ioクライアントのラッパー
 */
export interface WebSocketClient {
  /** クライアント一意識別子 */
  id: string;
  
  /** 接続状態 */
  connected: boolean;
  
  /** クライアントのメタデータ */
  handshake: {
    address: string;
    headers: Record<string, string>;
    query: Record<string, string>;
  };

  /**
   * クライアントにメッセージを送信
   * @param event - イベント名
   * @param data - 送信データ
   */
  emit(event: string, data: unknown): void;

  /**
   * 接続を切断
   * @param close - 切断するかどうか
   */
  disconnect(close?: boolean): void;

  /**
   * ルームに参加
   * @param room - ルーム名
   */
  join(room: string): void;

  /**
   * ルームから退出
   * @param room - ルーム名
   */
  leave(room: string): void;
}

/**
 * WebSocket設定インターフェース
 */
export interface WebSocketGatewayConfig {
  /** CORSの設定 */
  cors?: {
    origin: string | string[] | boolean;
    credentials?: boolean;
  };
  
  /** 名前空間 */
  namespace?: string;
  
  /** ハートビート設定 */
  heartbeat?: {
    interval: number;
    timeout: number;
  };
  
  /** 最大接続数 */
  maxConnections?: number;
  
  /** 認証が必要かどうか */
  requireAuth?: boolean;
}

/**
 * WebSocketイベントハンドラー設定
 */
export interface WebSocketEventHandlers {
  /** 接続イベントハンドラー */
  onConnection?: (client: WebSocketClient) => Promise<void>;
  
  /** 切断イベントハンドラー */
  onDisconnection?: (client: WebSocketClient, reason: string) => Promise<void>;
  
  /** メッセージイベントハンドラー */
  onMessage?: (
    client: WebSocketClient, 
    message: components['schemas']['WebSocketMessage']
  ) => Promise<void>;
  
  /** エラーイベントハンドラー */
  onError?: (client: WebSocketClient, error: Error) => Promise<void>;
}