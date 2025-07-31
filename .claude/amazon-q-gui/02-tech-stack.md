# Amazon Q GUI - 技術スタック

## 1. 技術選定方針

### 1.1 選定基準
- **型安全性**: TypeScriptによる完全な型定義
- **保守性**: エンタープライズグレードのフレームワーク
- **パフォーマンス**: リアルタイム通信の最適化
- **開発効率**: 充実したエコシステムとツール

### 1.2 アーキテクチャ原則
- マイクロサービス指向
- レイヤードアーキテクチャ
- 依存性注入（DI）
- 単一責任原則（SRP）

## 2. フロントエンド技術

### 2.1 Angular 20
**バージョン**: `20.0.0`（2025年5月29日リリース）

**選定理由**:
- エンタープライズアプリケーション開発の実績
- 完全なTypeScriptサポート
- 優れたCLIツール
- 豊富な公式パッケージ

**主要機能**:
- **Signals API**（安定版）
- **Incremental Hydration**
- **Zoneless Change Detection**
- **Built-in Control Flow**（`@if`, `@for`, `@switch`）

### 2.2 PrimeNG 20
**用途**: UIコンポーネントライブラリ

**採用コンポーネント**:
- **Menubar**（ヘッダーナビゲーション）
- **Sidebar**（サイドメニュー）
- **Card**（メッセージカード）
- **InputText/Textarea**（入力フィールド）
- **Button**（各種ボタン）
- **Terminal**（ターミナルコンポーネント）

### 2.3 スタイリング（Tailwind CSS v4）
**バージョン**: `4.0.0`

**選定理由**:
- **ユーティリティファースト**: クラスベースの迅速な開発
- **JITコンパイル**: 使用されるクラスのみ生成
- **新機能**: CSS変数、ネスト対応、コンテナクエリ
- **PrimeNGとの統合**: コンポーネントのカスタマイズが容易

### 2.4 追加ライブラリ
```json
{
  "primeng": "^20.0.0",            // UIコンポーネント
  "primeicons": "^7.0.0",          // アイコンセット
  "tailwindcss": "^4.0.0",         // ユーティリティファーストCSS
  "xterm": "^5.3.0",               // ターミナルエミュレーション
  "socket.io-client": "^4.7.5",    // WebSocket通信
  "@ngrx/store": "^20.0.0",        // 状態管理（スタンドアロン）
  "@ngrx/signals": "^20.0.0",      // NgRx Signals
  "ansi-to-html": "^0.7.2"         // ANSIコード変換
}
```

## 3. バックエンド技術

### 3.1 NestJS 11
**バージョン**: `11.0.0`

**選定理由**:
- Angularと同じデコレータベースアーキテクチャ
- 組み込みDIコンテナ
- モジュラー設計
- TypeScript第一主義

**主要モジュール**:
```typescript
@Module({
  imports: [
    WebSocketModule,    // リアルタイム通信
    TypeOrmModule,      // データベースORM
    ConfigModule,       // 設定管理
    AuthModule          // 認証
  ]
})
```

### 3.2 重要な依存関係
```json
{
  "@nestjs/websockets": "^11.0.0",
  "@nestjs/platform-socket.io": "^11.0.0",
  "node-pty": "^1.0.0",            // PTYプロセス管理
  "sqlite3": "^5.1.7",             // データベース
  "typeorm": "^0.3.20"             // ORM
}
```

## 4. 共通技術

### 4.1 TypeScript 5.5.4
**設定**:
```json
{
  "compilerOptions": {
    "target": "ES2023",
    "strict": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### 4.2 Node.js 22 LTS
**理由**:
- 長期サポート
- 最新のV8エンジン
- ネイティブESMサポート

## 4.3 Nx 20 (モノレポ管理)
**選定理由**:
- **統合開発環境**: AngularとNestJSを一つのワークスペースで管理
- **スマートビルド**: 変更された部分のみビルド
- **キャッシング**: ビルド結果のキャッシュで高速化
- **依存関係グラフ**: プロジェクト間の依存を可視化
- **コード生成**: 一貫性のあるコードジェネレータ

## 5. 開発ツール

### 5.1 ビルドツール
- **Nx CLI 20**: モノレポ管理、ビルドオーケストレーション
- **@nx/angular**: Angularプロジェクト管理
- **@nx/nest**: NestJSプロジェクト管理
- **Vite**: 高速HMR（Nx統合）

### 5.2 品質管理ツール
```json
{
  "eslint": "^8.57.0",
  "prettier": "^3.3.3",
  "husky": "^9.1.0",
  "commitlint": "^19.4.0"
}
```

### 5.3 テストツール
- **Jest**: 単体テスト
- **Cypress**: E2Eテスト
- **Supertest**: APIテスト

## 6. インフラストラクチャ

### 6.1 開発環境構成
- **Node.js 22 LTS**: ローカル実行環境
- **Nx CLI**: 開発サーバー管理
- **localhost**: すべてのサービスはローカルで実行

### 6.2 開発ツール
- **VS Code**: 推奨エディタ
- **Chrome DevTools**: デバッグ
- **Nx Console**: VS Code拡張機能

## 7. セキュリティ

### 7.1 認証・認可
- **JWT**: トークンベース認証
- **bcrypt**: パスワードハッシュ化
- **helmet**: セキュリティヘッダー

### 7.2 ローカル環境セキュリティ
- **HTTP**: localhost通信（開発環境）
- **CORS**: localhost間の通信を許可
- **開発用JWT**: ローカルテスト用の簡易認証

## 8. パフォーマンス最適化

### 8.1 フロントエンド
- **Lazy Loading**: モジュール遅延読み込み
- **OnPush戦略**: 変更検出最適化
- **仮想スクロール**: 大量データ表示

### 8.2 バックエンド
- **SQLite**: ローカルファイルベースDB
- **メモリキャッシング**: インメモリキャッシュ
- **開発モード**: ホットリロード対応

## 9. 監視・ログ

### 9.1 ロギング
```typescript
// Winston設定
const loggerConfig = {
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
};
```

### 9.2 開発環境モニタリング
- **Health Check**: /health エンドポイント
- **Console Logging**: 開発用ログ出力
- **Chrome DevTools**: パフォーマンス分析

## 10. 技術選定マトリクス

| カテゴリ | 技術 | 代替案 | 選定理由 |
|:---------|:------|:--------|:---------|
| モノレポ管理 | Nx 20 | Lerna, Rush | Angular/NestJS統合、キャッシュ最適化 |
| フロントエンドFW | Angular 20 | React, Vue | スタンドアロンアーキテクチャ、型安全性 |
| UIライブラリ | PrimeNG 20 | - | 豊富なコンポーネント、ターミナルUI、単一ライブラリで統一 |
| CSSフレームワーク | Tailwind CSS v4 | Bootstrap, Bulma | ユーティリティファースト、JITコンパイル |
| バックエンドFW | NestJS 11 | Express, Fastify | Angular類似、フルスタック |
| リアルタイム通信 | Socket.io | raw WebSocket | 再接続、ルーム機能 |
| プロセス管理 | node-pty | child_process | 完全なTTYエミュレーション |
| データベース | SQLite | PostgreSQL | Amazon Q既存DB利用 |
| ORM | TypeORM | Prisma, Sequelize | NestJS統合、型定義 |

## まとめ

この技術スタックは、型安全性、保守性、パフォーマンスのバランスを重視して選定されています。Angular 20とNestJS 11の組み合わせにより、フロントエンドとバックエンドで一貫した開発体験を提供し、TypeScript 5.5.4の最新機能を活用した堅牢なアプリケーションを構築できます。