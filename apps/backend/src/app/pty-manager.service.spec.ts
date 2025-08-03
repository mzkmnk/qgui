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
});
