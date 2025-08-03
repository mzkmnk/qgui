import { Test, TestingModule } from '@nestjs/testing';
import { WebSocketGateway } from './websocket.gateway';
import {
  WebSocketClient,
} from './interfaces/websocket-gateway.interface';
import { components } from '@qgui/shared';

describe('WebSocketGateway', () => {
  let gateway: WebSocketGateway;
  let mockClient: WebSocketClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebSocketGateway],
    }).compile();

    gateway = module.get<WebSocketGateway>(WebSocketGateway);

    // モッククライアントの作成
    mockClient = {
      id: 'test-client-123',
      connected: true,
      handshake: {
        address: '127.0.0.1',
        headers: {
          'user-agent': 'test-agent',
        },
        query: {},
      },
      emit: jest.fn(),
      disconnect: jest.fn(),
      join: jest.fn(),
      leave: jest.fn(),
    };
  });

  describe('handleConnection', () => {
    it('新しいクライアント接続時に接続イベントを送信する', async () => {
      // Act
      await gateway.handleConnection(mockClient);

      // Assert
      expect(mockClient.emit).toHaveBeenCalledWith(
        'connection',
        expect.objectContaining({
          type: 'connection',
          timestamp: expect.any(String),
          data: expect.objectContaining({
            clientId: 'test-client-123',
            status: 'connected',
          }),
        })
      );
    });

    it('接続時にクライアントのUser-Agentを含める', async () => {
      // Act
      await gateway.handleConnection(mockClient);

      // Assert
      expect(mockClient.emit).toHaveBeenCalledWith(
        'connection',
        expect.objectContaining({
          data: expect.objectContaining({
            userAgent: 'test-agent',
          }),
        })
      );
    });

    it('接続時にタイムスタンプがISO 8601形式である', async () => {
      // Act
      await gateway.handleConnection(mockClient);

      // Assert
      const emitCall = (mockClient.emit as jest.Mock).mock.calls[0];
      const message = emitCall[1] as components['schemas']['ConnectionEvent'];
      expect(new Date(message.timestamp).toISOString()).toBe(message.timestamp);
    });

    it('接続後にクライアント数が増加する', async () => {
      // Arrange
      const initialCount = gateway.getConnectedClientsCount();

      // Act
      await gateway.handleConnection(mockClient);

      // Assert
      expect(gateway.getConnectedClientsCount()).toBe(initialCount + 1);
    });

    it('同じクライアントIDで再接続時はreconnectedステータスを送信する', async () => {
      // Arrange
      await gateway.handleConnection(mockClient);
      await gateway.handleDisconnect(mockClient);

      // Act
      await gateway.handleConnection(mockClient);

      // Assert
      const emitCalls = (mockClient.emit as jest.Mock).mock.calls;
      const lastCall = emitCalls[emitCalls.length - 1];
      expect(lastCall[1]).toEqual(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'reconnected',
          }),
        })
      );
    });
  });

  describe('getConnectedClientsCount', () => {
    it('初期状態では0を返す', () => {
      // Act & Assert
      expect(gateway.getConnectedClientsCount()).toBe(0);
    });

    it('接続後は正しいクライアント数を返す', async () => {
      // Arrange
      const mockClient2: WebSocketClient = {
        ...mockClient,
        id: 'test-client-456',
      };

      // Act
      await gateway.handleConnection(mockClient);
      await gateway.handleConnection(mockClient2);

      // Assert
      expect(gateway.getConnectedClientsCount()).toBe(2);
    });
  });

  describe('getClientConnectionState', () => {
    it('接続されていないクライアントの場合はnullを返す', async () => {
      // Act
      const state = await gateway.getClientConnectionState(
        'non-existent-client'
      );

      // Assert
      expect(state).toBeNull();
    });

    it('接続されているクライアントの接続状態を返す', async () => {
      // Arrange
      await gateway.handleConnection(mockClient);

      // Act
      const state = await gateway.getClientConnectionState(mockClient.id);

      // Assert
      expect(state).toEqual(
        expect.objectContaining({
          status: 'connected',
          connectedAt: expect.any(String),
        })
      );
    });
  });
});
