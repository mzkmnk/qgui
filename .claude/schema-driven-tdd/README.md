# スキーマ駆動開発 + TDD統合ガイド

## 概要

このガイドは、Nx + Angular + NestJS構成でスキーマ駆動開発（Schema-Driven Development）とテスト駆動開発（TDD）を統合する方法を説明します。

## 目次

1. [01-overview.md](./01-overview.md) - 全体概要と戦略
2. [02-setup-guide.md](./02-setup-guide.md) - 環境構築とツールチェーン設定
3. [03-implementation-workflow.md](./03-implementation-workflow.md) - 実装ワークフローとベストプラクティス
4. [04-examples.md](./04-examples.md) - 実践的なサンプルコード

## プロジェクト方針

- **1ファイル1関数、1関数1責務**の原則に従う
- **バレルエクスポートは行わない**
- **t-wadaが推奨するTDD**を採用
- **すべてのコミュニケーションとコードコメントは日本語**

## 期待される効果

- 型安全性による実行時エラー削減
- API仕様とコードの自動同期
- TDDによる設計品質向上
- 開発効率の大幅な向上