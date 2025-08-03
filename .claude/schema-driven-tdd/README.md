# スキーマ駆動開発 + TDD 統合ガイド

## 概要

このガイドは、Nx + Angular + NestJS 構成でスキーマ駆動開発（Schema-Driven Development）とテスト駆動開発（TDD）を統合する方法を説明します。

## 目次

1. [01-overview.md](./01-overview.md) - 全体概要と戦略
2. [02-setup-guide.md](./02-setup-guide.md) - 環境構築とツールチェーン設定
3. [03-implementation-workflow.md](./03-implementation-workflow.md) - 実装ワークフローとベストプラクティス
4. [04-examples.md](./04-examples.md) - 実践的なサンプルコード

## プロジェクト方針

- **1 ファイル 1 関数、1 関数 1 責務**の原則に従う
- **バレルエクスポートは行わない**
- **t-wada が推奨する TDD**を採用
- **すべてのコミュニケーションとコードコメントは日本語**

## 期待される効果

- 型安全性による実行時エラー削減
- API 仕様とコードの自動同期
- TDD による設計品質向上
- 開発効率の大幅な向上
