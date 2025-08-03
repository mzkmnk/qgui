# フェーズ 1: 基盤構築 - 機能単位 TDD 実装

## 概要

YAGNI原則に従い、最小限必要な基盤機能のみを機能単位でRed→Green実装する。
各機能は独立したPRとして実装可能なサイズに分割。

## バックエンド基盤実装

### 1. ヘルスチェックAPI実装（Backend PR #1）

#### 1.1 基本ヘルスチェック機能

- [x] **スキーマ定義済**: `foundation-api.yaml` の `/health` エンドポイント
- [ ] **Red**: `health.controller.spec.ts` - GET /health のテスト作成
- [ ] **Green**: `health.controller.ts` - 最小限の実装（固定値返却）
- [ ] **動作確認**: `npm run backend:test` でテスト通過確認

### 2. WebSocket基本接続（Backend PR #2）

#### 2.1 WebSocket接続確立機能のみ

- [x] **スキーマ定義済**: `websocket.schema.yaml` の接続イベント定義
- [ ] **Red**: `websocket.gateway.spec.ts` - 接続イベントのテスト作成
- [ ] **Green**: `websocket.gateway.ts` - 接続ハンドリングのみ実装
- [ ] **動作確認**: WebSocket接続が確立できることを確認

### 3. PTYプロセス起動（Backend PR #3）

#### 3.1 プロセス起動機能のみ

- [x] **スキーマ定義済**: `pty-process.schema.yaml` のプロセス起動定義
- [ ] **Red**: `pty-manager.service.spec.ts` - プロセス起動テスト作成
- [ ] **Green**: `pty-manager.service.ts` - プロセス起動のみ実装
- [ ] **動作確認**: PTYプロセスが起動できることを確認

## フロントエンド基盤実装

### 4. ヘルスチェック呼び出し（Frontend PR #1）

#### 4.1 ヘルスチェックサービス

- [ ] **Red**: `health.service.spec.ts` - ヘルスチェックAPI呼び出しテスト
- [ ] **Green**: `health.service.ts` - HTTPクライアント実装
- [ ] **動作確認**: `npm run frontend:test` でテスト通過確認

### 5. WebSocket接続サービス（Frontend PR #2）

#### 5.1 WebSocket接続管理

- [ ] **Red**: `websocket.service.spec.ts` - WebSocket接続テスト
- [ ] **Green**: `websocket.service.ts` - 接続管理のみ実装
- [ ] **動作確認**: WebSocket接続が確立できることを確認

## 実装優先順位

1. **必須**: ヘルスチェックAPI（バックエンド→フロントエンド）
2. **必須**: WebSocket基本接続（バックエンド→フロントエンド）
3. **必須**: PTYプロセス起動（バックエンドのみ）

## 削除した項目（YAGNI原則）

以下の項目は実際に必要になるまで実装しない：

- WebSocketサービスヘルスチェック（/health/websocket）
- PTYサービスヘルスチェック（/health/pty）
- デバッグエンドポイント（/api/debug/info）
- 再接続ロジック
- エラーハンドリング強化
- パフォーマンステスト
- 統合テスト
- メッセージ送受信機能（基本接続確立後に必要になったら実装）
- プロセス終了機能（起動ができてから必要になったら実装）

## 各PRの完了条件

### バックエンドPR

- [ ] 対象機能のテストが全てGreen
- [ ] `npm run backend:lint` エラーなし
- [ ] TypeScriptコンパイルエラーなし
- [ ] 実装は最小限（ハードコードOK）

### フロントエンドPR

- [ ] 対象機能のテストが全てGreen
- [ ] `npm run frontend:lint` エラーなし
- [ ] TypeScriptコンパイルエラーなし
- [ ] 実装は最小限（モックデータOK）

## 重要な原則

1. **機能単位**: 1つのPRで1つの機能のみ実装
2. **最小実装**: まずは動くことを優先（ハードコード歓迎）
3. **独立性**: 各PRは他のPRに依存しない
4. **YAGNI**: 今必要な機能のみ実装