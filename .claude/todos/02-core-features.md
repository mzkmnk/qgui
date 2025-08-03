# フェーズ 2: コア機能実装 - TDD + スキーマ駆動開発 TODO リスト

## 概要

t-wada 推奨の TDD + スキーマ駆動開発手法に従い、Amazon Q GUI の主要機能を実装する
基盤構築（フェーズ 1）で作成したスキーマとテスト環境を活用し、コア機能を段階的に実装

## Feature 1: セッション管理機能

### Phase 1: セッション管理スキーマ定義

#### 1.1 セッションドメインモデリング

- [ ] **セッションスキーマ設計**: `schemas/session.schema.yaml` 作成
  ```yaml
  Session:
    type: object
    required: [id, name, status, createdAt]
    properties:
      id: { type: string, format: uuid }
      name: { type: string, maxLength: 100 }
      status: { enum: [active, idle, terminated] }
      createdAt: { type: string, format: date-time }
      lastAccessed: { type: string, format: date-time }
      metadata: { $ref: '#/components/schemas/SessionMetadata' }
  ```

#### 1.2 セッション API 設計

- [ ] **セッション API 設計**: `schemas/session-api.yaml` 作成
  - [ ] `POST /api/sessions` (作成)
  - [ ] `GET /api/sessions` (一覧取得)
  - [ ] `GET /api/sessions/{id}` (詳細取得)
  - [ ] `PUT /api/sessions/{id}` (更新)
  - [ ] `DELETE /api/sessions/{id}` (削除)

#### 1.3 型生成とインターフェース定義

- [ ] **型生成**: セッション関連 TypeScript 型の自動生成
- [ ] **インターフェース定義**: SessionService, SessionRepository interfaces

### Phase 2: Red フェーズ（セッション管理テスト作成）

#### 2.1 バックエンドセッションテスト（Jest）

- [ ] **テストファイル作成**: `session.service.spec.ts`
- [ ] **失敗テスト作成**: セッション作成テスト
  ```typescript
  describe('SessionService', () => {
    it('新しいセッションを作成できるべき', async () => {
      const createSessionDto = { name: 'テストセッション' };
      const result = await sessionService.createSession(createSessionDto);

      expect(result.id).toBeDefined();
      expect(result.name).toBe('テストセッション');
      expect(result.status).toBe('active');
    });
  });
  ```
- [ ] **失敗テスト作成**: セッション削除テスト（PTY プロセス終了含む）
- [ ] **失敗テスト作成**: セッション一覧取得テスト

#### 2.2 フロントエンドセッションテスト（Vitest）

- [ ] **テストファイル作成**: `session.service.spec.ts`（フロントエンド）
- [ ] **失敗テスト作成**: セッション状態管理（signals）テスト
- [ ] **失敗テスト作成**: セッション切り替えテスト

### Phase 3: Green フェーズ（セッション管理仮実装）

#### 3.1 バックエンド仮実装

- [ ] **SessionService 作成**: 最小限の CRUD 実装
  ```typescript
  @Injectable()
  export class SessionService {
    private sessions = new Map<string, Session>();

    async createSession(dto: CreateSessionDto): Promise<Session> {
      const session: Session = {
        id: 'fake-uuid-' + Date.now(),
        name: dto.name,
        status: 'active',
        createdAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
      };
      this.sessions.set(session.id, session);
      return session; // ハードコード仮実装
    }
  }
  ```
- [ ] **テスト確認**: 作成したテストが Green（成功）になることを確認

#### 3.2 フロントエンド仮実装

- [ ] **SessionStateService 作成**: signals によるセッション状態管理
- [ ] **テスト確認**: 作成したテストが Green（成功）になることを確認

### Phase 4: Refactor フェーズ（セッション管理実装改善）

#### 4.1 バックエンド実装改善

- [ ] **データベース永続化**: TypeORM エンティティとの統合
- [ ] **PTY プロセス連携**: セッション削除時のプロセス終了処理
- [ ] **テスト確認**: リファクタリング後もテストが Green を維持

#### 4.2 フロントエンド実装改善

- [ ] **HTTP 通信統合**: バックエンド API との連携
- [ ] **UI コンポーネント連携**: セッション一覧表示・切り替え機能
- [ ] **テスト確認**: リファクタリング後もテストが Green を維持

### Phase 5: セッション管理次のテストケース追加

#### 5.1 セッション管理エッジケース

- [ ] **異常系テスト**: セッション作成失敗時のエラーハンドリング
- [ ] **異常系テスト**: 存在しないセッション削除時の処理
- [ ] **パフォーマンステスト**: 多数セッション作成時の性能

## Feature 2: メッセージ表示・処理機能

### Phase 1: メッセージ処理スキーマ定義

#### 1.1 メッセージドメインモデリング

- [ ] **メッセージスキーマ設計**: `schemas/message.schema.yaml` 作成
  ```yaml
  Message:
    type: object
    required: [id, sessionId, content, type, timestamp]
    properties:
      id: { type: string, format: uuid }
      sessionId: { type: string, format: uuid }
      content: { type: string }
      type: { enum: [user, assistant, system, error] }
      metadata: { $ref: '#/components/schemas/MessageMetadata' }
      ansiData: { $ref: '#/components/schemas/ANSIData' }
  ```

#### 1.2 ANSI 処理スキーマ設計

- [ ] **ANSI スキーマ設計**: `schemas/ansi.schema.yaml` 作成
  - [ ] ANSI カラーコード定義
  - [ ] テキストスタイル定義（bold, italic, underline）
  - [ ] カーソル制御コード定義

### Phase 2: Red フェーズ（メッセージ処理テスト作成）

#### 2.1 ANSI パーサーテスト作成

- [ ] **テストファイル作成**: `ansi-parser.service.spec.ts`
- [ ] **失敗テスト作成**: ANSI カラーコード解析テスト
  ```typescript
  describe('ANSIParserService', () => {
    it('ANSIカラーコードを正しくパースできるべき', () => {
      const input = '\x1b[31mRed Text\x1b[0m';
      const result = ansiParser.parse(input);

      expect(result.segments).toHaveLength(1);
      expect(result.segments[0].text).toBe('Red Text');
      expect(result.segments[0].style.color).toBe('red');
    });
  });
  ```
- [ ] **失敗テスト作成**: テキストスタイル処理テスト
- [ ] **失敗テスト作成**: 不要エスケープシーケンス除去テスト

### Phase 3: Green フェーズ（メッセージ処理仮実装）

#### 3.1 ANSI パーサー仮実装

- [ ] **ANSIParserService 作成**: 最小限の解析機能
  ```typescript
  @Injectable()
  export class ANSIParserService {
    parse(input: string): ParsedANSI {
      // ハードコード仮実装
      if (input.includes('\x1b[31m')) {
        return {
          segments: [
            {
              text: 'Red Text',
              style: { color: 'red' },
            },
          ],
        };
      }
      return { segments: [{ text: input, style: {} }] };
    }
  }
  ```
- [ ] **テスト確認**: 作成したテストが Green（成功）になることを確認

### Phase 4: Refactor フェーズ（メッセージ処理実装改善）

#### 4.1 ANSI パーサー実装改善

- [ ] **実際の正規表現処理**: ANSI エスケープシーケンスの完全対応
- [ ] **パフォーマンス最適化**: 大量テキスト処理対応
- [ ] **テスト確認**: リファクタリング後もテストが Green を維持

### Phase 5: メッセージ処理次のテストケース追加

#### 5.1 メッセージ処理エッジケース

- [ ] **異常系テスト**: 不正な ANSI シーケンス処理
- [ ] **パフォーマンステスト**: 大容量メッセージ処理性能
- [ ] **統合テスト**: リアルタイムメッセージ表示テスト

## ベビーステップ実践例

### Example: セッション作成機能の実装

#### Step 1: スキーマ定義

```yaml
CreateSessionDto:
  type: object
  required: [name]
  properties:
    name: { type: string, minLength: 1, maxLength: 100 }
```

#### Step 2: Red

```typescript
it('should create new session', async () => {
  const dto = { name: 'Test Session' };
  const result = await service.createSession(dto);
  expect(result.name).toBe('Test Session');
});
```

#### Step 3: Green

```typescript
async createSession(dto: CreateSessionDto): Promise<Session> {
  return { id: '1', name: dto.name, status: 'active' } as Session;
}
```

#### Step 4: Refactor

```typescript
async createSession(dto: CreateSessionDto): Promise<Session> {
  const session = new Session();
  session.id = uuid();
  session.name = dto.name;
  session.status = SessionStatus.ACTIVE;
  return await this.repository.save(session);
}
```

## 完了条件

### Feature 完了の定義

- [ ] **全スキーマ定義完了**: 各機能のスキーマが yaml 形式で定義済み
- [ ] **全テスト Green**: 作成したすべてのテストが成功
- [ ] **カバレッジ目標**: 機能別テストカバレッジ 80%以上
- [ ] **統合テスト成功**: フロントエンド・バックエンド統合動作確認

## 次フェーズ（認証・セキュリティ）への引き継ぎ

- [ ] **機能スキーマ**: セッション・メッセージ管理の完成したスキーマ
- [ ] **テストスイート**: 各機能の包括的テストスイート
- [ ] **実装パターン**: TDD ベストプラクティス事例集
  - [ ] カスタムカラー設定機能
- [ ] パフォーマンス最適化
  - [ ] 大量テキスト処理の最適化
  - [ ] 仮想スクロール導入検討
  - [ ] メモリリーク対策

### マークダウンレンダリング

- [ ] マークダウンパーサー実装
  - [ ] 基本的なマークダウン構文サポート
  - [ ] コードブロックの特別処理
  - [ ] リンクのサニタイゼーション
- [ ] カスタムレンダラー実装
  - [ ] thinking ブロックの特別表示
  - [ ] ツール使用ブロックの強調表示
  - [ ] システムメッセージの区別表示
- [ ] リアルタイムレンダリング
  - [ ] ストリーミング中の段階的レンダリング
  - [ ] 不完全なマークダウンの処理
  - [ ] レンダリング結果のキャッシュ

### コードシンタックスハイライト

- [ ] シンタックスハイライト機能
  - [ ] Prism.js または highlight.js 統合
  - [ ] 主要言語サポート（TypeScript, Python, Go 等）
  - [ ] 動的言語検出
- [ ] コードブロック機能拡張
  - [ ] コピー&ペースト機能
  - [ ] 行番号表示
  - [ ] コード折りたたみ機能
  - [ ] ファイル名表示

## ターミナル機能実装

### xterm.js 統合

- [ ] ターミナルエミュレーション基盤
  - [ ] xterm.js インストール・設定
  - [ ] FitAddon 統合（リサイズ対応）
  - [ ] WebLinksAddon 統合（URL クリック対応）
  - [ ] Search Addon 統合（検索機能）
- [ ] ターミナル表示設定
  - [ ] フォント設定（Fira Code 等）
  - [ ] カラーテーマ設定
  - [ ] カーソル設定
  - [ ] スクロールバッファ設定
- [ ] リサイズ対応
  - [ ] ウィンドウリサイズ検知
  - [ ] PTY プロセスへのサイズ通知
  - [ ] レスポンシブ対応
- [ ] キーボード入力処理
  - [ ] 特殊キー（Ctrl+C, Ctrl+D 等）の処理
  - [ ] 日本語入力対応
  - [ ] ショートカットキー設定

### ツール承認機能

- [ ] ツール承認 UI 実装
  - [ ] 承認ダイアログコンポーネント
  - [ ] ツール情報表示（名前、説明、リスク レベル）
  - [ ] 承認・拒否ボタン
  - [ ] 今回のセッションで信頼する機能
- [ ] ツール承認フロー実装
  - [ ] ツール実行要求の検知
  - [ ] ユーザー承認待ち状態管理
  - [ ] 承認結果の Amazon Q CLI への送信
  - [ ] タイムアウト処理
- [ ] ツール信頼管理
  - [ ] 信頼済みツールの管理
  - [ ] セッション単位の信頼設定
  - [ ] 全体設定での信頼ツール管理
- [ ] ツール実行結果表示
  - [ ] 実行中インジケーター
  - [ ] 実行結果の整形表示
  - [ ] エラー時の適切な表示
  - [ ] 実行時間の表示

## 履歴管理機能

### データベース統合

- [ ] SQLite データベース設定
  - [ ] TypeORM 設定
  - [ ] エンティティ定義（Session, Message, ToolApproval 等）
  - [ ] マイグレーション設定
  - [ ] インデックス設定
- [ ] リポジトリパターン実装
  - [ ] SessionRepository 実装
  - [ ] MessageRepository 実装
  - [ ] ToolApprovalRepository 実装
- [ ] データベース操作最適化
  - [ ] バッチインサート機能
  - [ ] 定期的なデータクリーンアップ
  - [ ] パフォーマンスチューニング

### チャット履歴機能

- [ ] 履歴保存機能
  - [ ] メッセージの自動保存
  - [ ] セッション情報の更新
  - [ ] ツール使用履歴の記録
- [ ] 履歴読み込み・表示
  - [ ] セッション履歴一覧
  - [ ] メッセージ履歴の復元
  - [ ] ページネーション実装
  - [ ] 無限スクロール実装
- [ ] 履歴検索機能
  - [ ] 全文検索実装（FTS5 使用）
  - [ ] フィルタリング機能
  - [ ] 日付範囲指定
  - [ ] セッション絞り込み

### エクスポート機能

- [ ] データエクスポート機能
  - [ ] Markdown 形式エクスポート
  - [ ] JSON 形式エクスポート
  - [ ] PDF 生成機能
- [ ] インポート機能
  - [ ] 履歴データのインポート
  - [ ] データ形式バリデーション
  - [ ] 重複データの処理

## エラーハンドリング強化

### グローバルエラーハンドラー

- [ ] フロントエンドエラーハンドリング
  - [ ] グローバルエラーハンドラー実装
  - [ ] エラーログ収集
  - [ ] ユーザーフレンドリーなエラー表示
  - [ ] エラー復旧機能
- [ ] バックエンドエラーハンドリング
  - [ ] 例外フィルター実装
  - [ ] エラーレスポンス標準化
  - [ ] ログ出力設定
  - [ ] アラート機能

### 自動復旧機能

- [ ] WebSocket 再接続機能
  - [ ] 接続断検知
  - [ ] 指数バックオフによる再接続
  - [ ] 接続状態 UI 表示
- [ ] PTY プロセス復旧
  - [ ] プロセス異常終了検知
  - [ ] 自動再起動機能
  - [ ] セッション状態復旧
- [ ] データ整合性チェック
  - [ ] データベース整合性確認
  - [ ] 不整合データの修復
  - [ ] バックアップ・復元機能

## パフォーマンス最適化

### フロントエンド最適化

- [ ] レンダリング最適化
  - [ ] OnPush 変更検知戦略
  - [ ] signals による効率的な状態管理
  - [ ] lazy loading の適用
- [ ] メモリ管理
  - [ ] メモリリーク対策
  - [ ] 不要なサブスクリプションの解除
  - [ ] 大量メッセージ表示の最適化

### バックエンド最適化

- [ ] WebSocket パフォーマンス
  - [ ] メッセージバッファリング
  - [ ] 圧縮機能の有効化
  - [ ] レート制限実装
- [ ] データベースパフォーマンス
  - [ ] クエリ最適化
  - [ ] 接続プール設定
  - [ ] インデックス最適化

## テスト実装

### 単体テスト

- [ ] フロントエンド単体テスト
  - [ ] コンポーネントテスト
  - [ ] サービステスト
  - [ ] パイプテスト
- [ ] バックエンド単体テスト
  - [ ] サービステスト
  - [ ] リポジトリテスト
  - [ ] ゲートウェイテスト

### 統合テスト

- [ ] WebSocket 通信テスト
- [ ] データベース統合テスト
- [ ] PTY プロセス統合テスト

## 成果物・確認項目

- [ ] フル機能のチャットインターフェース動作確認
- [ ] セッション管理機能動作確認
- [ ] ツール承認フロー動作確認
- [ ] 履歴保存・読み込み動作確認
- [ ] エラーハンドリング動作確認
- [ ] パフォーマンス指標の測定

## 次フェーズへの準備

- [ ] セキュリティ機能要件の確認
- [ ] 認証システム設計の準備
- [ ] UI/UX 改善項目の整理
