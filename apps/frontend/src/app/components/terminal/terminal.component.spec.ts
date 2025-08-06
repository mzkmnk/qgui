import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TerminalComponent } from './terminal.component';
import { TerminalWebSocketService } from '../../services/terminal-websocket.service';
import { of } from 'rxjs';

// xterm.jsのモック
vi.mock('@xterm/xterm', () => ({
  Terminal: vi.fn().mockImplementation(() => {
    const callbacks: ((data: string) => void)[] = [];
    return {
      open: vi.fn(),
      write: vi.fn(),
      writeln: vi.fn(),
      dispose: vi.fn(),
      loadAddon: vi.fn(),
      onData: vi.fn((callback) => {
        callbacks.push(callback);
      }),
      _triggerData: (data: string) => {
        callbacks.forEach(cb => cb(data));
      },
      cols: 80,
      rows: 24,
    };
  }),
}));

// FitAddonのモック
vi.mock('@xterm/addon-fit', () => ({
  FitAddon: vi.fn().mockImplementation(() => ({
    fit: vi.fn(),
  })),
}));

// ResizeObserverのモック
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe('TerminalComponent', () => {
  let component: TerminalComponent;
  let fixture: ComponentFixture<TerminalComponent>;
  let mockTerminalWebSocketService: {
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    sendCommand: ReturnType<typeof vi.fn>;
    onPtyOutput: ReturnType<typeof vi.fn>;
    resize: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockTerminalWebSocketService = {
      connect: vi.fn().mockResolvedValue(true),
      disconnect: vi.fn(),
      sendCommand: vi.fn().mockReturnValue(true),
      onPtyOutput: vi.fn().mockReturnValue(of('test output')),
      resize: vi.fn().mockReturnValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [TerminalComponent],
      providers: [
        {
          provide: TerminalWebSocketService,
          useValue: mockTerminalWebSocketService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TerminalComponent);
    component = fixture.componentInstance;
  });

  it('ターミナルコンポーネントが作成される', () => {
    expect(component).toBeTruthy();
  });

  it('初期化時にターミナルインスタンスが作成される', () => {
    fixture.detectChanges();
    expect(component.terminal).toBeTruthy();
    expect(component.terminal).toBeDefined();
  });

  it('ターミナル要素がDOMに存在する', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const terminalElement = compiled.querySelector('.terminal-container');
    expect(terminalElement).toBeTruthy();
  });

  it('destroy時にターミナルが適切にクリーンアップされる', () => {
    fixture.detectChanges();
    const terminal = component.terminal;
    vi.spyOn(terminal, 'dispose');
    
    component.ngOnDestroy();
    
    expect(terminal.dispose).toHaveBeenCalled();
    expect(mockTerminalWebSocketService.disconnect).toHaveBeenCalled();
  });

  it('WebSocket接続が初期化される', async () => {
    await component.ngOnInit();
    fixture.detectChanges();
    
    expect(mockTerminalWebSocketService.connect).toHaveBeenCalledWith(
      'ws://localhost:3001'
    );
  });

  it('PTY出力をターミナルに表示する', async () => {
    mockTerminalWebSocketService.onPtyOutput.mockReturnValue(
      of('Hello World')
    );
    
    await component.ngOnInit();
    fixture.detectChanges();
    
    // 少し待つことでRxJSのsubscriptionが動作する
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(component.terminal.write).toHaveBeenCalledWith('Hello World');
  });

  it.skip('キー入力をWebSocket経由で送信する', async () => {
    await component.ngOnInit();
    fixture.detectChanges();
    
    // onDataメソッドが呼ばれたことを確認
    expect(component.terminal.onData).toHaveBeenCalled();
    
    // ターミナルでキー入力をシミュレート
    (component.terminal as any)._triggerData('test input');
    
    expect(mockTerminalWebSocketService.sendCommand).toHaveBeenCalledWith(
      'test input'
    );
  });
});