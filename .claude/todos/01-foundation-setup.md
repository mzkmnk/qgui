# フェーズ 1: 基盤構築 - TDD + スキーマ駆動開発 TODO リスト

## 概要

t-wada 推奨の TDD + スキーマ駆動開発手法に従い、プロジェクト基盤を構築する

## Phase 1: スキーマ定義フェーズ

### 1.1 要件分析とドメインモデリング

**目標**: WebSocket 通信と Amazon Q CLI 統合の基本機能を定義

#### 1.1.1 WebSocket 通信スキーマ設計

- [x] **スキーマ設計**: `schemas/websocket.schema.yaml` 作成
  - [x] WebSocket メッセージフォーマット定義
  - [x] 接続・切断イベント定義
  - [x] エラーハンドリング定義
- [x] **型生成**: WebSocket 関連 TypeScript 型の自動生成設定
- [x] **インターフェース定義**: WebSocketGateway, WebSocketService interfaces

#### 1.1.2 PTY プロセス管理スキーマ設計

- [x] **スキーマ設計**: `schemas/pty-process.schema.yaml` 作成
  - [x] PTY プロセス状態定義（idle, running, error, terminated）
  - [x] 入出力メッセージフォーマット定義
  - [x] プロセスライフサイクルイベント定義
- [x] **型生成**: PTY 関連 TypeScript 型の自動生成設定
- [x] **インターフェース定義**: PTYManager, ProcessSession interfaces

### 1.2 API エンドポイント設計

- [x] **基盤 API 設計**: `schemas/foundation-api.yaml` 作成
  - [x] ヘルスチェックエンドポイント（`/health`, `/health/websocket`, `/health/pty`）
  - [x] 接続状態エンドポイント（`/api/connection/status`）
  - [x] デバッグエンドポイント（`/api/debug/info`）

## Phase 2: Red フェーズ（失敗するテストを書く）

### 2.1 WebSocket 接続基盤テスト作成

#### 2.1.1 バックエンド WebSocket テスト（Jest）

- [ ] **テストファイル作成**: `websocket.gateway.spec.ts`
- [ ] **失敗テスト作成**: WebSocket 接続確立テスト
  ```typescript
  describe('WebSocketGateway', () => {
    it('クライアント接続時に接続イベントを発火すべき', async () => {
      // このテストは最初失敗する（実装がないため）
    });
  });
  ```
- [ ] **失敗テスト作成**: メッセージ送受信テスト
- [ ] **失敗テスト作成**: 切断処理テスト

#### 2.1.2 フロントエンド WebSocket テスト（Vitest）

- [ ] **テストファイル作成**: `websocket.service.spec.ts`
- [ ] **失敗テスト作成**: WebSocket サービス初期化テスト
- [ ] **失敗テスト作成**: 再接続ロジックテスト
- [ ] **失敗テスト作成**: 接続状態管理（signals）テスト

### 2.2 PTY プロセス管理テスト作成

#### 2.2.1 バックエンド PTY テスト（Jest）

- [ ] **テストファイル作成**: `pty-manager.service.spec.ts`
- [ ] **失敗テスト作成**: PTY プロセス起動テスト
- [ ] **失敗テスト作成**: プロセス終了テスト
- [ ] **失敗テスト作成**: 入出力処理テスト

## Phase 3: Green フェーズ（テストを通す最小限の実装）

### 3.1 WebSocket 基盤の仮実装

#### 3.1.1 バックエンド仮実装

- [ ] **WebSocketGateway 作成**: 最小限の接続・切断処理
  ```typescript
  @WebSocketGateway()
  export class WebSocketGateway {
    handleConnection(client: Socket) {
      // ハードコードでテストを通す仮実装
      client.emit('connected', { status: 'connected' });
    }
  }
  ```
- [ ] **テスト確認**: 作成したテストが Green（成功）になることを確認

#### 3.1.2 フロントエンド仮実装

- [ ] **WebSocketService 作成**: 最小限の接続管理
- [ ] **テスト確認**: 作成したテストが Green（成功）になることを確認

### 3.2 PTY プロセス管理の仮実装

#### 3.2.1 バックエンド仮実装

- [ ] **PTYManagerService 作成**: プロセス起動の仮実装
  ```typescript
  export class PTYManagerService {
    startProcess(): Promise<string> {
      // ハードコードでテストを通す仮実装
      return Promise.resolve('fake-process-id');
    }
  }
  ```
- [ ] **テスト確認**: 作成したテストが Green（成功）になることを確認

## Phase 4: Refactor フェーズ（実装を改善）

### 4.1 WebSocket 実装の改善

- [ ] **実際の Socket.io 統合**: ハードコードを実際の Socket.io 実装に置換
- [ ] **エラーハンドリング強化**: 接続エラー、タイムアウト処理追加
- [ ] **テスト確認**: リファクタリング後もテストが Green を維持

### 4.2 PTY 実装の改善

- [ ] **実際の node-pty 統合**: ハードコードを実際の node-pty 実装に置換
- [ ] **プロセス監視機能**: プロセス状態監視とクリーンアップ処理追加
- [ ] **テスト確認**: リファクタリング後もテストが Green を維持

## Phase 5: 次のテストケース追加

### 5.1 エッジケースのテスト追加

- [ ] **異常系テスト**: ネットワーク切断時の再接続テスト
- [ ] **異常系テスト**: PTY プロセス異常終了時の復旧テスト
- [ ] **パフォーマンステスト**: 同時接続数制限テスト

### 5.2 統合テストの追加

- [ ] **E2E テスト**: WebSocket + PTY 統合動作テスト
- [ ] **E2E テスト**: フロントエンド・バックエンド統合テスト

## 開発環境整備（TDD 支援ツール）

### 6.1 TDD 環境設定

- [ ] **Jest 設定強化**: バックエンド TDD 環境（watch mode, coverage）
- [ ] **Vitest 設定強化**: フロントエンド TDD 環境（watch mode, coverage）
- [ ] **テストヘルパー**: モック・スタブ作成ユーティリティ

### 6.2 開発フローツール整備

- [ ] **ホットリロード**: テスト変更時の自動実行設定
- [ ] **デバッグ設定**: テストデバッグ用 VSCode 設定
- [ ] **型チェック**: リアルタイム型チェック設定

## ベビーステップ実践例

### Example: WebSocket 接続機能の実装

#### Step 1: スキーマ定義

```yaml
# schemas/websocket.schema.yaml（最小限）
WebSocketMessage:
  type: object
  required: [type, data]
  properties:
    type:
      enum: [connect, disconnect, message]
    data: any
```

#### Step 2: Red

```typescript
// websocket.gateway.spec.ts（1つの失敗テスト）
it('should emit connection event', () => {
  const gateway = new WebSocketGateway();
  const mockClient = { emit: jest.fn() };

  gateway.handleConnection(mockClient);

  expect(mockClient.emit).toHaveBeenCalledWith('connected');
});
```

#### Step 3: Green

```typescript
// websocket.gateway.ts（最小実装）
export class WebSocketGateway {
  handleConnection(client: any) {
    client.emit('connected'); // ハードコード
  }
}
```

#### Step 4: Refactor

```typescript
// websocket.gateway.ts（改善実装）
export class WebSocketGateway {
  handleConnection(client: Socket) {
    const connectionData = {
      id: client.id,
      timestamp: new Date(),
    };
    client.emit('connected', connectionData);
  }
}
```

#### Step 5: 次のテスト

```typescript
// 次の失敗テスト
it('should handle disconnect event', () => {
  // 新たな失敗テストを追加
});
```

## 重要な原則

### 1. 一度に 1 つだけ

- **1 つのテストケースのみ**を作成・実装
- **1 つの小さな機能のみ**に集中
- **短時間**で完了する作業単位

### 2. 必ず順序を守る

1. **スキーマファースト**: 必ず型・インターフェース定義から開始
2. **テストファースト**: 実装前に必ずテストを作成
3. **Red → Green → Refactor**: この順序を厳密に守る

### 3. 仮実装を恐れない

- **ハードコード大歓迎**: 最初は固定値で問題なし
- **段階的改善**: 少しずつ一般化
- **完璧主義排除**: まず動作することを優先

## 完了条件

### Phase 1 完了の定義

- [ ] **全スキーマ定義完了**: WebSocket, PTY, API 仕様が yaml 形式で定義済み
- [ ] **型生成成功**: すべての型が正常に生成され、TypeScript コンパイル成功
- [ ] **基本テスト作成完了**: 少なくとも各機能 1 つずつのテストが作成済み

### Phase 2-5 完了の定義

- [ ] **全テスト Green**: 作成したすべてのテストが成功
- [ ] **カバレッジ目標**: テストカバレッジ 80%以上
- [ ] **型安全性**: TypeScript strict mode でエラーなし

## 次フェーズ（コア機能実装）への引き継ぎ

- [ ] **スキーマ資産**: 完成したスキーマファイル群
- [ ] **テスト資産**: 基盤機能のテストスイート
- [ ] **実装パターン**: TDD サイクルの実践例とノウハウ
- [ ] **CI/CD 設定**: 自動テスト実行環境
