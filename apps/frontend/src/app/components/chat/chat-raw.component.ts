import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-raw-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="demo-container">
      <h3>改行処理のデモ</h3>
      
      <!-- white-space: pre-wrapを使用した例 -->
      <div class="example">
        <h4>1. white-space: pre-wrap（推奨）</h4>
        <div class="message pre-wrap">{{ rawResponse1 }}</div>
      </div>

      <!-- innerHTMLでbrタグを使用した例 -->
      <div class="example">
        <h4>2. 改行を&lt;br&gt;に変換</h4>
        <div class="message" [innerHTML]="formattedResponse2"></div>
      </div>

      <!-- preタグを使用した例 -->
      <div class="example">
        <h4>3. &lt;pre&gt;タグ使用</h4>
        <pre class="message pre-tag">{{ rawResponse3 }}</pre>
      </div>
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .example {
      margin-bottom: 30px;
      border: 1px solid #e5e7eb;
      padding: 15px;
      border-radius: 8px;
    }

    h4 {
      margin: 0 0 10px 0;
      color: #374151;
    }

    .message {
      padding: 12px;
      background: #f9fafb;
      border-radius: 6px;
      font-size: 14px;
      line-height: 1.6;
    }

    /* 方法1: white-space: pre-wrapで改行を保持 */
    .pre-wrap {
      white-space: pre-wrap;  /* 改行を保持し、長い行は折り返す */
      word-wrap: break-word;  /* 長い単語も折り返す */
    }

    /* 方法3: preタグのスタイル調整 */
    .pre-tag {
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: inherit;  /* フォントを統一 */
      margin: 0;
    }
  `]
})
export class ChatRawDemoComponent {
  // バックエンドから受け取る生のレスポンス例
  rawResponse1 = `これはAというものです。
詳細については以下をご確認ください：

1. 最初の項目
   - サブ項目A
   - サブ項目B

2. 次の項目
   これは説明文です。
   複数行にわたる説明が
   そのまま表示されます。

コード例：
\`\`\`python
def hello():
    print("Hello, World!")
    return True
\`\`\`

以上です。`;

  rawResponse3 = this.rawResponse1;

  // HTML用にフォーマット
  get formattedResponse2(): string {
    return this.rawResponse1
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  }
}