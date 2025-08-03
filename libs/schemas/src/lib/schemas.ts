import { components as WebSocketComponents } from '../../../../types/generated/websocket.types';
import { components as PTYComponents } from '../../../../types/generated/pty-process.types';

// WebSocket 関連型のエクスポート
export type WebSocketMessage = WebSocketComponents['schemas']['WebSocketMessage'];
export type ConnectionEvent = WebSocketComponents['schemas']['ConnectionEvent'];
export type DisconnectionEvent = WebSocketComponents['schemas']['DisconnectionEvent'];
export type MessageEvent = WebSocketComponents['schemas']['MessageEvent'];
export type ErrorEvent = WebSocketComponents['schemas']['ErrorEvent'];
export type HeartbeatEvent = WebSocketComponents['schemas']['HeartbeatEvent'];
export type ConnectionState = WebSocketComponents['schemas']['ConnectionState'];
export type WebSocketConfig = WebSocketComponents['schemas']['WebSocketConfig'];

// PTY プロセス管理関連型のエクスポート
export type ProcessState = PTYComponents['schemas']['ProcessState'];
export type PTYMessage = PTYComponents['schemas']['PTYMessage'];
export type ProcessStartEvent = PTYComponents['schemas']['ProcessStartEvent'];
export type ProcessStopEvent = PTYComponents['schemas']['ProcessStopEvent'];
export type ProcessOutputEvent = PTYComponents['schemas']['ProcessOutputEvent'];
export type ProcessInputEvent = PTYComponents['schemas']['ProcessInputEvent'];
export type ProcessErrorEvent = PTYComponents['schemas']['ProcessErrorEvent'];
export type ProcessStatusEvent = PTYComponents['schemas']['ProcessStatusEvent'];
export type ProcessResourceEvent = PTYComponents['schemas']['ProcessResourceEvent'];
export type ProcessSession = PTYComponents['schemas']['ProcessSession'];
export type PTYConfig = PTYComponents['schemas']['PTYConfig'];
export type PTYManagerState = PTYComponents['schemas']['PTYManagerState'];

// PTYManager インターフェース定義
export interface PTYManager {
  /**
   * PTYマネージャーの現在の状態を取得
   */
  getState(): PTYManagerState;

  /**
   * 新しいPTYプロセスを開始
   * @param startData プロセス開始データ
   * @returns プロセスID
   */
  startProcess(startData: PTYComponents['schemas']['ProcessStartData']): Promise<string>;

  /**
   * プロセスを停止
   * @param processId プロセスID
   * @param stopData 停止データ
   */
  stopProcess(processId: string, stopData?: Partial<PTYComponents['schemas']['ProcessStopData']>): Promise<void>;

  /**
   * プロセスに入力を送信
   * @param processId プロセスID
   * @param inputData 入力データ
   */
  sendInput(processId: string, inputData: PTYComponents['schemas']['ProcessInputData']): Promise<void>;

  /**
   * プロセスの状態を取得
   * @param processId プロセスID
   */
  getProcessStatus(processId: string): Promise<PTYComponents['schemas']['ProcessStatusData'] | null>;

  /**
   * アクティブなセッション一覧を取得
   */
  getActiveSessions(): Promise<ProcessSession[]>;

  /**
   * 特定のセッションを取得
   * @param sessionId セッションID
   */
  getSession(sessionId: string): Promise<ProcessSession | null>;

  /**
   * プロセスのリソース使用状況を取得
   * @param processId プロセスID
   */
  getProcessResources(processId: string): Promise<PTYComponents['schemas']['ProcessResourceData'] | null>;

  /**
   * PTYマネージャーの設定を更新
   * @param config 新しい設定
   */
  updateConfig(config: Partial<PTYConfig>): Promise<void>;

  /**
   * クリーンアップ処理（終了したプロセスの削除など）
   */
  cleanup(): Promise<void>;

  /**
   * PTYマネージャーを初期化
   * @param config 初期設定
   */
  initialize(config?: Partial<PTYConfig>): Promise<void>;

  /**
   * PTYマネージャーを停止
   */
  shutdown(): Promise<void>;
}

// ProcessSession 拡張インターフェース
export interface ProcessSessionManager {
  /**
   * セッションを作成
   * @param startData プロセス開始データ
   * @returns 作成されたセッション
   */
  createSession(startData: PTYComponents['schemas']['ProcessStartData']): Promise<ProcessSession>;

  /**
   * セッションを削除
   * @param sessionId セッションID
   */
  destroySession(sessionId: string): Promise<void>;

  /**
   * セッションの最終アクティビティ時刻を更新
   * @param sessionId セッションID
   */
  updateLastActivity(sessionId: string): Promise<void>;

  /**
   * セッションにタグを追加
   * @param sessionId セッションID
   * @param tags 追加するタグ
   */
  addTags(sessionId: string, tags: string[]): Promise<void>;

  /**
   * セッションからタグを削除
   * @param sessionId セッションID
   * @param tags 削除するタグ
   */
  removeTags(sessionId: string, tags: string[]): Promise<void>;

  /**
   * タグでセッションを検索
   * @param tags 検索するタグ
   */
  findSessionsByTags(tags: string[]): Promise<ProcessSession[]>;

  /**
   * 所有者でセッションを検索
   * @param owner 所有者
   */
  findSessionsByOwner(owner: string): Promise<ProcessSession[]>;
}

// イベントハンドラー型定義
export interface PTYEventHandler {
  /**
   * プロセス開始イベントハンドラー
   */
  onProcessStart?: (event: ProcessStartEvent) => void;

  /**
   * プロセス停止イベントハンドラー
   */
  onProcessStop?: (event: ProcessStopEvent) => void;

  /**
   * プロセス出力イベントハンドラー
   */
  onProcessOutput?: (event: ProcessOutputEvent) => void;

  /**
   * プロセス入力イベントハンドラー
   */
  onProcessInput?: (event: ProcessInputEvent) => void;

  /**
   * プロセスエラーイベントハンドラー
   */
  onProcessError?: (event: ProcessErrorEvent) => void;

  /**
   * プロセス状態変更イベントハンドラー
   */
  onProcessStatus?: (event: ProcessStatusEvent) => void;

  /**
   * プロセスリソース使用状況イベントハンドラー
   */
  onProcessResource?: (event: ProcessResourceEvent) => void;
}

// ユーティリティ関数
export function schemas(): string {
  return 'schemas';
}
