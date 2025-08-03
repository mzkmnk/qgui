/**
 * PTYプロセス管理インターフェース
 * node-ptyを使用したプロセス管理の抽象化
 */

import {
  PTYProcessState,
  PTYProcessInfo,
  // PTYDataMessage,
  PTYLifecycleEvent,
  PTYProcessCreateRequest,
  // PTYProcessCreateResponse,
  // PTYResizeRequest,
  // PTYControlCommand,
} from '@qgui/shared';

/**
 * PTYプロセスセッションインターフェース
 * 個々のPTYプロセスを表す
 */
export interface ProcessSession {
  /**
   * プロセスのユニークID
   */
  readonly processId: string;

  /**
   * 現在のプロセス状態
   */
  readonly state: PTYProcessState;

  /**
   * プロセス作成日時
   */
  readonly createdAt: Date;

  /**
   * プロセス終了日時（終了済みの場合）
   */
  readonly terminatedAt?: Date;

  /**
   * プロセスへのデータ送信
   * @param data 送信するデータ
   */
  write(data: string): void;

  /**
   * ターミナルサイズの変更
   * @param cols 列数
   * @param rows 行数
   */
  resize(cols: number, rows: number): void;

  /**
   * プロセスの終了
   * @param force 強制終了フラグ
   */
  terminate(force?: boolean): Promise<void>;

  /**
   * データ受信時のコールバック登録
   * @param callback データ受信時に呼ばれる関数
   */
  onData(callback: (data: string) => void): void;

  /**
   * エラー発生時のコールバック登録
   * @param callback エラー発生時に呼ばれる関数
   */
  onError(callback: (error: Error) => void): void;

  /**
   * プロセス終了時のコールバック登録
   * @param callback 終了時に呼ばれる関数
   */
  onExit(callback: (exitCode: number, signal?: string) => void): void;
}

/**
 * PTYマネージャーインターフェース
 * PTYプロセスの作成・管理を行う
 */
export interface PTYManager {
  /**
   * 新しいPTYプロセスを作成
   * @param request プロセス作成リクエスト
   * @returns 作成されたプロセスセッション
   */
  createProcess(request: PTYProcessCreateRequest): Promise<ProcessSession>;

  /**
   * プロセスIDからセッションを取得
   * @param processId プロセスID
   * @returns プロセスセッション（存在しない場合はundefined）
   */
  getProcess(processId: string): ProcessSession | undefined;

  /**
   * すべてのアクティブなプロセスを取得
   * @returns アクティブなプロセスセッションの配列
   */
  getAllProcesses(): ProcessSession[];

  /**
   * プロセスを終了
   * @param processId プロセスID
   * @param force 強制終了フラグ
   */
  terminateProcess(processId: string, force?: boolean): Promise<void>;

  /**
   * すべてのプロセスを終了
   * @param force 強制終了フラグ
   */
  terminateAllProcesses(force?: boolean): Promise<void>;

  /**
   * プロセスライフサイクルイベントのリスナー登録
   * @param callback イベント発生時に呼ばれる関数
   */
  onLifecycleEvent(callback: (event: PTYLifecycleEvent) => void): void;

  /**
   * 指定されたプロセスの情報を取得
   * @param processId プロセスID
   * @returns プロセス情報
   */
  getProcessInfo(processId: string): PTYProcessInfo | undefined;
}