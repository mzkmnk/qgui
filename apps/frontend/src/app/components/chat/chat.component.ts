import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col h-full bg-gradient-to-b from-zinc-900/95 to-zinc-950/95 rounded-xl overflow-hidden relative">
      <!-- 背景のグラデーション -->
      <div class="absolute inset-0 bg-gradient-to-br from-orange-500/3 via-transparent to-orange-500/3 pointer-events-none"></div>
      <!-- メッセージエリア -->
      <div class="flex-1 overflow-y-auto p-5 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent" #messagesArea>
        @for (message of messages(); track message.id) {
          <div class="flex w-full animate-fadeIn"
               [class.justify-end]="message.role === 'user'"
               [class.justify-start]="message.role === 'assistant'">
            <div class="flex gap-3 max-w-[70%]"
                 [class.flex-row-reverse]="message.role === 'user'">
              <!-- アバター -->
              <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold shadow-lg"
                   [class.bg-orange-500]="message.role === 'user'"
                   [class.text-white]="message.role === 'user'"
                   [class.bg-zinc-800]="message.role === 'assistant'"
                   [class.text-gray-300]="message.role === 'assistant'"
                   [class.border]="message.role === 'assistant'"
                   [class.border-zinc-700]="message.role === 'assistant'">
                @if (message.role === 'user') {
                  <span>You</span>
                } @else {
                  <span>AI</span>
                }
              </div>
              
              <!-- メッセージ内容 -->
              <div class="rounded-xl px-4 py-3 shadow-md transition-all hover:shadow-lg"
                   [class.bg-orange-500]="message.role === 'user'"
                   [class.text-white]="message.role === 'user'"
                   [class.bg-zinc-800]="message.role === 'assistant'"
                   [class.text-gray-200]="message.role === 'assistant'"
                   [class.border]="message.role === 'assistant'"
                   [class.border-zinc-700]="message.role === 'assistant'">
                <div class="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {{ message.content }}
                </div>
                <div class="text-xs mt-1 opacity-60">
                  {{ formatTime(message.timestamp) }}
                </div>
              </div>
            </div>
          </div>
        }
        
        <!-- タイピングインジケーター -->
        @if (isTyping()) {
          <div class="flex justify-start w-full animate-fadeIn">
            <div class="flex gap-3 max-w-[70%]">
              <div class="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-gray-300 shadow-lg">
                <span>AI</span>
              </div>
              <div class="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 shadow-md">
                <div class="flex gap-1">
                  <span class="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                  <span class="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style="animation-delay: 200ms"></span>
                  <span class="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style="animation-delay: 400ms"></span>
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- 入力エリア -->
      <div class="p-4 bg-gradient-to-r from-zinc-800/60 to-zinc-900/60 backdrop-blur-xl border-t border-white/10 flex gap-3 items-end">
        <textarea
          [(ngModel)]="inputText"
          (keydown)="onKeyDown($event)"
          placeholder="メッセージを入力..."
          class="flex-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg resize-none text-sm text-gray-200 placeholder-gray-500 font-sans outline-none transition-all focus:border-orange-500 focus:shadow-[0_0_0_1px_rgba(249,115,22,0.2)] disabled:bg-zinc-900/50 disabled:cursor-not-allowed"
          rows="3"
          [disabled]="isTyping()"
        ></textarea>
        <button 
          (click)="sendMessage()"
          [disabled]="!inputText.trim() || isTyping()"
          class="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium cursor-pointer transition-all hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/20 disabled:bg-zinc-700 disabled:text-gray-500 disabled:cursor-not-allowed">
          送信
        </button>
      </div>
    </div>
  `
})
export class ChatComponent {
  messages = signal<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'こんにちは！Qgui AIアシスタントです。どのようなお手伝いができますか？',
      timestamp: new Date(),
      status: 'sent'
    }
  ]);

  inputText = '';
  isTyping = signal(false);

  sendMessage(): void {
    if (!this.inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: this.inputText,
      timestamp: new Date(),
      status: 'sending'
    };

    // ユーザーメッセージを追加
    this.messages.update(msgs => [...msgs, userMessage]);
    const messageContent = this.inputText;
    this.inputText = '';

    // タイピング表示
    setTimeout(() => {
      this.isTyping.set(true);
    }, 500);

    // AIの応答をシミュレート
    setTimeout(() => {
      this.isTyping.set(false);
      
      const aiResponse = this.generateMockResponse(messageContent);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        status: 'sent'
      };
      
      this.messages.update(msgs => [...msgs, aiMessage]);
      this.scrollToBottom();
    }, 2000);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  formatMessage(content: string): string {
    // バックエンドからのレスポンスをそのまま表示する場合
    // 改行やスペースを保持
    
    // コードブロックの処理（改行を保持）
    const formatted = content
      .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        // コードブロック内の改行はそのまま保持
        return `<pre><code>${this.escapeHtml(code)}</code></pre>`;
      })
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');  // 通常の改行は<br>に変換
    
    return formatted;
  }
  
  private escapeHtml(text: string): string {
    // HTMLエスケープ（XSS対策）
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const messagesArea = document.querySelector('.overflow-y-auto');
      if (messagesArea) {
        messagesArea.scrollTop = messagesArea.scrollHeight;
      }
    }, 100);
  }

  private generateMockResponse(userInput: string): string {
    const responses = [
      'なるほど、「' + userInput + '」についてですね。詳しく説明させていただきます。\n\n```typescript\n// サンプルコード\nconst example = "Hello World";\nconsole.log(example);\n```\n\nこのようにして実装できます。',
      '「' + userInput + '」を処理中です...\n\n結果:\n- 正常に完了しました\n- 3つのファイルが更新されました\n- テストも全て通過しています',
      'ご質問ありがとうございます。\n\n「' + userInput + '」について、以下の方法をお試しください：\n1. まず設定を確認\n2. 必要なパッケージをインストール\n3. コードを実行',
      '申し訳ございません。「' + userInput + '」の処理中にエラーが発生しました。\n\n`Error: Connection timeout`\n\n再度お試しください。'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
}