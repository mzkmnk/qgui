# フェーズ 1: 基盤構築 - 機能単位 TDD 実装

## 概要

YAGNI 原則に従い、最小限必要な基盤機能のみを機能単位で Red→Green 実装する。
各機能は独立した PR として実装可能なサイズに分割。

## バックエンド基盤実装

### 1. ヘルスチェック API 実装

#### 1.1 基本ヘルスチェック機能

- [x] **スキーマ定義済**: `foundation-api.yaml` の `/health` エンドポイント
- [ ] **Red**: `health.controller.spec.ts` - GET /health のテスト作成
- [ ] **Green**: `health.controller.ts` - 最小限の実装（固定値返却）
- [ ] **動作確認**: `npm run backend:test` でテスト通過確認

### 2. WebSocket 基本接続

#### 2.1 WebSocket 接続確立機能のみ

- [x] **スキーマ定義済**: `websocket.schema.yaml` の接続イベント定義
- [x] **Red**: `websocket.gateway.spec.ts` - 接続イベントのテスト作成
- [x] **Green**: `websocket.gateway.ts` - 接続ハンドリングのみ実装
- [x] **動作確認**: WebSocket 接続が確立できることを確認

### 3. PTY プロセス起動

#### 3.1 プロセス起動機能のみ

- [x] **スキーマ定義済**: `pty-process.schema.yaml` のプロセス起動定義
- [ ] **Red**: `pty-manager.service.spec.ts` - プロセス起動テスト作成
- [ ] **Green**: `pty-manager.service.ts` - プロセス起動のみ実装
- [ ] **動作確認**: PTY プロセスが起動できることを確認

## フロントエンド基盤実装

### 4. ヘルスチェック呼び出し

#### 4.1 ヘルスチェックサービス

- [ ] **Red**: `health.service.spec.ts` - ヘルスチェック API 呼び出しテスト
- [ ] **Green**: `health.service.ts` - HTTP クライアント実装
- [ ] **動作確認**: `npm run frontend:test` でテスト通過確認

### 5. WebSocket 接続サービス

#### 5.1 WebSocket 接続管理

- [ ] **Red**: `websocket.service.spec.ts` - WebSocket 接続テスト
- [ ] **Green**: `websocket.service.ts` - 接続管理のみ実装
- [ ] **動作確認**: WebSocket 接続が確立できることを確認

## 実装優先順位

1. **必須**: ヘルスチェック API（バックエンド → フロントエンド）
2. **必須**: WebSocket 基本接続（バックエンド → フロントエンド）
3. **必須**: PTY プロセス起動（バックエンドのみ）

## 削除した項目（YAGNI 原則）

以下の項目は実際に必要になるまで実装しない：

- WebSocket サービスヘルスチェック（/health/websocket）
- PTY サービスヘルスチェック（/health/pty）
- デバッグエンドポイント（/api/debug/info）
- 再接続ロジック
- エラーハンドリング強化
- パフォーマンステスト
- 統合テスト
- メッセージ送受信機能（基本接続確立後に必要になったら実装）
- プロセス終了機能（起動ができてから必要になったら実装）

## 各 PR の完了条件

### バックエンド PR

- [ ] 対象機能のテストが全て Green
- [ ] `npm run backend:lint` エラーなし
- [ ] TypeScript コンパイルエラーなし
- [ ] 実装は最小限（ハードコード OK）

### フロントエンド PR

- [ ] 対象機能のテストが全て Green
- [ ] `npm run frontend:lint` エラーなし
- [ ] TypeScript コンパイルエラーなし
- [ ] 実装は最小限（モックデータ OK）

## 重要な原則

1. **機能単位**: 1 つの PR で 1 つの機能のみ実装
2. **最小実装**: まずは動くことを優先（ハードコード歓迎）
3. **独立性**: 各 PR は他の PR に依存しない
4. **YAGNI**: 今必要な機能のみ実装
