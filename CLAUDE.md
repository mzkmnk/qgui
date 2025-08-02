# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 開発言語とプロセス

- **すべてのコミュニケーションとコードコメントは日本語で記述すること**
- **開発手法: t-wada推奨のTDD（テスト駆動開発）+ スキーマ駆動開発を採用**
  - **スキーマファースト**: データ構造（型・インターフェース）を最初に定義
  - **テストファースト**: 実装前にテストを先に書く
  - **Red-Green-Refactorサイクル**: 失敗→成功→改善の反復
  - **ベビーステップ**: 極小の変更単位で進める
  - **仮実装**: まず動作する最小限のコードから開始
- **実装の基本方針**
  - 1ファイル1関数、1関数1責務で取り組むこと
  - バレルエクスポートは行わないこと

## プロジェクト概要

このプロジェクトは、NxモノレポでAngularフロントエンドとNestJSバックエンドを含むQguiアプリケーションです。

## よく使うコマンド

### 開発サーバー起動
```bash
# フロントエンドとバックエンドを同時起動
npm run dev

# 個別起動
npm run frontend:dev  # フロントエンド開発サーバー
npm run backend:dev   # バックエンド開発サーバー
```

### ビルド
```bash
# 両方のアプリケーションをビルド
npm run build

# 個別ビルド
npm run frontend:build
npm run backend:build
```

### テスト実行
```bash
# すべてのテストを実行
npm run test

# テストをウォッチモードで実行
npm run frontend:test:watch  # フロントエンド
npm run backend:test:watch   # バックエンド

# E2Eテスト
npm run e2e
npm run frontend:e2e  # フロントエンドE2E
npm run backend:e2e   # バックエンドE2E

# 単一テストの実行
npx nx test frontend --testFile=app.spec.ts  # フロントエンド
npx nx test backend --testFile=app.service.spec.ts  # バックエンド
```

### リント
```bash
# すべてのプロジェクトをリント
npm run lint

# 個別リント
npm run frontend:lint
npm run backend:lint
```

### 影響を受けるプロジェクトのみ実行
```bash
npm run affected:build
npm run affected:test
npm run affected:lint
```

### プロジェクト依存関係グラフ
```bash
npm run graph
```

## アーキテクチャ概要

### モノレポ構造
```
apps/
├── frontend/         # Angular 20.1アプリケーション
│   ├── src/         # ソースコード
│   └── vite.config.mts  # Viteビルド設定
├── backend/         # NestJS 11バックエンド
│   ├── src/         # ソースコード
│   └── webpack.config.js  # Webpackビルド設定
├── frontend-e2e/    # Playwright E2Eテスト
└── backend-e2e/     # バックエンドE2Eテスト
```

### 技術スタック
- **フロントエンド**: Angular 20.1 + Vite + Vitest
- **バックエンド**: NestJS 11 + Express + Jest
- **共通**: TypeScript 5.8、RxJS 7.8、Axios 1.6

### Nx設定の特徴
- キャッシング有効（ビルド、テスト、リント）
- Nx Cloud接続済み（分散キャッシング）
- 自動ターゲット推論プラグイン設定済み

### テスト戦略（TDD + スキーマ駆動開発）
1. **フロントエンド単体テスト**: Vitest + Angular Testing Utilities
2. **バックエンド単体テスト**: Jest + NestJS Testing Utilities
3. **E2Eテスト**: Playwright（フロントエンド）、Jest（バックエンド）

## 開発フロー（t-wada推奨TDD + スキーマ駆動開発）

### 基本サイクル
このプロジェクトでは、以下の開発サイクルを厳密に守ります：

#### 1. スキーマ定義フェーズ
**目的**: データ構造と型を事前に設計し、実装の指針を明確にする

**手順**:
```typescript
// 例: ユーザー管理機能の場合
// 1. インターフェースを先に定義
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserRepository {
  findById(id: string): Promise<User | null>;
  create(userData: CreateUserData): Promise<User>;
  update(id: string, userData: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
}

interface CreateUserData {
  name: string;
  email: string;
}

interface UpdateUserData {
  name?: string;
  email?: string;
}
```

#### 2. Red フェーズ（失敗するテストを書く）
**目的**: 実装すべき機能の仕様をテストで表現する

**手順**:
```typescript
// テストを先に書く（この時点では実装は存在しない）
describe('UserService', () => {
  it('指定されたIDのユーザーを取得できる', async () => {
    // Arrange: テスト準備
    const userId = '123';
    const expectedUser: User = {
      id: '123',
      name: 'テストユーザー',
      email: 'test@example.com',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01')
    };
    
    // Act: テスト実行（この時点では失敗する）
    const result = await userService.findById(userId);
    
    // Assert: 結果検証
    expect(result).toEqual(expectedUser);
  });
});
```

**実行結果**: テストは失敗する（Red）→ これが正常

#### 3. Green フェーズ（テストを通す最小限の実装）
**目的**: テストを通すための最小限のコードを書く

**手順**:
```typescript
// 仮実装: まずはテストを通すだけの簡単な実装
class UserService {
  constructor(private userRepository: UserRepository) {}
  
  async findById(id: string): Promise<User | null> {
    // 仮実装: ハードコードでテストを通す
    if (id === '123') {
      return {
        id: '123',
        name: 'テストユーザー',
        email: 'test@example.com',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      };
    }
    return null;
  }
}
```

**実行結果**: テストが成功する（Green）

#### 4. Refactor フェーズ（実装を改善）
**目的**: コードの品質を向上させる（機能は変更しない）

**手順**:
```typescript
// リファクタリング: 実際のリポジトリを使用する実装に変更
class UserService {
  constructor(private userRepository: UserRepository) {}
  
  async findById(id: string): Promise<User | null> {
    // ハードコードを除去し、実際のリポジトリを使用
    return await this.userRepository.findById(id);
  }
}
```

**実行結果**: テストは引き続き成功する

#### 5. 次のテストケース追加
新しい機能やエッジケースのテストを追加し、サイクルを繰り返す

```typescript
// 次のテストケース
it('存在しないIDの場合はnullを返す', async () => {
  const result = await userService.findById('nonexistent');
  expect(result).toBeNull();
});

it('新しいユーザーを作成できる', async () => {
  const createData: CreateUserData = {
    name: '新規ユーザー',
    email: 'new@example.com'
  };
  
  const result = await userService.create(createData);
  
  expect(result.id).toBeDefined();
  expect(result.name).toBe('新規ユーザー');
  expect(result.email).toBe('new@example.com');
});
```

### 重要な原則

#### ベビーステップの実践
- **1つのテストケースにつき1つの機能**のみを実装
- **極小の変更**で進める（一度に大きな変更をしない）
- **各ステップでテストが全て通る**ことを確認

#### 仮実装の活用
- 最初は**ハードコード**でテストを通す
- **段階的に一般化**していく
- **完璧を求めず**、動作することを優先

#### テストの品質
- **AAA（Arrange-Act-Assert）パターン**を使用
- **テスト名は仕様を表現**する（何をテストするかが明確）
- **1つのテストで1つのことだけ**を検証

### 実践例：機能開発の流れ

#### ステップ1: 要件分析とスキーマ設計
```
要件: ユーザー一覧を取得する機能を追加したい
↓
スキーマ設計: UserService.findAll() メソッドを追加
戻り値: Promise<User[]>
```

#### ステップ2: インターフェース更新
```typescript
interface UserRepository {
  findAll(): Promise<User[]>;
  // ... 既存メソッド
}
```

#### ステップ3: テスト作成（Red）
```typescript
it('全ユーザーを取得できる', async () => {
  const result = await userService.findAll();
  expect(Array.isArray(result)).toBe(true);
});
```

#### ステップ4: 仮実装（Green）
```typescript
async findAll(): Promise<User[]> {
  return []; // 空配列を返す仮実装
}
```

#### ステップ5: より具体的なテスト（Red）
```typescript
it('複数のユーザーを正しく取得できる', async () => {
  const result = await userService.findAll();
  expect(result.length).toBeGreaterThan(0);
  expect(result[0]).toHaveProperty('id');
  expect(result[0]).toHaveProperty('name');
});
```

#### ステップ6: 実装の改善（Green）
```typescript
async findAll(): Promise<User[]> {
  return await this.userRepository.findAll();
}
```

### コミット前チェックリスト
1. **全てのテストが通る**ことを確認: `npm run test`
2. **リントエラーがない**ことを確認: `npm run lint`
3. **型エラーがない**ことを確認: TypeScriptコンパイル成功
4. **コードレビュー**: 自分のコードを見直し、改善点がないか確認

## タスク管理（.claude/todos）

### タスク管理の基本方針
- **.claude/todosファイルでタスクを管理する場合、タスクを完了したら毎回、即座にチェックボックスを埋めること**
- **ユーザーが管理をしやすいように、完了タスクは即座に視覚的に分かるようにすること**
- チェックボックス形式: `- [x] 完了したタスク`
- 未完了タスク形式: `- [ ] 未完了のタスク`

### タスク管理の実践例
```markdown
## 実装タスク
- [x] ユーザーインターフェースの設計
- [x] データベーススキーマの定義
- [ ] API エンドポイントの実装
- [ ] テストケースの作成
- [ ] エラーハンドリングの追加
```

### 重要な注意事項
- **タスクが完了したら、そのタスクのチェックボックスを `[ ]` から `[x]` に即座に変更する**
- **完了タスクと未完了タスクを明確に分けて管理する**
- **ユーザーが進捗を一目で把握できるようにする**

## Angular開発のベストプラクティス

### TypeScriptのベストプラクティス
- 厳密な型チェックを使用する
- 型が明らかな場合は型推論を優先する
- `any`型を避ける；型が不確実な場合は`unknown`を使用する

### Angularのベストプラクティス
- 常にNgModulesよりもスタンドアロンコンポーネントを使用する
- `@Component`、`@Directive`、`@Pipe`デコレータ内で`standalone: true`を設定しない
- 状態管理にはsignalsを使用する
- フィーチャールートには遅延読み込みを実装する
- すべての静的画像には`NgOptimizedImage`を使用する
- `@HostBinding`と`@HostListener`デコレータを使用しない。代わりに`@Component`または`@Directive`デコレータの`host`オブジェクト内にホストバインディングを配置する

### コンポーネント
- コンポーネントを小さく保ち、単一の責任に集中させる
- デコレータの代わりに`input()`と`output()`関数を使用する
- 派生状態には`computed()`を使用する
- `@Component`デコレータで`changeDetection: ChangeDetectionStrategy.OnPush`を設定する
- 小さなコンポーネントにはインラインテンプレートを優先する
- テンプレート駆動型よりもリアクティブフォームを優先する
- `ngClass`を使用せず、代わりに`class`バインディングを使用する
- `ngStyle`を使用せず、代わりに`style`バインディングを使用する

### 状態管理
- ローカルコンポーネント状態にはsignalsを使用する
- 派生状態には`computed()`を使用する
- 状態変換を純粋で予測可能に保つ
- signalsで`mutate`を使用せず、代わりに`update`または`set`を使用する

### テンプレート
- テンプレートをシンプルに保ち、複雑なロジックを避ける
- `*ngIf`、`*ngFor`、`*ngSwitch`の代わりにネイティブ制御フロー（`@if`、`@for`、`@switch`）を使用する
- observablesを扱う際はasyncパイプを使用する

### サービス
- 単一の責任を中心にサービスを設計する
- シングルトンサービスには`providedIn: 'root'`オプションを使用する
- コンストラクタインジェクションの代わりに`inject()`関数を使用する

## Angular公式ドキュメントリンク集

### 基本

- [Angularとは](https://angular.dev/overview)
- [インストールガイド](https://angular.dev/installation)
- [スタイルガイド](https://next.angular.dev/style-guide)

### コンポーネント

- [コンポーネントとは](https://angular.dev/guide/components)
- [コンポーネントセレクター](https://angular.dev/guide/components/selectors)
- [コンポーネントのスタイリング](https://angular.dev/guide/components/styling)
- [inputプロパティでデータを受け取る](https://angular.dev/guide/components/inputs)
- [outputでカスタムイベント](https://angular.dev/guide/components/outputs)
- [コンテンツプロジェクション](https://angular.dev/guide/components/content-projection)
- [コンポーネントのライフサイクル](https://angular.dev/guide/components/lifecycle)

### テンプレートガイド

- [テンプレート概要](https://angular.dev/guide/templates)
- [イベントリスナーの追加](https://angular.dev/guide/templates/event-listeners)
- [テキスト、プロパティ、属性のバインディング](https://angular.dev/guide/templates/binding)
- [制御フロー](https://angular.dev/guide/templates/control-flow)
- [テンプレート変数の宣言](https://angular.dev/guide/templates/variables)
- [コンポーネントの遅延読み込み](https://angular.dev/guide/templates/defer)
- [式の構文](https://angular.dev/guide/templates/expression-syntax)

### ディレクティブ

- [ディレクティブ概要](https://angular.dev/guide/directives)
- [属性ディレクティブ](https://angular.dev/guide/directives/attribute-directives)
- [構造ディレクティブ](https://angular.dev/guide/directives/structural-directives)
- [ディレクティブコンポジション](https://angular.dev/guide/directives/directive-composition-api)
- [画像の最適化](https://angular.dev/guide/image-optimization)

### Signals

- [Signals概要](https://angular.dev/guide/signals)
- [linkedSignalによる依存状態](https://angular.dev/guide/signals/linked-signal)
- [リソースによる非同期リアクティビティ](https://angular.dev/guide/signals/resource)

### 依存性注入（DI）

- [依存性注入の概要](https://angular.dev/guide/di)
- [依存性注入の理解](https://angular.dev/guide/di/dependency-injection)
- [インジェクタブルサービスの作成](https://angular.dev/guide/di/creating-injectable-service)
- [依存プロバイダーの設定](https://angular.dev/guide/di/dependency-injection-providers)
- [インジェクションコンテキスト](https://angular.dev/guide/di/dependency-injection-context)
- [階層的インジェクター](https://angular.dev/guide/di/hierarchical-dependency-injection)
- [インジェクショントークンの最適化](https://angular.dev/guide/di/lightweight-injection-tokens)

### RxJS

- [Angular SignalsとのRxJS連携](https://angular.dev/ecosystem/rxjs-interop)
- [コンポーネントoutputの連携](https://angular.dev/ecosystem/rxjs-interop/output-interop)

### データの読み込み

- [HttpClient概要](https://angular.dev/guide/http)
- [HttpClientのセットアップ](https://angular.dev/guide/http/setup)
- [リクエストの作成](https://angular.dev/guide/http/making-requests)
- [リクエストのインターセプト](https://angular.dev/guide/http/interceptors)
- [テスト](https://angular.dev/guide/http/testing)

### フォーム

- [フォーム概要](https://angular.dev/guide/forms)
- [リアクティブフォーム](https://angular.dev/guide/forms/reactive-forms)
- [厳密に型付けされたフォーム](https://angular.dev/guide/forms/typed-forms)
- [テンプレート駆動型フォーム](https://angular.dev/guide/forms/template-driven-forms)
- [フォーム入力の検証](https://angular.dev/guide/forms/form-validation)
- [動的フォームの構築](https://angular.dev/guide/forms/dynamic-forms)

### ルーティング

- [ルーティング概要](https://angular.dev/guide/routing)
- [ルートの定義](https://angular.dev/guide/routing/define-routes)
- [アウトレットでルートを表示](https://angular.dev/guide/routing/show-routes-with-outlets)
- [ルートへのナビゲート](https://angular.dev/guide/routing/navigate-to-routes)
- [ルート状態の読み取り](https://angular.dev/guide/routing/read-route-state)
- [一般的なルーティングタスク](https://angular.dev/guide/routing/common-router-tasks)
- [カスタムルートマッチの作成](https://angular.dev/guide/routing/routing-with-urlmatcher)

### サーバーサイドレンダリング（SSR）

- [SSR概要](https://angular.dev/guide/performance)
- [AngularでのSSR](https://angular.dev/guide/ssr)
- [ビルド時プリレンダリング（SSG）](https://angular.dev/guide/prerendering)
- [サーバールーティングによるハイブリッドレンダリング](https://angular.dev/guide/hybrid-rendering)
- [ハイドレーション](https://angular.dev/guide/hydration)
- [インクリメンタルハイドレーション](https://angular.dev/guide/incremental-hydration)

### CLI

- [Angular CLI概要](https://angular.dev/tools/cli)

### テスト

- [テスト概要](https://angular.dev/guide/testing)
- [テストカバレッジ](https://angular.dev/guide/testing/code-coverage)
- [サービスのテスト](https://angular.dev/guide/testing/services)
- [コンポーネントテストの基本](https://angular.dev/guide/testing/components-basics)
- [コンポーネントテストのシナリオ](https://angular.dev/guide/testing/components-scenarios)
- [属性ディレクティブのテスト](https://angular.dev/guide/testing/attribute-directives)
- [パイプのテスト](https://angular.dev/guide/testing/pipes)
- [テストのデバッグ](https://angular.dev/guide/testing/debugging)
- [テストユーティリティAPI](https://angular.dev/guide/testing/utility-apis)
- [コンポーネントハーネス概要](https://angular.dev/guide/testing/component-harnesses-overview)
- [テストでのコンポーネントハーネスの使用](https://angular.dev/guide/testing/using-component-harnesses)
- [コンポーネント用のハーネス作成](https://angular.dev/guide/testing/creating-component-harnesses)

### アニメーション

- [コンテンツのアニメーション](https://angular.dev/guide/animations/css)
- [ルートトランジションアニメーション](https://angular.dev/guide/animations/route-animations)
- [ネイティブCSSアニメーションへの移行](https://next.angular.dev/guide/animations/migration)

### API

- [APIリファレンス](https://angular.dev/api)
- [CLIコマンドリファレンス](https://angular.dev/cli)

### その他

- [Zoneless](https://angular.dev/guide/zoneless)
- [エラー百科事典](https://angular.dev/errors)
- [拡張診断](https://angular.dev/extended-diagnostics)
- [アップデートガイド](https://angular.dev/update-guide)
- [Angularへの貢献](https://github.com/angular/angular/blob/main/CONTRIBUTING.md)
- [Angularのロードマップ](https://angular.dev/roadmap)
- [プロジェクトを最新に保つ](https://angular.dev/update)
- [セキュリティ](https://angular.dev/best-practices/security)
- [国際化（i18n）](https://angular.dev/guide/i18n)