# Amazon Q CLI 調査レポート

## 1. Amazon Q CLI のコマンド構造

### 基本コマンド一覧

```bash
# チャットコマンド（デフォルト）
q chat                  # インタラクティブチャットセッションを開始
q chat "質問内容"        # 直接質問を投げる

# 翻訳コマンド
q translate "自然言語"   # 自然言語をシェルコマンドに変換
q translate -n 3        # 最大3つの候補を表示

# 診断・管理コマンド
q doctor               # インストールと設定の問題を診断
q doctor --all         # すべての診断テストを実行
q doctor --strict      # 警告でもエラーとして扱う

# 認証コマンド
q login                # Amazon Qにログイン
q login --license free # AWS Builder ID（無料）でログイン
q login --license pro --identity-provider https://company.awsapps.com/start --region us-east-1
q logout               # ログアウト
q whoami              # 現在のユーザー情報を表示

# インライン補完
q inline enable       # インライン補完を有効化
q inline disable      # インライン補完を無効化
q inline status       # インライン補完の状態を確認

# MCPサーバー管理
q mcp add            # MCPサーバーを追加
q mcp remove         # MCPサーバーを削除
q mcp list           # MCPサーバー一覧を表示
q mcp status         # MCPサーバーの状態を確認

# その他のコマンド
q version            # バージョン情報を表示
q issue              # GitHubイシューを作成
q settings           # 設定管理
q update             # Amazon Qをアップデート
q theme              # ビジュアルテーマの管理
```

### コマンドオプションとフラグ

#### chat コマンド

- `--no-interactive`: インタラクティブモードを無効化し、最初の応答のみを表示
- `--resume`: 前回の会話を再開
- `--profile`: コンテキストプロファイルを設定
- `--trust-all-tools`: モデルがすべてのツールを使用できるようにする

#### translate コマンド

- `-n <数値>`: 生成する補完候補の数（最大 5）

#### update コマンド

- `--non-interactive`: 確認プロンプトなしでアップデート
- `--relaunch-dashboard`: アップデート後に再起動

## 2. 利用可能なツール一覧

### デフォルトで使えるツール

Amazon Q CLI は以下のツールを標準でサポート：

1. **ファイルシステムアクセス**

   - ローカルファイルの読み書き
   - ディレクトリ操作
   - ファイル検索

2. **コマンド実行**

   - シェルコマンドの実行
   - プロセス管理

3. **開発ツール統合**

   - git（バージョン管理）
   - npm（パッケージ管理）
   - docker（コンテナ管理）
   - aws（AWS CLI）

4. **エディタ統合**
   - `/editor` コマンドで外部エディタを起動

### MCP（Model Context Protocol）ツール

MCP を使用して外部データソースと統合：

- データベース接続
- API 統合
- カスタムツール

### ツールの承認メカニズム

1. **信頼レベル**

   - デフォルト: 信頼されていない（毎回承認が必要）
   - 信頼済み: 自動的に使用される
   - 危険: 特別な警告が表示される

2. **承認オプション**

   - Ask: 毎回承認を求める（デフォルト）
   - Always allow: 常に許可する
   - Deny: 使用を拒否する

3. **信頼設定の変更**
   ```bash
   /tools trust  # チャット内でツールの信頼設定を切り替え
   ```

## 3. 設定オプション

### 設定ファイルの場所

1. **グローバル設定**

   - `~/.aws/amazonq/mcp.json` - すべてのワークスペースに適用

2. **ワークスペース設定**
   - `.amazonq/mcp.json` - 現在のワークスペースのみに適用

### MCP 設定ファイルの形式

```json
{
  "mcpServers": {
    "server-name": {
      "command": "実行するコマンド",
      "args": ["引数1", "引数2"],
      "env": {
        "環境変数名": "値"
      }
    }
  }
}
```

### 環境変数

- `Q_LOG_LEVEL`: ログレベルの制御
- MCP サーバーごとの環境変数設定が可能

### スコープオプション

- **Global**: すべてのプロジェクトで使用可能
- **Workspace**: 現在の IDE ワークスペースのみ

## 4. 出力フォーマット

### ストリーミング出力

- リアルタイムでの応答表示
- プログレッシブローディング（MCP サーバーが順次利用可能になる）

### マークダウンフォーマット

- Amazon Q CLI はマークダウン形式で出力
- アンダースコア文字の処理に既知の問題あり（Issue #2394）
- コードブロック、リスト、見出しなどのマークダウン要素をサポート

### ANSI エスケープコード

- モダンなターミナルでサポートされる ANSI エスケープコードに対応
- カラー出力、カーソル制御、フォントスタイリング
- Windows 10 バージョン 1511 以降でサポート

### エラーメッセージ

- 構造化されたエラー出力
- デバッグ情報の表示（`--verbose`オプション使用時）

## 5. 認証とセキュリティ

### AWS Builder ID（無料版）

```bash
q login --license free
```

- 個人使用向け
- AWS 管理コンソールへのアクセス不可
- IAM ロールや権限の割り当て不可
- IDE とコマンドラインでのみサポート

### IAM Identity Center（Pro 版）

```bash
q login --license pro --identity-provider https://my-company.awsapps.com/start --region us-east-1
```

- エンタープライズグレードの認証
- AWS 管理コンソールへのアクセス可能
- カスタマイゼーションなどの Pro 機能

### セッション管理

- **デフォルトセッション期間**:

  - IAM Identity Center: 8 時間（通常）、90 日（Amazon Q）
  - Builder ID: 継続的

- **認証の更新**:
  - 期限切れ時は再ログインが必要
  - キャッシュされた認証情報の自動更新

### セキュリティベストプラクティス

1. **最小権限の原則**

   - 必要最小限のツールのみを信頼する
   - 読み取り専用ツールと書き込みツールを区別

2. **定期的な認証更新**

   - セッションの定期的な確認
   - 不要な認証情報の削除

3. **ツール承認の慎重な管理**
   - 危険なツールには特別な注意
   - 信頼設定の定期的な見直し

## 6. node-pty での実行方法

### 基本的な実装例

```typescript
import * as os from 'node:os';
import * as pty from 'node-pty';

// Amazon Q CLIをnode-ptyで実行
const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
const ptyProcess = pty.spawn(shell, [], {
  name: 'xterm-color',
  cols: 80,
  rows: 30,
  cwd: process.env.HOME,
  env: {
    ...process.env,
    Q_LOG_LEVEL: 'info', // ログレベル設定
  },
});

// Amazon Q CLIコマンドの実行
ptyProcess.write('q chat\r');

// 出力の処理
ptyProcess.onData((data) => {
  // ANSIエスケープコードを含む出力の処理
  process.stdout.write(data);

  // マークダウンやツール承認プロンプトの解析
  // ここで出力を解析して適切に処理
});

// インタラクティブな入力
ptyProcess.write('AWS S3バケットの一覧を表示するコマンドを教えて\r');

// ウィンドウサイズの変更
ptyProcess.resize(100, 40);

// プロセスの終了
ptyProcess.kill();
```

### セッション管理

````typescript
class AmazonQSession {
  private ptyProcess: any;
  private outputBuffer: string = '';

  constructor() {
    this.initializeSession();
  }

  private initializeSession() {
    this.ptyProcess = pty.spawn('q', ['chat', '--no-interactive'], {
      name: 'xterm-256color',
      cols: 120,
      rows: 40,
      env: process.env,
    });

    this.ptyProcess.onData((data: string) => {
      this.outputBuffer += data;
      this.parseOutput(data);
    });
  }

  private parseOutput(data: string) {
    // ツール承認プロンプトの検出
    if (data.includes('Allow') || data.includes('Deny')) {
      // 承認処理
    }

    // マークダウンコードブロックの検出
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    // 処理...
  }

  public sendCommand(command: string) {
    this.ptyProcess.write(command + '\r');
  }

  public destroy() {
    this.ptyProcess.kill();
  }
}
````

### 注意事項

1. **権限レベル**

   - node-pty から起動されたプロセスは親プロセスと同じ権限レベルで実行
   - インターネットアクセス可能なサーバーでは特に注意

2. **プラットフォーム対応**

   - macOS: フルサポート
   - Linux: Ubuntu/Debian、AppImage サポート
   - Windows: WSL 経由での使用を推奨

3. **エラーハンドリング**
   - プロセスの異常終了
   - タイムアウト処理
   - 入出力エラーの適切な処理

## まとめ

Amazon Q CLI は、AI を活用した強力なコマンドラインツールで、以下の特徴を持ちます：

1. **豊富なコマンドセット**: チャット、翻訳、診断など多様な機能
2. **柔軟なツール統合**: MCP を通じた拡張可能なアーキテクチャ
3. **セキュアな認証**: Builder ID と IAM Identity Center の両方をサポート
4. **開発者フレンドリー**: 主要な開発ツールとの統合
5. **プログラマブル**: node-pty を使用した自動化が可能

これらの機能により、開発者の生産性を大幅に向上させることができます。
