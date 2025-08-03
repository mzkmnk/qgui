import { Signal, WritableSignal } from '@angular/core';
import { Observable } from 'rxjs';
import { components } from '@qgui/shared';

/**
 * WebSocketServiceインターフェース
 * Angularアプリケーションでのリアルタイム通信を管理
 */
export interface IWebSocketService {
  /**
   * 接続状態のシグナル（読み取り専用）
   */
  readonly connectionState: Signal<components['schemas']['ConnectionState']>;

  /**
   * 最後に受信したメッセージのシグナル（読み取り専用）
   */
  readonly lastMessage: Signal<
    components['schemas']['WebSocketMessage'] | null
  >;

  /**
   * エラー状態のシグナル（読み取り専用）
   */
  readonly error: Signal<components['schemas']['ErrorData'] | null>;

  /**
   * WebSocketサーバーに接続
   * @param url - 接続先URL
   * @param config - 接続設定
   * @returns 接続結果のPromise
   */
  connect(url: string, config?: WebSocketConnectionConfig): Promise<boolean>;

  /**
   * WebSocket接続を切断
   * @param reason - 切断理由
   */
  disconnect(reason?: string): void;

  /**
   * メッセージを送信
   * @param message - 送信するメッセージ
   * @returns 送信成功可否
   */
  sendMessage(message: components['schemas']['WebSocketMessage']): boolean;

  /**
   * 特定のタイプのメッセージを監視
   * @param messageType - 監視するメッセージタイプ
   * @returns メッセージのObservable
   */
  onMessage<T extends components['schemas']['WebSocketMessage']['type']>(
    messageType: T
  ): Observable<
    Extract<components['schemas']['WebSocketMessage'], { type: T }>
  >;

  /**
   * 接続状態の変化を監視
   * @returns 接続状態のObservable
   */
  onConnectionStateChange(): Observable<
    components['schemas']['ConnectionState']
  >;

  /**
   * エラーイベントを監視
   * @returns エラーのObservable
   */
  onError(): Observable<components['schemas']['ErrorData']>;

  /**
   * 再接続を実行
   * @returns 再接続結果のPromise
   */
  reconnect(): Promise<boolean>;

  /**
   * ハートビートの送信
   * @returns 送信成功可否
   */
  sendHeartbeat(): boolean;

  /**
   * 接続が有効かチェック
   * @returns 接続の有効性
   */
  isConnected(): boolean;

  /**
   * サービスのクリーンアップ
   */
  destroy(): void;
}

/**
 * WebSocket接続設定
 */
export interface WebSocketConnectionConfig {
  /** 自動再接続を有効にするか */
  autoReconnect?: boolean;

  /** 再接続の最大試行回数 */
  maxReconnectAttempts?: number;

  /** 再接続間隔（ミリ秒） */
  reconnectInterval?: number;

  /** 接続タイムアウト（ミリ秒） */
  connectionTimeout?: number;

  /** ハートビート間隔（ミリ秒） */
  heartbeatInterval?: number;

  /** メッセージキューの最大サイズ */
  messageQueueSize?: number;

  /** 認証トークン */
  authToken?: string;

  /** カスタムヘッダー */
  headers?: Record<string, string>;

  /** クエリパラメータ */
  query?: Record<string, string>;
}

/**
 * WebSocketイベントリスナー
 */
export interface WebSocketEventListener {
  /** イベントタイプ */
  type: components['schemas']['WebSocketMessage']['type'];

  /** コールバック関数 */
  callback: (message: components['schemas']['WebSocketMessage']) => void;

  /** 一度だけ実行するか */
  once?: boolean;
}

/**
 * WebSocketメッセージキューアイテム
 */
export interface WebSocketQueueItem {
  /** メッセージ */
  message: components['schemas']['WebSocketMessage'];

  /** 送信試行回数 */
  attempts: number;

  /** 最大試行回数 */
  maxAttempts: number;

  /** 作成日時 */
  createdAt: Date;

  /** コールバック（オプション） */
  callback?: (success: boolean) => void;
}

/**
 * WebSocket統計情報
 */
export interface WebSocketStats {
  /** 送信メッセージ数 */
  messagesSent: number;

  /** 受信メッセージ数 */
  messagesReceived: number;

  /** 再接続回数 */
  reconnectionCount: number;

  /** 最後の接続時刻 */
  lastConnectedAt: Date | null;

  /** 最後の切断時刻 */
  lastDisconnectedAt: Date | null;

  /** 平均レイテンシ（ミリ秒） */
  averageLatency: number;

  /** エラー数 */
  errorCount: number;
}

/**
 * リアクティブWebSocketサービスの拡張インターフェース
 * Angular Signalsを活用したリアクティブな状態管理
 */
export interface IReactiveWebSocketService extends IWebSocketService {
  /**
   * 送信メッセージキューのシグナル
   */
  readonly messageQueue: Signal<readonly WebSocketQueueItem[]>;

  /**
   * 統計情報のシグナル
   */
  readonly stats: Signal<WebSocketStats>;

  /**
   * デバッグモードのシグナル
   */
  readonly debugMode: WritableSignal<boolean>;

  /**
   * 接続済みクライアント数のシグナル（サーバーから受信）
   */
  readonly connectedClientsCount: Signal<number>;

  /**
   * 特定の条件でメッセージをフィルタリング
   * @param predicate - フィルタ条件
   * @returns フィルタされたメッセージのObservable
   */
  onMessageWhere(
    predicate: (message: components['schemas']['WebSocketMessage']) => boolean
  ): Observable<components['schemas']['WebSocketMessage']>;

  /**
   * メッセージの送信履歴を取得
   * @param limit - 取得件数制限
   * @returns 送信履歴
   */
  getMessageHistory(
    limit?: number
  ): readonly components['schemas']['WebSocketMessage'][];

  /**
   * デバッグ情報を出力
   */
  logDebugInfo(): void;
}
