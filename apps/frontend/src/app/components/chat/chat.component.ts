import { Component, signal, computed } from '@angular/core';
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
    <div class="chat-container">
      <!-- メッセージエリア -->
      <div class="messages-area" #messagesArea>
        @for (message of messages(); track message.id) {
          <div class="message-wrapper" [class.user-message]="message.role === 'user'"
               [class.assistant-message]="message.role === 'assistant'">
            <div class="message-bubble">
              <!-- アバター -->
              <div class="avatar">
                @if (message.role === 'user') {
                  <span class="avatar-text">You</span>
                } @else {
                  <span class="avatar-text">AI</span>
                }
              </div>
              
              <!-- メッセージ内容 -->
              <div class="message-content">
                <!-- 改行をそのまま表示する場合はこちら -->
                <div class="message-text raw-text">{{ message.content }}</div>
                <!-- マークダウン処理する場合はこちら（コメントアウト） -->
                <!-- <div class="message-text" [innerHTML]="formatMessage(message.content)"></div> -->
                <div class="message-time">{{ formatTime(message.timestamp) }}</div>
              </div>
            </div>
          </div>
        }
        
        <!-- タイピングインジケーター -->
        @if (isTyping()) {
          <div class="message-wrapper assistant-message">
            <div class="message-bubble">
              <div class="avatar">
                <span class="avatar-text">AI</span>
              </div>
              <div class="message-content">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- 入力エリア -->
      <div class="input-area">
        <textarea
          [(ngModel)]="inputText"
          (keydown)="onKeyDown($event)"
          placeholder="メッセージを入力..."
          class="message-input"
          rows="3"
          [disabled]="isTyping()"
        ></textarea>
        <button 
          (click)="sendMessage()"
          [disabled]="!inputText.trim() || isTyping()"
          class="send-button">
          送信
        </button>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #f7f7f8;
      border-radius: 12px;
      overflow: hidden;
    }

    .messages-area {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .message-wrapper {
      display: flex;
      width: 100%;
    }

    .message-wrapper.user-message {
      justify-content: flex-end;
    }

    .message-wrapper.assistant-message {
      justify-content: flex-start;
    }

    .message-bubble {
      display: flex;
      gap: 12px;
      max-width: 70%;
      animation: fadeIn 0.3s ease-in;
    }

    .user-message .message-bubble {
      flex-direction: row-reverse;
    }

    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 12px;
      font-weight: 600;
    }

    .user-message .avatar {
      background: #2563eb;
      color: white;
    }

    .assistant-message .avatar {
      background: #374151;
      color: white;
    }

    .message-content {
      background: white;
      border-radius: 12px;
      padding: 12px 16px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .user-message .message-content {
      background: #2563eb;
      color: white;
    }

    .message-text {
      font-size: 14px;
      line-height: 1.5;
      word-wrap: break-word;
    }

    /* バックエンドのレスポンスをそのまま表示 */
    .message-text.raw-text {
      white-space: pre-wrap;  /* 改行を保持、長い行は折り返す */
      word-break: break-word;  /* 長い単語も折り返す */
    }

    .message-text :deep(pre) {
      background: #1f2937;
      color: #e5e7eb;
      padding: 12px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 8px 0;
    }

    .user-message .message-text :deep(pre) {
      background: rgba(0, 0, 0, 0.2);
    }

    .message-text :deep(code) {
      background: rgba(0, 0, 0, 0.1);
      padding: 2px 4px;
      border-radius: 3px;
      font-family: 'Menlo', 'Monaco', monospace;
      font-size: 13px;
    }

    .message-time {
      font-size: 11px;
      opacity: 0.7;
      margin-top: 4px;
    }

    .typing-indicator {
      display: flex;
      gap: 4px;
      padding: 8px 0;
    }

    .typing-indicator span {
      width: 8px;
      height: 8px;
      background: #6b7280;
      border-radius: 50%;
      animation: typing 1.4s infinite;
    }

    .typing-indicator span:nth-child(2) {
      animation-delay: 0.2s;
    }

    .typing-indicator span:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes typing {
      0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.5;
      }
      30% {
        transform: translateY(-10px);
        opacity: 1;
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .input-area {
      padding: 16px;
      background: white;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 12px;
      align-items: flex-end;
    }

    .message-input {
      flex: 1;
      padding: 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      resize: none;
      font-size: 14px;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;
    }

    .message-input:focus {
      border-color: #2563eb;
    }

    .message-input:disabled {
      background: #f3f4f6;
      cursor: not-allowed;
    }

    .send-button {
      padding: 12px 24px;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }

    .send-button:hover:not(:disabled) {
      background: #1d4ed8;
    }

    .send-button:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    /* スクロールバーのスタイリング */
    .messages-area::-webkit-scrollbar {
      width: 6px;
    }

    .messages-area::-webkit-scrollbar-track {
      background: transparent;
    }

    .messages-area::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }

    .messages-area::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  `]
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
    let formatted = content
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
      const messagesArea = document.querySelector('.messages-area');
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