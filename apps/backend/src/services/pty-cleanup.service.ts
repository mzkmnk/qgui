import { Injectable, OnApplicationShutdown, Logger } from '@nestjs/common';

interface ProcessLike {
  pid: number;
  killed?: boolean;
  kill: () => void;
}

@Injectable()
export class PtyCleanupService implements OnApplicationShutdown {
  private readonly logger = new Logger(PtyCleanupService.name);
  private processes: Map<number, ProcessLike> = new Map();
  private timeouts: Map<number, NodeJS.Timeout> = new Map();

  /**
   * プロセスを登録
   */
  registerProcess(pid: number, process: ProcessLike): void {
    this.processes.set(pid, process);
    this.logger.log(`プロセス登録: PID ${pid}`);
  }

  /**
   * 特定のプロセスを終了
   */
  killProcess(pid: number): void {
    const process = this.processes.get(pid);
    if (process) {
      try {
        if (typeof process.kill === 'function') {
          process.kill();
        }
        this.processes.delete(pid);
        
        // タイムアウトがあればクリア
        const timeout = this.timeouts.get(pid);
        if (timeout) {
          clearTimeout(timeout);
          this.timeouts.delete(pid);
        }
        
        this.logger.log(`プロセス終了: PID ${pid}`);
      } catch (error) {
        this.logger.error(`プロセス終了エラー PID ${pid}:`, error);
      }
    }
  }

  /**
   * 全プロセスを終了
   */
  cleanupAll(): void {
    this.logger.log(`全プロセスのクリーンアップ開始: ${this.processes.size}個のプロセス`);
    
    this.processes.forEach((process, pid) => {
      try {
        if (typeof process.kill === 'function') {
          process.kill();
        }
        this.logger.log(`プロセス終了: PID ${pid}`);
      } catch (error) {
        this.logger.error(`プロセス終了エラー PID ${pid}:`, error);
      }
    });
    
    // タイムアウトを全てクリア
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
    
    this.processes.clear();
    this.logger.log('全プロセスのクリーンアップ完了');
  }

  /**
   * 登録されている全プロセスを取得
   */
  getAllProcesses(): ProcessLike[] {
    return Array.from(this.processes.values());
  }

  /**
   * プロセスが存在するか確認
   */
  hasProcess(pid: number): boolean {
    return this.processes.has(pid);
  }

  /**
   * プロセスにタイムアウトを設定
   */
  setProcessTimeout(pid: number, timeout: number): void {
    // 既存のタイムアウトがあればクリア
    const existingTimeout = this.timeouts.get(pid);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    // 新しいタイムアウトを設定
    const timeoutId = setTimeout(() => {
      this.logger.warn(`プロセスタイムアウト: PID ${pid} (${timeout}ms経過)`);
      this.killProcess(pid);
    }, timeout);
    
    this.timeouts.set(pid, timeoutId);
  }

  /**
   * アプリケーション終了時のフック
   */
  onApplicationShutdown(): void {
    this.logger.log('アプリケーション終了: PTYプロセスクリーンアップ開始');
    this.cleanupAll();
  }
}