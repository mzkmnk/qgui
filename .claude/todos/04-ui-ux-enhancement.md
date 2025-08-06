# フェーズ 4: UI/UX改善 - 機能単位 TDD 実装

## 概要

現在の基本的なUIをCrush風のモダンでプロフェッショナルなデザインに改善する。
PrimeNGコンポーネントとTailwind CSSを活用し、洗練されたユーザー体験を提供する。
**注意**: xterm.js統合は フェーズ11で実装するため、現在のmessage-displayコンポーネントを改善して使用する。

## 1. メッセージ表示の改善

### 1.1 スクロール機能の最適化

- [ ] **Red**: `message-display.component.spec.ts` - 自動スクロールテスト
  ```typescript
  it('新しいメッセージで自動的に最下部にスクロール', () => {
    component.addMessage({ type: 'output', content: 'test' });
    expect(component.scrollContainer.scrollTop)
      .toBe(component.scrollContainer.scrollHeight);
  });
  ```
- [ ] **Green**: 自動スクロール実装
- [ ] **Refactor**: スムーズスクロールアニメーション追加
- [ ] **動作確認**: 新しいメッセージが追加されたら自動スクロール

### 1.2 基本的なANSIカラー対応

- [ ] **Red**: `ansi-color.pipe.spec.ts` - ANSIカラーコード変換テスト
  ```typescript
  it('ANSIカラーコードをHTMLに変換', () => {
    const input = '\x1b[31mRed Text\x1b[0m';
    const result = pipe.transform(input);
    expect(result).toContain('color: #ff5555');
  });
  ```
- [ ] **Green**: ANSIカラーパイプ実装
- [ ] **Refactor**: 主要なカラーコードをサポート
- [ ] **動作確認**: ターミナル出力にカラーが適用される

## 2. コマンドパレット実装

### 2.1 コマンドパレットUI

- [ ] **Red**: `command-palette.component.spec.ts` - 表示/非表示テスト
  ```typescript
  it('Cmd+Kでコマンドパレットを表示', () => {
    const event = new KeyboardEvent('keydown', { 
      key: 'k', 
      metaKey: true 
    });
    component.handleKeydown(event);
    expect(component.isVisible).toBe(true);
  });
  ```
- [ ] **Green**: PrimeNG Dialogでコマンドパレット実装
- [ ] **Refactor**: フィルタリング機能追加
- [ ] **動作確認**: Cmd+K（Mac）/Ctrl+K（Windows/Linux）で開く

### 2.2 コマンド検索機能

- [ ] **Red**: コマンド検索テスト
  ```typescript
  it('入力に応じてコマンドをフィルタリング', () => {
    component.searchTerm = 'clear';
    component.filterCommands();
    expect(component.filteredCommands.length).toBeGreaterThan(0);
    expect(component.filteredCommands[0].name).toContain('clear');
  });
  ```
- [ ] **Green**: リアルタイム検索実装
- [ ] **Refactor**: あいまい検索対応
- [ ] **動作確認**: 素早くコマンドを検索・実行できる

## 3. AI応答ビューア

### 3.1 マークダウンレンダリング

- [ ] **Red**: `ai-response.component.spec.ts` - マークダウン変換テスト
  ```typescript
  it('マークダウンをHTMLに変換して表示', () => {
    const markdown = '## Title\n```python\nprint("hello")\n```';
    component.setContent(markdown);
    expect(component.renderedHtml).toContain('<h2>');
    expect(component.renderedHtml).toContain('<pre>');
  });
  ```
- [ ] **Green**: marked.jsでマークダウン処理実装
- [ ] **Refactor**: セキュリティ対策（XSS防止）
- [ ] **動作確認**: AI応答が構造化されて表示される

### 3.2 コードブロックのシンタックスハイライト

- [ ] **Red**: シンタックスハイライトテスト
  ```typescript
  it('コードブロックにシンタックスハイライトを適用', () => {
    const code = '```javascript\nconst x = 1;\n```';
    component.setContent(code);
    expect(component.renderedHtml).toContain('hljs');
  });
  ```
- [ ] **Green**: highlight.jsまたはPrismJS統合
- [ ] **Refactor**: 主要な言語をサポート
- [ ] **動作確認**: コードが読みやすく色分けされる

## 4. Crush風ダークテーマ

### 4.1 カラーパレット定義

- [ ] **Red**: `theme.service.spec.ts` - テーマ適用テスト
  ```typescript
  it('Crushテーマを適用', () => {
    themeService.applyTheme('crush-dark');
    const styles = getComputedStyle(document.documentElement);
    expect(styles.getPropertyValue('--primary-color')).toBe('#f97316');
  });
  ```
- [ ] **Green**: CSS変数でテーマ実装
  ```css
  :root {
    --primary-color: #f97316;      /* オレンジアクセント */
    --bg-primary: #0a0a0a;         /* 深い黒背景 */
    --bg-secondary: #1a1a1a;       /* カード背景 */
    --text-primary: #e5e5e5;       /* 明るいグレーテキスト */
    --text-secondary: #a1a1a1;     /* 薄いグレーテキスト */
    --border-color: #333333;       /* ボーダー色 */
  }
  ```
- [ ] **Refactor**: PrimeNGテーマのカスタマイズ
- [ ] **動作確認**: 目に優しい配色で長時間使用可能

### 4.2 グラスモーフィズム効果

- [ ] **実装**: 半透明とぼかし効果
  ```css
  .glass-panel {
    backdrop-filter: blur(10px);
    background: rgba(10, 10, 10, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  ```
- [ ] **動作確認**: モダンで洗練された見た目

## 5. キーボードショートカット

### 5.1 ショートカット管理サービス

- [ ] **Red**: `shortcut.service.spec.ts` - ショートカット登録テスト
  ```typescript
  it('ショートカットを登録・実行できる', () => {
    const handler = jasmine.createSpy('handler');
    service.register('cmd+shift+p', handler);
    service.trigger('cmd+shift+p');
    expect(handler).toHaveBeenCalled();
  });
  ```
- [ ] **Green**: グローバルショートカット管理実装
- [ ] **Refactor**: 設定可能なショートカット
- [ ] **動作確認**: 効率的なキーボード操作

### 5.2 主要ショートカット実装

- [ ] **実装**: 以下のショートカットを追加
  - `Cmd/Ctrl + K`: コマンドパレット
  - `Cmd/Ctrl + Enter`: コマンド実行
  - `Cmd/Ctrl + L`: 画面クリア
  - `Cmd/Ctrl + C`: 実行中のコマンド中断
  - `Cmd/Ctrl + /`: ヘルプ表示
- [ ] **動作確認**: 各ショートカットが正しく動作

## 6. サイドバーとレイアウト

### 6.1 折りたたみ可能サイドバー

- [ ] **Red**: `sidebar.component.spec.ts` - サイドバー開閉テスト
  ```typescript
  it('サイドバーをトグルできる', () => {
    expect(component.isOpen).toBe(true);
    component.toggle();
    expect(component.isOpen).toBe(false);
  });
  ```
- [ ] **Green**: PrimeNG Sidebarコンポーネント実装
- [ ] **Refactor**: アニメーション追加
- [ ] **動作確認**: スムーズな開閉動作

### 6.2 セッション履歴表示

- [ ] **Red**: セッション履歴表示テスト
- [ ] **Green**: 履歴リスト実装
- [ ] **Refactor**: 検索・フィルタリング機能
- [ ] **動作確認**: 過去のセッションに素早くアクセス

## 7. ステータスバー

### 7.1 情報表示バー実装

- [ ] **Red**: `status-bar.component.spec.ts` - ステータス表示テスト
  ```typescript
  it('接続状態を表示', () => {
    component.connectionStatus = 'connected';
    fixture.detectChanges();
    expect(element.textContent).toContain('Connected');
  });
  ```
- [ ] **Green**: 下部ステータスバー実装
- [ ] **Refactor**: リアルタイム更新
- [ ] **動作確認**: 以下の情報が表示される
  - WebSocket接続状態
  - 実行中のコマンド数
  - 現在のディレクトリ
  - 時刻

## 8. アニメーション強化

### 8.1 スムーズなトランジション

- [ ] **Red**: `animation.service.spec.ts` - アニメーション動作テスト
- [ ] **Green**: Angular Animations API使用
- [ ] **Refactor**: パフォーマンス最適化
- [ ] **動作確認**: 画面遷移がスムーズ

### 8.2 ローディング表示

- [ ] **Red**: ローディング表示テスト
- [ ] **Green**: PrimeNG ProgressSpinner実装
- [ ] **Refactor**: カスタムローディングアニメーション
- [ ] **動作確認**: 処理中の状態が分かりやすい

## 9. レスポンシブデザイン

### 9.1 モバイル対応

- [ ] **Red**: レスポンシブレイアウトテスト
- [ ] **Green**: Tailwind CSSでレスポンシブ実装
- [ ] **Refactor**: タッチ操作対応
- [ ] **動作確認**: 各デバイスサイズで適切に表示

## 各PRの完了条件

### フロントエンドPR

- [ ] 全テストがGreen
- [ ] `npm run frontend:lint` エラーなし
- [ ] `npm run frontend:test` 成功
- [ ] レスポンシブデザイン確認済み
- [ ] Crush風ダークテーマ適用済み
- [ ] キーボードショートカット動作確認済み

## 次のフェーズへの移行条件

- [ ] メッセージ表示が改善されている
- [ ] コマンドパレットが動作する
- [ ] AI応答が美しく表示される
- [ ] Crush風のダークテーマが適用されている
- [ ] 主要なキーボードショートカットが実装されている
- [ ] ステータスバーで情報が確認できる