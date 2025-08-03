# データベーススキーマ実装 TODO リスト

## 概要

Amazon Q GUI アプリケーションの SQLite データベース設計・実装の詳細項目

## データベース基盤設計

### SQLite 設定・最適化

- [ ] SQLite 基本設定
  - [ ] データベースファイル配置設計
  - [ ] 接続設定最適化
  - [ ] PRAGMA 設定（WAL, synchronous 等）
  - [ ] メモリ設定調整
- [ ] パフォーマンス設定
  - [ ] cache_size 設定
  - [ ] temp_store 設定
  - [ ] journal_mode 設定（WAL 推奨）
  - [ ] synchronous 設定
- [ ] セキュリティ設定
  - [ ] データベース暗号化検討
  - [ ] アクセス権限設定
  - [ ] バックアップ暗号化
  - [ ] 機密情報保護

### TypeORM 統合設定

- [ ] TypeORM 設定
  - [ ] データソース設定
  - [ ] エンティティ自動検出
  - [ ] マイグレーション設定
  - [ ] ロギング設定
- [ ] 接続管理
  - [ ] 接続プール設定
  - [ ] 接続タイムアウト設定
  - [ ] リトライ設定
  - [ ] エラーハンドリング
- [ ] 開発・テスト設定分離
  - [ ] 環境別設定ファイル
  - [ ] 開発用初期データ
  - [ ] テスト用データベース設定
  - [ ] 設定バリデーション

## エンティティ設計・実装

### User エンティティ実装

- [ ] User 基本エンティティ
  ```typescript
  @Entity('users')
  export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column()
    passwordHash: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'json', nullable: true })
    preferences: UserPreferences;
  }
  ```
- [ ] User 関連設定
  - [ ] インデックス設計（username, email）
  - [ ] バリデーション設定
  - [ ] デフォルト値設定
  - [ ] JSON 列の型安全性確保
- [ ] リレーション設定
  - [ ] User ↔ Session 関連
  - [ ] User ↔ ToolApproval 関連
  - [ ] カスケード設定
  - [ ] 削除制約設定

### Session エンティティ実装

- [ ] Session 基本エンティティ
  ```typescript
  @Entity('sessions')
  export class SessionEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    @Column()
    title: string;

    @Column({ nullable: true })
    workspace: string;

    @Column({
      type: 'varchar',
      enum: SessionStatus,
      default: SessionStatus.ACTIVE,
    })
    status: SessionStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ nullable: true })
    lastMessageAt: Date;

    @Column({ default: 0 })
    messageCount: number;

    @Column({ type: 'json', nullable: true })
    metadata: SessionMetadata;
  }
  ```
- [ ] Session 詳細設定
  - [ ] セッション状態管理
  - [ ] メタデータ構造設計
  - [ ] インデックス設計
  - [ ] パフォーマンス最適化
- [ ] Session 機能拡張
  - [ ] セッション自動タイトル生成
  - [ ] セッション統計情報
  - [ ] セッション検索機能
  - [ ] セッション分類・タグ機能

### Message エンティティ実装

- [ ] Message 基本エンティティ
  ```typescript
  @Entity('messages')
  export class MessageEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => SessionEntity)
    @JoinColumn({ name: 'session_id' })
    session: SessionEntity;

    @Column({
      type: 'varchar',
      enum: MessageRole,
    })
    role: MessageRole;

    @Column({ type: 'text' })
    content: string;

    @Column({
      type: 'varchar',
      enum: MessageFormat,
      default: MessageFormat.TEXT,
    })
    format: MessageFormat;

    @CreateDateColumn()
    timestamp: Date;

    @Column({ type: 'json', nullable: true })
    metadata: MessageMetadata;

    @Column({ type: 'json', nullable: true })
    toolRequest: ToolRequest;

    @Column({ type: 'json', nullable: true })
    toolResponse: ToolResponse;
  }
  ```
- [ ] Message 詳細設定
  - [ ] 大容量コンテンツ対応
  - [ ] メッセージ形式バリデーション
  - [ ] メタデータスキーマ設計
  - [ ] インデックス戦略
- [ ] Message 機能拡張
  - [ ] メッセージ検索最適化
  - [ ] メッセージ分類・フィルタリング
  - [ ] メッセージ統計機能
  - [ ] メッセージエクスポート対応

### ToolApproval エンティティ実装

- [ ] ToolApproval 基本エンティティ
  ```typescript
  @Entity('tool_approvals')
  export class ToolApprovalEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => SessionEntity)
    @JoinColumn({ name: 'session_id' })
    session: SessionEntity;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    @Column()
    toolName: string;

    @Column({ type: 'text' })
    command: string;

    @Column({ type: 'text', nullable: true })
    purpose: string;

    @Column({
      type: 'varchar',
      enum: ToolApprovalStatus,
    })
    approvalStatus: ToolApprovalStatus;

    @Column({
      type: 'varchar',
      enum: ToolRiskLevel,
    })
    riskLevel: ToolRiskLevel;

    @CreateDateColumn()
    requestedAt: Date;

    @Column({ nullable: true })
    approvedAt: Date;

    @Column({ type: 'json', nullable: true })
    parameters: Record<string, any>;

    @Column({ type: 'json', nullable: true })
    executionResult: ToolExecutionResult;
  }
  ```
- [ ] ToolApproval 詳細設定
  - [ ] 承認履歴管理
  - [ ] ツール分類・カテゴリー
  - [ ] リスクレベル自動判定
  - [ ] 実行結果保存

### 補助エンティティ実装

- [ ] UserPreferences エンティティ
  - [ ] テーマ設定
  - [ ] 言語設定
  - [ ] 通知設定
  - [ ] デフォルト値管理
- [ ] SessionTag エンティティ
  - [ ] セッション分類
  - [ ] カスタムタグ
  - [ ] タグ統計
  - [ ] タグ検索
- [ ] AuditLog エンティティ
  - [ ] 操作ログ記録
  - [ ] セキュリティイベント
  - [ ] アクセス履歴
  - [ ] 変更履歴

## インデックス・パフォーマンス最適化

### プライマリインデックス設計

- [ ] 基本インデックス
  - [ ] users: username, email（UNIQUE）
  - [ ] sessions: user_id, status, created_at
  - [ ] messages: session_id, timestamp
  - [ ] tool_approvals: session_id, user_id, tool_name
- [ ] 複合インデックス設計
  - [ ] sessions: (user_id, status, updated_at)
  - [ ] messages: (session_id, role, timestamp)
  - [ ] tool_approvals: (user_id, approval_status, requested_at)
  - [ ] messages: (session_id, format, timestamp)
- [ ] 部分インデックス
  - [ ] アクティブセッションのみ
  - [ ] 最近のメッセージのみ
  - [ ] 承認待ちツールのみ
  - [ ] エラーメッセージのみ

### クエリ最適化

- [ ] 頻繁なクエリ最適化
  - [ ] セッション一覧取得
  - [ ] メッセージ履歴取得
  - [ ] ユーザー認証クエリ
  - [ ] 検索クエリ最適化
- [ ] 重いクエリ特定・改善
  - [ ] EXPLAIN QUERY PLAN 分析
  - [ ] N+1 問題解決
  - [ ] バッチクエリ実装
  - [ ] キャッシュ戦略
- [ ] ページネーション最適化
  - [ ] カーソルベースページネーション
  - [ ] オフセット最適化
  - [ ] 大量データ処理
  - [ ] 無限スクロール対応

## 全文検索実装

### SQLite FTS5 設定

- [ ] FTS5 仮想テーブル作成
  ```sql
  CREATE VIRTUAL TABLE messages_fts USING fts5(
    content,
    session_id UNINDEXED,
    role UNINDEXED,
    timestamp UNINDEXED,
    content='messages',
    content_rowid='id'
  );
  ```
- [ ] FTS5 トリガー設定
  - [ ] INSERT 時の自動インデックス更新
  - [ ] UPDATE 時のインデックス更新
  - [ ] DELETE 時のインデックス削除
  - [ ] バッチ更新最適化
- [ ] 検索機能実装
  - [ ] キーワード検索
  - [ ] フレーズ検索
  - [ ] 前方一致・部分一致
  - [ ] AND/OR/NOT 演算子対応

### 高度な検索機能

- [ ] 検索結果ランキング
  - [ ] BM25 ランキング
  - [ ] カスタムランキング関数
  - [ ] 日付重み付け
  - [ ] ユーザー行動ベース重み付け
- [ ] 検索結果ハイライト
  - [ ] snippet()関数活用
  - [ ] カスタムハイライト実装
  - [ ] HTML 出力対応
  - [ ] コンテキスト表示
- [ ] 検索フィルタリング
  - [ ] セッション絞り込み
  - [ ] 日付範囲指定
  - [ ] メッセージタイプフィルタ
  - [ ] ツール関連フィルタ

## データマイグレーション

### 初期マイグレーション

- [ ] スキーマ作成マイグレーション
  - [ ] テーブル定義
  - [ ] インデックス作成
  - [ ] 制約設定
  - [ ] デフォルトデータ投入
- [ ] 開発データセットアップ
  - [ ] テストユーザー作成
  - [ ] サンプルセッション作成
  - [ ] サンプルメッセージ作成
  - [ ] 開発用設定データ

### 段階的マイグレーション計画

- [ ] バージョン管理戦略
  - [ ] スキーマバージョン管理
  - [ ] 前方互換性確保
  - [ ] 後方互換性考慮
  - [ ] ロールバック戦略
- [ ] データ変換マイグレーション
  - [ ] 既存データ変換
  - [ ] データ整合性チェック
  - [ ] バックアップ・復元
  - [ ] 段階的移行

### マイグレーション実行環境

- [ ] マイグレーション実行ツール
  - [ ] TypeORM マイグレーション活用
  - [ ] カスタムマイグレーションスクリプト
  - [ ] 実行前チェック機能
  - [ ] 実行後検証機能
- [ ] 環境別実行戦略
  - [ ] 開発環境自動実行
  - [ ] ローカル環境手動確認
  - [ ] テスト環境検証
  - [ ] CI/CD 統合

## リポジトリパターン実装

### BaseRepository 実装

- [ ] 共通リポジトリクラス
  ```typescript
  export abstract class BaseRepository<T extends BaseEntity> {
    constructor(protected repository: Repository<T>, protected logger: Logger) {}

    async findById(id: string): Promise<T | null> {
      // 基本実装
    }

    async save(entity: T): Promise<T> {
      // 基本実装
    }

    async softDelete(id: string): Promise<void> {
      // 基本実装
    }
  }
  ```
- [ ] 共通機能実装
  - [ ] CRUD 基本操作
  - [ ] エラーハンドリング
  - [ ] ログ出力
  - [ ] トランザクション管理
- [ ] バリデーション機能
  - [ ] 保存前バリデーション
  - [ ] 業務ルールチェック
  - [ ] データ整合性チェック
  - [ ] エラーメッセージ生成

### 専用リポジトリ実装

- [ ] UserRepository 実装
  - [ ] ユーザー認証関連クエリ
  - [ ] ユーザー検索機能
  - [ ] プロファイル管理
  - [ ] 権限チェック機能
- [ ] SessionRepository 実装
  - [ ] セッション一覧取得
  - [ ] セッション統計情報
  - [ ] セッション検索機能
  - [ ] アクティブセッション管理
- [ ] MessageRepository 実装
  - [ ] メッセージ履歴取得
  - [ ] 全文検索統合
  - [ ] メッセージ統計
  - [ ] バッチ保存機能
- [ ] ToolApprovalRepository
  - [ ] 承認履歴管理
  - [ ] 統計情報取得
  - [ ] 承認状況監視
  - [ ] 自動承認ルール適用

### 高度なクエリ実装

- [ ] 統計・分析クエリ
  - [ ] ユーザー活動統計
  - [ ] セッション統計
  - [ ] メッセージ統計
  - [ ] ツール使用統計
- [ ] レポート生成クエリ
  - [ ] 日別レポート
  - [ ] 週別・月別レポート
  - [ ] ユーザー別レポート
  - [ ] 機能別レポート
- [ ] 予測・トレンド分析
  - [ ] 使用量予測
  - [ ] トレンド分析
  - [ ] 異常検知
  - [ ] パフォーマンス分析

## データ整合性・制約

### 参照整合性制約

- [ ] 外部キー制約設計
  - [ ] CASCADE 設定
  - [ ] RESTRICT 設定
  - [ ] SET NULL 設定
  - [ ] 制約エラーハンドリング
- [ ] データ整合性チェック
  - [ ] 定期的整合性チェック
  - [ ] 不整合データ検出
  - [ ] 自動修復機能
  - [ ] 手動修復ツール

### ビジネスルール制約

- [ ] アプリケーションレベル制約
  - [ ] ユーザー権限制約
  - [ ] セッション状態制約
  - [ ] メッセージ形式制約
  - [ ] ツール承認制約
- [ ] データバリデーション
  - [ ] 入力値検証
  - [ ] フォーマット検証
  - [ ] 範囲検証
  - [ ] 一意性検証

### トランザクション管理

- [ ] トランザクション戦略
  - [ ] 読み取り専用トランザクション
  - [ ] 書き込みトランザクション
  - [ ] 長時間トランザクション対策
  - [ ] デッドロック対策
- [ ] 分散トランザクション
  - [ ] マルチテーブル更新
  - [ ] 外部システム連携
  - [ ] 補償トランザクション
  - [ ] Saga パターン実装

## バックアップ・復旧

### バックアップ戦略

- [ ] 定期バックアップ
  - [ ] 日次バックアップ
  - [ ] 増分バックアップ
  - [ ] バックアップローテーション
  - [ ] バックアップ検証
- [ ] リアルタイムバックアップ
  - [ ] WAL ファイルバックアップ
  - [ ] 継続的バックアップ
  - [ ] ポイント in タイムリカバリ
  - [ ] 自動バックアップ

### 復旧機能

- [ ] データ復旧ツール
  - [ ] 完全復旧機能
  - [ ] 部分復旧機能
  - [ ] 選択的復旧機能
  - [ ] 復旧検証機能
- [ ] 災害復旧計画
  - [ ] 復旧手順書
  - [ ] 復旧テスト
  - [ ] 復旧時間目標設定
  - [ ] データ損失許容範囲設定

## 監視・メンテナンス

### データベース監視

- [ ] パフォーマンス監視
  - [ ] クエリ実行時間監視
  - [ ] ロック監視
  - [ ] デッドロック検出
  - [ ] I/O 監視
- [ ] リソース監視
  - [ ] ディスク使用量監視
  - [ ] メモリ使用量監視
  - [ ] 接続数監視
  - [ ] キャッシュヒット率監視

### 定期メンテナンス

- [ ] データクリーンアップ
  - [ ] 古いデータ削除
  - [ ] 一時データ削除
  - [ ] ログローテーション
  - [ ] インデックス再構築
- [ ] 最適化作業
  - [ ] VACUUM 実行
  - [ ] ANALYZE 実行
  - [ ] インデックス統計更新
  - [ ] クエリプラン最適化

## 成果物・確認項目

- [ ] 完全なデータベーススキーマ
- [ ] 全エンティティの実装完了
- [ ] インデックス最適化完了
- [ ] 全文検索機能動作確認
- [ ] リポジトリパターン実装完了
- [ ] マイグレーション機能確認
- [ ] バックアップ・復旧機能確認
- [ ] パフォーマンス要件達成

## 技術的考慮事項

- [ ] SQLite の制限事項理解
- [ ] 大容量データ対応計画
- [ ] 同時アクセス制御
- [ ] データ圧縮・アーカイブ戦略

## 将来拡張への準備

- [ ] 他 RDBMS 移行準備
- [ ] 分散データベース対応検討
- [ ] NoSQL とのハイブリッド構成検討
- [ ] 他ローカルデータベース（PostgreSQL 等）移行準備
