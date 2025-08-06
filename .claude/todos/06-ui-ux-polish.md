# フェーズ 6: UI/UX磨き上げ（Crush風プロフェッショナルUI）

## 概要

チャットUI基盤とAmazon Q統合が完成した上で、Crush風の洗練されたUI/UXを実装する。
機能は既に動作しているため、純粋にユーザー体験の向上に集中できる。

## 前提条件

- フェーズ4でチャットUIが動作している
- フェーズ5でAmazon Qが使える
- 基本機能はすべて実装済み

## 1. Crush風テーマの完成

### 1.1 プロフェッショナルなカラーパレット

- [ ] **実装**: Crush風の完全なテーマ
  ```typescript
  const crushTheme = {
    background: '#0a0a0a',
    foreground: '#e5e5e5',
    cursor: '#f97316',
    selection: 'rgba(249, 115, 22, 0.3)',
    // 16色すべて定義
    black: '#1a1a1a',
    red: '#ff5555',
    green: '#50fa7b',
    yellow: '#f1fa8c',
    blue: '#bd93f9',
    magenta: '#ff79c6',
    cyan: '#8be9fd',
    white: '#f8f8f2',
    // bright colors
    brightBlack: '#6272a4',
    brightRed: '#ff6e6e',
    brightGreen: '#69ff94',
    brightYellow: '#ffffa5',
    brightBlue: '#d6acff',
    brightMagenta: '#ff92df',
    brightCyan: '#a4ffff',
    brightWhite: '#ffffff'
  };
  ```
- [ ] **動作確認**: 美しい配色

### 1.2 グラスモーフィズム効果

- [ ] **実装**: パネルに半透明効果
  ```css
  .chat-container {
    backdrop-filter: blur(10px);
    background: rgba(10, 10, 10, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }
  ```
- [ ] **動作確認**: モダンな見た目

## 2. コマンドパレット

### 2.1 Cmd+K実装

- [ ] **Red**: `command-palette.component.spec.ts` - 起動テスト
  ```typescript
  it('Cmd+Kで起動', () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k', metaKey: true
    });
    component.handleKeydown(event);
    expect(component.isVisible).toBe(true);
  });
  ```
- [ ] **Green**: PrimeNG Dialog実装
- [ ] **Refactor**: アニメーション追加
- [ ] **動作確認**: スムーズに開く

### 2.2 コマンド検索

- [ ] **実装**: あいまい検索
- [ ] **動作確認**: 素早くコマンドを見つけられる

## 3. AI応答の美化

### 3.1 マークダウン完全対応

- [ ] **Red**: `markdown-renderer.spec.ts` - レンダリングテスト
  ```typescript
  it('マークダウンを美しく表示', () => {
    const md = '## Title\n- List\n```js\ncode\n```';
    const html = renderer.render(md);
    expect(html).toContain('class="markdown"');
  });
  ```
- [ ] **Green**: marked.js統合
- [ ] **Refactor**: カスタムスタイル
- [ ] **動作確認**: AI応答が構造化される

### 3.2 シンタックスハイライト

- [ ] **実装**: highlight.js統合
- [ ] **動作確認**: コードが色付けされる

## 4. サイドバー

### 4.1 セッション管理UI

- [ ] **Red**: `sidebar.component.spec.ts` - サイドバーテスト
- [ ] **Green**: PrimeNG Sidebar実装
- [ ] **動作確認**: セッション切り替え可能

### 4.2 履歴表示

- [ ] **実装**: 会話履歴リスト
- [ ] **動作確認**: 過去の会話を参照できる

## 5. ステータスバー

### 5.1 情報表示

- [ ] **実装**: 下部ステータスバー
  - 接続状態
  - Amazon Q状態
  - 現在のディレクトリ
  - 時刻
- [ ] **動作確認**: 必要な情報が見える

## 6. キーボードショートカット

### 6.1 主要ショートカット

- [ ] **実装**: 
  - `Cmd/Ctrl + K`: コマンドパレット
  - `Cmd/Ctrl + Enter`: 実行
  - `Cmd/Ctrl + L`: クリア
  - `Cmd/Ctrl + /`: ヘルプ
  - `Cmd/Ctrl + S`: セッション保存
- [ ] **動作確認**: 効率的な操作

## 7. アニメーション

### 7.1 スムーズな遷移

- [ ] **実装**: Angular Animations
  ```typescript
  trigger('slideIn', [
    transition(':enter', [
      style({ transform: 'translateX(-100%)' }),
      animate('200ms ease-in')
    ])
  ])
  ```
- [ ] **動作確認**: 滑らかな動き

### 7.2 ローディング表示

- [ ] **実装**: Amazon Q実行中の表示
- [ ] **動作確認**: 処理中が分かる

## 8. レスポンシブ対応

### 8.1 画面サイズ対応

- [ ] **実装**: Tailwind レスポンシブクラス
- [ ] **動作確認**: 各デバイスで適切に表示

## 9. 高度なターミナル機能

### 9.1 スプリットビュー

- [ ] **実装**: 画面分割機能
- [ ] **動作確認**: 複数セッション同時表示

### 9.2 タブ機能

- [ ] **実装**: 複数タブ管理
- [ ] **動作確認**: タブ切り替え

## 完了条件

- [ ] Crush風の美しいUIが実現
- [ ] コマンドパレットが動作
- [ ] AI応答が美しく表示される
- [ ] キーボードショートカット完備
- [ ] アニメーションが滑らか
- [ ] プロフェッショナルな見た目と操作感

## 成果物

完成度の高いAmazon Q GUIアプリケーション：
- チャットUIによる直感的なインターフェース
- Amazon Q CLIとの完全統合
- Crush風の洗練されたUI/UX