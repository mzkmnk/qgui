# フェーズ 2: コア機能実装 - 機能単位 TDD 実装

## 概要

YAGNI原則に従い、Amazon Q GUI の最小限動作に必要なコア機能のみを実装する。
各機能は独立したPRとして実装可能なサイズに分割。

## バックエンドコア機能実装

### 1. WebSocketメッセージ送受信（Backend PR #4）

#### 1.1 メッセージ送信機能のみ

- [ ] **Red**: `websocket.gateway.spec.ts` - メッセージ送信テスト追加
  ```typescript
  it('クライアントからのメッセージを受信できる', () => {
    const testMessage = { type: 'command', data: 'ls' };
    gateway.handleMessage(mockClient, testMessage);
    expect(mockClient.emit).toHaveBeenCalled();
  });
  ```
- [ ] **Green**: `websocket.gateway.ts` - handleMessage実装（固定応答）
- [ ] **動作確認**: WebSocketでメッセージ送受信ができることを確認

### 2. PTYコマンド実行（Backend PR #5）

#### 2.1 コマンド実行と結果取得

- [ ] **Red**: `pty-manager.service.spec.ts` - コマンド実行テスト追加
  ```typescript
  it('コマンドを実行して結果を取得できる', async () => {
    const result = await ptyManager.executeCommand('echo test');
    expect(result).toContain('test');
  });
  ```
- [ ] **Green**: `pty-manager.service.ts` - executeCommand実装
- [ ] **動作確認**: PTYでコマンドが実行できることを確認

### 3. WebSocket-PTY連携（Backend PR #6）

#### 3.1 WebSocket経由でPTYコマンド実行

- [ ] **Red**: 統合テスト作成 - WebSocket経由のコマンド実行
- [ ] **Green**: WebSocketGatewayとPTYManagerの連携実装
- [ ] **動作確認**: WebSocket経由でコマンドを実行し結果を取得

## フロントエンドコア機能実装

### 4. コマンド入力UI（Frontend PR #3）

#### 4.1 基本的な入力フィールド

- [ ] **Red**: `command-input.component.spec.ts` - 入力フィールドテスト
- [ ] **Green**: `command-input.component.ts` - 最小限の入力UI
- [ ] **動作確認**: テキスト入力とEnterキーでの送信

### 5. メッセージ表示（Frontend PR #4）

#### 5.1 テキストメッセージ表示のみ

- [ ] **Red**: `message-display.component.spec.ts` - メッセージ表示テスト
- [ ] **Green**: `message-display.component.ts` - シンプルなテキスト表示
- [ ] **動作確認**: 送信したコマンドと結果が表示される

### 6. 基本的なANSI処理（Frontend PR #5）

#### 6.1 最小限のカラーコード対応

- [ ] **Red**: `ansi.pipe.spec.ts` - 赤色のみのANSI処理テスト
  ```typescript
  it('赤色のANSIコードを処理できる', () => {
    const input = '\x1b[31mRed\x1b[0m';
    const result = ansiPipe.transform(input);
    expect(result).toContain('color: red');
  });
  ```
- [ ] **Green**: `ansi.pipe.ts` - 赤色のみ対応の最小実装
- [ ] **動作確認**: 赤色のテキストが表示される

## 統合動作確認

### 7. 最小限の動作確認（End-to-End）

- [ ] フロントエンドでコマンド入力
- [ ] WebSocket経由でバックエンドに送信
- [ ] PTYでコマンド実行
- [ ] 結果をフロントエンドに表示
- [ ] 基本的なANSIカラーが反映される

## 削除した項目（YAGNI原則）

以下の項目は実際に必要になるまで実装しない：

- セッション管理（複数セッション不要）
- データベース統合（履歴保存不要）
- マークダウンレンダリング
- xterm.js統合（基本的な表示で十分）
- ツール承認機能
- 履歴管理機能
- エクスポート機能
- パフォーマンス最適化
- エラーハンドリング強化
- 全ANSIエスケープシーケンス対応
- シンタックスハイライト
- 高度なターミナル機能

## 各PRの完了条件

### バックエンドPR

- [ ] 対象機能のテストが全てGreen
- [ ] `npm run backend:lint` エラーなし
- [ ] TypeScriptコンパイルエラーなし
- [ ] 最小限の実装（ハードコードOK）

### フロントエンドPR

- [ ] 対象機能のテストが全てGreen
- [ ] `npm run frontend:lint` エラーなし
- [ ] TypeScriptコンパイルエラーなし
- [ ] 最小限の実装（シンプルなUI）

## 次のフェーズへの移行条件

- [ ] コマンド入力→実行→結果表示の基本フローが動作
- [ ] 最小限のANSI処理（赤色のみ）が動作
- [ ] 全テストがGreen