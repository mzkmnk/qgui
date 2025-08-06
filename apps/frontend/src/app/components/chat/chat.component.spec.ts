import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ChatComponent } from './chat.component';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatComponent, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('初期メッセージが表示される', () => {
    expect(component).toBeTruthy();
    const messages = component.messages();
    expect(messages.length).toBe(1);
    expect(messages[0].role).toBe('assistant');
    expect(messages[0].content).toContain('こんにちは');
  });

  it('メッセージを送信できる', () => {
    component.inputText = 'テストメッセージ';
    component.sendMessage();
    
    const messages = component.messages();
    expect(messages.length).toBe(2);
    expect(messages[1].role).toBe('user');
    expect(messages[1].content).toBe('テストメッセージ');
    expect(component.inputText).toBe('');
  });

  it('空のメッセージは送信されない', () => {
    component.inputText = '   ';
    component.sendMessage();
    
    const messages = component.messages();
    expect(messages.length).toBe(1);
  });

  it('Enterキーでメッセージが送信される', () => {
    component.inputText = 'テストメッセージ';
    const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: false });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    
    component.onKeyDown(event);
    
    expect(preventDefaultSpy).toHaveBeenCalled();
    const messages = component.messages();
    expect(messages.length).toBe(2);
  });

  it('Shift+Enterでは送信されない', () => {
    component.inputText = 'テストメッセージ';
    const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    
    component.onKeyDown(event);
    
    expect(preventDefaultSpy).not.toHaveBeenCalled();
    const messages = component.messages();
    expect(messages.length).toBe(1);
  });

  it('時刻が正しくフォーマットされる', () => {
    const date = new Date('2025-01-01T14:30:00');
    const formatted = component.formatTime(date);
    expect(formatted).toMatch(/\d{2}:\d{2}/);
  });

  it('HTMLが適切にエスケープされる', () => {
    const dangerous = '<script>alert("XSS")</script>';
    const escaped = component['escapeHtml'](dangerous);
    expect(escaped).not.toContain('<script>');
    expect(escaped).toContain('&lt;script&gt;');
  });
});