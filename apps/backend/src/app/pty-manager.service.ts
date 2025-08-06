import { Injectable } from '@nestjs/common';
import { PTYManager, ProcessSession } from './interfaces/pty-manager.interface';
import {
  PTYProcessCreateRequest,
  PTYProcessInfo,
  PTYLifecycleEvent,
  PTYProcessState,
} from '@qgui/shared';
import { exec } from 'child_process';
import { promisify } from 'util';
import { PtyCleanupService } from '../services/pty-cleanup.service';
import { BufferLimitService } from '../services/buffer-limit.service';

interface MutableProcessSession {
  processId: string;
  state: PTYProcessState;
  createdAt: Date;
  terminatedAt?: Date;
}

@Injectable()
export class PTYManagerService implements PTYManager {
  private processes: Map<string, ProcessSession> = new Map();
  private processStates: Map<string, MutableProcessSession> = new Map();
  private processIdCounter = 0;
  private execAsync = promisify(exec);

  constructor(
    private readonly cleanupService: PtyCleanupService,
    private readonly bufferService: BufferLimitService,
  ) {}

  async createProcess(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    request: PTYProcessCreateRequest
  ): Promise<ProcessSession> {
    // 仮実装: プロセスIDを生成
    const processId = `process-${++this.processIdCounter}`;
    const createdAt = new Date();

    // バッファを作成
    this.bufferService.createBuffer(processId);

    // プロセス状態を作成
    const processState: MutableProcessSession = {
      processId,
      state: 'running' as PTYProcessState,
      createdAt,
      terminatedAt: undefined,
    };
    this.processStates.set(processId, processState);

    // 仮実装: ProcessSessionオブジェクトを作成
    const processSession: ProcessSession = {
      get processId() { return processState.processId; },
      get state() { return processState.state; },
      get createdAt() { return processState.createdAt; },
      get terminatedAt() { return processState.terminatedAt; },
      write: (data: string) => {
        // バッファにデータを追加
        this.bufferService.appendToBuffer(processId, data);
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      resize: (cols: number, rows: number) => {
        // 仮実装: 何もしない
      },
      terminate: async () => {
        // プロセスをクリーンアップサービスから削除
        this.cleanupService.killProcess(parseInt(processId.replace('process-', '')));
        // バッファを削除
        this.bufferService.deleteBuffer(processId);
        // プロセス状態を更新
        processState.state = 'terminated' as PTYProcessState;
        processState.terminatedAt = new Date();
        // プロセスをMapから削除
        this.processes.delete(processId);
        this.processStates.delete(processId);
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onData: (callback: (data: string) => void) => {
        // 仮実装: 何もしない
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onError: (callback: (error: Error) => void) => {
        // 仮実装: 何もしない
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onExit: (callback: (exitCode: number, signal?: string) => void) => {
        // 仮実装: 何もしない
      },
    };

    // プロセスを保存
    this.processes.set(processId, processSession);
    
    // クリーンアップサービスにプロセスを登録
    // 注: 実際のPTYプロセスがないため、ダミーのプロセスオブジェクトを登録
    const dummyProcess = {
      pid: parseInt(processId.replace('process-', '')),
      killed: false,
      kill: () => {
        processSession.terminate();
      },
    };
    this.cleanupService.registerProcess(dummyProcess.pid, dummyProcess);

    return processSession;
  }

  getProcess(processId: string): ProcessSession | undefined {
    return this.processes.get(processId);
  }

  getAllProcesses(): ProcessSession[] {
    return Array.from(this.processes.values());
  }

  async terminateProcess(processId: string, force?: boolean): Promise<void> {
    const process = this.processes.get(processId);
    if (process) {
      await process.terminate(force);
    }
  }

  async terminateAllProcesses(force?: boolean): Promise<void> {
    const promises: Promise<void>[] = [];
    for (const process of this.processes.values()) {
      promises.push(process.terminate(force));
    }
    await Promise.all(promises);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onLifecycleEvent(callback: (event: PTYLifecycleEvent) => void): void {
    // 仮実装: 何もしない
  }

  getProcessInfo(processId: string): PTYProcessInfo | undefined {
    const processState = this.processStates.get(processId);
    if (!processState) {
      return undefined;
    }

    return {
      processId: processState.processId,
      state: processState.state,
      createdAt: processState.createdAt.toISOString(),
      terminatedAt: processState.terminatedAt?.toISOString(),
    };
  }

  async executeCommand(command: string): Promise<string> {
    try {
      // 実際のコマンド実行
      const { stdout, stderr } = await this.execAsync(command, {
        encoding: 'utf8',
        timeout: 5000, // 5秒のタイムアウト
      });

      // stdoutが空の場合はstderrを返す（エラーの場合）
      return stdout || stderr || '';
    } catch (error) {
      // エラーの場合はエラーメッセージを返す
      if (error instanceof Error) {
        // execのエラーオブジェクトには stderr プロパティがある場合がある
        const execError = error as Error & { stderr?: string };
        if (execError.stderr) {
          return execError.stderr;
        }
        return error.message;
      }
      return 'コマンド実行中にエラーが発生しました';
    }
  }
}
