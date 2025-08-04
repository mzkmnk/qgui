import { Test, TestingModule } from '@nestjs/testing';
import { PTYManagerService } from './pty-manager.service';
import { PTYProcessCreateRequest } from '@qgui/shared';

describe('PTYManagerService', () => {
  let service: PTYManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PTYManagerService],
    }).compile();

    service = module.get<PTYManagerService>(PTYManagerService);
  });

  describe('createProcess', () => {
    it('指定されたコマンドでPTYプロセスを起動できる', async () => {
      // Arrange: テスト準備
      const createRequest: PTYProcessCreateRequest = {
        command: 'echo',
        args: ['test'],
        cols: 80,
        rows: 24,
      };

      // Act: テスト実行
      const processSession = await service.createProcess(createRequest);

      // Assert: 結果検証
      expect(processSession).toBeDefined();
      expect(processSession.processId).toBeDefined();
      expect(processSession.state).toBe('running');
      expect(processSession.createdAt).toBeInstanceOf(Date);
    });

    it('プロセスIDが一意であることを確認する', async () => {
      // Arrange: テスト準備
      const createRequest: PTYProcessCreateRequest = {
        command: 'echo',
        args: ['test1'],
        cols: 80,
        rows: 24,
      };

      // Act: 複数のプロセスを起動
      const process1 = await service.createProcess(createRequest);
      const process2 = await service.createProcess(createRequest);

      // Assert: プロセスIDが異なることを確認
      expect(process1.processId).not.toBe(process2.processId);
    });
  });

  describe('getProcess', () => {
    it('作成したプロセスを取得できる', async () => {
      // Arrange: プロセスを作成
      const createRequest: PTYProcessCreateRequest = {
        command: 'echo',
        args: ['test'],
        cols: 80,
        rows: 24,
      };
      const createdProcess = await service.createProcess(createRequest);

      // Act: プロセスを取得
      const retrievedProcess = service.getProcess(createdProcess.processId);

      // Assert: 同じプロセスが取得できることを確認
      expect(retrievedProcess).toBeDefined();
      expect(retrievedProcess?.processId).toBe(createdProcess.processId);
    });

    it('存在しないプロセスIDの場合はundefinedを返す', () => {
      // Act: 存在しないIDで取得を試みる
      const result = service.getProcess('non-existent-id');

      // Assert: undefinedが返ることを確認
      expect(result).toBeUndefined();
    });
  });

  describe('executeCommand', () => {
    it('コマンドを実行して結果を取得できる', async () => {
      // Arrange: テスト準備
      // 今回はechoコマンドを使用

      // Act: テスト実行
      const result = await service.executeCommand('echo test');

      // Assert: 結果検証
      expect(result).toContain('test');
    });

    it('複数の引数を持つコマンドを実行できる', async () => {
      // Arrange: テスト準備

      // Act: テスト実行
      const result = await service.executeCommand('echo hello world');

      // Assert: 結果検証
      expect(result).toContain('hello world');
    });

    it('存在しないコマンドの場合はエラーメッセージを返す', async () => {
      // Arrange: テスト準備

      // Act: テスト実行
      const result = await service.executeCommand('nonexistentcommand123');

      // Assert: 結果検証（エラーメッセージが含まれることを確認）
      expect(result).toBeDefined();
      // 実際のエラーメッセージはOS依存なので、空でないことだけ確認
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
