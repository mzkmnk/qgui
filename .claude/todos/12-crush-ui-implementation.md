# フェーズ 12: Crush風UI実装詳細 - 機能単位 TDD 実装

## 概要

CharmbraceletのCrushのような洗練されたターミナルUIを実装する。
PrimeNGコンポーネントとTailwind CSSを活用し、モダンで使いやすいインターフェースを構築する。

## レイアウト構造

### 1. メインレイアウト

#### 1.1 フレックスボックスレイアウト

- [ ] **Red**: `main-layout.component.spec.ts` - レイアウト構造テスト
  ```typescript
  it('3カラムレイアウトを構築する', () => {
    expect(component.sidebar).toBeDefined();
    expect(component.mainContent).toBeDefined();
    expect(component.rightPanel).toBeDefined();
  });
  ```
- [ ] **Green**: Flexboxベースのレスポンシブレイアウト実装
  ```html
  <div class="flex h-screen bg-gray-950">
    <app-sidebar class="w-64 border-r border-gray-800"></app-sidebar>
    <main class="flex-1 flex flex-col"></main>
    <app-right-panel class="w-80 border-l border-gray-800"></app-right-panel>
  </div>
  ```
- [ ] **動作確認**: 画面サイズに応じて適切にレイアウトされる

### 2. ヘッダーバー

#### 2.1 グラスモーフィズムヘッダー

- [ ] **Red**: `header.component.spec.ts` - ヘッダー表示テスト
- [ ] **Green**: 半透明ヘッダー実装
  ```scss
  .header {
    backdrop-filter: blur(12px);
    background: rgba(10, 10, 10, 0.8);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  ```
- [ ] **動作確認**: スクロール時に背景がぼやける

#### 2.2 ブランディング要素

- [ ] **実装**: ロゴとタイトル配置
  ```html
  <header class="h-14 flex items-center px-4">
    <div class="flex items-center space-x-3">
      <div class="w-8 h-8 bg-orange-500 rounded-lg"></div>
      <h1 class="text-xl font-semibold text-gray-100">Q Terminal</h1>
    </div>
  </header>
  ```
- [ ] **動作確認**: プロフェッショナルな見た目

## コマンドパレット実装

### 3. Cmd+K コマンドパレット

#### 3.1 モーダルオーバーレイ

- [ ] **Red**: `command-palette.component.spec.ts` - 表示/非表示テスト
  ```typescript
  it('Cmd+Kでパレットが開く', () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true
    });
    document.dispatchEvent(event);
    expect(component.isVisible).toBe(true);
  });
  ```
- [ ] **Green**: PrimeNG Dialogでパレット実装
- [ ] **動作確認**: キーボードショートカットで開く

#### 3.2 ファジー検索

- [ ] **Red**: コマンド検索テスト
  ```typescript
  it('コマンドをファジー検索できる', () => {
    component.searchTerm = 'aws s3';
    const results = component.filterCommands();
    expect(results[0].name).toContain('AWS S3');
  });
  ```
- [ ] **Green**: Fuse.jsでファジー検索実装
- [ ] **動作確認**: 曖昧な入力でもコマンドが見つかる

## AI応答ビューア

### 4. 構造化された応答表示

#### 4.1 メッセージバブル

- [ ] **Red**: `message-bubble.component.spec.ts` - バブル表示テスト
- [ ] **Green**: チャット風バブルUI実装
  ```html
  <div class="message" [ngClass]="{'user': isUser, 'assistant': !isUser}">
    <div class="bubble rounded-2xl px-4 py-3 max-w-3xl">
      <div [innerHTML]="renderedContent"></div>
    </div>
  </div>
  ```
- [ ] **動作確認**: ユーザーとAIのメッセージが区別される

#### 4.2 コードブロックスタイリング

- [ ] **Red**: シンタックスハイライトテスト
- [ ] **Green**: Prism.jsでコードハイライト実装
  ```scss
  pre[class*="language-"] {
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    overflow-x: auto;
  }
  ```
- [ ] **動作確認**: コードが美しくハイライトされる

## サイドバー実装

### 5. セッション管理サイドバー

#### 5.1 セッションリスト

- [ ] **Red**: `session-list.component.spec.ts` - リスト表示テスト
- [ ] **Green**: PrimeNG TreeでセッションツリーUI
  ```html
  <p-tree [value]="sessions" 
          [style]="{'border': 'none'}"
          selectionMode="single"
          [(selection)]="selectedSession">
    <ng-template let-node pTemplate="default">
      <div class="flex items-center space-x-2">
        <i class="pi pi-message text-orange-500"></i>
        <span class="text-gray-300">{{ node.label }}</span>
      </div>
    </ng-template>
  </p-tree>
  ```
- [ ] **動作確認**: セッション履歴が階層表示される

### 6. ステータスバー

#### 6.1 情報表示バー

- [ ] **Red**: `status-bar.component.spec.ts` - ステータス表示テスト
- [ ] **Green**: 下部固定ステータスバー実装
  ```html
  <div class="status-bar h-8 bg-gray-900 border-t border-gray-800 px-4 flex items-center justify-between">
    <div class="flex items-center space-x-4">
      <span class="text-xs text-gray-500">
        <i class="pi pi-circle-fill text-green-500 text-xs mr-1"></i>
        Connected to AWS
      </span>
      <span class="text-xs text-gray-500">Region: us-east-1</span>
    </div>
    <div class="text-xs text-gray-500">
      Memory: 256MB | CPU: 12%
    </div>
  </div>
  ```
- [ ] **動作確認**: リアルタイム情報が表示される

## アニメーション実装

### 7. スムーズなトランジション

#### 7.1 ページ遷移アニメーション

- [ ] **Red**: アニメーション動作テスト
- [ ] **Green**: Angular Animations実装
  ```typescript
  trigger('slideIn', [
    transition(':enter', [
      style({ transform: 'translateX(100%)', opacity: 0 }),
      animate('300ms ease-out', 
        style({ transform: 'translateX(0)', opacity: 1 }))
    ])
  ])
  ```
- [ ] **動作確認**: パネルがスムーズにスライドする

#### 7.2 ホバーエフェクト

- [ ] **実装**: インタラクティブなホバー効果
  ```scss
  .interactive-element {
    transition: all 0.2s ease;
    &:hover {
      background: rgba(249, 115, 22, 0.1);
      border-color: rgba(249, 115, 22, 0.5);
      transform: translateY(-1px);
    }
  }
  ```
- [ ] **動作確認**: 要素にホバーすると反応する

## カラーテーマ

### 8. Crush風カラーパレット

#### 8.1 CSS変数定義

- [ ] **実装**: グローバルカラー変数
  ```scss
  :root {
    // 背景色
    --bg-primary: #0a0a0a;
    --bg-secondary: #141414;
    --bg-tertiary: #1a1a1a;
    
    // テキスト色
    --text-primary: #e5e5e5;
    --text-secondary: #a3a3a3;
    --text-muted: #737373;
    
    // アクセント色
    --accent-orange: #f97316;
    --accent-green: #10b981;
    --accent-blue: #3b82f6;
    --accent-purple: #8b5cf6;
    
    // ボーダー色
    --border-subtle: rgba(255, 255, 255, 0.1);
    --border-strong: rgba(255, 255, 255, 0.2);
  }
  ```

## タイポグラフィ

### 9. フォント設定

#### 9.1 システムフォントスタック

- [ ] **実装**: 読みやすいフォント階層
  ```scss
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
  }
  
  code, pre {
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 
                 'Fira Code', monospace;
  }
  ```

## 削除・延期した項目（YAGNI原則）

以下の項目は実際に必要になるまで実装しない：

- 3Dエフェクト
- パーティクルアニメーション
- カスタムカーソル
- サウンドエフェクト
- 複雑なドラッグ&ドロップ
- タッチジェスチャー
- ゲーミフィケーション要素

## 各PRの完了条件

### フロントエンドPR

- [ ] Crush風のダークテーマが適用されている
- [ ] コマンドパレットが動作する
- [ ] グラスモーフィズム効果が表示される
- [ ] スムーズなアニメーションが動作する
- [ ] レスポンシブデザインが機能する

## 次のフェーズへの移行条件

- [ ] プロフェッショナルな見た目のUIが完成
- [ ] 全体的に統一感のあるデザイン
- [ ] 直感的なユーザー体験
- [ ] パフォーマンスへの影響が最小限
- [ ] アクセシビリティ基準を満たしている