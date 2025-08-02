# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 開発言語とプロセス

- **すべてのコミュニケーションとコードコメントは日本語で記述すること**
- **開発手法: t-wadaが推奨するTDD（テスト駆動開発）を採用**
  - 実装前にテストを先に書く
  - Red-Green-Refactorサイクルを厳守
  - 小さなステップで進める

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

### テスト戦略（TDD）
1. **フロントエンド単体テスト**: Vitest + Angular Testing Utilities
2. **バックエンド単体テスト**: Jest + NestJS Testing Utilities
3. **E2Eテスト**: Playwright（フロントエンド）、Jest（バックエンド）

## 開発フロー（TDD）
1. テストを書く（Red）
2. テストをパスする最小限のコードを書く（Green）
3. リファクタリング（Refactor）
4. コミット前に必ず `npm run lint` と `npm run test` を実行

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