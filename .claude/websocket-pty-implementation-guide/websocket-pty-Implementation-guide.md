# WebSocket + PTY による高度なターミナル体験の実装ガイド

## 📋 目次

1. [概要](#概要)
2. [技術的背景と課題](#技術的背景と課題)
3. [解決策：WebSocket + PTY](#解決策websocket--pty)
4. [実装方法](#実装方法)
5. [Amazon Q CLI との統合](#amazon-q-cli-との統合)
6. [フロントエンド実装](#フロントエンド実装)
7. [実用例とコード](#実用例とコード)
8. [参考資料](#参考資料)

---

## 概要

このガイドでは、ブラウザ上で本格的なターミナル体験を提供するための技術について解説します。特に **Amazon Q CLI** のような対話型プログラムを Web UI で利用するための実装方法を詳しく説明します。

### 🎯 実現目標

- ✅ ブラウザで本格的なターミナル操作
- ✅ Amazon Q CLI の完全な統合
- ✅ ストリーミング応答のリアルタイム表示
- ✅ thinking、tool usage 等の全要素対応
- ✅ 対話型プログラムの完全サポート

---

## 技術的背景と課題

### 🚫 従来手法の限界

#### 1. `child_process.exec()` の問題

```javascript
// ❌ 対話型プログラムで問題が発生
const { exec } = require('child_process');

exec('q', (error, stdout, stderr) => {
  // Amazon Q CLI は対話型なので、この方法では永遠に戻ってこない
  console.log(stdout); // 実行されない
});
```

**問題点:**

- 対話型プログラムが終了まで待機
- ストリーミング出力が取得できない
- パスワード入力等の対話処理が不可能

#### 2. `child_process.spawn()` でも不十分

```javascript
// ⚠️ 部分的には動作するが制限あり
const { spawn } = require('child_process');

const child = spawn('q', [], {
  stdio: ['pipe', 'pipe', 'pipe'], // パイプ経由
});

child.stdout.on('data', (data) => {
  console.log(data.toString()); // エスケープシーケンスが混入
});
```

**問題点:**

- プログラムが「端末環境ではない」と判定
- 色付き出力やカーソル制御が正常動作しない
- vim、ssh 等の高度な対話型プログラムが利用不可

### 🔍 根本的な問題

対話型プログラムは **TTY（端末）環境** を期待しているが、パイプ接続では TTY として認識されない。

```c
// プログラム内部での判定例
if (isatty(STDIN_FILENO)) {
    // 端末モード：色付き出力、対話機能
    enable_colors();
    enable_interactive_mode();
} else {
    // 非端末モード：プレーンテキスト、バッチ処理
    disable_colors();
    run_batch_mode();
}
```

---

## 解決策：WebSocket + PTY

### 🏗️ アーキテクチャ概要

```
┌─────────────────┐   WebSocket   ┌─────────────────┐    PTY    ┌─────────────────┐
│   フロントエンド    │◄────────────►│   バックエンド     │◄────────►│   ターミナル      │
│   (xterm.js)    │   双方向通信    │   (Node.js)     │   制御    │  (Amazon Q CLI) │
└─────────────────┘               └─────────────────┘           └─────────────────┘
        ▲                                  ▲                            ▲
        │                                  │                            │
    ユーザー操作                      WebSocket管理                   プロセス実行
   キー入力・表示                     PTY制御                      コマンド処理
```

### 🔧 PTY（Pseudo Terminal）とは

**PTY = Pseudo Terminal（仮想端末）**

- ハードウェア端末をソフトウェアでエミュレート
- **Master/Slave** 構造で双方向通信
- プログラムに「本物の端末」として認識される

```
┌─────────────────┐    ┌─────────────────┐
│   PTY Master    │◄──►│   PTY Slave     │
│   (制御側)       │    │  (プログラム側)   │
└─────────────────┘    └─────────────────┘
        ▲                       ▲
        │                       │
   ターミナル                 プロセス
  エミュレータ              (bash, q, vim)
```

### ✨ PTY の利点

| 機能                 | パイプ                  | PTY         |
| -------------------- | ----------------------- | ----------- |
| **対話型プログラム** | ❌ 動作しない           | ✅ 完全動作 |
| **色付き出力**       | ❌ エスケープ文字化け   | ✅ 正常表示 |
| **パスワード入力**   | ❌ プロンプト表示されず | ✅ 安全入力 |
| **カーソル制御**     | ❌ 制御コード文字化け   | ✅ 正常動作 |
| **vim/nano 等**      | ❌ 画面崩れ             | ✅ 正常編集 |

---

## 実装方法

### 📦 必要なライブラリ

```bash
# バックエンド
npm install node-pty ws express

# フロントエンド
npm install xterm xterm-addon-fit
```

### 🖥️ バックエンド実装

#### 1. 基本的な PTY サーバー

```javascript
// server.js
const pty = require('node-pty');
const WebSocket = require('ws');
const express = require('express');

const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('クライアント接続');

  // PTY プロセスを作成
  const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 150, // 広い幅で不自然な改行を防ぐ
    rows: 50, // 十分な高さ
    cwd: process.cwd(),
    env: {
      ...process.env,
      TERM: 'xterm-256color',
    },
  });

  // PTY → WebSocket
  ptyProcess.on('data', (data) => {
    ws.send(
      JSON.stringify({
        type: 'output',
        data: data,
      })
    );
  });

  // WebSocket → PTY
  ws.on('message', (message) => {
    const msg = JSON.parse(message);

    switch (msg.type) {
      case 'input':
        ptyProcess.write(msg.data);
        break;
      case 'resize':
        ptyProcess.resize(msg.cols, msg.rows);
        break;
    }
  });

  // 切断処理
  ws.on('close', () => {
    ptyProcess.kill();
    console.log('クライアント切断');
  });
});

server.listen(3000, () => {
  console.log('PTY サーバーが起動しました: http://localhost:3000');
});
```

#### 2. Amazon Q CLI 専用ハンドラー

````javascript
// amazon-q-handler.js
class AmazonQHandler {
  constructor() {
    this.ptyProcess = null;
    this.isReady = false;
    this.outputBuffer = '';
  }

  async startSession() {
    this.ptyProcess = pty.spawn('q', [], {
      name: 'xterm-color',
      cols: 150,
      rows: 50,
      cwd: process.cwd(),
      env: {
        ...process.env,
        TERM: 'xterm-256color',
      },
    });

    this.ptyProcess.on('data', (data) => {
      this.handleOutput(data);
    });

    // 初期化完了まで待機
    await this.waitForReady();
  }

  handleOutput(rawData) {
    // ANSI エスケープシーケンス処理
    const processed = this.processOutput(rawData);

    // 要素別に分類して送信
    this.emitProcessedOutput(processed);
  }

  processOutput(data) {
    // 1. ANSI エスケープシーケンス除去
    const cleaned = this.cleanAnsiEscapes(data);

    // 2. 出力要素の検出・分類
    return this.classifyOutput(cleaned);
  }

  classifyOutput(text) {
    if (text.includes('<thinking>')) {
      return { type: 'thinking', content: text };
    }
    if (text.includes('Using tool:')) {
      return { type: 'tool_usage', content: text };
    }
    if (text.includes('```')) {
      return { type: 'code_block', content: text };
    }
    if (text.match(/\[(システム|エラー|警告)\]/)) {
      return { type: 'system_message', content: text };
    }
    return { type: 'text', content: text };
  }

  cleanAnsiEscapes(data) {
    return data
      .replace(/\x1b\[[0-9;]*[mGKHf]/g, '') // 色/スタイル
      .replace(/\x1b\].*?\x07/g, '') // OSC シーケンス
      .replace(/\x1b\[.*?[A-Za-z]/g, '') // CSI シーケンス
      .replace(/\r/g, ''); // キャリッジリターン
  }
}
````

### 🌐 フロントエンド実装

#### 1. 基本的な xterm.js 実装

```html
<!DOCTYPE html>
<html>
  <head>
    <title>PTY Terminal</title>
    <script src="https://cdn.jsdelivr.net/npm/xterm@5.0.0/lib/xterm.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/xterm-addon-fit@0.7.0/lib/xterm-addon-fit.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/xterm@5.0.0/css/xterm.css" />
    <style>
      #terminal {
        width: 100%;
        height: 100vh;
      }
      .thinking-block {
        background: #f0f8ff;
        border-left: 4px solid #007acc;
        padding: 10px;
        margin: 5px 0;
      }
      .tool-usage {
        background: #fff8dc;
        padding: 8px;
        border-radius: 4px;
        margin: 3px 0;
      }
      .code-block {
        background: #f8f8f8;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 10px;
      }
    </style>
  </head>
  <body>
    <div id="terminal"></div>

    <script>
      // ターミナル初期化
      const terminal = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
        theme: {
          background: '#1e1e1e',
          foreground: '#d4d4d4',
        },
      });

      const fitAddon = new FitAddon.FitAddon();
      terminal.loadAddon(fitAddon);
      terminal.open(document.getElementById('terminal'));
      fitAddon.fit();

      // WebSocket 接続
      const ws = new WebSocket('ws://localhost:3000');

      // サーバーからの出力
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        switch (msg.type) {
          case 'output':
            terminal.write(msg.data);
            break;
          case 'processed_output':
            renderProcessedOutput(msg);
            break;
        }
      };

      // ユーザー入力
      terminal.onData((data) => {
        ws.send(
          JSON.stringify({
            type: 'input',
            data: data,
          })
        );
      });

      // リサイズ処理
      terminal.onResize(({ cols, rows }) => {
        ws.send(
          JSON.stringify({
            type: 'resize',
            cols: cols,
            rows: rows,
          })
        );
      });

      // ウィンドウリサイズ対応
      window.addEventListener('resize', () => {
        fitAddon.fit();
      });
    </script>
  </body>
</html>
```

#### 2. Amazon Q CLI 専用レンダラー

````javascript
// amazon-q-renderer.js
class AmazonQRenderer {
  constructor(container) {
    this.container = container;
    this.messageElements = new Map();
  }

  renderOutput(output) {
    const element = this.createElement(output);
    this.container.appendChild(element);
    return element;
  }

  createElement(output) {
    const wrapper = document.createElement('div');
    wrapper.className = `output-element ${output.type}`;

    switch (output.type) {
      case 'thinking':
        wrapper.innerHTML = `
          <details class="thinking-block">
            <summary>🤔 Thinking...</summary>
            <pre>${this.escapeHtml(output.content)}</pre>
          </details>
        `;
        break;

      case 'tool_usage':
        wrapper.innerHTML = `
          <div class="tool-usage">
            <span class="tool-icon">🔧</span>
            <span class="tool-text">${this.escapeHtml(output.content)}</span>
          </div>
        `;
        break;

      case 'code_block':
        const language = this.extractLanguage(output.content);
        const code = this.extractCode(output.content);
        wrapper.innerHTML = `
          <div class="code-block">
            <div class="code-header">
              <span class="language">${language}</span>
              <button class="copy-btn" onclick="copyToClipboard('${this.escapeForJs(code)}')">
                📋 Copy
              </button>
            </div>
            <pre><code class="language-${language}">${this.escapeHtml(code)}</code></pre>
          </div>
        `;
        break;

      case 'system_message':
        const messageType = this.extractMessageType(output.content);
        wrapper.innerHTML = `
          <div class="system-message ${messageType}">
            <span class="system-icon">${this.getSystemIcon(messageType)}</span>
            <span class="system-text">${this.escapeHtml(output.content)}</span>
          </div>
        `;
        break;

      default:
        wrapper.innerHTML = `
          <div class="response-text">
            ${this.renderMarkdown(output.content)}
          </div>
        `;
    }

    return wrapper;
  }

  extractLanguage(codeBlock) {
    const match = codeBlock.match(/```(\w+)/);
    return match ? match[1] : 'text';
  }

  extractCode(codeBlock) {
    const match = codeBlock.match(/```(?:\w+)?\n([\s\S]*?)```/);
    return match ? match[1] : codeBlock;
  }

  getSystemIcon(type) {
    const icons = {
      システム: 'ℹ️',
      警告: '⚠️',
      エラー: '❌',
      情報: '💡',
    };
    return icons[type] || 'ℹ️';
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  renderMarkdown(text) {
    // 簡易マークダウンレンダリング
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }
}

// コピー機能
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    console.log('コードがクリップボードにコピーされました');
  });
}
````

---

## Amazon Q CLI との統合

### 🔗 完全統合の実装

````javascript
// amazon-q-integration.js
class AmazonQIntegration {
  constructor(websocket) {
    this.ws = websocket;
    this.sessionState = 'disconnected';
    this.outputBuffer = '';
    this.currentResponse = '';
  }

  async startAmazonQSession() {
    // Amazon Q CLI セッション開始
    this.ws.send(
      JSON.stringify({
        type: 'start_amazon_q',
        config: {
          cols: 150,
          rows: 50,
        },
      })
    );

    this.sessionState = 'starting';
    await this.waitForReady();
  }

  async sendQuestion(question) {
    if (this.sessionState !== 'ready') {
      throw new Error('Amazon Q session is not ready');
    }

    // 質問送信
    this.ws.send(
      JSON.stringify({
        type: 'amazon_q_input',
        data: question + '\n',
      })
    );

    // ストリーミング応答の開始
    this.currentResponse = '';
    return this.waitForCompleteResponse();
  }

  handleAmazonQOutput(output) {
    // 出力タイプの判定
    const processedOutput = this.processOutput(output);

    // リアルタイム表示
    this.emitStreamingOutput(processedOutput);

    // 応答の蓄積
    this.currentResponse += processedOutput.content;

    // 応答完了の検出
    if (this.isResponseComplete(processedOutput)) {
      this.emitCompleteResponse(this.currentResponse);
      this.currentResponse = '';
    }
  }

  processOutput(rawOutput) {
    // 1. ANSI エスケープ除去
    const cleaned = this.cleanAnsiEscapes(rawOutput);

    // 2. 出力要素の分類
    return this.classifyAmazonQOutput(cleaned);
  }

  classifyAmazonQOutput(text) {
    // thinking 要素
    if (text.includes('<thinking>') || text.includes('</thinking>')) {
      return {
        type: 'thinking',
        content: text,
        metadata: { streamable: true, hidden: false },
      };
    }

    // ツール使用
    if (text.includes('Using tool:')) {
      const toolName = text.match(/Using tool: (\w+)/)?.[1];
      return {
        type: 'tool_usage',
        content: text,
        metadata: { toolName, streamable: true },
      };
    }

    // コードブロック
    if (text.includes('```')) {
      const language = text.match(/```(\w+)/)?.[1] || 'text';
      return {
        type: 'code_block',
        content: text,
        metadata: { language, copyable: true },
      };
    }

    // システムメッセージ
    if (text.match(/\[(システム|エラー|警告|情報)\]/)) {
      const messageType = text.match(/\[(\w+)\]/)?.[1];
      return {
        type: 'system_message',
        content: text,
        metadata: { messageType, priority: 'high' },
      };
    }

    // 対話的要素
    if (text.match(/.*\([yY]\/[nN]\)|選択.*:|.*\(\d+-\d+\):/)) {
      return {
        type: 'interactive',
        content: text,
        metadata: { requiresInput: true },
      };
    }

    // 通常テキスト
    return {
      type: 'text',
      content: text,
      metadata: { streamable: true },
    };
  }
}
````

### 📊 ストリーミング出力の分析

Amazon Q CLI の出力パターンを理解することで、適切な処理が可能になります：

````javascript
// streaming-analyzer.js
class StreamingAnalyzer {
  constructor() {
    this.patterns = {
      responseStart: /🤖.*claude/i,
      thinkingStart: /<thinking>/,
      thinkingEnd: /<\/thinking>/,
      toolUsage: /Using tool: (\w+)/,
      codeBlockStart: /```(\w+)?/,
      codeBlockEnd: /```/,
      systemMessage: /\[(システム|エラー|警告|情報)\]/,
      responseEnd: /\n\s*$/,
    };
  }

  analyzeChunk(chunk) {
    const analysis = {
      containsThinking: this.patterns.thinkingStart.test(chunk),
      containsToolUsage: this.patterns.toolUsage.test(chunk),
      containsCode: this.patterns.codeBlockStart.test(chunk),
      containsSystem: this.patterns.systemMessage.test(chunk),
      isResponseStart: this.patterns.responseStart.test(chunk),
      isResponseEnd: this.patterns.responseEnd.test(chunk),
    };

    return analysis;
  }
}
````

---

## フロントエンド実装

### 🎨 ユーザーインターフェース

```css
/* styles.css */
.amazon-q-chat {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.chat-header {
  background: #007acc;
  color: white;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #f5f5f5;
}

.message {
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.message.user {
  background: #e3f2fd;
  margin-left: 2rem;
}

.message.assistant {
  background: white;
  margin-right: 2rem;
}

/* 出力要素のスタイリング */
.thinking-block {
  background: #f0f8ff;
  border-left: 4px solid #007acc;
  padding: 1rem;
  margin: 0.5rem 0;
  border-radius: 4px;
}

.thinking-block summary {
  cursor: pointer;
  font-weight: bold;
  color: #007acc;
}

.tool-usage {
  background: #fff8dc;
  border: 1px solid #ffd700;
  padding: 0.8rem;
  border-radius: 4px;
  margin: 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.code-block {
  background: #f8f8f8;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin: 0.5rem 0;
  overflow: hidden;
}

.code-header {
  background: #eee;
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
}

.code-header .language {
  font-size: 0.9rem;
  color: #666;
  font-weight: bold;
}

.copy-btn {
  background: #007acc;
  color: white;
  border: none;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.copy-btn:hover {
  background: #005a9e;
}

.code-content {
  padding: 1rem;
  overflow-x: auto;
}

.system-message {
  padding: 0.8rem;
  border-radius: 4px;
  margin: 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.system-message.システム {
  background: #e8f5e8;
  border: 1px solid #4caf50;
}

.system-message.警告 {
  background: #fff3cd;
  border: 1px solid #ffc107;
}

.system-message.エラー {
  background: #f8d7da;
  border: 1px solid #dc3545;
}

.interactive-element {
  background: #f0f0f0;
  border: 2px solid #007acc;
  padding: 1rem;
  border-radius: 6px;
  margin: 0.5rem 0;
}

.interactive-prompt {
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.interactive-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.interactive-submit {
  background: #007acc;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.chat-input {
  padding: 1rem;
  background: white;
  border-top: 1px solid #ddd;
  display: flex;
  gap: 0.5rem;
}

.chat-input input {
  flex: 1;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.chat-input button {
  background: #007acc;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
}

.chat-input button:hover {
  background: #005a9e;
}

.chat-input button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* ストリーミング表示のアニメーション */
.streaming-cursor::after {
  content: '▊';
  animation: blink 1s infinite;
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}
```

### 🔄 リアルタイムストリーミング実装

````javascript
// streaming-chat.js
class StreamingChatInterface {
  constructor(container) {
    this.container = container;
    this.currentMessage = null;
    this.streamingElement = null;
    this.ws = null;
  }

  async initialize() {
    // WebSocket 接続
    this.ws = new WebSocket('ws://localhost:3000');

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    // Amazon Q セッション開始
    await this.startAmazonQSession();
  }

  handleMessage(data) {
    switch (data.type) {
      case 'streaming_chunk':
        this.handleStreamingChunk(data);
        break;
      case 'complete_response':
        this.handleCompleteResponse(data);
        break;
      case 'session_ready':
        this.handleSessionReady();
        break;
    }
  }

  handleStreamingChunk(chunk) {
    // 新しいメッセージの開始
    if (!this.currentMessage) {
      this.currentMessage = this.createMessageElement('assistant');
      this.container.appendChild(this.currentMessage);
    }

    // チャンクタイプに応じた処理
    const element = this.renderStreamingChunk(chunk);
    this.currentMessage.appendChild(element);

    // スクロール調整
    this.scrollToBottom();
  }

  renderStreamingChunk(chunk) {
    const wrapper = document.createElement('div');
    wrapper.className = `streaming-chunk ${chunk.type}`;

    switch (chunk.type) {
      case 'thinking':
        wrapper.innerHTML = `
          <details class="thinking-block" open>
            <summary>🤔 Thinking...</summary>
            <div class="thinking-content">${this.escapeHtml(chunk.content)}</div>
          </details>
        `;
        break;

      case 'tool_usage':
        wrapper.innerHTML = `
          <div class="tool-usage">
            <span class="tool-icon">🔧</span>
            <span class="tool-name">${chunk.metadata.toolName}</span>
            <span class="tool-status">実行中...</span>
          </div>
        `;
        break;

      case 'text':
        wrapper.innerHTML = `
          <div class="response-text">
            <span class="streaming-text">${this.escapeHtml(chunk.content)}</span>
            <span class="streaming-cursor"></span>
          </div>
        `;
        break;

      case 'code_block':
        if (chunk.content.includes('```')) {
          // 完全なコードブロック
          wrapper.innerHTML = this.renderCompleteCodeBlock(chunk);
        } else {
          // ストリーミング中のコード
          wrapper.innerHTML = `
            <div class="code-block streaming">
              <div class="code-header">
                <span class="language">${chunk.metadata.language || 'text'}</span>
                <span class="streaming-indicator">入力中...</span>
              </div>
              <div class="code-content">
                <pre><code>${this.escapeHtml(chunk.content)}<span class="streaming-cursor"></span></code></pre>
              </div>
            </div>
          `;
        }
        break;
    }

    return wrapper;
  }

  renderCompleteCodeBlock(chunk) {
    const language = chunk.metadata.language || 'text';
    const code = chunk.content.replace(/```\w*\n?/g, '').replace(/```$/, '');

    return `
      <div class="code-block">
        <div class="code-header">
          <span class="language">${language}</span>
          <button class="copy-btn" onclick="copyToClipboard(\`${this.escapeForJs(code)}\`)">
            📋 Copy
          </button>
        </div>
        <div class="code-content">
          <pre><code class="language-${language}">${this.escapeHtml(code)}</code></pre>
        </div>
      </div>
    `;
  }

  async sendMessage(message) {
    // ユーザーメッセージを表示
    const userMessage = this.createMessageElement('user');
    userMessage.innerHTML = `<div class="user-text">${this.escapeHtml(message)}</div>`;
    this.container.appendChild(userMessage);

    // 応答準備
    this.currentMessage = null;

    // メッセージ送信
    this.ws.send(
      JSON.stringify({
        type: 'amazon_q_input',
        data: message,
      })
    );

    this.scrollToBottom();
  }

  createMessageElement(sender) {
    const element = document.createElement('div');
    element.className = `message ${sender}`;
    return element;
  }

  scrollToBottom() {
    this.container.scrollTop = this.container.scrollHeight;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  escapeForJs(text) {
    return text.replace(/`/g, '\\`').replace(/\$/g, '\\$');
  }
}

// 使用例
document.addEventListener('DOMContentLoaded', async () => {
  const chatContainer = document.getElementById('chat-messages');
  const chatInterface = new StreamingChatInterface(chatContainer);

  await chatInterface.initialize();

  // 入力フィールドの処理
  const inputField = document.getElementById('chat-input');
  const sendButton = document.getElementById('send-button');

  const sendMessage = () => {
    const message = inputField.value.trim();
    if (message) {
      chatInterface.sendMessage(message);
      inputField.value = '';
      inputField.focus();
    }
  };

  sendButton.addEventListener('click', sendMessage);
  inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
});
````

---

## 実用例とコード

### 🚀 完全な実装例

#### 1. プロジェクト構造

```
amazon-q-web-interface/
├── server/
│   ├── server.js              # メインサーバー
│   ├── amazon-q-handler.js    # Amazon Q CLI ハンドラー
│   ├── pty-manager.js         # PTY 管理
│   └── websocket-handler.js   # WebSocket 管理
├── client/
│   ├── index.html             # メインページ
│   ├── js/
│   │   ├── chat-interface.js  # チャットインターフェース
│   │   ├── streaming-renderer.js # ストリーミングレンダラー
│   │   └── websocket-client.js   # WebSocket クライアント
│   └── css/
│       └── styles.css         # スタイルシート
└── package.json
```

#### 2. package.json

```json
{
  "name": "amazon-q-web-interface",
  "version": "1.0.0",
  "description": "Web interface for Amazon Q CLI using WebSocket + PTY",
  "main": "server/server.js",
  "scripts": {
    "start": "node server/server.js",
    "dev": "nodemon server/server.js"
  },
  "dependencies": {
    "node-pty": "^1.0.0",
    "ws": "^8.14.0",
    "express": "^4.18.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
```

#### 3. 実行方法

```bash
# 1. プロジェクトのセットアップ
git clone <repository>
cd amazon-q-web-interface
npm install

# 2. Amazon Q CLI がインストールされていることを確認
q --version

# 3. サーバー起動
npm start

# 4. ブラウザでアクセス
open http://localhost:3000
```

### 📈 パフォーマンス最適化

```javascript
// performance-optimizer.js
class PerformanceOptimizer {
  constructor() {
    this.bufferSize = 8192;
    this.updateThrottle = 16; // 60fps
    this.pendingUpdates = [];
  }

  // バッファリングによる効率的な更新
  bufferUpdate(update) {
    this.pendingUpdates.push(update);

    if (!this.updateScheduled) {
      this.updateScheduled = true;
      requestAnimationFrame(() => {
        this.flushUpdates();
        this.updateScheduled = false;
      });
    }
  }

  flushUpdates() {
    const batchedUpdates = this.pendingUpdates.splice(0);

    // 同じタイプの更新をまとめて処理
    const groupedUpdates = this.groupUpdatesByType(batchedUpdates);

    groupedUpdates.forEach((group) => {
      this.processBatchedUpdate(group);
    });
  }

  // メモリ効率的な ANSI エスケープシーケンス除去
  optimizedAnsiClean(text) {
    // プリコンパイルされた正規表現を使用
    return text.replace(this.ansiRegex, '');
  }

  // Virtual DOM による効率的な DOM 更新
  updateVirtualDOM(changes) {
    // 実際の DOM 操作を最小限に抑制
    const optimizedChanges = this.optimizeDOMChanges(changes);
    this.applyDOMChanges(optimizedChanges);
  }
}
```

---

## 参考資料

### 📚 技術ドキュメント

#### PTY 関連

- [node-pty GitHub](https://github.com/microsoft/node-pty)
- [PTY システムコール (Linux Manual)](https://man7.org/linux/man-pages/man7/pty.7.html)
- [Terminal Emulator 実装ガイド](https://invisible-island.net/xterm/xterm.faq.html)

#### WebSocket 関連

- [WebSocket API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [ws ライブラリドキュメント](https://github.com/websockets/ws)

#### xterm.js 関連

- [xterm.js 公式ドキュメント](https://xtermjs.org/)
- [xterm.js API リファレンス](https://xtermjs.org/docs/api/)

#### Amazon Q CLI

- [Amazon Q Developer CLI ドキュメント](https://aws.amazon.com/q/developer/)

### 🔧 実装例とサンプル

#### オープンソースプロジェクト

- [VS Code Integrated Terminal](https://github.com/microsoft/vscode) - PTY + WebSocket の実用例
- [Hyper Terminal](https://github.com/vercel/hyper) - Electron ベースのターミナル
- [ttyd](https://github.com/tsl0922/ttyd) - Web ベースターミナルの C 実装

#### 学習リソース

- [Building a Terminal Emulator](https://www.uninformativ.de/blog/postings/2018-02-24/0/POSTING-en.html)
- [How Terminal Works](https://www.linusakesson.net/programming/tty/)

### ⚠️ 注意事項とセキュリティ

#### セキュリティ考慮事項

1. **認証・認可**: WebSocket 接続時の適切な認証
2. **コマンド制限**: 危険なコマンドの実行防止
3. **サンドボックス**: プロセス実行環境の分離
4. **入力検証**: ユーザー入力の適切なサニタイゼーション

```javascript
// セキュリティ実装例
class SecurityManager {
  constructor() {
    this.allowedCommands = ['q', 'ls', 'cat', 'echo'];
    this.blockedCommands = ['rm', 'sudo', 'ssh', 'curl'];
  }

  validateCommand(command) {
    const cmd = command.trim().split(' ')[0];

    if (this.blockedCommands.includes(cmd)) {
      throw new Error(`Command '${cmd}' is not allowed`);
    }

    return true;
  }

  sanitizeInput(input) {
    // 危険な文字列の除去
    return input.replace(/[;&|`$()]/g, '');
  }
}
```

#### パフォーマンス考慮事項

1. **メモリ管理**: 長時間のセッションでのメモリリーク防止
2. **CPU 使用率**: ANSI エスケープシーケンス処理の最適化
3. **ネットワーク**: WebSocket データ送信の効率化
4. **ブラウザリソース**: DOM 操作の最適化

---

## まとめ

この実装ガイドで説明した **WebSocket + PTY** アーキテクチャにより、以下が実現可能です：

### ✅ 実現される機能

1. **完全な Amazon Q CLI 統合**

   - thinking プロセスの可視化
   - ツール使用状況の表示
   - ストリーミング応答のリアルタイム表示
   - 対話的要素の完全サポート

2. **本格的なターミナル体験**

   - 色付き出力の正確な表示
   - カーソル制御とエスケープシーケンス対応
   - vim、nano 等の高度なエディタ対応
   - パスワード入力等のセキュアな対話

3. **優れたユーザー体験**
   - 60fps でのスムーズなストリーミング表示
   - 要素別の適切なスタイリング
   - コピー&ペースト等の便利機能
   - レスポンシブデザイン対応

### 🚀 将来の拡張可能性

- **マルチセッション対応**: 複数の Amazon Q セッション同時実行
- **ファイル操作**: ドラッグ&ドロップによるファイルアップロード
- **音声入力**: 音声認識による質問入力
- **AI 支援**: 質問候補の自動提案
- **共同作業**: 複数ユーザーでのセッション共有

この技術を基盤として、Claude Code のような高度な開発環境や、Amazon Q CLI を活用した革新的な Web アプリケーションの構築が可能になります。

---

_このガイドが WebSocket + PTY による高度なターミナル体験の実装に役立つことを願います。技術的な質問や改善提案がありましたら、お気軽にお声かけください。_
