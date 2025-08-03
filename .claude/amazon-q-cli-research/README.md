# Amazon Q CLI 調査ドキュメント

## 概要

このディレクトリには、Amazon Q CLI の詳細な調査結果と GUI アプリケーション開発のためのデータスキーマ定義が含まれています。

## 調査日

2025-08-01

## Amazon Q CLI バージョン

- Version: 1.12.7
- Path: `/Users/${username}/.local/bin/q`

## ドキュメント構成

### 1. [コマンド構造](./01-command-structure.md)

Amazon Q CLI の全コマンド一覧と詳細な使用方法

- 利用可能なコマンドとサブコマンド
- chat コマンドの詳細オプション
- MCP コマンドの使い方
- グローバルオプション

### 2. [出力フォーマット](./02-output-formats.md)

CLI の出力形式とパース方法

- ANSI エスケープコードの詳細
- メッセージタイプの識別
- マークダウンとコードブロックの処理
- ストリーミング出力の仕組み

### 3. [ツールと MCP](./03-tools-and-mcp.md)

ツール実行と Model Context Protocol の仕組み

- ツール承認メカニズム
- 標準ツール一覧
- MCP 設定と管理
- ツール実行時の表示

### 4. [node-pty 統合](./04-node-pty-integration.md)

node-pty を使用した CLI 制御の実装ガイド

- PTY プロセスの起動と管理
- 出力のパースとバッファリング
- セッション管理クラスの実装
- プラットフォーム固有の考慮事項

### 5. [データスキーマ](./05-data-schema.md)

GUI アプリケーションのための完全なデータモデル定義

- TypeScript 型定義
- WebSocket メッセージ形式
- データベーススキーマ
- 状態管理モデル

## サンプルファイル

- `sample-output-1.txt` - コード生成時の出力サンプル
- `sample-tool-approval.txt` - ツール実行時の出力サンプル
- `settings.json` - 現在の設定値

## 主な発見事項

### 1. 認証

- Builder ID と IAM Identity Center の 2 種類の認証方式
- 現在の環境は Builder ID でログイン済み

### 2. ツール実行

- fs_read 等の標準ツールは自動的に信頼される
- ツール実行前に「Thinking...」アニメーションが表示
- 実行結果は色付きで表示される

### 3. MCP

- Model Context Protocol による拡張可能なアーキテクチャ
- グローバルとワークスペースレベルの設定
- カスタム MCP サーバーの統合が可能

### 4. 出力処理

- 豊富な ANSI エスケープコードの使用
- プログレッシブな出力表示
- マークダウン形式のサポート

## 次のステップ

1. **バックエンド実装**

   - node-pty を使用した Amazon Q CLI プロセス管理
   - WebSocket によるリアルタイム通信
   - ツール承認メカニズムの実装

2. **フロントエンド実装**

   - ANSI パーサーの実装
   - リアルタイムストリーミング表示
   - ツール承認 UI の作成

3. **データベース設計**
   - SQLite によるセッション履歴管理
   - ユーザー設定の永続化
   - 検索機能の実装

## 参考リソース

- [Amazon Q CLI 公式ドキュメント](https://docs.aws.amazon.com/amazonq/latest/cli/)
- [node-pty GitHub](https://github.com/microsoft/node-pty)
- [ANSI Escape Codes](https://en.wikipedia.org/wiki/ANSI_escape_code)
