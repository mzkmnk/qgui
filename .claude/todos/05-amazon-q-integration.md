# フェーズ 5: Amazon Q CLI統合

## 概要

xterm.js基盤の上にAmazon Q CLI機能を統合する。
既にターミナルが動作しているため、Amazon Q特有の機能に集中できる。

## 前提条件

- フェーズ4のターミナル基盤が完成している
- Amazon Q CLIは既にログイン済み
- PTY経由でコマンドが実行できる

## 1. Amazon Qコマンド実行

### 1.1 基本的なchatコマンド

- [ ] **Red**: `amazon-q.service.spec.ts` - chatコマンドテスト
  ```typescript
  it('q chatコマンドを実行できる', async () => {
    const response = await service.chat('How to use S3?');
    expect(response).toContain('S3');
  });
  ```
- [ ] **Green**: PTY経由でq chatを実行
- [ ] **Refactor**: エラーハンドリング
- [ ] **動作確認**: Amazon Qが応答する

### 1.2 ストリーミング応答

- [ ] **Red**: ストリーミングテスト
  ```typescript
  it('応答をリアルタイムで受信', (done) => {
    service.chatStream('Generate code').subscribe({
      next: chunk => expect(chunk).toBeDefined(),
      complete: done
    });
  });
  ```
- [ ] **Green**: チャンク単位の処理
- [ ] **動作確認**: 応答が順次表示される

## 2. コマンド識別

### 2.1 Amazon Qコマンドの判定

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
  ```typescript
  it('コードブロックを検出', () => {
    const text = '```python\nprint("hello")\n```';
    expect(detector.hasCodeBlock(text)).toBe(true);
  });
  ```
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

### 5.1 Amazon Q CLIエラー

- [ ] **Red**: エラー処理テスト
- [ ] **Green**: エラーメッセージ表示
- [ ] **動作確認**: エラーが分かりやすい

## 完了条件

- [ ] q chatコマンドが実行できる
- [ ] ストリーミング応答が表示される
- [ ] 基本的なマークダウンが認識される
- [ ] 会話の文脈が保持される
- [ ] エラーが適切に処理される

## 次のフェーズへ

Amazon Qが使えるようになったので、フェーズ6でUI/UXを磨き上げる。