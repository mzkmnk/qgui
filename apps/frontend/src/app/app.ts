import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommandInputComponent } from './components/command-input/command-input.component';
import { MessageDisplayComponent } from './components/message-display/message-display.component';

interface Message {
  type: 'command' | 'output';
  content: string;
}

@Component({
  imports: [RouterModule, CommandInputComponent, MessageDisplayComponent],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  protected title = 'frontend';
  protected messages = signal<Message[]>([]);

  onCommandSubmit(command: string): void {
    console.log('コマンド送信:', command);
    // コマンドをメッセージリストに追加
    this.messages.update(msgs => [...msgs, { type: 'command', content: command }]);
    
    // 簡単な動作確認のため、仮の出力を追加
    setTimeout(() => {
      // ANSIコードを含む仮の出力を生成（テスト用）
      if (command === 'test-ansi') {
        this.messages.update(msgs => [...msgs, { 
          type: 'output', 
          content: '\x1b[31mこれは赤色のテキストです\x1b[0m' 
        }]);
      } else if (command === 'ls') {
        this.messages.update(msgs => [...msgs, { 
          type: 'output', 
          content: 'file1.txt\n\x1b[31merror.log\x1b[0m\ndata.json' 
        }]);
      } else {
        this.messages.update(msgs => [...msgs, { 
          type: 'output', 
          content: `コマンド "${command}" を実行しました` 
        }]);
      }
    }, 100);
  }
}
