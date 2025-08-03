# Amazon Q CLI コマンド構造調査

## 1. 基本情報

### バージョン

```
q 1.12.7
```

### インストールパス

```
/Users/${username}/.local/bin/q
```

## 2. 利用可能なコマンド一覧

### 人気のサブコマンド

- `chat` - Amazon Q とチャット
- `translate` - 自然言語からシェルコマンドへの変換
- `doctor` - インストール問題のデバッグ
- `settings` - 外観と動作のカスタマイズ
- `quit` - アプリケーションの終了

### すべてのコマンド

#### セットアップ・認証関連

- `login` - ログイン
- `logout` - ログアウト
- `whoami` - 現在のユーザーの詳細を表示
- `profile` - IDC ユーザーに関連付けられたプロファイルを表示
- `user` - アカウント管理
- `setup` - CLI コンポーネントのセットアップ
- `init` - 指定されたシェル用の dotfiles を生成

#### 開発支援

- `chat` - ターミナル内の AI アシスタント
- `translate` - 自然言語からシェルコマンドへの変換
- `inline` - インラインシェル補完
- `mcp` - Model Context Protocol (MCP)

#### デバッグ・診断

- `debug` - アプリのデバッグ
- `diagnostic` - 診断テストの実行
- `doctor` - 一般的な問題の修正と診断

#### アプリケーション管理

- `launch` - デスクトップアプリの起動
- `quit` - デスクトップアプリの終了
- `restart` - デスクトップアプリの再起動
- `update` - Amazon Q アプリケーションの更新

#### 設定・カスタマイズ

- `settings` - 外観と動作のカスタマイズ
- `theme` - テーマの取得または設定
- `integrations` - システム統合の管理

#### その他

- `dashboard` - ダッシュボードを開く
- `issue` - 新しい GitHub issue を作成
- `help` - ヘルプメッセージの表示

## 3. chat コマンドの詳細

### 使用方法

```bash
q chat [OPTIONS] [INPUT]
```

### 引数

- `[INPUT]` - 最初の質問（オプション）

### オプション

| オプション                   | 短縮形 | 説明                                   |
| :--------------------------- | :----- | :------------------------------------- |
| `--resume`                   | `-r`   | このディレクトリから前の会話を再開     |
| `--profile <PROFILE>`        |        | 使用するコンテキストプロファイル       |
| `--model <MODEL>`            |        | 使用するモデル                         |
| `--trust-all-tools`          | `-a`   | 確認なしですべてのツールの使用を許可   |
| `--trust-tools <TOOL_NAMES>` |        | 特定のツールのみを信頼（カンマ区切り） |
| `--no-interactive`           |        | ユーザー入力を期待せずに実行           |
| `--verbose`                  | `-v`   | ログの詳細度を上げる                   |
| `--help`                     | `-h`   | ヘルプを表示                           |

### 使用例

```bash
# 基本的な使用
q chat

# 最初の質問を含めて起動
q chat "Pythonで Hello World を書いて"

# すべてのツールを信頼して実行
q chat -a

# 特定のツールのみを信頼
q chat --trust-tools=fs_read,fs_write

# 前の会話を再開
q chat --resume
```

## 4. MCP コマンドの詳細

### 使用方法

```bash
q mcp <COMMAND>
```

### サブコマンド

- `add` - 設定済みサーバーの追加または置換
- `remove` - MCP 設定からサーバーを削除
- `list` - 設定済みサーバーの一覧表示
- `import` - 別のファイルからサーバー設定をインポート
- `status` - 設定済みサーバーのステータスを取得

### 現在の設定

```
📄 workspace:
  /Users/${username}/dev/qgui/.amazonq/mcp.json
    (empty)

🌍 global:
  /Users/${username}/.aws/amazonq/mcp.json
    • prompts_mcp_server node
```

## 5. グローバルオプション

すべてのコマンドで使用可能：

- `-v, --verbose` - ログの詳細度を増加（複数指定可能）
- `-h, --help` - ヘルプを表示
- `-V, --version` - バージョンを表示

## 6. 環境変数

- `Q_LOG_LEVEL` - ログレベルの設定
- `Q_CONFIG_DIR` - 設定ディレクトリのカスタマイズ

## 7. 設定ファイルの場所

- グローバル設定: `~/.aws/amazonq/`
- ワークスペース設定: `.amazonq/`
- MCP 設定: `mcp.json`
