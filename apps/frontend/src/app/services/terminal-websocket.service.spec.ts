import { TestBed } from '@angular/core/testing';
import { TerminalWebSocketService } from './terminal-websocket.service';
import { WebSocketService } from './websocket.service';
import { of } from 'rxjs';

describe('TerminalWebSocketService', () => {
  let service: TerminalWebSocketService;
  let mockWebSocketService: {
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    sendMessage: ReturnType<typeof vi.fn>;
    onMessage: ReturnType<typeof vi.fn>;
    isConnected: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockWebSocketService = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      sendMessage: vi.fn(),
      onMessage: vi.fn(),
      isConnected: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        TerminalWebSocketService,
        { provide: WebSocketService, useValue: mockWebSocketService },
      ],
    });

    service = TestBed.inject(TerminalWebSocketService);
  });

  it('サービスが作成される', () => {
    expect(service).toBeTruthy();
  });

  it('WebSocket経由でコマンドを送信できる', () => {
    mockWebSocketService.sendMessage.mockReturnValue(true);
    mockWebSocketService.isConnected.mockReturnValue(true);

    const result = service.sendCommand('ls');

    expect(mockWebSocketService.sendMessage).toHaveBeenCalledWith({
      type: 'pty:input',
      data: 'ls',
    });
    expect(result).toBe(true);
  });

  it('未接続時はコマンド送信に失敗する', () => {
    mockWebSocketService.isConnected.mockReturnValue(false);

    const result = service.sendCommand('ls');

    expect(result).toBe(false);
    expect(mockWebSocketService.sendMessage).not.toHaveBeenCalled();
  });

  it('PTY出力メッセージを受信できる', async () => {
    const mockOutput = { type: 'pty:output', data: 'Hello World' };
    mockWebSocketService.onMessage.mockReturnValue(of(mockOutput));

    const outputPromise = new Promise<string>((resolve) => {
      service.onPtyOutput().subscribe((output) => {
        resolve(output);
      });
    });

    const output = await outputPromise;
    expect(output).toBe('Hello World');
    expect(mockWebSocketService.onMessage).toHaveBeenCalledWith('pty:output');
  });

  it('接続時にPTYセッションを開始する', async () => {
    mockWebSocketService.connect.mockResolvedValue(true);
    mockWebSocketService.sendMessage.mockReturnValue(true);

    const result = await service.connect('ws://localhost:3001');

    expect(mockWebSocketService.connect).toHaveBeenCalledWith(
      'ws://localhost:3001'
    );
    expect(mockWebSocketService.sendMessage).toHaveBeenCalledWith({
      type: 'pty:start',
      data: {},
    });
    expect(result).toBe(true);
  });

  it('切断時にPTYセッションを終了する', () => {
    mockWebSocketService.sendMessage.mockReturnValue(true);
    mockWebSocketService.isConnected.mockReturnValue(true);

    service.disconnect();

    expect(mockWebSocketService.sendMessage).toHaveBeenCalledWith({
      type: 'pty:stop',
      data: {},
    });
    expect(mockWebSocketService.disconnect).toHaveBeenCalled();
  });

  it('サイズ変更メッセージを送信できる', () => {
    mockWebSocketService.sendMessage.mockReturnValue(true);
    mockWebSocketService.isConnected.mockReturnValue(true);

    const result = service.resize(80, 24);

    expect(mockWebSocketService.sendMessage).toHaveBeenCalledWith({
      type: 'pty:resize',
      data: { cols: 80, rows: 24 },
    });
    expect(result).toBe(true);
  });
});