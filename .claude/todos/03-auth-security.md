# フェーズ3: 認証とセキュリティ - TDD + スキーマ駆動開発 TODOリスト

## 概要
t-wada推奨のTDD + スキーマ駆動開発手法に従い、セキュアなマルチユーザー環境を構築する
（ローカル開発環境向け）

## Feature 1: JWT認証システム実装

### Phase 1: 認証スキーマ定義

#### 1.1 認証ドメインモデリング
- [ ] **認証スキーマ設計**: `schemas/auth.schema.yaml` 作成
  ```yaml
  LoginDto:
    type: object
    required: [username, password]
    properties:
      username: { type: string, minLength: 1, maxLength: 50 }
      password: { type: string, minLength: 8, maxLength: 100 }
  
  AuthResponse:
    type: object
    required: [accessToken, refreshToken, user]
    properties:
      accessToken: { type: string }
      refreshToken: { type: string }
      user: { $ref: '#/components/schemas/UserProfile' }
  ```

#### 1.2 ユーザー管理スキーマ設計
- [ ] **ユーザースキーマ設計**: `schemas/user.schema.yaml` 作成
  - [ ] User エンティティ定義（id, username, email, role, passwordHash）
  - [ ] UserRole enum定義（admin, user, guest）
  - [ ] CreateUserDto, UpdateUserDto定義

#### 1.3 認証API設計
- [ ] **認証API設計**: `schemas/auth-api.yaml` 作成
  - [ ] `POST /api/auth/login` (ログイン)
  - [ ] `POST /api/auth/logout` (ログアウト)
  - [ ] `POST /api/auth/refresh` (トークンリフレッシュ)
  - [ ] `GET /api/auth/profile` (プロファイル取得)

### Phase 2: Red フェーズ（認証システムテスト作成）

#### 2.1 バックエンド認証テスト（Jest）
- [ ] **テストファイル作成**: `auth.service.spec.ts`
- [ ] **失敗テスト作成**: ユーザーログインテスト
  ```typescript
  describe('AuthService', () => {
    it('有効な認証情報でログインできるべき', async () => {
      const loginDto = { username: 'testuser', password: 'password123' };
      const result = await authService.login(loginDto);
      
      expect(result.accessToken).toBeDefined();
      expect(result.user.username).toBe('testuser');
    });
  });
  ```
- [ ] **失敗テスト作成**: 無効な認証情報でのログイン失敗テスト
- [ ] **失敗テスト作成**: JWTトークン検証テスト

#### 2.2 フロントエンド認証テスト（Vitest）
- [ ] **テストファイル作成**: `auth.service.spec.ts`（フロントエンド）
- [ ] **失敗テスト作成**: 認証状態管理（signals）テスト
- [ ] **失敗テスト作成**: トークン自動リフレッシュテスト

### Phase 3: Green フェーズ（認証システム仮実装）

#### 3.1 バックエンド仮実装
- [ ] **AuthService作成**: 最小限の認証機能
  ```typescript
  @Injectable()
  export class AuthService {
    async login(loginDto: LoginDto): Promise<AuthResponse> {
      // ハードコード仮実装
      if (loginDto.username === 'testuser' && loginDto.password === 'password123') {
        return {
          accessToken: 'fake-jwt-token',
          refreshToken: 'fake-refresh-token',
          user: { id: '1', username: 'testuser', role: 'user' }
        };
      }
      throw new UnauthorizedException('Invalid credentials');
    }
  }
  ```
- [ ] **テスト確認**: 作成したテストが Green（成功）になることを確認

#### 3.2 フロントエンド仮実装
- [ ] **AuthStateService作成**: 認証状態管理（signals）
- [ ] **テスト確認**: 作成したテストが Green（成功）になることを確認

### Phase 4: Refactor フェーズ（認証システム実装改善）

#### 4.1 バックエンド実装改善
- [ ] **実際のJWT統合**: @nestjs/jwtライブラリとの統合
- [ ] **パスワードハッシュ**: bcryptによるパスワード暗号化
- [ ] **データベース連携**: ユーザー情報の永続化
- [ ] **テスト確認**: リファクタリング後もテストが Green を維持

#### 4.2 フロントエンド実装改善
- [ ] **HTTP認証ヘッダー**: 自動トークン付与機能
- [ ] **ルートガード**: 認証必須ページの保護
- [ ] **テスト確認**: リファクタリング後もテストが Green を維持

### Phase 5: 認証システム次のテストケース追加

#### 5.1 認証エッジケース
- [ ] **異常系テスト**: トークン有効期限切れ処理
- [ ] **異常系テスト**: 不正なトークンでのアクセス
- [ ] **セキュリティテスト**: ブルートフォース攻撃対策

## Feature 2: ロールベースアクセス制御（RBAC）

### Phase 1: RBAC スキーマ定義

#### 1.1 権限管理ドメインモデリング
- [ ] **権限スキーマ設計**: `schemas/rbac.schema.yaml` 作成
  ```yaml
  Permission:
    type: object
    required: [resource, action]
    properties:
      resource: { enum: [session, message, user, system] }
      action: { enum: [create, read, update, delete, execute] }
  
  Role:
    type: object
    required: [name, permissions]
    properties:
      name: { enum: [admin, user, guest] }
      permissions: { type: array, items: { $ref: '#/components/schemas/Permission' } }
  ```

### Phase 2: Red フェーズ（RBAC テスト作成）

#### 2.1 権限チェックテスト作成
- [ ] **テストファイル作成**: `rbac.service.spec.ts`
- [ ] **失敗テスト作成**: ロール別権限チェックテスト
  ```typescript
  describe('RBACService', () => {
    it('adminロールはすべてのリソースにアクセスできるべき', () => {
      const hasPermission = rbacService.checkPermission('admin', 'user', 'delete');
      expect(hasPermission).toBe(true);
    });
    
    it('guestロールは読み取り権限のみ持つべき', () => {
      const hasPermission = rbacService.checkPermission('guest', 'session', 'create');
      expect(hasPermission).toBe(false);
    });
  });
  ```

### Phase 3: Green フェーズ（RBAC 仮実装）

#### 3.1 RBAC仮実装
- [ ] **RBACService作成**: 最小限の権限チェック機能
  ```typescript
  @Injectable()
  export class RBACService {
    checkPermission(role: string, resource: string, action: string): boolean {
      // ハードコード仮実装
      if (role === 'admin') return true;
      if (role === 'guest' && action === 'read') return true;
      return false;
    }
  }
  ```

### Phase 4: Refactor フェーズ（RBAC 実装改善）

#### 4.1 権限マトリックス実装
- [ ] **設定ベース権限管理**: YAML設定ファイルからの権限読み込み
- [ ] **デコレーターベース権限チェック**: @RequirePermission デコレーター
- [ ] **WebSocket権限ガード**: リアルタイム通信の権限制御

## Feature 3: セキュリティ強化機能

### Phase 1: セキュリティスキーマ定義

#### 1.1 セキュリティ設定スキーマ
- [ ] **セキュリティ設定スキーマ**: `schemas/security.schema.yaml` 作成
  - [ ] レート制限設定（API, WebSocket, ログイン試行）
  - [ ] CORS設定（開発環境用）
  - [ ] CSP設定定義

### Phase 2: Red フェーズ（セキュリティテスト作成）

#### 2.1 セキュリティ機能テスト
- [ ] **テストファイル作成**: `security.service.spec.ts`
- [ ] **失敗テスト作成**: レート制限テスト
- [ ] **失敗テスト作成**: 入力検証テスト
- [ ] **失敗テスト作成**: XSS/SQLインジェクション対策テスト

### Phase 3-4: Green & Refactor フェーズ

#### 3.1 セキュリティ機能実装
- [ ] **レート制限実装**: @nestjs/throttler統合
- [ ] **入力検証強化**: class-validator DTOバリデーション
- [ ] **セキュリティヘッダー**: helmet.js統合

## ベビーステップ実践例

### Example: JWT認証実装

#### Step 1: スキーマ定義
```yaml
LoginDto:
  type: object
  required: [username, password]
  properties:
    username: { type: string }
    password: { type: string }
```

#### Step 2: Red
```typescript
it('should authenticate user with valid credentials', async () => {
  const loginDto = { username: 'test', password: 'pass' };
  const result = await authService.login(loginDto);
  expect(result.accessToken).toBeDefined();
});
```

#### Step 3: Green
```typescript
async login(loginDto: LoginDto): Promise<AuthResponse> {
  return { accessToken: 'fake-token' } as AuthResponse;
}
```

#### Step 4: Refactor
```typescript
async login(loginDto: LoginDto): Promise<AuthResponse> {
  const user = await this.validateUser(loginDto);
  const payload = { username: user.username, sub: user.id };
  return { accessToken: this.jwtService.sign(payload) };
}
```

## 完了条件

### セキュリティ機能完了の定義
- [ ] **全スキーマ定義完了**: 認証・認可関連スキーマがyaml形式で定義済み
- [ ] **全テストGreen**: 作成したすべてのセキュリティテストが成功
- [ ] **セキュリティ監査通過**: 基本的なセキュリティチェック項目をクリア
- [ ] **カバレッジ目標**: セキュリティ機能のテストカバレッジ90%以上

## 次フェーズ（UI/UX改善）への引き継ぎ
- [ ] **認証UI コンポーネント**: ログイン・ログアウト・権限管理画面
- [ ] **セキュリティ設定**: ユーザー向けセキュリティ設定機能
- [ ] **監査ログUI**: セキュリティログ表示・検索機能

### JWT認証基盤
- [ ] JWT認証ライブラリ統合
  - [ ] @nestjs/jwt インストール・設定
  - [ ] JWT設定（秘密鍵、有効期限等）
  - [ ] リフレッシュトークン対応
  - [ ] ローカル環境用の簡易設定
- [ ] 認証サービス実装（バックエンド）
  - [ ] AuthService クラス実装
  - [ ] トークン生成・検証機能
  - [ ] パスワードハッシュ機能（bcrypt使用）
  - [ ] ユーザー情報管理
- [ ] 認証ガード実装
  - [ ] JwtAuthGuard 実装
  - [ ] WebSocket認証ガード実装
  - [ ] ロール ベースガード準備
- [ ] トークン管理（フロントエンド）
  - [ ] AuthService（Angular）実装
  - [ ] トークンストレージ管理
  - [ ] 自動リフレッシュ機能
  - [ ] 認証状態管理（signals使用）

### ログイン・ログアウト機能
- [ ] ログイン画面実装
  - [ ] ログインフォームコンポーネント
  - [ ] バリデーション機能
  - [ ] エラーハンドリング・表示
  - [ ] ローカル開発用デフォルトユーザー
- [ ] ログアウト機能
  - [ ] ログアウトAPI実装
  - [ ] トークン無効化処理
  - [ ] セッションクリーンアップ
  - [ ] ログアウト確認ダイアログ
- [ ] 認証状態管理
  - [ ] 認証状態の永続化
  - [ ] ページリロード時の状態復元
  - [ ] セッションタイムアウト管理
  - [ ] 自動ログアウト機能

### パスワード管理機能
- [ ] パスワードリセット機能
  - [ ] パスワードリセットAPI実装
  - [ ] セキュリティ質問機能（ローカル用）
  - [ ] 一時パスワード生成
  - [ ] パスワード強度チェック
- [ ] パスワード変更機能
  - [ ] パスワード変更画面
  - [ ] 現在パスワード確認
  - [ ] 新パスワードバリデーション
  - [ ] 変更履歴管理

## 認可システム実装

### ロールベースアクセス制御
- [ ] ロール定義
  - [ ] ユーザーロール（admin, user, guest）
  - [ ] 権限マトリックス定義
  - [ ] ロール継承関係設計
- [ ] 権限管理
  - [ ] 権限チェック機能実装
  - [ ] リソースレベル権限制御
  - [ ] セッション権限管理
  - [ ] ツール実行権限管理
- [ ] 権限ガード実装
  - [ ] RolesGuard実装
  - [ ] メソッドレベル権限デコレーター
  - [ ] リソース権限チェック
- [ ] 権限管理UI
  - [ ] 権限設定画面
  - [ ] ロール割り当て機能
  - [ ] 権限表示機能

### ユーザー管理機能
- [ ] ユーザー管理API
  - [ ] ユーザー作成・更新・削除API
  - [ ] ユーザー一覧・検索API
  - [ ] ユーザープロファイル管理
- [ ] ユーザー管理画面
  - [ ] ユーザー一覧画面
  - [ ] ユーザー詳細・編集画面
  - [ ] プロファイル設定画面
- [ ] セルフサービス機能
  - [ ] プロファイル編集機能
  - [ ] 設定変更機能
  - [ ] データエクスポート機能

## セキュリティ強化

### ローカル環境セキュリティ
- [ ] アクセス制限設定
  - [ ] localhost限定アクセス設定
  - [ ] ポート設定のセキュリティ考慮
  - [ ] ファイアウォール設定推奨事項
- [ ] CORS設定
  - [ ] 開発用CORS設定
  - [ ] オリジン制限設定
  - [ ] 認証情報送信設定
- [ ] セキュリティヘッダー
  - [ ] helmet.js導入
  - [ ] CSP設定（開発環境用）
  - [ ] セキュリティヘッダー追加

### 入力検証・サニタイゼーション
- [ ] 入力検証強化
  - [ ] DTOバリデーション（class-validator使用）
  - [ ] パラメータサニタイゼーション
  - [ ] SQLインジェクション対策
  - [ ] XSS対策
- [ ] ファイルアップロード制限
  - [ ] ファイルタイプ制限
  - [ ] ファイルサイズ制限
  - [ ] マルウェアスキャン（基本レベル）
- [ ] レート制限
  - [ ] API呼び出し制限
  - [ ] WebSocket接続制限
  - [ ] ログイン試行制限

### データ保護
- [ ] データ暗号化
  - [ ] データベース暗号化（SQLiteレベル）
  - [ ] 機密データのハッシュ化
  - [ ] 通信暗号化（HTTPS開発環境）
- [ ] データマスキング
  - [ ] ログ出力時の機密情報マスク
  - [ ] エラーメッセージの情報制限
  - [ ] API レスポンスの情報制限
- [ ] バックアップ・復旧
  - [ ] データベースバックアップ機能
  - [ ] 設定ファイルバックアップ
  - [ ] 災害復旧手順書作成

## 監査・ログ機能

### アクセスログ
- [ ] 認証ログ
  - [ ] ログイン・ログアウト記録
  - [ ] 認証失敗記録
  - [ ] トークンリフレッシュ記録
- [ ] API アクセスログ
  - [ ] エンドポイントアクセス記録
  - [ ] レスポンス時間記録
  - [ ] エラー発生記録
- [ ] WebSocketアクセスログ
  - [ ] 接続・切断記録
  - [ ] メッセージ送受信記録
  - [ ] セッション状態変更記録

### 操作ログ
- [ ] ユーザー操作ログ
  - [ ] セッション操作記録
  - [ ] メッセージ送信記録
  - [ ] 設定変更記録
- [ ] システム操作ログ
  - [ ] Amazon Q CLI操作記録
  - [ ] ツール実行記録
  - [ ] データベース操作記録
- [ ] セキュリティイベントログ
  - [ ] 異常アクセス検知
  - [ ] 権限エラー記録
  - [ ] セキュリティ警告記録

### ログ管理機能
- [ ] ログ設定管理
  - [ ] ログレベル設定
  - [ ] ログ出力先設定
  - [ ] ログローテーション設定
- [ ] ログ分析機能
  - [ ] ログ検索機能
  - [ ] ログ統計機能
  - [ ] ログアラート機能
- [ ] ログ保管・削除
  - [ ] ログ保管期間設定
  - [ ] 古いログの自動削除
  - [ ] ログアーカイブ機能

## セキュリティテスト

### 脆弱性テスト
- [ ] 静的セキュリティテスト
  - [ ] npm audit実行
  - [ ] セキュリティリンター設定
  - [ ] コード品質チェック
- [ ] 動的セキュリティテスト
  - [ ] 認証バイパステスト
  - [ ] 権限昇格テスト
  - [ ] セッション管理テスト
- [ ] ペネトレーションテスト（基本レベル）
  - [ ] SQLインジェクションテスト
  - [ ] XSSテスト
  - [ ] CSRFテスト

### セキュリティ設定確認
- [ ] 設定レビュー
  - [ ] データベース設定セキュリティ
  - [ ] サーバー設定セキュリティ
  - [ ] 環境変数セキュリティ
- [ ] 認証機能テスト
  - [ ] 認証フローテスト
  - [ ] トークン有効性テスト
  - [ ] セッション管理テスト
- [ ] アクセス制御テスト
  - [ ] 権限チェックテスト
  - [ ] 未認証アクセステスト
  - [ ] 権限外操作テスト

## コンプライアンス対応

### プライバシー保護
- [ ] 個人情報保護
  - [ ] 個人情報の特定・分類
  - [ ] 個人情報の暗号化
  - [ ] 個人情報の削除機能
- [ ] データ最小化
  - [ ] 必要最小限のデータ収集
  - [ ] 不要データの自動削除
  - [ ] データ保管期間の設定
- [ ] 透明性確保
  - [ ] プライバシーポリシー作成
  - [ ] データ使用目的の明示
  - [ ] ユーザー同意機能

### セキュリティドキュメント作成
- [ ] セキュリティポリシー文書
  - [ ] セキュリティ方針書
  - [ ] インシデント対応手順
  - [ ] セキュリティ教育資料
- [ ] 運用手順書
  - [ ] セキュリティ運用手順
  - [ ] バックアップ・復旧手順
  - [ ] 緊急時対応手順
- [ ] セキュリティチェックリスト
  - [ ] 日次セキュリティチェック
  - [ ] 月次セキュリティレビュー
  - [ ] セキュリティ監査項目

## 成果物・確認項目
- [ ] 安全な認証システム動作確認
- [ ] マルチユーザー機能動作確認
- [ ] アクセス制御機能動作確認
- [ ] 監査ログ機能動作確認
- [ ] セキュリティテスト完了
- [ ] セキュリティドキュメント整備完了

## 技術的考慮事項
- [ ] パフォーマンス: 認証処理のレスポンス時間測定
- [ ] 可用性: 認証システム障害時の動作確認
- [ ] 拡張性: 新しい認証方法への対応準備

## 次フェーズへの準備
- [ ] UI/UX改善におけるセキュリティ考慮事項の整理
- [ ] パフォーマンス最適化時のセキュリティ影響評価
- [ ] セキュリティ機能のユーザビリティ評価