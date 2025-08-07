import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CommandPaletteComponent } from './command-palette.component';

describe('CommandPaletteComponent', () => {
  let component: CommandPaletteComponent;
  let fixture: ComponentFixture<CommandPaletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandPaletteComponent, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CommandPaletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('初期状態では非表示', () => {
    expect(component.isVisible()).toBe(false);
  });

  it('Cmd+Kで表示される', () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      preventDefault: () => {
        // デフォルトのブラウザ動作を防ぐ
      }
    });
    
    component.handleKeydown(event);
    expect(component.isVisible()).toBe(true);
  });

  it('Ctrl+Kでも表示される（Windows/Linux）', () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      preventDefault: () => {
        // デフォルトのブラウザ動作を防ぐ
      }
    });
    
    component.handleKeydown(event);
    expect(component.isVisible()).toBe(true);
  });

  it('Escapeキーで閉じる', () => {
    component.open();
    expect(component.isVisible()).toBe(true);
    
    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      preventDefault: () => {
        // デフォルトのブラウザ動作を防ぐ
      }
    });
    
    component.handleKeydown(event);
    expect(component.isVisible()).toBe(false);
  });

  it('コマンドを検索できる', () => {
    const commands = [
      { id: '1', label: 'New Chat', action: () => { /* 新しいチャットアクション */ } },
      { id: '2', label: 'Clear Chat', action: () => { /* チャットクリアアクション */ } },
      { id: '3', label: 'Settings', action: () => { /* 設定アクション */ } }
    ];
    
    component.commands = commands;
    component.searchQuery = 'chat';
    
    const filtered = component.getFilteredCommands();
    expect(filtered.length).toBe(2);
    expect(filtered[0].label).toBe('New Chat');
    expect(filtered[1].label).toBe('Clear Chat');
  });

  it('コマンドを実行して閉じる', () => {
    const mockAction = vi.fn();
    const command = { id: '1', label: 'Test Command', action: mockAction };
    
    component.open();
    component.executeCommand(command);
    
    expect(mockAction).toHaveBeenCalled();
    expect(component.isVisible()).toBe(false);
  });

  it('オーバーレイクリックで閉じる', () => {
    component.open();
    component.onOverlayClick();
    expect(component.isVisible()).toBe(false);
  });
});