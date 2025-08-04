import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebSocketService } from './websocket.service';

// WebSocketのモック型を定義
type MockWebSocket = {
  close: ReturnType<typeof vi.fn>;
  send: ReturnType<typeof vi.fn>;
  readyState: number;
  onopen: ((event: Event) => void) | null;
  onerror: ((event: Event) => void) | null;
  onclose: ((event: CloseEvent) => void) | null;
  onmessage: ((event: MessageEvent) => void) | null;
};

// WebSocketコンストラクタのモック型
interface MockWebSocketConstructor {
  new (url: string): MockWebSocket;
  CONNECTING: number;
  OPEN: number;
  CLOSING: number;
  CLOSED: number;
}

describe('WebSocketService', () => {
  let service: WebSocketService;
  let mockWebSocket: MockWebSocket;
  let originalWebSocket: typeof WebSocket;

  beforeEach(() => {
    // WebSocketのモックを作成
    mockWebSocket = {
      close: vi.fn(),
      send: vi.fn(),
      readyState: WebSocket.CONNECTING,
      onopen: null,
      onerror: null,
      onclose: null,
      onmessage: null,
    };

    // WebSocketコンストラクタを保存してモック
    originalWebSocket = global.WebSocket;
    
    // より型安全なモックの作成
    const MockWebSocketClass = vi.fn(() => mockWebSocket) as unknown as MockWebSocketConstructor;
    MockWebSocketClass.CONNECTING = 0;
    MockWebSocketClass.OPEN = 1;
    MockWebSocketClass.CLOSING = 2;
    MockWebSocketClass.CLOSED = 3;
    
    global.WebSocket = MockWebSocketClass as unknown as typeof WebSocket;

    TestBed.configureTestingModule({
      providers: [WebSocketService],
    });

    service = TestBed.inject(WebSocketService);
  });

  afterEach(() => {
    // WebSocketコンストラクタを元に戻す
    global.WebSocket = originalWebSocket;
    // モックをクリア
    vi.clearAllMocks();
  });

  describe('connect', () => {
    it('指定されたURLでWebSocket接続を確立できる', async () => {
      // Arrange
      const testUrl = 'ws://localhost:3000/ws';

      // Act
      const connectPromise = service.connect(testUrl);

      // WebSocket接続成功をシミュレート
      mockWebSocket.readyState = WebSocket.OPEN;
      mockWebSocket.onopen?.(new Event('open'));

      const result = await connectPromise;

      // Assert
      expect(result).toBe(true);
      expect(global.WebSocket).toHaveBeenCalledWith(testUrl);
    });

    it('接続失敗時はfalseを返す', async () => {
      // Arrange
      const testUrl = 'ws://localhost:3000/ws';

      // Act
      const connectPromise = service.connect(testUrl);

      // WebSocket接続失敗をシミュレート
      mockWebSocket.readyState = WebSocket.CLOSED;
      mockWebSocket.onerror?.(new Event('error'));

      const result = await connectPromise;

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('disconnect', () => {
    it('WebSocket接続を切断できる', async () => {
      // Arrange
      const testUrl = 'ws://localhost:3000/ws';
      const connectPromise = service.connect(testUrl);

      // 接続成功をシミュレート
      mockWebSocket.readyState = WebSocket.OPEN;
      mockWebSocket.onopen?.(new Event('open'));

      await connectPromise;

      // Act
      service.disconnect();

      // Assert
      expect(mockWebSocket.close).toHaveBeenCalled();
    });

    it('切断理由を指定して切断できる', async () => {
      // Arrange
      const testUrl = 'ws://localhost:3000/ws';
      const reason = 'ユーザーによる切断';
      const connectPromise = service.connect(testUrl);

      // 接続成功をシミュレート
      mockWebSocket.readyState = WebSocket.OPEN;
      mockWebSocket.onopen?.(new Event('open'));

      await connectPromise;

      // Act
      service.disconnect(reason);

      // Assert
      expect(mockWebSocket.close).toHaveBeenCalledWith(1000, reason);
    });
  });

  describe('isConnected', () => {
    it('接続中の場合はtrueを返す', async () => {
      // Arrange
      const testUrl = 'ws://localhost:3000/ws';
      const connectPromise = service.connect(testUrl);

      // 接続成功をシミュレート
      mockWebSocket.readyState = WebSocket.OPEN;
      mockWebSocket.onopen?.(new Event('open'));

      await connectPromise;

      // Act
      const result = service.isConnected();

      // Assert
      expect(result).toBe(true);
    });

    it('未接続の場合はfalseを返す', () => {
      // Act
      const result = service.isConnected();

      // Assert
      expect(result).toBe(false);
    });
  });
});
