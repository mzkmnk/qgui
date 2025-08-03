# Amazon Q CLI GUI 開発 TODO リスト（YAGNI原則適用版）

## 概要

このディレクトリには、Amazon Q CLI を Web ベースの GUI で操作するためのアプリケーション開発に関する TODO リストが含まれています。
**YAGNI原則（You Aren't Gonna Need It）**に従い、実際に必要な機能のみを**機能単位でRed→Green実装**します。

## 開発方針

- **必要最小限の実装**: 今必要な機能のみ実装
- **機能単位のTDD**: 1つのPRで1つの機能をRed→Greenサイクルで実装
- **バックエンド/フロントエンド分離**: PRを独立して作成可能
- **過早な最適化を避ける**: 問題が発生してから対処

## 開発フェーズ別 TODO リスト

### フェーズ 1: 基盤構築

**ファイル**: [01-foundation-setup.md](./01-foundation-setup.md)

- **実装済み**: スキーマ定義（WebSocket、PTY、API）
- **実装予定**:
  - ヘルスチェックAPI（Backend PR #1）
  - WebSocket基本接続（Backend PR #2）
  - PTYプロセス起動（Backend PR #3）
  - ヘルスチェック呼び出し（Frontend PR #1）
  - WebSocket接続サービス（Frontend PR #2）

### フェーズ 2: コア機能実装

**ファイル**: [02-core-features.md](./02-core-features.md)

- **実装予定**:
  - WebSocketメッセージ送受信（Backend PR #4）
  - PTYコマンド実行（Backend PR #5）
  - WebSocket-PTY連携（Backend PR #6）
  - コマンド入力UI（Frontend PR #3）
  - メッセージ表示（Frontend PR #4）
  - 基本的なANSI処理（Frontend PR #5）

### フェーズ 3: セキュリティ基本設定

**ファイル**: [03-auth-security.md](./03-auth-security.md)

- **実装予定**（ローカル環境のみ）:
  - ローカルアクセス制限（Backend PR #7）
  - 開発用CORS設定（Backend PR #8）
  - 基本的な入力検証（Backend PR #9）
  - サニタイゼーション（Frontend PR #6）

### フェーズ 4: UI/UX 基本改善

**ファイル**: [04-ui-ux-enhancement.md](./04-ui-ux-enhancement.md)

- **実装予定**（最小限のUI改善）:
  - 基本レスポンシブ対応（Frontend PR #7）
  - 基本テーマ機能（Frontend PR #8）
  - 基本アクセシビリティ（Frontend PR #10）

### フェーズ 5: パフォーマンス最適化（必要時のみ）

**ファイル**: [05-performance-optimization.md](./05-performance-optimization.md)

- **方針**: パフォーマンス問題が発生した場合のみ対処
- **削除**: 過早な最適化項目すべて

### フェーズ 6: 品質保証

**ファイル**: [06-quality-assurance.md](./06-quality-assurance.md)

- **方針**: 基本的なテスト維持のみ
- **削除**: 複雑なテスト戦略、メトリクス収集

### その他のフェーズ

- **フェーズ 7**: [技術実装詳細](./07-technical-implementation-details.md) - 必要に応じて実装
- **フェーズ 8**: [WebSocket-PTY統合](./08-websocket-pty-integration.md) - コア機能で実装済み
- **フェーズ 9**: [データベース実装](./09-database-schema-implementation.md) - 現時点では不要

## 削除・延期した項目（YAGNI原則）

### 必要になるまで実装しない機能

- **認証システム**: JWT、マルチユーザー管理
- **データベース**: 履歴保存、検索機能
- **高度なUI/UX**: アニメーション、複雑なテーマ
- **パフォーマンス最適化**: 仮想スクロール、Service Worker
- **高度なテスト**: E2Eテスト、パフォーマンステスト
- **監視・分析**: ダッシュボード、メトリクス収集

## 技術スタック（必要最小限）

### フロントエンド
- Angular 20.1（標準機能のみ使用）
- 基本的なCSS/Tailwind
- シンプルなコンポーネント構成

### バックエンド
- NestJS 11（標準機能のみ使用）
- WebSocket（Socket.io）
- node-pty（基本機能のみ）

## 各PRの完了条件

1. **対象機能のテストがGreen**
2. **リント・型チェックエラーなし**
3. **最小限の実装（ハードコードOK）**
4. **動作確認完了**

## 重要な原則

- **KISS（Keep It Simple, Stupid）**: シンプルに保つ
- **YAGNI（You Aren't Gonna Need It）**: 必要になるまで作らない
- **DRY（Don't Repeat Yourself）**: 重複は最小限に
- **実用性優先**: 完璧より動作を優先

---

**作成日**: 2025-08-02  
**最終更新**: 2025-08-03（YAGNI原則適用）  
**バージョン**: 2.0.0