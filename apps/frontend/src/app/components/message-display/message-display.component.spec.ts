import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageDisplayComponent } from './message-display.component';

describe('MessageDisplayComponent', () => {
  let component: MessageDisplayComponent;
  let fixture: ComponentFixture<MessageDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageDisplayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MessageDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('コンポーネントが作成できる', () => {
    expect(component).toBeTruthy();
  });

  it('メッセージが表示される', () => {
    const testMessage = 'テストメッセージ';
    fixture.componentRef.setInput('messages', [
      { type: 'output', content: testMessage },
    ]);
    fixture.detectChanges();

    const messageElement = fixture.nativeElement.querySelector('.message');
    expect(messageElement).toBeTruthy();
    expect(messageElement.textContent).toContain(testMessage);
  });

  it('複数のメッセージが順番に表示される', () => {
    const messages = [
      { type: 'command', content: 'echo test' },
      { type: 'output', content: 'test' },
    ];
    fixture.componentRef.setInput('messages', messages);
    fixture.detectChanges();

    const messageElements = fixture.nativeElement.querySelectorAll('.message');
    expect(messageElements.length).toBe(2);
    expect(messageElements[0].textContent).toContain('echo test');
    expect(messageElements[1].textContent).toContain('test');
  });

  it('コマンドとアウトプットで異なるスタイルが適用される', () => {
    const messages = [
      { type: 'command', content: 'ls' },
      { type: 'output', content: 'file.txt' },
    ];
    fixture.componentRef.setInput('messages', messages);
    fixture.detectChanges();

    const commandElement =
      fixture.nativeElement.querySelector('.message-command');
    const outputElement =
      fixture.nativeElement.querySelector('.message-output');

    expect(commandElement).toBeTruthy();
    expect(outputElement).toBeTruthy();
  });

  it('空のメッセージリストの場合は何も表示されない', () => {
    fixture.componentRef.setInput('messages', []);
    fixture.detectChanges();

    const messageElements = fixture.nativeElement.querySelectorAll('.message');
    expect(messageElements.length).toBe(0);
  });

  it('ANSIコードを含むメッセージが正しく表示される', () => {
    const messages = [
      {
        type: 'output',
        content: '\x1b[31mエラー\x1b[0m: ファイルが見つかりません',
      },
    ];
    fixture.componentRef.setInput('messages', messages);
    fixture.detectChanges();

    const messageElement =
      fixture.nativeElement.querySelector('.message-output');
    expect(messageElement).toBeTruthy();
    expect(messageElement.innerHTML).toContain(
      '<span style="color: red">エラー</span>'
    );
  });
});
