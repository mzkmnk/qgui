import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommandInputComponent } from './command-input.component';

describe('CommandInputComponent', () => {
  let component: CommandInputComponent;
  let fixture: ComponentFixture<CommandInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CommandInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('コンポーネントが作成できる', () => {
    expect(component).toBeTruthy();
  });

  it('入力フィールドが存在する', () => {
    const inputElement = fixture.nativeElement.querySelector('input');
    expect(inputElement).toBeTruthy();
  });

  it('入力フィールドにプレースホルダーが設定されている', () => {
    const inputElement = fixture.nativeElement.querySelector('input');
    expect(inputElement.placeholder).toBe('コマンドを入力...');
  });

  it('テキストを入力できる', () => {
    const inputElement = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const testText = 'ls -la';
    
    inputElement.value = testText;
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    
    expect(component.inputValue()).toBe(testText);
  });

  it('Enterキーで送信イベントが発火する', () => {
    const inputElement = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const testCommand = 'echo test';
    let emittedCommand = '';
    
    component.commandSubmit.subscribe((command: string) => {
      emittedCommand = command;
    });
    
    inputElement.value = testCommand;
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    inputElement.dispatchEvent(enterEvent);
    
    expect(emittedCommand).toBe(testCommand);
  });

  it('送信後に入力フィールドがクリアされる', () => {
    const inputElement = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const testCommand = 'pwd';
    
    inputElement.value = testCommand;
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    inputElement.dispatchEvent(enterEvent);
    fixture.detectChanges();
    
    expect(inputElement.value).toBe('');
    expect(component.inputValue()).toBe('');
  });

  it('空文字の場合は送信しない', () => {
    const inputElement = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    let emittedCount = 0;
    
    component.commandSubmit.subscribe(() => {
      emittedCount++;
    });
    
    inputElement.value = '';
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    inputElement.dispatchEvent(enterEvent);
    
    expect(emittedCount).toBe(0);
  });
});