# フェーズ 11: ターミナル機能強化（xterm.js統合） - 機能単位 TDD 実装

## 概要

現在の基本的なターミナル表示をxterm.jsを使用したプロフェッショナルなターミナルエミュレータに置き換える。
YAGNI原則に従い、基本的なターミナル機能から段階的に実装する。

## 1. xterm.js基本統合

### 1.1 パッケージインストール

- [ ] **実装**: 必要なパッケージをインストール
  ```bash
  npm install xterm xterm-addon-fit xterm-addon-web-links
  ```
- [ ] **動作確認**: パッケージが正しくインストールされる

### 1.2 ターミナルインスタンス作成

- [ ] **Red**: `xterm.service.spec.ts` - ターミナル作成テスト
  ```typescript
  it('xterm.jsターミナルを作成できる', () => {
    const terminal = xtermService.createTerminal({
      cols: 80,
      rows: 24
    });
    expect(terminal).toBeDefined();
    expect(terminal.cols).toBe(80);
    expect(terminal.rows).toBe(24);
  });
  ```
- [ ] **Green**: `xterm.service.ts` - xterm.js初期化実装
- [ ] **Refactor**: 設定オプションの外部化
- [ ] **動作確認**: ブラウザにターミナルが表示される

### 1.3 DOM要素へのアタッチ

- [ ] **Red**: DOMマウントテスト
  ```typescript
  it('DOM要素にターミナルをアタッチできる', () => {
    const element = document.createElement('div');
    xtermService.attachToElement(terminal, element);
    expect(element.querySelector('.xterm')).toBeDefined();
  });
  ```
- [ ] **Green**: DOM統合実装
- [ ] **Refactor**: Angular ViewChild統合
- [ ] **動作確認**: 指定した要素内にターミナルが描画される

## 2. PTY統合

### 2.1 双方向データバインディング

- [ ] **Red**: `pty-binding.service.spec.ts` - PTY連携テスト
  ```typescript
  it('PTYとxterm.jsを双方向接続できる', () => {
    const binding = ptyBinding.connect(terminal, ptyProcess);
    binding.sendToTerminal('Hello');
    expect(terminal.buffer.active.getLine(0)).toContain('Hello');
  });
  ```
- [ ] **Green**: WebSocket経由のPTY接続実装
- [ ] **Refactor**: エラーハンドリング追加
- [ ] **動作確認**: キー入力がPTYに送信され、出力が表示される

### 2.2 リアルタイム出力

- [ ] **Red**: ストリーミング出力テスト
  ```typescript
  it('PTY出力をリアルタイムで表示', (done) => {
    ptyBinding.onData((data) => {
      expect(data).toBeDefined();
      done();
    });
    ptyProcess.write('echo test');
  });
  ```
- [ ] **Green**: PTY出力のリアルタイム表示実装
- [ ] **Refactor**: バッファリング最適化
- [ ] **動作確認**: コマンド実行結果がリアルタイムで表示される

## 3. 基本的なターミナル機能

### 3.1 ANSIカラー完全対応

- [ ] **Red**: `ansi-colors.spec.ts` - カラーコード処理テスト
  ```typescript
  it('ANSIカラーコードを正しく表示する', () => {
    terminal.write('\x1b[31mRed Text\x1b[0m');
    const line = terminal.buffer.active.getLine(0);
    expect(line.getCell(0).getFgColor()).toBe(1); // Red
  });
  ```
- [ ] **Green**: xterm.jsのデフォルトANSI処理活用
- [ ] **Refactor**: カスタムカラーテーマ対応
- [ ] **動作確認**: カラフルなターミナル出力が表示される

### 3.2 カーソル制御

- [ ] **Red**: カーソル移動テスト
  ```typescript
  it('カーソル位置を制御できる', () => {
    terminal.write('\x1b[5;10H'); // 5行10列に移動
    expect(terminal.buffer.active.cursorY).toBe(4); // 0-indexed
    expect(terminal.buffer.active.cursorX).toBe(9);
  });
  ```
- [ ] **Green**: カーソル制御シーケンス対応
- [ ] **Refactor**: カーソルスタイルカスタマイズ
- [ ] **動作確認**: viやnanoなどのエディタが正常動作

## 4. リサイズ対応

### 4.1 ウィンドウリサイズ

- [ ] **Red**: `resize.service.spec.ts` - リサイズ処理テスト
  ```typescript
  it('ウィンドウリサイズに追従する', () => {
    resizeService.handleResize(terminal, 100, 30);
    expect(terminal.cols).toBe(100);
    expect(terminal.rows).toBe(30);
  });
  ```
- [ ] **Green**: ResizeObserver APIでリサイズ検知
- [ ] **Refactor**: デバウンス処理追加
- [ ] **動作確認**: ブラウザウィンドウ変更時にターミナルサイズが調整される

### 4.2 PTYサイズ同期

- [ ] **Red**: PTYサイズ更新テスト
  ```typescript
  it('PTYプロセスにリサイズを通知', async () => {
    await ptyService.resize(100, 30);
    expect(ptyProcess.cols).toBe(100);
    expect(ptyProcess.rows).toBe(30);
  });
  ```
- [ ] **Green**: PTYプロセスへのリサイズ通知実装
- [ ] **Refactor**: 非同期処理の最適化
- [ ] **動作確認**: リサイズ後もレイアウトが崩れない

## 5. スクロール機能

### 5.1 バッファスクロール

- [ ] **Red**: スクロール動作テスト
  ```typescript
  it('マウスホイールでスクロールできる', () => {
    // 多量の出力を生成
    for(let i = 0; i < 100; i++) {
      terminal.writeln(`Line ${i}`);
    }
    terminal.scrollToTop();
    expect(terminal.buffer.active.viewportY).toBe(0);
  });
  ```
- [ ] **Green**: スクロールバー実装
- [ ] **Refactor**: スムーズスクロール対応
- [ ] **動作確認**: 長い出力をスムーズにスクロール可能

### 5.2 スクロールバック制限

- [ ] **Red**: バッファ制限テスト
- [ ] **Green**: スクロールバックバッファサイズ設定
- [ ] **Refactor**: メモリ使用量の最適化
- [ ] **動作確認**: メモリ使用量が適切に制限される

## 6. コピー&ペースト

### 6.1 テキスト選択

- [ ] **Red**: `selection.spec.ts` - テキスト選択テスト
  ```typescript
  it('マウスドラッグでテキストを選択', () => {
    terminal.select(0, 0, 5);
    expect(terminal.getSelection()).toBe('Hello');
  });
  ```
- [ ] **Green**: マウスドラッグでテキスト選択実装
- [ ] **Refactor**: 選択範囲のハイライト改善
- [ ] **動作確認**: ターミナル内のテキストを選択できる

### 6.2 クリップボード統合

- [ ] **Red**: コピー&ペーストテスト
  ```typescript
  it('選択テキストをコピーできる', async () => {
    terminal.select(0, 0, 5);
    await clipboardService.copy(terminal.getSelection());
    expect(await navigator.clipboard.readText()).toBe('Hello');
  });
  ```
- [ ] **Green**: Clipboard API統合
- [ ] **Refactor**: ショートカットキー対応
- [ ] **動作確認**: Ctrl+C/Ctrl+Vが動作する

## 7. テーマ適用

### 7.1 Crush風ダークテーマ

- [ ] **Red**: `theme.spec.ts` - テーマ適用テスト
  ```typescript
  it('Crushテーマを適用', () => {
    const theme = themeService.getCrushTheme();
    terminal.setOption('theme', theme);
    expect(terminal.options.theme.background).toBe('#0a0a0a');
  });
  ```
- [ ] **Green**: xterm.jsテーマ設定
  ```typescript
  const crushTheme = {
    background: '#0a0a0a',
    foreground: '#e5e5e5',
    cursor: '#f97316',
    selection: 'rgba(249, 115, 22, 0.3)',
    black: '#1a1a1a',
    red: '#ff5555',
    green: '#50fa7b',
    yellow: '#f1fa8c',
    blue: '#bd93f9',
    magenta: '#ff79c6',
    cyan: '#8be9fd',
    white: '#f8f8f2',
    brightBlack: '#6272a4',
    brightRed: '#ff6e6e',
    brightGreen: '#69ff94',
    brightYellow: '#ffffa5',
    brightBlue: '#d6acff',
    brightMagenta: '#ff92df',
    brightCyan: '#a4ffff',
    brightWhite: '#ffffff'
  };
  ```
- [ ] **Refactor**: テーマ切り替え機能
- [ ] **動作確認**: Crushのような見た目になる

## 8. 必須アドオン統合

### 8.1 FitAddon（自動サイズ調整）

- [ ] **Red**: FitAddon統合テスト
  ```typescript
  it('コンテナサイズに自動フィット', () => {
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    fitAddon.fit();
    expect(terminal.cols).toBeGreaterThan(0);
  });
  ```
- [ ] **Green**: `xterm-addon-fit`導入
- [ ] **Refactor**: レスポンシブ対応
- [ ] **動作確認**: コンテナサイズに自動フィット

### 8.2 WebLinksAddon（URL検出）

- [ ] **Red**: URLクリック可能テスト
  ```typescript
  it('URLをクリック可能にする', () => {
    const webLinksAddon = new WebLinksAddon();
    terminal.loadAddon(webLinksAddon);
    terminal.write('Visit https://example.com');
    // URLがクリック可能になることを確認
  });
  ```
- [ ] **Green**: `xterm-addon-web-links`導入
- [ ] **Refactor**: URLハンドラーカスタマイズ
- [ ] **動作確認**: ターミナル内のURLがクリック可能

## 9. パフォーマンス最適化

### 9.1 仮想レンダリング

- [ ] **実装**: xterm.jsのデフォルト仮想レンダリング確認
- [ ] **動作確認**: 大量の出力でもスムーズに動作

### 9.2 メモリ管理

- [ ] **実装**: バッファサイズの適切な設定（デフォルト1000行）
- [ ] **動作確認**: メモリ使用量が適切に管理される

## 各PRの完了条件

### フロントエンドPR

- [ ] xterm.jsが表示される
- [ ] キー入力が機能する
- [ ] コマンド実行結果が表示される
- [ ] リサイズが適切に処理される
- [ ] コピー&ペーストが動作する
- [ ] 全テストがGreen
- [ ] `npm run frontend:lint` エラーなし

### バックエンドPR

- [ ] PTYとxterm.jsの接続が確立
- [ ] 双方向通信が機能する
- [ ] リサイズ情報がPTYに伝達される
- [ ] 全テストがGreen
- [ ] `npm run backend:lint` エラーなし

## 次のフェーズへの移行条件

- [ ] xterm.jsでターミナルが表示される
- [ ] コマンドの入力と実行ができる
- [ ] ANSIカラーが正しく表示される
- [ ] リサイズが適切に動作する
- [ ] Crush風のテーマが適用されている
- [ ] コピー&ペーストが機能する
- [ ] URLがクリック可能になっている