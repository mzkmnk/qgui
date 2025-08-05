# フェーズ 2: コア機能実装 - 機能単位 TDD 実装

## 概要

YAGNI 原則に従い、Amazon Q GUI の最小限動作に必要なコア機能のみを実装する。
各機能は独立した PR として実装可能なサイズに分割。

## バックエンドコア機能実装

### 1. WebSocket メッセージ送受信

#### 1.1 メッセージ送信機能のみ

- [x] **Red**: `websocket.gateway.spec.ts` - メッセージ送信テスト追加
  ```typescript
  it('クライアントからのメッセージを受信できる', () => {
    const testMessage = { type: 'command', data: 'ls' };
    gateway.handleMessage(mockClient, testMessage);
    expect(mockClient.emit).toHaveBeenCalled();
  });
  ```
- [x] **Green**: `websocket.gateway.ts` - handleMessage 実装（固定応答）
- [x] **動作確認**: WebSocket でメッセージ送受信ができることを確認

### 2. PTY コマンド実行

#### 2.1 コマンド実行と結果取得

- [x] **Red**: `pty-manager.service.spec.ts` - コマンド実行テスト追加
  ```typescript
  it('コマンドを実行して結果を取得できる', async () => {
    const result = await ptyManager.executeCommand('echo test');
    expect(result).toContain('test');
  });
  ```
- [x] **Green**: `pty-manager.service.ts` - executeCommand 実装
- [x] **動作確認**: PTY でコマンドが実行できることを確認

### 3. WebSocket-PTY 連携

#### 3.1 WebSocket 経由で PTY コマンド実行

- [x] **Red**: 統合テスト作成 - WebSocket 経由のコマンド実行
- [x] **Green**: WebSocketGateway と PTYManager の連携実装
- [x] **動作確認**: WebSocket 経由でコマンドを実行し結果を取得

## フロントエンドコア機能実装

### 4. コマンド入力 UI

#### 4.1 基本的な入力フィールド

- [x] **Red**: `command-input.component.spec.ts` - 入力フィールドテスト
- [x] **Green**: `command-input.component.ts` - 最小限の入力 UI
- [x] **動作確認**: テキスト入力と Enter キーでの送信

### 5. メッセージ表示

#### 5.1 テキストメッセージ表示のみ

- [x] **Red**: `message-display.component.spec.ts` - メッセージ表示テスト
- [x] **Green**: `message-display.component.ts` - シンプルなテキスト表示
- [x] **動作確認**: 送信したコマンドと結果が表示される

### 6. 基本的な ANSI 処理

#### 6.1 最小限のカラーコード対応

- [x] **Red**: `ansi.pipe.spec.ts` - 赤色のみの ANSI 処理テスト
  ```typescript
  it('赤色のANSIコードを処理できる', () => {
    const input = '\x1b[31mRed\x1b[0m';
    const result = ansiPipe.transform(input);
    expect(result).toContain('color: red');
  });
  ```
- [x] **Green**: `ansi.pipe.ts` - 赤色のみ対応の最小実装
- [x] **動作確認**: 赤色のテキストが表示される

## 統合動作確認

### 7. 最小限の動作確認（End-to-End）

- [x] フロントエンドでコマンド入力
- [x] WebSocket 経由でバックエンドに送信
- [x] PTY でコマンド実行
- [x] 結果をフロントエンドに表示
- [x] 基本的な ANSI カラーが反映される

## 削除した項目（YAGNI 原則）

以下の項目は実際に必要になるまで実装しない：

- セッション管理（複数セッション不要）
- データベース統合（履歴保存不要）
- マークダウンレンダリング
- xterm.js 統合（基本的な表示で十分）
- ツール承認機能
- 履歴管理機能
- エクスポート機能
- パフォーマンス最適化
- エラーハンドリング強化
- 全 ANSI エスケープシーケンス対応
- シンタックスハイライト
- 高度なターミナル機能

## 各 PR の完了条件

### バックエンド PR

- [ ] 対象機能のテストが全て Green
- [ ] `npm run backend:lint` エラーなし
- [ ] TypeScript コンパイルエラーなし
- [ ] 最小限の実装（ハードコード OK）

### フロントエンド PR

- [ ] 対象機能のテストが全て Green
- [ ] `npm run frontend:lint` エラーなし
- [ ] TypeScript コンパイルエラーなし
- [ ] 最小限の実装（シンプルな UI）

## 次のフェーズへの移行条件

- [ ] コマンド入力 → 実行 → 結果表示の基本フローが動作
- [ ] 最小限の ANSI 処理（赤色のみ）が動作
- [ ] 全テストが Green
