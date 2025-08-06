# フェーズ 3: ローカルセキュリティ基本設定 - 機能単位 TDD 実装

## 概要

ローカル環境でのアプリケーション実行に必要な最小限のセキュリティ設定を実装する。
Amazon Q CLIは既にログイン済みの前提とし、アプリケーション自体のセキュリティのみに焦点を当てる。

## 前提条件

- **Amazon Q CLIは既にログイン済み**（認証情報管理は不要）
- **完全ローカル環境での実行**（デプロイなし）
- **シングルユーザー利用**（マルチユーザー認証不要）

## ローカルセキュリティ実装

### 1. コマンド実行制限

#### 1.1 危険なコマンドのフィルタリング

- [x] **Red**: `command-filter.service.spec.ts` - 危険コマンドブロックテスト
  ```typescript
  it('危険なコマンドをブロックする', () => {
    const dangerous = ['rm -rf /', 'sudo rm -rf', 'mkfs'];
    dangerous.forEach(cmd => {
      expect(filterService.isSafe(cmd)).toBe(false);
    });
  });
  ```
- [x] **Green**: `command-filter.service.ts` - コマンドフィルタリング実装
- [x] **動作確認**: 危険なコマンドが実行されない

### 2. 入力サニタイゼーション

#### 2.1 XSS対策

- [x] **Red**: `sanitization.service.spec.ts` - HTML/スクリプト除去テスト
- [x] **Green**: 入力値のサニタイゼーション実装
- [x] **動作確認**: 悪意あるスクリプトが実行されない

### 3. localhost限定アクセス

#### 3.1 ローカルホストのみアクセス許可

- [x] **Red**: CORS設定の動作確認テスト
- [x] **Green**: localhost限定のCORS設定実装
- [x] **動作確認**: ローカル環境でのみアクセス可能

## プロセス管理

### 4. PTYプロセスの安全な管理

#### 4.1 プロセスのクリーンアップ

- [ ] **Red**: `pty-cleanup.service.spec.ts` - プロセス終了処理テスト
  ```typescript
  it('アプリ終了時に全PTYプロセスを終了する', () => {
    const processes = ptyManager.getAllProcesses();
    ptyManager.cleanupAll();
    expect(processes.every(p => p.killed)).toBe(true);
  });
  ```
- [ ] **Green**: プロセスクリーンアップ実装
- [ ] **動作確認**: ゾンビプロセスが残らない

### 5. メモリ制限

#### 5.1 出力バッファ制限

- [ ] **Red**: `buffer-limit.spec.ts` - バッファサイズ制限テスト
- [ ] **Green**: 出力バッファの最大サイズ設定（例：10MB）
- [ ] **動作確認**: 大量出力でもメモリ枯渇しない

## 削除・延期した項目（YAGNI原則）

以下の項目は実際に必要になるまで実装しない：

### AWS関連（Amazon Q CLIが既にログイン済みのため不要）
- AWS認証情報管理
- AWS STS統合
- IAMロール管理
- AWS認証UIコンポーネント

### 過剰なセキュリティ（ローカル環境のため不要）
- HTTPS/TLS設定
- JWT認証システム
- セッション管理
- マルチユーザー認証
- OAuth/SAML統合
- ファイアウォール設定
- セキュリティスキャナー統合
- ペネトレーションテスト
- 監査ログ機能

## 各PRの完了条件

### バックエンドPR

- [ ] 危険なコマンドフィルタリングテストがGreen
- [ ] `npm run backend:lint` エラーなし
- [ ] PTYプロセスが適切にクリーンアップされる
- [ ] localhostのみアクセス可能

### フロントエンドPR

- [ ] サニタイゼーションテストがGreen
- [ ] `npm run frontend:lint` エラーなし
- [ ] XSS脆弱性がない

## 次のフェーズへの移行条件

- [ ] 危険なコマンドがブロックされる
- [ ] XSS攻撃が防げる
- [ ] localhostのみアクセス可能
- [ ] PTYプロセスが適切に管理される
- [ ] メモリ使用量が制限される