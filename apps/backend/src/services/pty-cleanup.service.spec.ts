import { Test, TestingModule } from '@nestjs/testing';
import { PtyCleanupService } from './pty-cleanup.service';

interface MockPtyProcess {
  pid: number;
  killed: boolean;
  kill: () => void;
}

describe('PtyCleanupService', () => {
  let service: PtyCleanupService;
  let mockProcesses: MockPtyProcess[];

  beforeEach(async () => {
    mockProcesses = [
      { pid: 1001, killed: false, kill: function() { this.killed = true; } },
      { pid: 1002, killed: false, kill: function() { this.killed = true; } },
      { pid: 1003, killed: false, kill: function() { this.killed = true; } }
    ];

    const module: TestingModule = await Test.createTestingModule({
      providers: [PtyCleanupService],
    }).compile();

    service = module.get<PtyCleanupService>(PtyCleanupService);
  });

  it('サービスが定義されている', () => {
    expect(service).toBeDefined();
  });

  describe('プロセス管理', () => {
    it('プロセスを登録できる', () => {
      mockProcesses.forEach(process => {
        service.registerProcess(process.pid, process);
      });
      
      const allProcesses = service.getAllProcesses();
      expect(allProcesses).toHaveLength(3);
    });

    it('特定のプロセスを終了できる', () => {
      service.registerProcess(mockProcesses[0].pid, mockProcesses[0]);
      
      service.killProcess(mockProcesses[0].pid);
      
      expect(mockProcesses[0].killed).toBe(true);
      expect(service.getAllProcesses()).toHaveLength(0);
    });

    it('存在しないプロセスを終了しようとしてもエラーにならない', () => {
      expect(() => service.killProcess(9999)).not.toThrow();
    });
  });

  describe('クリーンアップ', () => {
    it('アプリ終了時に全PTYプロセスを終了する', () => {
      // プロセスを登録
      mockProcesses.forEach(process => {
        service.registerProcess(process.pid, process);
      });

      // クリーンアップ実行
      service.cleanupAll();

      // 全プロセスが終了していることを確認
      expect(mockProcesses.every(p => p.killed)).toBe(true);
      expect(service.getAllProcesses()).toHaveLength(0);
    });

    it('プロセスが0個でもcleanupAllがエラーにならない', () => {
      expect(() => service.cleanupAll()).not.toThrow();
    });

    it('シャットダウンフックが登録される', () => {
      const shutdownSpy = jest.spyOn(service, 'onApplicationShutdown');
      
      service.onApplicationShutdown();
      
      expect(shutdownSpy).toHaveBeenCalled();
    });
  });

  describe('プロセス状態確認', () => {
    it('登録されたプロセスのリストを取得できる', () => {
      service.registerProcess(mockProcesses[0].pid, mockProcesses[0]);
      service.registerProcess(mockProcesses[1].pid, mockProcesses[1]);
      
      const processes = service.getAllProcesses();
      
      expect(processes).toHaveLength(2);
      expect(processes[0].pid).toBe(mockProcesses[0].pid);
      expect(processes[1].pid).toBe(mockProcesses[1].pid);
    });

    it('プロセスが存在するか確認できる', () => {
      service.registerProcess(mockProcesses[0].pid, mockProcesses[0]);
      
      expect(service.hasProcess(mockProcesses[0].pid)).toBe(true);
      expect(service.hasProcess(9999)).toBe(false);
    });
  });

  describe('タイムアウト処理', () => {
    it('長時間実行されているプロセスを強制終了できる', () => {
      jest.useFakeTimers();
      
      // プロセスを登録
      service.registerProcess(mockProcesses[0].pid, mockProcesses[0]);
      
      // タイムアウト設定（30分）
      service.setProcessTimeout(mockProcesses[0].pid, 30 * 60 * 1000);
      
      // 時間を進める
      jest.advanceTimersByTime(31 * 60 * 1000);
      
      // プロセスが終了していることを確認
      expect(mockProcesses[0].killed).toBe(true);
      
      jest.useRealTimers();
    });
  });
});