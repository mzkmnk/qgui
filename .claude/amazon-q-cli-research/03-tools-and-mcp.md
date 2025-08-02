# Amazon Q CLI ツールとMCP調査

## 1. ツール実行の仕組み

### ツール実行フロー
1. **Thinking状態**: アニメーションで「Thinking...」が表示
2. **ツール使用宣言**: `🛠️  Using tool: {ツール名} (trusted/untrusted)`
3. **実行詳細表示**: 実行内容がインデントされて表示
4. **完了通知**: 実行時間と共に完了メッセージ

### ツール承認の状態
- `(trusted)` - 自動的に承認されたツール
- `(untrusted)` - ユーザー承認が必要なツール

## 2. 確認されたツール

### fs_read
ファイルシステムの読み取りツール
```
🛠️  Using tool: fs_read (trusted)
 ⋮ 
 ● Reading directory: /Users/${username}/dev/qgui with maximum depth of 0
 ⋮ 
 ● Completed in 0.0s
```

## 3. Amazon Q CLIの標準ツール（推測）

公式ドキュメントやコマンド出力から推測される標準ツール：

### ファイルシステム操作
- `fs_read` - ファイル/ディレクトリの読み取り
- `fs_write` - ファイルへの書き込み
- `fs_create` - ファイル/ディレクトリの作成
- `fs_delete` - ファイル/ディレクトリの削除

### コマンド実行
- `exec` - シェルコマンドの実行
- `npm` - npmコマンドの実行
- `git` - gitコマンドの実行

### 開発ツール
- `docker` - Dockerコマンドの実行
- `aws` - AWS CLIコマンドの実行

## 4. MCP (Model Context Protocol)

### 概要
MCPは、Amazon Q CLIがツールやコンテキストを拡張するためのプロトコル。

### 設定ファイル
- グローバル: `~/.aws/amazonq/mcp.json`
- ワークスペース: `.amazonq/mcp.json`

### 設定例
```json
{
  "mcpServers": {
    "prompts_mcp_server": {
      "command": "node",
      "args": ["/path/to/server/dist/index.js"],
      "env": {
        "PROJECT_ROOT": ".",
        "LOG_LEVEL": "debug"
      },
      "timeout": 120000,
      "disabled": false
    }
  }
}
```

### MCPサーバー設定項目
- `command`: 実行コマンド（node、python等）
- `args`: コマンド引数
- `env`: 環境変数
- `timeout`: タイムアウト時間（ミリ秒）
- `disabled`: 無効化フラグ

### MCPサーバーの初期化
```
⠋ 0 of 1 mcp servers initialized. ctrl-c to start chatting now
⚠ prompts_mcp_server has loaded in 0.10 s with the following warning:
The following tool names are changed:
 - prompts_mcp_server___explain-code -> prompts_mcp_server___explaincode
✓ 1 of 1 mcp servers initialized.
```

## 5. ツール承認メカニズム

### 承認レベル
1. **Ask (デフォルト)**: 毎回承認を求める
2. **Always allow**: 常に許可
3. **Deny**: 拒否

### 承認プロセス
1. ツール実行前に承認プロンプトが表示（untrustedの場合）
2. ユーザーが承認/拒否を選択
3. 承認された場合のみツールが実行される

### trust-toolsオプション
```bash
# すべてのツールを信頼
q chat --trust-all-tools

# 特定のツールのみ信頼
q chat --trust-tools=fs_read,fs_write

# すべてのツールを信頼しない
q chat --trust-tools=
```

## 6. ツール実行時の表示要素

### Thinkingアニメーション
```
⠋ Thinking...
⠙ Thinking...
⠹ Thinking...
⠸ Thinking...
⠼ Thinking...
⠴ Thinking...
⠦ Thinking...
⠧ Thinking...
⠇ Thinking...
⠏ Thinking...
```

### ツール実行表示
```
[38;5;13m🛠️  Using tool: {tool_name}[38;5;2m (trusted)[39m[39m
 ⋮ 
 ● {実行内容詳細}
 ⋮ 
[38;5;10m[1m ● Completed in {time}s[39m
```

### 色コード
- `[38;5;13m` - マゼンタ（ツールアイコン）
- `[38;5;2m` - 緑（trusted状態）
- `[38;5;10m` - 明るい緑（完了メッセージ）

## 7. GUIでの実装に向けた考慮事項

### ツール承認UI
1. 承認待ちツールのモーダル表示
2. ツール名、コマンド、リスクレベルの表示
3. Allow/Denyボタン
4. "Always allow this tool"チェックボックス

### ツール実行状態の表示
1. Thinkingアニメーション → スピナーアイコン
2. ツール実行中の進行状況表示
3. 実行結果のインライン表示

### MCPサーバー管理
1. MCPサーバーの一覧表示
2. サーバーの有効/無効切り替え
3. サーバー設定の編集UI
4. 初期化状態の監視