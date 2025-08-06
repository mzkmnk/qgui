# フェーズ 4: Crush風モダンUI/UX実装 - 機能単位 TDD 実装

## 概要

CrushのようなモダンでプロフェッショナルなターミナルUIを実装する。
PrimeNGコンポーネントとTailwind CSSを活用し、洗練されたユーザー体験を提供する。

## ターミナルUI強化

### 1. xterm.js統合

#### 1.1 ターミナルエミュレータ実装

- [ ] **Red**: `terminal.service.spec.ts` - xterm.js初期化テスト
  ```typescript
  it('xterm.jsターミナルを初期化できる', () => {
    const terminal = terminalService.createTerminal();
    expect(terminal).toBeDefined();
    expect(terminal.cols).toBe(80);
    expect(terminal.rows).toBe(24);
  });
  ```
- [ ] **Green**: `terminal.service.ts` - xterm.js統合実装
- [ ] **動作確認**: プロフェッショナルなターミナル表示

### 2. スプリットビュー

#### 2.1 ペイン分割機能

- [ ] **Red**: `split-view.component.spec.ts` - ペイン分割テスト
  ```typescript
  it('ターミナルを垂直分割できる', () => {
    component.splitVertical();
    expect(component.panes.length).toBe(2);
    expect(component.activePaneIndex).toBe(1);
  });
  ```
- [ ] **Green**: `split-view.component.ts` - PrimeNG Splitterでペイン管理
- [ ] **動作確認**: 複数ターミナルを同時表示可能

## モダンUIコンポーネント

### 3. コマンドパレット

#### 3.1 Cmd+K風コマンドパレット

- [ ] **Red**: `command-palette.component.spec.ts` - コマンドパレット表示テスト
  ```typescript
  it('Cmd+Kでコマンドパレットを表示', () => {
    const event = new KeyboardEvent('keydown', { 
      key: 'k', 
      metaKey: true 
    });
    component.handleKeydown(event);
    expect(component.isPaletteVisible).toBe(true);
  });
  ```
- [ ] **Green**: `command-palette.component.ts` - PrimeNG Dialogでパレット実装
- [ ] **動作確認**: スムーズなコマンド検索と実行

### 4. AI応答ビューア

#### 4.1 構造化されたAI応答表示

- [ ] **Red**: `ai-response.component.spec.ts` - マークダウンレンダリングテスト
  ```typescript
  it('AI応答をマークダウンとして表示', () => {
    const response = '## Title\n```python\ncode\n```';
    component.setResponse(response);
    expect(component.renderedHtml).toContain('<h2>');
    expect(component.renderedHtml).toContain('<pre>');
  });
  ```
- [ ] **Green**: `ai-response.component.ts` - marked.jsでマークダウン処理
- [ ] **動作確認**: コードブロックのシンタックスハイライト付き表示

## テーマシステム

### 5. Crush風ダークテーマ

#### 5.1 プロフェッショナルなダークテーマ

- [ ] **Red**: `theme.service.spec.ts` - Crush風テーマ適用テスト
- [ ] **Green**: CSS変数でCrush風カラーパレット実装
  ```css
  --primary-color: #f97316; /* オレンジアクセント */
  --bg-terminal: #0a0a0a;   /* 深い黒背景 */
  --text-primary: #e5e5e5;  /* 明るいグレーテキスト */
  ```
- [ ] **動作確認**: 目に優しい配色で長時間使用可能

### 6. グラスモーフィズム効果

#### 6.1 半透明とぼかし効果

- [ ] **実装**: 背景のぼかしと半透明効果
  ```css
  backdrop-filter: blur(10px);
  background: rgba(10, 10, 10, 0.85);
  ```
- [ ] **動作確認**: モダンで洗練された見た目

## インタラクション強化

### 7. スムーズなアニメーション

#### 7.1 トランジション効果

- [ ] **Red**: `animation.service.spec.ts` - アニメーション動作テスト
- [ ] **Green**: Angular Animationsで滑らかな遷移実装
- [ ] **動作確認**: パネル開閉、コマンド実行時のスムーズな動き

### 8. キーボードショートカット

#### 8.1 プロ向けショートカット

- [ ] **Red**: `shortcut.service.spec.ts` - ショートカット登録テスト
  ```typescript
  it('カスタムショートカットを登録できる', () => {
    shortcutService.register('cmd+shift+p', () => {});
    expect(shortcutService.getShortcuts().length).toBe(1);
  });
  ```
- [ ] **Green**: グローバルショートカット管理サービス
- [ ] **動作確認**: Vim風ナビゲーション、クイックアクション

## サイドバーとナビゲーション

### 9. 折りたたみ可能サイドバー

#### 9.1 セッション管理サイドバー

- [ ] **Red**: `sidebar.component.spec.ts` - サイドバー開閉テスト
- [ ] **Green**: PrimeNG Sidebarでセッション一覧表示
- [ ] **動作確認**: セッション切り替え、履歴表示

### 10. ステータスバー

#### 10.1 情報表示バー

- [ ] **実装**: 下部ステータスバー
  - AWS接続状態
  - 実行中のコマンド数
  - メモリ使用量
  - 現在のディレクトリ
- [ ] **動作確認**: リアルタイム情報更新

## コンテキストメニュー

### 11. 右クリックメニュー

#### 11.1 ターミナル内コンテキストメニュー

- [ ] **Red**: `context-menu.component.spec.ts` - メニュー表示テスト
- [ ] **Green**: PrimeNG ContextMenuで実装
- [ ] **動作確認**: コピー、貼り付け、検索等のクイックアクション

## インラインサジェスト

### 12. AIコマンド補完

#### 12.1 リアルタイムサジェスト

- [ ] **Red**: `suggestion.service.spec.ts` - サジェスト表示テスト
- [ ] **Green**: Amazon Q APIでコマンド候補取得
- [ ] **動作確認**: Tab補完でコマンド入力効率化

## 削除・延期した項目（YAGNI原則）

以下の項目は実際に必要になるまで実装しない：

- 3Dエフェクト
- パーティクルアニメーション
- カスタムフォント読み込み
- 音声フィードバック
- タッチバー対応（macOS）
- ゲーミフィケーション要素
- ソーシャル機能
- プロファイル同期

## 各PRの完了条件

### フロントエンドPR

- [ ] UIコンポーネントのテストが全てGreen
- [ ] `npm run frontend:lint` エラーなし
- [ ] レスポンシブデザイン確認
- [ ] アクセシビリティ基準を満たす
- [ ] パフォーマンス劣化なし（初回描画3秒以内）

## 次のフェーズへの移行条件

- [ ] xterm.jsでプロターミナル表示
- [ ] Crush風のダークテーマ適用
- [ ] コマンドパレット機能動作
- [ ] AI応答の美しい表示
- [ ] キーボードショートカット実装
- [ ] スムーズなアニメーション動作