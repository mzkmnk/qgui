import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TerminalComponent } from './terminal.component';

// xterm.jsのモック
vi.mock('@xterm/xterm', () => ({
  Terminal: vi.fn().mockImplementation(() => ({
    open: vi.fn(),
    writeln: vi.fn(),
    dispose: vi.fn(),
    loadAddon: vi.fn(),
  })),
}));

// FitAddonのモック
vi.mock('@xterm/addon-fit', () => ({
  FitAddon: vi.fn().mockImplementation(() => ({
    fit: vi.fn(),
  })),
}));

describe('TerminalComponent', () => {
  let component: TerminalComponent;
  let fixture: ComponentFixture<TerminalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TerminalComponent],
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
  });
});