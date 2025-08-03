# node-pty 改行処理の問題と解決策

## 問題の確認

ご指摘の通り、Amazon Q CLI の出力には**ターミナルの幅に基づく自動改行**が含まれています。

### 実例

```
• Running a command like [38;5;10mcurl wttr.in[0m in your terminal for a quick weather
report[0m[0m
```

この例では、「weather」の後で改行されており、これはターミナルの幅（通常 80 文字）に達したための自動改行です。

## 原因

1. **ターミナルエミュレーション**: PTY は実際のターミナルをエミュレートするため、指定した列数（cols）で自動的に改行
2. **ハードラップ**: 長い行は強制的に次の行に折り返される
3. **ANSI エスケープコード**: 改行位置にエスケープコードが含まれる場合もある

## 解決策

### 1. 適切なターミナルサイズの設定

```typescript
const pty = spawn('q', ['chat'], {
  name: 'xterm-256color',
  cols: 200, // 十分に大きな値に設定
  rows: 50,
  env: process.env,
});
```

### 2. 出力の後処理による改行の修復

```typescript
class OutputProcessor {
  private buffer: string = '';
  private previousLine: string = '';

  processOutput(data: string): string {
    // ANSIコードを一時的に除去して処理
    const cleanData = this.stripAnsi(data);
    const lines = cleanData.split('\n');

    const processedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 不自然な改行の検出パターン
      if (this.isUnnaturalLineBreak(line, i, lines)) {
        // 前の行と結合
        if (processedLines.length > 0) {
          processedLines[processedLines.length - 1] += ' ' + line.trim();
        } else if (this.previousLine) {
          this.previousLine += ' ' + line.trim();
        }
      } else {
        if (this.previousLine) {
          processedLines.push(this.previousLine);
          this.previousLine = '';
        }
        processedLines.push(line);
      }
    }

    // 最後の行を保持（次のチャンクで結合される可能性）
    if (processedLines.length > 0 && !data.endsWith('\n')) {
      this.previousLine = processedLines.pop()!;
    }

    return processedLines.join('\n');
  }

  private isUnnaturalLineBreak(line: string, index: number, lines: string[]): boolean {
    // 不自然な改行のパターン
    const patterns = [
      // 文の途中での改行
      /^[a-z]/, // 小文字で始まる
      /^(report|data|information|application|conditions)/, // 一般的な続き単語

      // 前の行が文の途中で終わっている
      index > 0 && /[a-zA-Z,]\s*$/.test(lines[index - 1]),

      // リスト項目の続き
      index > 0 && /^[•\-\*]\s/.test(lines[index - 1]) && !/^[•\-\*\s]/.test(line),
    ];

    return patterns.some((pattern) => (typeof pattern === 'boolean' ? pattern : pattern.test(line)));
  }

  private stripAnsi(str: string): string {
    return str.replace(/\x1b\[[0-9;]*m/g, '');
  }
}
```

### 3. マークダウンベースの処理

````typescript
interface ProcessedMessage {
  role: 'user' | 'assistant';
  content: string;
  format: 'markdown' | 'code' | 'text';
  metadata?: {
    originalWithAnsi?: string;
    processedAt: Date;
  };
}

class MessageProcessor {
  private outputProcessor = new OutputProcessor();

  processMessage(rawOutput: string): ProcessedMessage {
    // ANSIコードを除去
    const cleanContent = this.stripAnsi(rawOutput);

    // 不自然な改行を修復
    const fixedContent = this.fixLineBreaks(cleanContent);

    // マークダウン要素の識別と保護
    const protectedContent = this.protectMarkdownElements(fixedContent);

    return {
      role: 'assistant',
      content: protectedContent,
      format: this.detectFormat(protectedContent),
      metadata: {
        originalWithAnsi: rawOutput,
        processedAt: new Date(),
      },
    };
  }

  private fixLineBreaks(content: string): string {
    // 段落の検出と修復
    const paragraphs = content.split(/\n\s*\n/);

    return paragraphs
      .map((paragraph) => {
        // リスト項目は改行を保持
        if (paragraph.match(/^[•\-\*\d+\.]\s/m)) {
          return paragraph;
        }

        // コードブロックは改行を保持
        if (paragraph.match(/^```/m)) {
          return paragraph;
        }

        // 通常の段落は改行を修復
        return paragraph.replace(/([a-z,])\n([a-z])/g, '$1 $2');
      })
      .join('\n\n');
  }

  private protectMarkdownElements(content: string): string {
    // コードブロックを保護
    const codeBlockRegex = /```[\s\S]*?```/g;
    const codeBlocks: string[] = [];

    content = content.replace(codeBlockRegex, (match) => {
      codeBlocks.push(match);
      return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
    });

    // インラインコードを保護
    const inlineCodeRegex = /`[^`]+`/g;
    const inlineCodes: string[] = [];

    content = content.replace(inlineCodeRegex, (match) => {
      inlineCodes.push(match);
      return `__INLINE_CODE_${inlineCodes.length - 1}__`;
    });

    // 復元
    codeBlocks.forEach((block, i) => {
      content = content.replace(`__CODE_BLOCK_${i}__`, block);
    });

    inlineCodes.forEach((code, i) => {
      content = content.replace(`__INLINE_CODE_${i}__`, code);
    });

    return content;
  }

  private stripAnsi(str: string): string {
    return str.replace(/\x1b\[[0-9;]*m/g, '');
  }

  private detectFormat(content: string): 'markdown' | 'code' | 'text' {
    if (content.includes('```')) return 'markdown';
    if (content.match(/^(#|##|###)\s/m)) return 'markdown';
    if (content.match(/[*_~`]/)) return 'markdown';
    return 'text';
  }
}
````

### 4. リアルタイムストリーミング対応

```typescript
class StreamingMessageProcessor {
  private buffer: string = '';
  private currentMessage: Partial<ProcessedMessage> = {};

  processChunk(chunk: string): { partial: string; complete?: ProcessedMessage } {
    this.buffer += chunk;

    // 完全な行を抽出
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || ''; // 最後の不完全な行を保持

    let processedContent = '';

    for (const line of lines) {
      // 不自然な改行の場合、バッファに追加
      if (this.shouldJoinWithPrevious(line)) {
        processedContent = processedContent.trimEnd() + ' ' + line.trim() + '\n';
      } else {
        processedContent += line + '\n';
      }
    }

    // メッセージの終了を検出
    if (chunk.includes('[?25h') || chunk.includes('[1G[0m[0m')) {
      const complete = this.finalizeMessage(processedContent + this.buffer);
      this.buffer = '';
      return { partial: '', complete };
    }

    return { partial: processedContent, complete: undefined };
  }

  private shouldJoinWithPrevious(line: string): boolean {
    const clean = this.stripAnsi(line);

    // 短い行で、文の続きのように見える場合
    if (clean.length < 20 && /^[a-z]/.test(clean)) {
      return true;
    }

    // 特定のパターン
    if (/^(report|data|information|application|conditions)/.test(clean)) {
      return true;
    }

    return false;
  }

  private finalizeMessage(content: string): ProcessedMessage {
    const processor = new MessageProcessor();
    return processor.processMessage(content);
  }

  private stripAnsi(str: string): string {
    return str.replace(/\x1b\[[0-9;]*m/g, '');
  }
}
```

## フロントエンドでの表示

### Angular コンポーネント

```typescript
@Component({
  selector: 'app-message',
  template: `
    <div class="message" [class.user]="message.role === 'user'">
      <div class="content" [innerHTML]="formattedContent"></div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule],
})
export class MessageComponent {
  @Input() message!: ProcessedMessage;

  get formattedContent(): string {
    if (this.message.format === 'markdown') {
      // マークダウンをHTMLに変換（marked.jsなどを使用）
      return this.markdownService.parse(this.message.content);
    }

    // プレーンテキストの場合、改行を<br>に変換
    return this.message.content.replace(/\n/g, '<br>');
  }
}
```

## 推奨設定

1. **十分なターミナル幅**: 最低 120 文字、推奨 200 文字
2. **バッファリング**: 50-100ms のデバウンスで出力を集約
3. **後処理**: 不自然な改行の検出と修復
4. **マークダウン処理**: 改行修復時にマークダウン要素を保護

## まとめ

node-pty の出力には確かにターミナル幅による改行が含まれますが、適切な処理により自然な表示が可能です。重要なのは：

1. 十分な幅のターミナルサイズ設定
2. 不自然な改行パターンの検出
3. マークダウン要素の保護
4. ストリーミング対応の処理

これらの対策により、フロントエンドで正しく整形されたメッセージを表示できます。
