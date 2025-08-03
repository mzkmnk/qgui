import { Injectable } from '@nestjs/common';
import { PTYManager, ProcessSession } from './interfaces/pty-manager.interface';
import {
  PTYProcessCreateRequest,
  PTYProcessInfo,
  PTYLifecycleEvent,
  PTYProcessState,
} from '@qgui/shared';

@Injectable()
export class PTYManagerService implements PTYManager {
  private processes: Map<string, ProcessSession> = new Map();
  private processIdCounter = 0;

  async createProcess(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    request: PTYProcessCreateRequest
  ): Promise<ProcessSession> {
    // 仮実装: プロセスIDを生成
    const processId = `process-${++this.processIdCounter}`;
    const createdAt = new Date();

    // 仮実装: ProcessSessionオブジェクトを作成
    const processSession: ProcessSession = {
      processId,
      state: 'running' as PTYProcessState,
      createdAt,
      terminatedAt: undefined,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      write: (data: string) => {
        // 仮実装: 何もしない
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      resize: (cols: number, rows: number) => {
        // 仮実装: 何もしない
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      terminate: async (force?: boolean) => {
        // 仮実装: 何もしない
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

    return processSession;
  }

  getProcess(processId: string): ProcessSession | undefined {
    return this.processes.get(processId);
  }

  getAllProcesses(): ProcessSession[] {
    return Array.from(this.processes.values());
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async terminateProcess(processId: string, force?: boolean): Promise<void> {
    // 仮実装: 何もしない
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async terminateAllProcesses(force?: boolean): Promise<void> {
    // 仮実装: 何もしない
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onLifecycleEvent(callback: (event: PTYLifecycleEvent) => void): void {
    // 仮実装: 何もしない
  }

  getProcessInfo(processId: string): PTYProcessInfo | undefined {
    const process = this.processes.get(processId);
    if (!process) {
      return undefined;
    }

    return {
      processId: process.processId,
      state: process.state,
      createdAt: process.createdAt.toISOString(),
      terminatedAt: process.terminatedAt?.toISOString(),
    };
  }
}
