/**
 * フロントエンドPTYサービスインターフェース
 * WebSocket経由でバックエンドのPTYプロセスと通信する
 */

import { Observable } from 'rxjs';
import { Signal } from '@angular/core';
import {
  PTYProcessState,
  PTYProcessInfo,
  PTYDataMessage,
  PTYLifecycleEvent,
  PTYProcessCreateRequest,
  PTYProcessCreateResponse,
  PTYResizeRequest,
  PTYControlCommand,
} from '@qgui/shared';

/**
 * フロントエンドプロセスセッション状態
 */
export interface FrontendProcessSession {
  /**
   * プロセスID
   */
  readonly processId: string;

  /**
   * プロセス状態（Signal）
   */
  readonly state: Signal<PTYProcessState>;

  /**
   * 出力データストリーム
   */
  readonly output$: Observable<string>;

  /**
   * エラーストリーム
   */
  readonly error$: Observable<Error>;

  /**
   * プロセスへの入力送信
   * @param data 送信するデータ
   */
  sendInput(data: string): void;

  /**
   * ターミナルサイズ変更
   * @param cols 列数
   * @param rows 行数
   */
  resize(cols: number, rows: number): void;

  /**
   * プロセス終了
   * @param force 強制終了フラグ
   */
  terminate(force?: boolean): void;
}

/**
 * PTYサービスインターフェース
 * フロントエンドからPTYプロセスを管理する
 */
export interface PTYService {
  /**
   * WebSocket接続状態
   */
  readonly isConnected: Signal<boolean>;

  /**
   * アクティブなセッション一覧
   */
  readonly sessions: Signal<Map<string, FrontendProcessSession>>;

  /**
   * ライフサイクルイベントストリーム
   */
  readonly lifecycleEvents$: Observable<PTYLifecycleEvent>;

  /**
   * 新しいプロセスセッションを作成
   * @param request プロセス作成リクエスト
   * @returns 作成されたセッション
   */
  createSession(request: PTYProcessCreateRequest): Promise<FrontendProcessSession>;

  /**
   * セッションを取得
   * @param processId プロセスID
   * @returns セッション（存在しない場合はundefined）
   */
  getSession(processId: string): FrontendProcessSession | undefined;

  /**
   * セッションを終了
   * @param processId プロセスID
   * @param force 強制終了フラグ
   */
  terminateSession(processId: string, force?: boolean): Promise<void>;

  /**
   * すべてのセッションを終了
   * @param force 強制終了フラグ
   */
  terminateAllSessions(force?: boolean): Promise<void>;

  /**
   * WebSocket接続の確立
   */
  connect(): Promise<void>;

  /**
   * WebSocket接続の切断
   */
  disconnect(): void;
}