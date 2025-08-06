# フェーズ 4: ターミナル基盤構築（xterm.js基本統合）

## 概要

Amazon Q CLIの出力を適切に表示するための最小限のターミナル基盤を構築する。
複雑なUI機能は後回しにし、まずは動作する基盤を作ることに集中する。

## 実装順序の理由

**なぜこの順序なのか：**
1. Amazon Q CLIはANSIカラー、エスケープシーケンスを多用する
2. 現在のmessage-displayでは表示が崩れる
3. xterm.jsがあれば、Amazon Qの出力が正しく表示される

## 1. xterm.jsインストールと基本セットアップ

### 1.1 パッケージインストール

- [ ] **実装**: 最小限のパッケージをインストール
  ```bash
  npm install xterm xterm-addon-fit
  ```
- [ ] **動作確認**: パッケージが正しくインストールされる

### 1.2 基本的なターミナルコンポーネント作成

- [ ] **Red**: `terminal.component.spec.ts` - コンポーネント作成テスト
  ```typescript
  it('ターミナルコンポーネントが作成される', () => {
    expect(component).toBeTruthy();
    expect(component.terminal).toBeDefined();
  });
  ```
- [ ] **Green**: `terminal.component.ts` - 最小限の実装
- [ ] **Refactor**: Angularライフサイクル対応
- [ ] **動作確認**: コンポーネントが表示される

## 2. PTY接続（既存の機能を活用）

### 2.1 WebSocket経由のデータ送受信

- [ ] **Red**: `terminal-websocket.service.spec.ts` - WebSocket接続テスト
  ```typescript
  it('WebSocket経由でコマンドを送信できる', () => {
    service.sendCommand('ls');
    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'command', data: 'ls' })
    );
  });
  ```
- [ ] **Green**: 既存のWebSocketサービスと統合
- [ ] **Refactor**: エラーハンドリング
- [ ] **動作確認**: コマンドが実行される

### 2.2 出力の表示

- [ ] **Red**: 出力表示テスト
  ```typescript
  it('PTY出力をターミナルに表示', () => {
    service.onMessage({ type: 'output', data: 'Hello' });
    expect(terminal.buffer.active.getLine(0)).toContain('Hello');
  });
  ```
- [ ] **Green**: xterm.jsへの出力実装
- [ ] **Refactor**: バッファリング
- [ ] **動作確認**: コマンド結果が表示される

## 3. 最小限のスタイリング

### 3.1 基本的なダークテーマ

- [ ] **実装**: 最小限のダークテーマ
  ```typescript
  const basicTheme = {
    background: '#1a1a1a',
    foreground: '#e5e5e5',
    cursor: '#f97316'
  };
  ```
- [ ] **動作確認**: 目に優しい配色

### 3.2 サイズ調整

- [ ] **実装**: FitAddonで自動サイズ調整
- [ ] **動作確認**: コンテナに収まる

## 4. 基本的な操作

### 4.1 キー入力

- [ ] **Red**: キー入力テスト
- [ ] **Green**: キーボード入力をPTYに送信
- [ ] **動作確認**: タイピングが機能する

### 4.2 コピー&ペースト（最小限）

- [ ] **実装**: 基本的なコピー機能
- [ ] **動作確認**: テキスト選択とコピーが可能

## 完了条件

- [ ] xterm.jsでターミナルが表示される
- [ ] コマンドの入力と実行ができる
- [ ] PTY出力が正しく表示される
- [ ] ANSIカラーが表示される
- [ ] 基本的なコピーが機能する

## 次のフェーズへ

この基盤があれば、Amazon Q CLIの出力が適切に表示される。
フェーズ5でAmazon Q統合、フェーズ6でUI/UXの磨き上げを行う。