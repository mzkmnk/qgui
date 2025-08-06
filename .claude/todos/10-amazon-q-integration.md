# フェーズ 10: Amazon Q CLI統合 - 機能単位 TDD 実装

## 概要

Amazon Q CLIをWebアプリケーションから利用可能にするための統合実装。
YAGNI原則に従い、基本的な chat と通常のCLIコマンド実行機能から開始する。

## 前提条件

- **Amazon Q CLIは既にログイン済み**
- **ローカル環境での実行**
- **認証情報管理は不要**

## コア統合機能

### 1. Amazon Q CLIサービス実装

#### 1.1 基本的なコマンド実行

- [ ] **Red**: `amazon-q-cli.service.spec.ts` - 基本コマンド実行テスト
  ```typescript
  it('Amazon Q chatを実行できる', async () => {
    const result = await amazonQService.chat('Hello, how can I use AWS S3?');
    expect(result.response).toBeDefined();
    expect(result.response).toContain('S3');
  });
  ```
- [ ] **Green**: `amazon-q-cli.service.ts` - PTY経由でAmazon Q CLI実行
- [ ] **動作確認**: 実際のAmazon Q CLIが応答を返す

#### 1.2 ストリーミング応答処理

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
- [ ] **動作確認**: リアルタイムで応答が表示される

### 2. コマンドパーサー

#### 2.1 Amazon Q専用コマンド認識

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
- [ ] **動作確認**: 各種Amazon Qコマンドが正しく解析される

### 3. 応答フォーマッター

#### 3.1 AI応答の構造化

- [ ] **Red**: `response-formatter.spec.ts` - マークダウン変換テスト
  ```typescript
  it('コードブロックを識別して整形する', () => {
    const raw = 'Here is code:\n```python\nprint("hello")\n```';
    const formatted = formatter.format(raw);
    expect(formatted.blocks[0].type).toBe('code');
    expect(formatted.blocks[0].language).toBe('python');
  });
  ```
- [ ] **Green**: マークダウンパーサーとコードブロック処理
- [ ] **動作確認**: コードが適切にハイライトされる

### 4. セッション管理

#### 4.1 会話コンテキスト保持

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
- [ ] **動作確認**: 連続した会話でコンテキストが維持される

## フロントエンド統合

### 5. Amazon Qコンポーネント

#### 5.1 チャットインターフェース

- [ ] **Red**: `amazon-q-chat.component.spec.ts` - チャットUIテスト
- [ ] **Green**: PrimeNGベースのチャットUI実装
- [ ] **動作確認**: メッセージの送受信が適切に表示される

#### 5.2 コマンドサジェスチョン

- [ ] **Red**: サジェスト表示テスト
- [ ] **Green**: Amazon Q特有のコマンド補完実装
- [ ] **動作確認**: 入力中にコマンド候補が表示される

### 6. エラーハンドリング

#### 6.1 エラーメッセージ表示

- [ ] **Red**: エラー表示テスト
  ```typescript
  it('Amazon Q CLIエラーを適切に表示する', () => {
    component.handleError(new Error('Command not found'));
    expect(component.errorMessage).toContain('not found');
  });
  ```
- [ ] **Green**: ユーザーフレンドリーなエラーメッセージ実装
- [ ] **動作確認**: 各種エラーが分かりやすく表示される

## WebSocket統合

### 7. リアルタイム通信

#### 7.1 Amazon Q応答のWebSocket送信

- [ ] **Red**: WebSocket経由の応答テスト
- [ ] **Green**: WebSocketGatewayでAmazon Q応答を中継
- [ ] **動作確認**: ブラウザでリアルタイムに応答が表示される

## 削除・延期した項目（YAGNI原則）

以下の項目は実際に必要になるまで実装しない：

### AWS認証関連（ログイン済み前提のため不要）
- AWS認証情報管理
- プロファイル選択UI
- 認証エラーハンドリング
- STSトークン管理

### 高度な機能
- 複雑なマルチモーダル応答（画像、図表）
- 高度なコンテキスト管理（RAG統合）
- カスタムツール実行
- エージェント機能の完全実装
- 複数LLMの切り替え
- ファイルアップロード機能
- 応答のエクスポート機能
- 詳細な使用状況分析
- コスト追跡機能

## 各PRの完了条件

### バックエンドPR

- [ ] Amazon Q CLIコマンドが実行できる（ログイン済み前提）
- [ ] ストリーミング応答が機能する
- [ ] エラーハンドリングが実装されている
- [ ] WebSocket経由で応答が送信される

### フロントエンドPR

- [ ] チャットUIが動作する
- [ ] 応答が適切に表示される
- [ ] コードブロックがハイライトされる
- [ ] エラーメッセージが表示される

## 次のフェーズへの移行条件

- [ ] Amazon Q chatコマンドが実行できる（既存のログインセッション使用）
- [ ] ストリーミング応答が表示される
- [ ] マークダウン形式の応答が整形される
- [ ] 基本的なエラーハンドリングが動作する
- [ ] セッションコンテキストが維持される