import { components as WebSocketComponents } from '@qgui/types/websocket';
import { components as PTYComponents } from '@qgui/types/pty-process';

// WebSocket 関連型のエクスポート
export type WebSocketMessage =
  WebSocketComponents['schemas']['WebSocketMessage'];
export type ConnectionEvent = WebSocketComponents['schemas']['ConnectionEvent'];
export type DisconnectionEvent =
  WebSocketComponents['schemas']['DisconnectionEvent'];
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

// プロセス制御インターフェース
export interface ProcessController {
  /**
   * 新しいPTYプロセスを開始
   * @param startData プロセス開始データ
   * @returns プロセスID
   */
  startProcess(
    startData: PTYComponents['schemas']['ProcessStartData']
  ): Promise<string>;

  /**
   * プロセスを停止
   * @param processId プロセスID
   */
  stopProcess(processId: string): Promise<void>;

  /**
   * プロセスに入力を送信
   * @param processId プロセスID
   * @param input 入力文字列
   */
  sendInput(processId: string, input: string): Promise<void>;
}

// イベントハンドラー
export interface ProcessEventHandler {
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
}

// ユーティリティ関数
export function schemas(): string {
  return 'schemas';
}
