# Amazon Q CLI node-pty 統合ガイド

## 1. node-pty での実行

### 基本的な起動

```typescript
import { spawn, IPty } from 'node-pty';

const pty: IPty = spawn('q', ['chat'], {
  name: 'xterm-256color',
  cols: 80,
  rows: 30,
  cwd: process.cwd(),
  env: process.env,
});
```

### 推奨パラメータ

- `name`: 'xterm-256color' - ANSI カラーコードのサポート
- `cols/rows`: ターミナルサイズ（リサイズ可能）
- `env`: 環境変数の継承が必要

## 2. 出力の処理

### ANSI エスケープコードの処理

```typescript
// ANSIエスケープコードを除去
function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

// カーソル制御コードを処理
function processCursorControl(str: string): string {
  return str
    .replace(/\x1b\[2K/g, '') // 行クリア
    .replace(/\x1b\[1G/g, '') // 行頭移動
    .replace(/\x1b\[\?25[lh]/g, ''); // カーソル表示/非表示
}
```

### 出力パターンの識別

```typescript
interface OutputPattern {
  userInput: RegExp; // [38;5;10m>[0m
  thinking: RegExp; // ⠋ Thinking...
  toolUsage: RegExp; // 🛠️  Using tool:
  codeBlock: RegExp; // [1m{language}
  completion: RegExp; // [?25h[39m[0m
}

const patterns: OutputPattern = {
  userInput: /\[38;5;10m>\[0m/,
  thinking: /[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏] Thinking\.\.\./,
  toolUsage: /🛠️  Using tool: (\w+)(\[38;5;2m)? \((trusted|untrusted)\)/,
  codeBlock: /\[1m(\w+)\s*\[0m/,
  completion: /\[\?25h\[39m\[0m/,
};
```

## 3. 入力の送信

### 基本的なメッセージ送信

```typescript
// 通常のメッセージ
pty.write('Hello, how can I help?\n');

// コマンドの送信
pty.write('/help\n');

// 特殊キーの送信
pty.write('\x03'); // Ctrl+C
pty.write('\x04'); // Ctrl+D
```

### ツール承認の応答

```typescript
// 承認パターンの検出
const approvalPrompt = /Do you want to allow this tool to run\?/;

// Y/Nの送信
if (output.match(approvalPrompt)) {
  pty.write('y\n'); // 承認
  // または
  pty.write('n\n'); // 拒否
}
```

## 4. セッション管理

### セッションクラスの実装

```typescript
class AmazonQSession {
  private pty: IPty | null = null;
  private buffer: string = '';
  private isThinking: boolean = false;

  constructor(
    private sessionId: string,
    private options: {
      trustAllTools?: boolean;
      model?: string;
      workspace?: string;
    } = {}
  ) {}

  async start(): Promise<void> {
    const args = ['chat'];

    if (this.options.trustAllTools) {
      args.push('--trust-all-tools');
    }

    if (this.options.model) {
      args.push('--model', this.options.model);
    }

    this.pty = spawn('q', args, {
      name: 'xterm-256color',
      cols: 120,
      rows: 40,
      cwd: this.options.workspace || process.cwd(),
      env: process.env,
    });

    this.pty.onData((data) => {
      this.handleOutput(data);
    });
  }

  private handleOutput(data: string): void {
    this.buffer += data;

    // Thinking状態の検出
    if (data.match(patterns.thinking)) {
      this.isThinking = true;
    }

    // 完了の検出
    if (data.match(patterns.completion)) {
      this.isThinking = false;
      this.processCompleteMessage();
    }
  }

  sendMessage(message: string): void {
    if (this.pty && !this.isThinking) {
      this.pty.write(message + '\n');
    }
  }

  resize(cols: number, rows: number): void {
    if (this.pty) {
      this.pty.resize(cols, rows);
    }
  }

  destroy(): void {
    if (this.pty) {
      this.pty.kill();
      this.pty = null;
    }
  }
}
```

## 5. 起動時の処理

### 初期化シーケンス

1. MCP サーバーの初期化待機
2. Amazon Q ロゴの表示
3. ヒントボックスの表示
4. プロンプトの表示

### 初期化完了の検出

```typescript
// MCPサーバー初期化完了
const mcpInitialized = /✓\s*\d+\s*of\s*\d+\s*mcp servers initialized/;

// プロンプト準備完了
const ready = /🤖 You are chatting with/;
```

## 6. エラーハンドリング

### プロセスエラー

```typescript
pty.onExit((exitCode, signal) => {
  if (exitCode !== 0) {
    console.error(`Process exited with code ${exitCode}`);
  }
});
```

### Amazon Q エラー

```typescript
const errorPatterns = {
  notLoggedIn: /Please login first/,
  mcpError: /MCP server .* failed to start/,
  toolError: /Tool execution failed/,
};
```

## 7. 特殊な機能

### コマンドの実行

```typescript
// /コマンドの送信
pty.write('/help\n');
pty.write('/quit\n');
pty.write('/usage\n');

// bashコマンドの実行（!プレフィックス）
pty.write('!ls -la\n');
```

### セッションの再開

```typescript
// --resumeオプションで前回のセッションを再開
const pty = spawn('q', ['chat', '--resume'], {
  cwd: workspaceDir,
});
```

## 8. パフォーマンス最適化

### バッファリング

```typescript
class OutputBuffer {
  private buffer: string[] = [];
  private timer: NodeJS.Timeout | null = null;

  add(data: string): void {
    this.buffer.push(data);
    this.scheduleFlush();
  }

  private scheduleFlush(): void {
    if (this.timer) return;

    this.timer = setTimeout(() => {
      this.flush();
    }, 50); // 50msのデバウンス
  }

  private flush(): void {
    if (this.buffer.length === 0) return;

    const combined = this.buffer.join('');
    this.buffer = [];
    this.timer = null;

    // 処理を実行
    this.processOutput(combined);
  }
}
```

### メモリ管理

```typescript
// 大きな出力のストリーミング処理
const MAX_BUFFER_SIZE = 1024 * 1024; // 1MB

if (this.buffer.length > MAX_BUFFER_SIZE) {
  this.buffer = this.buffer.slice(-MAX_BUFFER_SIZE / 2);
}
```

## 9. テスト環境での考慮事項

### モック PTY

```typescript
class MockPty implements IPty {
  private handlers = new Map<string, Function>();

  write(data: string): void {
    // テスト用の応答を生成
    if (data.includes('hello')) {
      this.emit('data', '[38;5;10m>[0m Hello! How can I help?\n');
    }
  }

  onData(handler: (data: string) => void): void {
    this.handlers.set('data', handler);
  }

  private emit(event: string, data: any): void {
    const handler = this.handlers.get(event);
    if (handler) handler(data);
  }
}
```

## 10. プラットフォーム固有の注意事項

### Windows

- コマンドが`q.exe`または`q.cmd`の可能性
- 改行コードが`\r\n`
- ANSI カラーコードのサポートが限定的

### macOS/Linux

- 標準的な POSIX 環境
- フル ANSI サポート
- シグナルハンドリングが重要
