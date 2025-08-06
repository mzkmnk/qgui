# フェーズ 10: Amazon Q CLI統合 - 機能単位 TDD 実装

## 概要

Amazon Q CLIをWebアプリケーションから利用可能にするための統合実装。
YAGNI原則に従い、基本的な chat と通常のCLIコマンド実行機能から開始する。

## 前提条件

- **Amazon Q CLIは既にログイン済み**
- **ローカル環境での実行**
- **認証情報管理は不要**

## 1. Amazon Q CLIサービス実装

### 1.1 基本的なコマンド実行

- [ ] **Red**: `amazon-q-cli.service.spec.ts` - 基本コマンド実行テスト
  ```typescript
  it('Amazon Q chatを実行できる', async () => {
    const result = await amazonQService.chat('Hello, how can I use AWS S3?');
    expect(result.response).toBeDefined();
    expect(result.response).toContain('S3');
  });
  ```
- [ ] **Green**: `amazon-q-cli.service.ts` - PTY経由でAmazon Q CLI実行
- [ ] **Refactor**: エラーハンドリング追加
- [ ] **動作確認**: 実際のAmazon Q CLIが応答を返す

### 1.2 ストリーミング応答処理

- [ ] **Red**: ストリーミング応答のテスト
  ```typescript
  it('ストリーミング応答を受信できる', (done) => {
    amazonQService.chatStream('Generate a long response')
      .subscribe({
        next: (chunk) => expect(chunk).toBeDefined(),
        complete: () => done()
      });
  });
  ```
- [ ] **Green**: Observable/EventEmitterでストリーミング実装
- [ ] **Refactor**: バッファリング最適化
- [ ] **動作確認**: リアルタイムで応答が表示される

## 2. コマンドパーサー

### 2.1 Amazon Q専用コマンド認識

- [ ] **Red**: `command-parser.service.spec.ts` - コマンド解析テスト
  ```typescript
  it('Amazon Qコマンドを識別できる', () => {
    const parsed = parser.parse('q chat "Hello"');
    expect(parsed.type).toBe('amazon-q');
    expect(parsed.command).toBe('chat');
    expect(parsed.args).toEqual(['Hello']);
  });
  ```
- [ ] **Green**: 正規表現ベースのコマンドパーサー実装
- [ ] **Refactor**: 複雑なコマンドに対応
- [ ] **動作確認**: 各種Amazon Qコマンドが正しく解析される

### 2.2 通常コマンドとの区別

- [ ] **Red**: コマンド種別判定テスト
  ```typescript
  it('通常のシェルコマンドと区別できる', () => {
    expect(parser.parse('ls -la').type).toBe('shell');
    expect(parser.parse('q chat "test"').type).toBe('amazon-q');
  });
  ```
- [ ] **Green**: コマンド種別判定ロジック実装
- [ ] **Refactor**: 拡張性を考慮した設計
- [ ] **動作確認**: 適切にコマンドが振り分けられる

## 3. 応答フォーマッター

### 3.1 マークダウン構造化

- [ ] **Red**: `response-formatter.spec.ts` - マークダウン変換テスト
  ```typescript
  it('コードブロックを識別して整形する', () => {
    const raw = 'Here is code:\n```python\nprint("hello")\n```';
    const formatted = formatter.format(raw);
    expect(formatted.blocks[0].type).toBe('code');
    expect(formatted.blocks[0].language).toBe('python');
  });
  ```
- [ ] **Green**: マークダウンパーサー実装
- [ ] **Refactor**: 複雑なマークダウン構造に対応
- [ ] **動作確認**: コードが適切にハイライトされる

### 3.2 リスト・テーブル処理

- [ ] **Red**: リスト・テーブル変換テスト
- [ ] **Green**: リスト・テーブルのHTML変換実装
- [ ] **Refactor**: スタイリング改善
- [ ] **動作確認**: 構造化データが見やすく表示される

## 4. セッション管理

### 4.1 会話コンテキスト保持

- [ ] **Red**: `session-manager.spec.ts` - セッション管理テスト
  ```typescript
  it('会話履歴を保持する', async () => {
    const session = sessionManager.create();
    await session.addMessage('user', 'Hello');
    await session.addMessage('assistant', 'Hi there');
    expect(session.getHistory().length).toBe(2);
  });
  ```
- [ ] **Green**: メモリベースのセッション管理実装
- [ ] **Refactor**: 永続化対応準備
- [ ] **動作確認**: 連続した会話でコンテキストが維持される

### 4.2 セッション切り替え

- [ ] **Red**: セッション切り替えテスト
- [ ] **Green**: 複数セッション管理実装
- [ ] **Refactor**: セッションIDによる管理
- [ ] **動作確認**: 複数の会話を並行して管理できる

## 5. フロントエンド統合

### 5.1 チャットインターフェース

- [ ] **Red**: `amazon-q-chat.component.spec.ts` - チャットUIテスト
  ```typescript
  it('メッセージを送信できる', async () => {
    component.messageInput = 'Hello Amazon Q';
    await component.sendMessage();
    expect(component.messages.length).toBe(1);
    expect(component.messages[0].content).toBe('Hello Amazon Q');
  });
  ```
- [ ] **Green**: PrimeNGベースのチャットUI実装
- [ ] **Refactor**: レスポンシブデザイン対応
- [ ] **動作確認**: メッセージの送受信が適切に表示される

### 5.2 入力補完

- [ ] **Red**: サジェスト表示テスト
- [ ] **Green**: Amazon Q特有のコマンド補完実装
- [ ] **Refactor**: 学習による補完精度向上
- [ ] **動作確認**: 入力中にコマンド候補が表示される

## 6. エラーハンドリング

### 6.1 接続エラー処理

- [ ] **Red**: エラー表示テスト
  ```typescript
  it('Amazon Q CLIエラーを適切に表示する', () => {
    component.handleError(new Error('Command not found'));
    expect(component.errorMessage).toContain('not found');
  });
  ```
- [ ] **Green**: エラーメッセージ表示実装
- [ ] **Refactor**: ユーザーフレンドリーなメッセージ
- [ ] **動作確認**: エラーが分かりやすく表示される

### 6.2 タイムアウト処理

- [ ] **Red**: タイムアウトテスト
- [ ] **Green**: タイムアウト機能実装
- [ ] **Refactor**: 設定可能なタイムアウト値
- [ ] **動作確認**: 長時間応答がない場合に適切に処理される

## 7. リアルタイム通信

### 7.1 WebSocket経由の応答

- [ ] **Red**: WebSocket経由の応答テスト
- [ ] **Green**: WebSocketGatewayでAmazon Q応答を中継
- [ ] **Refactor**: 効率的なデータ転送
- [ ] **動作確認**: ブラウザでリアルタイムに応答が表示される

### 7.2 プログレス表示

- [ ] **Red**: プログレス表示テスト
- [ ] **Green**: 処理中インジケーター実装
- [ ] **Refactor**: アニメーション追加
- [ ] **動作確認**: 処理中であることが明確に分かる

## 8. コマンド履歴

### 8.1 履歴保存

- [ ] **Red**: 履歴保存テスト
- [ ] **Green**: LocalStorageに履歴保存
- [ ] **Refactor**: 履歴の圧縮・最適化
- [ ] **動作確認**: 過去のコマンドが保存される

### 8.2 履歴検索

- [ ] **Red**: 履歴検索テスト
- [ ] **Green**: 履歴検索機能実装
- [ ] **Refactor**: あいまい検索対応
- [ ] **動作確認**: 過去のコマンドを素早く検索できる

## 各PRの完了条件

### バックエンドPR

- [ ] Amazon Q CLIコマンドが実行できる（ログイン済み前提）
- [ ] ストリーミング応答が機能する
- [ ] エラーハンドリングが実装されている
- [ ] 全テストがGreen
- [ ] `npm run backend:lint` エラーなし

### フロントエンドPR

- [ ] チャットUIが動作する
- [ ] マークダウン応答が整形される
- [ ] エラーが適切に表示される
- [ ] 全テストがGreen
- [ ] `npm run frontend:lint` エラーなし

## 次のフェーズへの移行条件

- [ ] Amazon Q chatコマンドが実行できる（既存のログインセッション使用）
- [ ] ストリーミング応答が表示される
- [ ] マークダウン形式の応答が整形される
- [ ] エラーハンドリングが実装されている
- [ ] 基本的なコマンド履歴が機能する