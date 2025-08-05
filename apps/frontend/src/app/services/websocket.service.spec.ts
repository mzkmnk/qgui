import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebSocketService } from './websocket.service';
import * as SocketIOClient from 'socket.io-client';

// Socket.ioのモック
vi.mock('socket.io-client', () => {
  return {
    io: vi.fn(),
  };
});

type MockSocket = {
  connected: boolean;
  on: ReturnType<typeof vi.fn>;
  emit: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
};

describe('WebSocketService', () => {
  let service: WebSocketService;
  let mockSocket: MockSocket;
  let mockIo: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Socket.ioのモックを作成
    mockSocket = {
      connected: false,
      on: vi.fn(),
      emit: vi.fn(),
      disconnect: vi.fn(),
    };

    mockIo = vi.fn().mockReturnValue(mockSocket);
    (SocketIOClient.io as unknown) = mockIo;

    TestBed.configureTestingModule({
      providers: [WebSocketService],
    });

    service = TestBed.inject(WebSocketService);
  });

  afterEach(() => {
    // モックをクリア
    vi.clearAllMocks();
  });

  describe('connect', () => {
    it('指定されたURLでSocket.io接続を確立できる', async () => {
      // Arrange
      const testUrl = 'http://localhost:3000';

      // Act
      const connectPromise = service.connect(testUrl);

      // 'on'メソッドが呼ばれたときのコールバックを取得
      const connectCallback = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'connect'
      )?.[1];

      // Socket.io接続成功をシミュレート
      mockSocket.connected = true;
      connectCallback?.();

      const result = await connectPromise;

      // Assert
      expect(result).toBe(true);
      expect(mockIo).toHaveBeenCalledWith(testUrl, {
        transports: ['websocket'],
        autoConnect: true,
      });
    });

    it('接続失敗時はfalseを返す', async () => {
      // Arrange
      const testUrl = 'http://localhost:3000';

      // Act
      const connectPromise = service.connect(testUrl);

      // 'on'メソッドが呼ばれたときのコールバックを取得
      const errorCallback = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'connect_error'
      )?.[1];

      // Socket.io接続失敗をシミュレート
      errorCallback?.(new Error('Connection failed'));

      const result = await connectPromise;

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('disconnect', () => {
    it('Socket.io接続を切断できる', async () => {
      // Arrange
      const testUrl = 'http://localhost:3000';
      const connectPromise = service.connect(testUrl);

      // 接続成功をシミュレート
      const connectCallback = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'connect'
      )?.[1];
      mockSocket.connected = true;
      connectCallback?.();

      await connectPromise;

      // Act
      service.disconnect();

      // Assert
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it('切断理由を指定して切断できる', async () => {
      // Arrange
      const testUrl = 'http://localhost:3000';
      const reason = 'ユーザーによる切断';
      const connectPromise = service.connect(testUrl);

      // 接続成功をシミュレート
      const connectCallback = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'connect'
      )?.[1];
      mockSocket.connected = true;
      connectCallback?.();

      await connectPromise;

      // Act
      service.disconnect(reason);

      // Assert
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });
  });

  describe('isConnected', () => {
    it('接続中の場合はtrueを返す', async () => {
      // Arrange
      const testUrl = 'http://localhost:3000';
      const connectPromise = service.connect(testUrl);

      // 接続成功をシミュレート
      const connectCallback = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'connect'
      )?.[1];
      mockSocket.connected = true;
      connectCallback?.();

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

  describe('sendMessage', () => {
    it('メッセージを送信できる', async () => {
      // Arrange
      const testUrl = 'http://localhost:3000';
      const connectPromise = service.connect(testUrl);

      // 接続成功をシミュレート
      const connectCallback = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'connect'
      )?.[1];
      mockSocket.connected = true;
      connectCallback?.();

      await connectPromise;

      const message = {
        id: '123',
        type: 'message' as const,
        timestamp: new Date().toISOString(),
        data: { command: 'test' },
      };

      // Act
      const result = service.sendMessage(message);

      // Assert
      expect(result).toBe(true);
      expect(mockSocket.emit).toHaveBeenCalledWith('message', message);
    });

    it('未接続の場合はfalseを返す', () => {
      // Arrange
      const message = {
        id: '123',
        type: 'message' as const,
        timestamp: new Date().toISOString(),
        data: { command: 'test' },
      };

      // Act
      const result = service.sendMessage(message);

      // Assert
      expect(result).toBe(false);
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });
  });
});
