import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownPipe } from '../../pipes/markdown.pipe';

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
  imports: [CommonModule, FormsModule, MarkdownPipe],
  template: `
    <div class="flex flex-col h-full bg-transparent overflow-hidden relative">
      <!-- ニューラルグリッド背景 -->
      <div class="absolute inset-0 opacity-20">
        <div
          class="absolute inset-0"
          style="background-image: linear-gradient(rgba(0, 217, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 217, 255, 0.1) 1px, transparent 1px); background-size: 50px 50px;"
        ></div>
      </div>
      <!-- グラデーションオーバーレイ -->
      <div
        class="absolute inset-0 bg-gradient-to-b from-transparent via-neural-dark/50 to-neural-dark pointer-events-none"
      ></div>
      <!-- メッセージエリア -->
      <div
        class="flex-1 overflow-y-auto p-6 flex flex-col gap-5 relative z-10 scrollbar-thin scrollbar-thumb-neural-border scrollbar-track-transparent"
        #messagesArea
      >
        @for (message of messages(); track message.id) {
        <div
          class="flex w-full animate-slide-up"
          [class.justify-end]="message.role === 'user'"
          [class.justify-start]="message.role === 'assistant'"
        >
          <div
            class="flex gap-3 max-w-[70%]"
            [class.flex-row-reverse]="message.role === 'user'"
          >
            <!-- アバター -->
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all duration-300"
              [ngClass]="{
                'bg-gradient-to-br from-accent-neon to-accent-quantum text-neural-dark shadow-neon-sm':
                  message.role === 'user',
                'bg-neural-surface border border-accent-neon/30 text-accent-neon':
                  message.role === 'assistant'
              }"
            >
              @if (message.role === 'user') {
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
              } @else {
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              }
            </div>

            <!-- メッセージ内容 -->
            <div
              class="rounded-xl px-5 py-4 backdrop-blur-md transition-all duration-300 hover:scale-[1.01]"
              [ngClass]="{
                'bg-gradient-to-r from-neural-surface to-neural-darker border border-accent-neon/30 text-neural-bright shadow-neon-sm':
                  message.role === 'user',
                'bg-neural-darker/80 text-neural-text border border-neural-border hover:border-accent-neon/30':
                  message.role === 'assistant'
              }"
            >
              <div
                class="text-sm leading-relaxed break-words markdown-content"
                [innerHTML]="message.content | markdown"
              ></div>
              <div class="text-xs mt-2 opacity-50 font-mono">
                {{ formatTime(message.timestamp) }}
              </div>
            </div>
          </div>
        </div>
        }

        <!-- タイピングインジケーター -->
        @if (isTyping()) {
        <div class="flex justify-start w-full animate-slide-up">
          <div class="flex gap-3 max-w-[70%]">
            <div
              class="w-10 h-10 rounded-lg bg-neural-surface border border-accent-neon/30 flex items-center justify-center flex-shrink-0 text-accent-neon"
            >
              <svg
                class="w-5 h-5 animate-pulse-neon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div
              class="bg-neural-darker/80 border border-neural-border rounded-xl px-5 py-4 backdrop-blur-md"
            >
              <div class="flex gap-2">
                <span
                  class="w-2 h-2 bg-accent-neon rounded-full animate-pulse"
                  style="animation-delay: 0ms"
                ></span>
                <span
                  class="w-2 h-2 bg-accent-electric rounded-full animate-pulse"
                  style="animation-delay: 200ms"
                ></span>
                <span
                  class="w-2 h-2 bg-accent-quantum rounded-full animate-pulse"
                  style="animation-delay: 400ms"
                ></span>
              </div>
            </div>
          </div>
        </div>
        }
      </div>

      <!-- 入力エリア -->
      <div
        class="p-5 bg-neural-darker/90 backdrop-blur-xl border-t border-neural-border flex gap-4 items-end relative z-10 flex-shrink-0"
      >
        <!-- 入力エリアのグロー効果 -->
        <div
          class="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-accent-neon to-transparent"
        ></div>
        <textarea
          [(ngModel)]="inputText"
          (keydown)="onKeyDown($event)"
          placeholder="メッセージを入力..."
          class="flex-1 p-4 bg-neural-void/50 border border-neural-border rounded-lg resize-none text-sm text-neural-text placeholder-neural-muted font-mono outline-none transition-all duration-300 focus:border-accent-neon focus:shadow-inner-glow focus:bg-neural-void/80 disabled:opacity-50 disabled:cursor-not-allowed"
          rows="3"
          [disabled]="isTyping()"
        ></textarea>
        <button
          (click)="sendMessage()"
          [disabled]="!inputText.trim() || isTyping()"
          class="px-6 py-3 bg-gradient-to-r from-accent-neon to-accent-quantum text-neural-dark rounded-lg font-bold cursor-pointer transition-all duration-300 hover:shadow-neon hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
    </div>
  `,
})
export class ChatComponent {
  messages = signal<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'こんにちは！Qgui AIアシスタントです。どのようなお手伝いができますか？',
      timestamp: new Date(),
      status: 'sent',
    },
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
      status: 'sending',
    };

    // ユーザーメッセージを追加
    this.messages.update((msgs) => [...msgs, userMessage]);
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
        status: 'sent',
      };

      this.messages.update((msgs) => [...msgs, aiMessage]);
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
      .replace(/\n/g, '<br>'); // 通常の改行は<br>に変換

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
      minute: '2-digit',
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
      `なるほど、「${userInput}」についてですね。詳しく説明させていただきます。

## 実装例

\`\`\`typescript
// サンプルコード
const example = "Hello World";
console.log(example);
\`\`\`

### ポイント
- **型安全性**を保つ
- *シンプル*な実装を心がける
- \`async/await\`を活用する

このようにして実装できます。`,

      `「${userInput}」を処理中です...

## 結果

- ✅ 正常に完了しました
- 📝 3つのファイルが更新されました
- 🧪 テストも全て通過しています

> 詳細は[ログ](https://example.com)をご確認ください。`,

      `ご質問ありがとうございます。

「${userInput}」について、以下の方法をお試しください：

1. まず設定を確認
2. 必要なパッケージをインストール
3. コードを実行

### 参考リンク
- [公式ドキュメント](https://example.com/docs)
- [チュートリアル](https://example.com/tutorial)`,

      `申し訳ございません。「${userInput}」の処理中にエラーが発生しました。

\`\`\`
Error: Connection timeout
  at line 42
\`\`\`

**対処法:**
1. ネットワーク接続を確認
2. 再度お試しください`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }
}
