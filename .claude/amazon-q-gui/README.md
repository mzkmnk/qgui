# Amazon Q GUI 開発ドキュメント（最終版）

## 概要

Amazon Q CLI を Web ベースの GUI で操作するためのアプリケーション開発に関する技術ドキュメントです。

## ドキュメント構成

### 1. [プロジェクト概要](./01-project-overview.md)

プロジェクトの目的、スコープ、主要機能の説明

### 2. [技術スタック](./02-tech-stack.md)

採用技術の詳細と選定理由

### 3. [システムアーキテクチャ](./03-architecture.md)

全体構成、コンポーネント設計、データフロー

### 4. [実装ガイド](./04-implementation-guide.md)

開発環境のセットアップから実装手順まで

### 5. [API 仕様](./05-api-specifications.md)

WebSocket 通信プロトコル、REST API、型定義

### 6. [開発ロードマップ](./06-roadmap.md)

フェーズ別の実装計画とマイルストーン

## クイックスタート

```bash
# Nxワークスペース作成
npx create-nx-workspace@latest amazon-q-gui --preset=apps --packageManager=npm
cd amazon-q-gui

# Angularアプリケーション追加
npx nx g @nx/angular:app frontend --directory=apps/frontend --style=scss --routing --standalone

# NestJSアプリケーション追加
npx nx g @nx/nest:app backend --directory=apps/backend

# 依存関係のインストール
npm install primeng primeicons tailwindcss@next @ngrx/store @ngrx/signals
npm install @nestjs/websockets @nestjs/platform-socket.io node-pty

# 開発サーバー起動
npx nx run-many --target=serve --projects=frontend,backend --parallel
```

## 技術選定サマリー

| カテゴリ           | 技術                     | バージョン |
| :----------------- | :----------------------- | :--------- |
| フロントエンド     | Angular (スタンドアロン) | 20.0.0     |
| UI ライブラリ      | PrimeNG                  | 20.0.0     |
| CSS フレームワーク | Tailwind CSS             | 4.0.0      |
| 状態管理           | NgRx (スタンドアロン)    | 20.0.0     |
| バックエンド       | NestJS                   | 11.0.0     |
| 言語               | TypeScript               | 5.5.4      |
| WebSocket          | Socket.io                | 4.7.5      |
| プロセス管理       | node-pty                 | 1.0.0      |
| データベース       | SQLite3                  | 5.1.7      |
| ランタイム         | Node.js                  | 22 LTS     |
| モノレポ管理       | Nx                       | 20.0.0     |

## プロジェクト構成

```
amazon-q-gui/
├── apps/
│   ├── frontend/          # Angular 20 アプリケーション
│   ├── frontend-e2e/      # Cypress E2Eテスト
│   ├── backend/           # NestJS 11 サーバー
│   └── backend-e2e/       # APIテスト
├── libs/
│   └── shared/
│       └── interfaces/    # 共有型定義
├── nx.json                # Nx設定
└── package.json
```

作成日: 2025-07-31
