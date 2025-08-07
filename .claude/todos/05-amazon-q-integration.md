# フェーズ 5: Amazon Q CLI 統合

## 概要

チャット UI 基盤の上に Amazon Q CLI 機能を統合する。
既にチャットインターフェースが動作しているため、Amazon Q 特有の機能に集中できる。

## 前提条件

- フェーズ 4 のチャット UI 基盤が完成している
- Amazon Q CLI は既にログイン済み
- PTY 経由でコマンドが実行できる

## 1. Amazon Q コマンド実行

### 1.1 基本的な chat コマンド

- [ ] **Red**: `amazon-q.service.spec.ts` - chat コマンドテスト
  ```typescript
  it('q chatコマンドを実行できる', async () => {
    const response = await service.chat('How to use S3?');
    expect(response).toContain('S3');
  });
  ```
- [ ] **Green**: PTY 経由で q chat を実行
- [ ] **Refactor**: エラーハンドリング
- [ ] **動作確認**: Amazon Q が応答する

### 1.2 ストリーミング応答

- [ ] **Red**: ストリーミングテスト
  ```typescript
  it('応答をリアルタイムで受信', (done) => {
    service.chatStream('Generate code').subscribe({
      next: (chunk) => expect(chunk).toBeDefined(),
      complete: done,
    });
  });
  ```
- [ ] **Green**: チャンク単位の処理
- [ ] **動作確認**: 応答が順次表示される

## 2. コマンド識別

### 2.1 Amazon Q コマンドの判定

- [ ] **Red**: コマンド判定テスト
  ```typescript
  it('Amazon Qコマンドを識別', () => {
    expect(parser.isAmazonQ('q chat "test"')).toBe(true);
    expect(parser.isAmazonQ('ls -la')).toBe(false);
  });
  ```
- [ ] **Green**: コマンドパーサー実装
- [ ] **動作確認**: 適切に振り分けられる

## 3. 応答処理の改善

### 3.1 マークダウン認識

- [ ] **Red**: マークダウン検出テスト
  ````typescript
  it('コードブロックを検出', () => {
    const text = '```python\nprint("hello")\n```';
    expect(detector.hasCodeBlock(text)).toBe(true);
  });
  ````
- [ ] **Green**: パターン検出実装
- [ ] **動作確認**: コードブロックが識別される

### 3.2 構造化表示（基本）

- [ ] **実装**: コードブロックの背景色変更
- [ ] **動作確認**: コードが見やすくなる

## 4. セッション管理

### 4.1 会話履歴の保持

- [ ] **Red**: 履歴保持テスト
  ```typescript
  it('会話履歴を保持', () => {
    session.addMessage('user', 'Hello');
    session.addMessage('assistant', 'Hi');
    expect(session.getHistory().length).toBe(2);
  });
  ```
- [ ] **Green**: メモリベースの履歴管理
- [ ] **動作確認**: 文脈が維持される

## 5. エラー処理

### 5.1 Amazon Q CLI エラー

- [ ] **Red**: エラー処理テスト
- [ ] **Green**: エラーメッセージ表示
- [ ] **動作確認**: エラーが分かりやすい

## 完了条件

- [ ] q chat コマンドが実行できる
- [ ] ストリーミング応答が表示される
- [ ] 基本的なマークダウンが認識される
- [ ] 会話の文脈が保持される
- [ ] エラーが適切に処理される

## 次のフェーズへ

Amazon Q が使えるようになったので、フェーズ 6 で UI/UX を磨き上げる。
