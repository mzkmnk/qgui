# フェーズ 3: セキュリティ基本設定 - 機能単位 TDD 実装

## 概要

YAGNI 原則に従い、ローカル開発環境で必要最小限のセキュリティ設定のみを実装する。
マルチユーザー認証は不要、ローカル環境での基本的な保護のみ。

## バックエンドセキュリティ実装

### 1. ローカルアクセス制限

#### 1.1 localhost 限定アクセス

- [ ] **Red**: `app.controller.spec.ts` - localhost 以外からのアクセス拒否テスト
  ```typescript
  it('localhost以外からのアクセスを拒否する', async () => {
    const response = await request(app.getHttpServer()).get('/health').set('X-Forwarded-For', '192.168.1.1').expect(403);
  });
  ```
- [ ] **Green**: IP フィルタリングミドルウェア実装（localhost/127.0.0.1 のみ許可）
- [ ] **動作確認**: localhost 以外からアクセスできないことを確認

### 2. 開発用 CORS 設定

#### 2.1 フロントエンドからのアクセス許可

- [ ] **Red**: CORS 設定テスト - フロントエンドオリジンからのアクセス許可
- [ ] **Green**: NestJS の CORS 設定（開発サーバーのオリジンのみ許可）
- [ ] **動作確認**: フロントエンドから API アクセスできることを確認

### 3. 基本的な入力検証

#### 3.1 コマンド入力の基本検証

- [ ] **Red**: `pty-manager.service.spec.ts` - 危険なコマンドの拒否テスト
  ```typescript
  it('rm -rf /などの危険なコマンドを拒否する', async () => {
    await expect(ptyManager.executeCommand('rm -rf /')).rejects.toThrow();
  });
  ```
- [ ] **Green**: 基本的なコマンドフィルタリング実装
- [ ] **動作確認**: 通常のコマンドは実行でき、危険なコマンドは拒否される

## フロントエンドセキュリティ実装

### 4. サニタイゼーション

#### 4.1 HTML エスケープ処理

- [ ] **Red**: `sanitize.pipe.spec.ts` - HTML タグのエスケープテスト
  ```typescript
  it('HTMLタグをエスケープする', () => {
    const input = '<script>alert("XSS")</script>';
    const result = sanitizePipe.transform(input);
    expect(result).not.toContain('<script>');
  });
  ```
- [ ] **Green**: `sanitize.pipe.ts` - 基本的な HTML エスケープ実装
- [ ] **動作確認**: HTML タグが画面に表示されないことを確認

## 最小限のセキュリティヘッダー

### 5. セキュリティヘッダー設定

#### 5.1 基本的なセキュリティヘッダー

- [ ] **Red**: セキュリティヘッダーの存在確認テスト
- [ ] **Green**: helmet.js の基本設定のみ適用
- [ ] **動作確認**: レスポンスヘッダーにセキュリティヘッダーが含まれる

## 削除した項目（YAGNI 原則）

以下の項目は実際に必要になるまで実装しない：

- JWT 認証システム（ローカル環境では不要）
- ユーザー管理機能（シングルユーザー前提）
- ロールベースアクセス制御（RBAC）
- パスワード管理機能
- 監査・ログ機能（開発環境では不要）
- データ暗号化（ローカル環境では過剰）
- ペネトレーションテスト
- コンプライアンス対応
- セッション管理
- リフレッシュトークン
- ブルートフォース対策

## 各 PR の完了条件

### バックエンド PR

- [ ] 対象機能のテストが全て Green
- [ ] `npm run backend:lint` エラーなし
- [ ] TypeScript コンパイルエラーなし
- [ ] 最小限のセキュリティ確保

### フロントエンド PR

- [ ] 対象機能のテストが全て Green
- [ ] `npm run frontend:lint` エラーなし
- [ ] TypeScript コンパイルエラーなし
- [ ] XSS 脆弱性なし

## 次のフェーズへの移行条件

- [ ] localhost 限定アクセスが機能
- [ ] 開発用 CORS 設定が適用済み
- [ ] 基本的な入力検証が実装済み
- [ ] HTML サニタイゼーションが機能
