import { Test, TestingModule } from '@nestjs/testing';
import { BufferLimitService } from './buffer-limit.service';

describe('BufferLimitService', () => {
  let service: BufferLimitService;
  const MAX_BUFFER_SIZE = 10 * 1024 * 1024; // 10MB

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BufferLimitService],
    }).compile();

    service = module.get<BufferLimitService>(BufferLimitService);
  });

  it('サービスが定義されている', () => {
    expect(service).toBeDefined();
  });

  describe('バッファサイズ制限', () => {
    it('デフォルトの最大バッファサイズが10MBである', () => {
      expect(service.getMaxBufferSize()).toBe(MAX_BUFFER_SIZE);
    });

    it('最大バッファサイズを変更できる', () => {
      const newSize = 5 * 1024 * 1024; // 5MB
      service.setMaxBufferSize(newSize);
      
      expect(service.getMaxBufferSize()).toBe(newSize);
    });

    it('負の値を設定しようとするとエラーになる', () => {
      expect(() => service.setMaxBufferSize(-1)).toThrow('バッファサイズは正の値である必要があります');
    });

    it('0を設定しようとするとエラーになる', () => {
      expect(() => service.setMaxBufferSize(0)).toThrow('バッファサイズは正の値である必要があります');
    });
  });

  describe('バッファ管理', () => {
    it('新しいバッファを作成できる', () => {
      const sessionId = 'test-session-1';
      const buffer = service.createBuffer(sessionId);
      
      expect(buffer).toBeDefined();
      expect(service.getBuffer(sessionId)).toBe(buffer);
    });

    it('バッファにデータを追加できる', () => {
      const sessionId = 'test-session-2';
      service.createBuffer(sessionId);
      
      const data = 'テストデータ';
      service.appendToBuffer(sessionId, data);
      
      const buffer = service.getBuffer(sessionId);
      expect(buffer.getContent()).toBe(data);
    });

    it('バッファサイズ制限を超えると古いデータが削除される', () => {
      const sessionId = 'test-session-3';
      service.createBuffer(sessionId);
      service.setMaxBufferSize(100); // 100バイトに制限
      
      // 50バイトのデータを3回追加（合計150バイト）
      const data1 = 'a'.repeat(50);
      const data2 = 'b'.repeat(50);
      const data3 = 'c'.repeat(50);
      
      service.appendToBuffer(sessionId, data1);
      service.appendToBuffer(sessionId, data2);
      service.appendToBuffer(sessionId, data3);
      
      const buffer = service.getBuffer(sessionId);
      const content = buffer.getContent();
      
      // 最初のデータが削除され、後の2つが残る
      expect(content.length).toBeLessThanOrEqual(100);
      expect(content).toContain('b');
      expect(content).toContain('c');
      expect(content).not.toContain('a'.repeat(50));
    });

    it('バッファをクリアできる', () => {
      const sessionId = 'test-session-4';
      service.createBuffer(sessionId);
      service.appendToBuffer(sessionId, 'データ');
      
      service.clearBuffer(sessionId);
      
      const buffer = service.getBuffer(sessionId);
      expect(buffer.getContent()).toBe('');
    });

    it('バッファを削除できる', () => {
      const sessionId = 'test-session-5';
      service.createBuffer(sessionId);
      
      service.deleteBuffer(sessionId);
      
      expect(service.getBuffer(sessionId)).toBeUndefined();
    });

    it('存在しないバッファへの操作は安全に処理される', () => {
      const sessionId = 'non-existent';
      
      expect(() => service.appendToBuffer(sessionId, 'data')).not.toThrow();
      expect(() => service.clearBuffer(sessionId)).not.toThrow();
      expect(() => service.deleteBuffer(sessionId)).not.toThrow();
    });
  });

  describe('メモリ使用量統計', () => {
    it('現在のメモリ使用量を取得できる', () => {
      const sessionId1 = 'session-1';
      const sessionId2 = 'session-2';
      
      service.createBuffer(sessionId1);
      service.createBuffer(sessionId2);
      
      service.appendToBuffer(sessionId1, 'a'.repeat(100));
      service.appendToBuffer(sessionId2, 'b'.repeat(200));
      
      const stats = service.getMemoryStats();
      
      expect(stats.totalBuffers).toBe(2);
      expect(stats.totalMemoryUsage).toBe(300);
      expect(stats.averageBufferSize).toBe(150);
    });

    it('メモリ使用量が制限値に近づくと警告を出す', () => {
      const warningSpy = jest.spyOn(service, 'isMemoryWarning');
      
      service.setMaxBufferSize(1000);
      const sessionId = 'warning-test';
      service.createBuffer(sessionId);
      
      // 80%以上使用で警告
      service.appendToBuffer(sessionId, 'x'.repeat(801));
      
      expect(warningSpy.mock.results[0].value).toBe(true);
    });
  });

  describe('循環バッファ実装', () => {
    it('CircularBufferが正しく動作する', () => {
      const CircularBuffer = service.getCircularBufferClass();
      const buffer = new CircularBuffer(10);
      
      // 10バイトのバッファに15バイト追加
      buffer.append('12345');
      buffer.append('67890');
      buffer.append('ABCDE');
      
      // 最初の5バイトが削除され、最後の10バイトが残る
      expect(buffer.getContent()).toBe('67890ABCDE');
      expect(buffer.getSize()).toBe(10);
    });

    it('CircularBufferをクリアできる', () => {
      const CircularBuffer = service.getCircularBufferClass();
      const buffer = new CircularBuffer(10);
      
      buffer.append('12345');
      buffer.clear();
      
      expect(buffer.getContent()).toBe('');
      expect(buffer.getSize()).toBe(0);
    });
  });
});