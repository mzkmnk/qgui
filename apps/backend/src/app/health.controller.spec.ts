import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  describe('GET /health', () => {
    it('指定されたIDのユーザーを取得できる', async () => {
      // Act: テスト実行（この時点では失敗する）
      const result = await controller.getHealth();

      // Assert: 結果検証
      expect(result).toBeDefined();
      expect(result.status).toBe('healthy');
      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });

    it('バージョン情報を含むレスポンスを返す', async () => {
      // Act: テスト実行
      const result = await controller.getHealth();

      // Assert: 結果検証
      expect(result.version).toBeDefined();
      expect(typeof result.version).toBe('string');
    });
  });
});
