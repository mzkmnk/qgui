# フェーズ 4: UI/UX 改善 - TDD + スキーマ駆動開発 TODO リスト

## 概要

t-wada 推奨の TDD + スキーマ駆動開発手法に従い、ユーザビリティを向上させる
Angular Testing Utilities と Vitest を活用し、UI コンポーネントのテスト駆動開発を実践

## Feature 1: レスポンシブデザインシステム

### Phase 1: レスポンシブ設計スキーマ定義

#### 1.1 UI 設計システムスキーマ

- [ ] **デザインシステムスキーマ**: `schemas/ui-design-system.schema.yaml` 作成

  ```yaml
  Breakpoint:
    type: object
    required: [name, minWidth, maxWidth]
    properties:
      name: { enum: [mobile, tablet, desktop, wide] }
      minWidth: { type: number }
      maxWidth: { type: number }

  ComponentSize:
    type: object
    properties:
      mobile: { $ref: '#/components/schemas/SizeSpec' }
      tablet: { $ref: '#/components/schemas/SizeSpec' }
      desktop: { $ref: '#/components/schemas/SizeSpec' }
  ```

#### 1.2 テーマシステムスキーマ

- [ ] **テーマスキーマ設計**: `schemas/theme.schema.yaml` 作成
  - [ ] ColorPalette 定義（light, dark, auto）
  - [ ] Typography 設定（fontSizes, lineHeights, fontFamilies）
  - [ ] Spacing システム（margins, paddings, gaps）

### Phase 2: Red フェーズ（UI コンポーネントテスト作成）

#### 2.1 レスポンシブコンポーネントテスト

- [ ] **テストファイル作成**: `responsive-layout.component.spec.ts`
- [ ] **失敗テスト作成**: ブレークポイント切り替えテスト
  ```typescript
  describe('ResponsiveLayoutComponent', () => {
    it('モバイル画面でサイドバーが非表示になるべき', () => {
      component.setScreenSize('mobile');
      fixture.detectChanges();

      const sidebar = fixture.debugElement.query(By.css('.sidebar'));
      expect(sidebar.nativeElement.classList).toContain('hidden');
    });
  });
  ```
- [ ] **失敗テスト作成**: タッチジェスチャーテスト
- [ ] **失敗テスト作成**: フォントサイズ可変テスト

#### 2.2 テーマシステムテスト

- [ ] **テストファイル作成**: `theme.service.spec.ts`
- [ ] **失敗テスト作成**: ダークモード切り替えテスト
- [ ] **失敗テスト作成**: テーマ永続化テスト

### Phase 3: Green フェーズ（レスポンシブ UI 仮実装）

#### 3.1 レスポンシブレイアウト仮実装

- [ ] **ResponsiveLayoutComponent 作成**: 最小限のレスポンシブ機能
  ```typescript
  @Component({
    template: `
      <div [class]="layoutClass()">
        <aside [class.hidden]="isMobile()" class="sidebar">
          <ng-content select="[slot=sidebar]"></ng-content>
        </aside>
        <main class="main-content">
          <ng-content></ng-content>
        </main>
      </div>
    `,
  })
  export class ResponsiveLayoutComponent {
    screenSize = signal<'mobile' | 'tablet' | 'desktop'>('desktop');

    isMobile = computed(() => this.screenSize() === 'mobile');
    layoutClass = computed(() => `layout-${this.screenSize()}`);

    setScreenSize(size: 'mobile' | 'tablet' | 'desktop') {
      this.screenSize.set(size); // ハードコード仮実装
    }
  }
  ```

#### 3.2 テーマシステム仮実装

- [ ] **ThemeService 作成**: 最小限のテーマ切り替え
  ```typescript
  @Injectable({ providedIn: 'root' })
  export class ThemeService {
    currentTheme = signal<'light' | 'dark'>('light');

    toggleTheme(): void {
      const newTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
      this.currentTheme.set(newTheme); // ハードコード仮実装
    }
  }
  ```

### Phase 4: Refactor フェーズ（レスポンシブ UI 実装改善）

#### 4.1 実際のブレークポイント検知

- [ ] **MediaQuery サービス統合**: 実際の画面サイズ検知
- [ ] **ResizeObserver 統合**: 動的なレイアウト調整
- [ ] **タッチジェスチャー対応**: Hammer.js またはネイティブタッチイベント

#### 4.2 高度なテーマシステム

- [ ] **CSS カスタムプロパティ**: 動的テーマ変更
- [ ] **LocalStorage 連携**: テーマ設定の永続化
- [ ] **システム設定連動**: prefers-color-scheme 対応

### Phase 5: レスポンシブ UI 次のテストケース追加

#### 5.1 UI エッジケース

- [ ] **異常系テスト**: 画面回転時のレイアウト崩れ対策
- [ ] **パフォーマンステスト**: テーマ切り替え時の応答性
- [ ] **アクセシビリティテスト**: 高コントラスト対応

## Feature 2: インタラクティブコンポーネント

### Phase 1: インタラクションスキーマ定義

#### 1.1 アニメーションスキーマ

- [ ] **アニメーションスキーマ**: `schemas/animations.schema.yaml` 作成
  ```yaml
  Animation:
    type: object
    required: [name, duration, easing]
    properties:
      name: { enum: [fadeIn, slideIn, scaleUp, bounce] }
      duration: { type: number, minimum: 0, maximum: 2000 }
      easing: { enum: [ease, ease-in, ease-out, ease-in-out] }
  ```

### Phase 2: Red フェーズ（アニメーションテスト作成）

#### 2.1 アニメーションコンポーネントテスト

- [ ] **テストファイル作成**: `animated-button.component.spec.ts`
- [ ] **失敗テスト作成**: ボタンアニメーションテスト
  ```typescript
  describe('AnimatedButtonComponent', () => {
    it('クリック時にボタンがスケールアニメーションするべき', fakeAsync(() => {
      const button = fixture.debugElement.query(By.css('button'));

      button.nativeElement.click();
      tick(100);

      expect(button.nativeElement.classList).toContain('scale-animation');
    }));
  });
  ```

### Phase 3: Green フェーズ（インタラクション仮実装）

#### 3.1 アニメーションコンポーネント仮実装

- [ ] **AnimatedButtonComponent 作成**: 最小限のアニメーション
  ```typescript
  @Component({
    template: `
      <button [class.scale-animation]="isAnimating()" (click)="handleClick()" class="animated-btn">
        <ng-content></ng-content>
      </button>
    `,
    styles: [
      `
        .scale-animation {
          transform: scale(0.95);
          transition: transform 150ms ease-out;
        }
      `,
    ],
  })
  export class AnimatedButtonComponent {
    isAnimating = signal(false);

    handleClick(): void {
      this.isAnimating.set(true);
      setTimeout(() => this.isAnimating.set(false), 150); // ハードコード仮実装
    }
  }
  ```

### Phase 4: Refactor フェーズ（高度なアニメーション）

#### 4.1 CSS アニメーション統合

- [ ] **Angular Animations API**: より複雑なアニメーション
- [ ] **WAAPI 統合**: Web Animations API 活用
- [ ] **パフォーマンス最適化**: will-change プロパティ活用

## Feature 3: アクセシビリティ強化

### Phase 1: アクセシビリティスキーマ定義

#### 1.1 A11y 要件スキーマ

- [ ] **アクセシビリティスキーマ**: `schemas/accessibility.schema.yaml` 作成
  - [ ] ARIA 属性定義
  - [ ] キーボードナビゲーション要件
  - [ ] コントラスト比要件

### Phase 2: Red フェーズ（A11y テスト作成）

#### 2.1 アクセシビリティテスト

- [ ] **テストファイル作成**: `accessibility.spec.ts`
- [ ] **失敗テスト作成**: ARIA 属性テスト
- [ ] **失敗テスト作成**: キーボードナビゲーションテスト
- [ ] **失敗テスト作成**: フォーカス管理テスト

### Phase 3-4: Green & Refactor フェーズ

#### 3.1 アクセシビリティ機能実装

- [ ] **A11y ディレクティブ**: ARIA 属性自動付与
- [ ] **KeyboardNavigationService**: タブ順序管理
- [ ] **FocusManagerService**: フォーカストラップ機能

## ベビーステップ実践例

### Example: ダークモード切り替えボタン実装

#### Step 1: スキーマ定義

```yaml
ThemeToggleState:
  type: object
  properties:
    theme: { enum: [light, dark] }
    isAnimating: { type: boolean }
```

#### Step 2: Red

```typescript
it('should toggle theme on click', () => {
  const button = fixture.debugElement.query(By.css('[data-testid="theme-toggle"]'));

  button.nativeElement.click();

  expect(component.currentTheme()).toBe('dark');
});
```

#### Step 3: Green

```typescript
@Component({
  template: `<button data-testid="theme-toggle" (click)="toggleTheme()">Toggle</button>`,
})
export class ThemeToggleComponent {
  currentTheme = signal<'light' | 'dark'>('light');

  toggleTheme(): void {
    this.currentTheme.set('dark'); // ハードコード仮実装
  }
}
```

#### Step 4: Refactor

```typescript
toggleTheme(): void {
  const newTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
  this.currentTheme.set(newTheme);
  this.themeService.setTheme(newTheme);
  document.documentElement.setAttribute('data-theme', newTheme);
}
```

## 完了条件

### UI/UX 機能完了の定義

- [ ] **全コンポーネントテスト Green**: 作成したすべての UI テストが成功
- [ ] **レスポンシブ対応完了**: 主要ブレークポイントでの動作確認
- [ ] **アクセシビリティ基準達成**: WCAG 2.1 AA レベルの基本要件
- [ ] **パフォーマンス目標**: First Contentful Paint < 1.5 秒

## 次フェーズ（パフォーマンス最適化）への引き継ぎ

- [ ] **レンダリング最適化**: OnPush 変更検知戦略の適用
- [ ] **バンドルサイズ最適化**: 遅延読み込み対象コンポーネントの特定
- [ ] **アニメーション最適化**: 60fps 維持のためのパフォーマンス調整
  - [ ] PrimeNG テーマとの統合
  - [ ] Tailwind CSS テーマ設定
- [ ] ダークテーマ作成
  - [ ] カラートークン定義
  - [ ] ターミナルダークテーマ
  - [ ] シンタックスハイライトダークテーマ
  - [ ] アイコン・画像の差し替え
- [ ] テーマ切り替え機能
  - [ ] テーマ切り替えボタン実装
  - [ ] 設定保存機能
  - [ ] システム設定連動機能
  - [ ] スムーズな切り替えアニメーション
- [ ] テーマカスタマイズ
  - [ ] カスタムカラー設定
  - [ ] アクセント色変更機能
  - [ ] テーマプリセット機能

### アニメーション・トランジション

- [ ] ページトランジション
  - [ ] ルート遷移アニメーション
  - [ ] フェードイン・アウト効果
  - [ ] スライドアニメーション
- [ ] コンポーネントアニメーション
  - [ ] モーダル表示・非表示
  - [ ] ツールチップアニメーション
  - [ ] ボタンホバー効果
  - [ ] 読み込みアニメーション
- [ ] チャットアニメーション
  - [ ] メッセージ送信アニメーション
  - [ ] タイピングインジケーター
  - [ ] ストリーミング表示効果
  - [ ] スクロールアニメーション
- [ ] マイクロインタラクション
  - [ ] ボタンフィードバック
  - [ ] フォーム入力フィードバック
  - [ ] 成功・エラー通知
  - [ ] プログレスインジケーター

### アクセシビリティ改善

- [ ] キーボードナビゲーション
  - [ ] Tab 順序の最適化
  - [ ] キーボードショートカット実装
  - [ ] フォーカス表示の改善
  - [ ] Esc キーでの操作キャンセル
- [ ] スクリーンリーダー対応
  - [ ] aria-label 属性の追加
  - [ ] role 属性の適切な設定
  - [ ] alt 属性の設定
  - [ ] 見出し構造の最適化
- [ ] 色・コントラスト対応
  - [ ] WCAG 2.1 AA 準拠
  - [ ] 色だけに依存しない情報伝達
  - [ ] ハイコントラストモード
- [ ] 読み上げ対応
  - [ ] 動的コンテンツの読み上げ
  - [ ] ステータス変更の通知
  - [ ] エラーメッセージの読み上げ

## 設定画面実装

### ユーザー設定

- [ ] プロファイル設定
  - [ ] ユーザー情報編集
  - [ ] アバター設定機能
  - [ ] 表示名カスタマイズ
- [ ] 表示設定
  - [ ] フォント設定（種類・サイズ）
  - [ ] 行間設定
  - [ ] ターミナル設定
  - [ ] メッセージ表示設定
- [ ] 動作設定
  - [ ] 自動保存間隔設定
  - [ ] 通知設定
  - [ ] 音効設定
  - [ ] セッションタイムアウト設定
- [ ] データ設定
  - [ ] 履歴保存期間設定
  - [ ] エクスポート形式設定
  - [ ] バックアップ設定

### アプリケーション設定

- [ ] Amazon Q CLI 設定
  - [ ] デフォルトモデル設定
  - [ ] ツール信頼設定
  - [ ] タイムアウト設定
  - [ ] デバッグモード設定
- [ ] 開発者設定
  - [ ] ログレベル設定
  - [ ] デバッグ情報表示
  - [ ] パフォーマンス情報表示
  - [ ] 実験的機能の有効化
- [ ] セキュリティ設定
  - [ ] セッション設定
  - [ ] 認証設定
  - [ ] アクセス制御設定
- [ ] 統合設定
  - [ ] エディター連携設定
  - [ ] ブラウザ連携設定
  - [ ] 外部ツール連携設定

### ショートカットキー設定

- [ ] デフォルトショートカット
  - [ ] 基本操作（送信、クリア等）
  - [ ] セッション操作
  - [ ] 履歴操作
  - [ ] 設定画面操作
- [ ] カスタムショートカット
  - [ ] ショートカット割り当て画面
  - [ ] 競合チェック機能
  - [ ] リセット機能
- [ ] ショートカットヘルプ
  - [ ] ヘルプ画面実装
  - [ ] ツールチップ表示
  - [ ] 一覧表示機能

## 高度な機能実装

### 検索機能強化

- [ ] 全文検索エンジン
  - [ ] SQLite FTS5 活用
  - [ ] 検索インデックス最適化
  - [ ] 検索パフォーマンス向上
- [ ] 高度な検索 UI
  - [ ] 検索バー実装
  - [ ] 検索フィルター機能
  - [ ] 検索履歴機能
  - [ ] 検索結果ハイライト
- [ ] フィルター機能
  - [ ] 日付範囲フィルター
  - [ ] セッションフィルター
  - [ ] メッセージタイプフィルター
  - [ ] ツール使用フィルター
- [ ] 検索結果表示
  - [ ] 検索結果一覧
  - [ ] コンテキスト表示
  - [ ] ページネーション
  - [ ] 並び替え機能

### エクスポート機能拡張

- [ ] 多形式エクスポート
  - [ ] Markdown 形式
  - [ ] HTML 形式
  - [ ] PDF 形式
  - [ ] JSON 形式
- [ ] エクスポート設定
  - [ ] 出力範囲選択
  - [ ] 出力形式カスタマイズ
  - [ ] 画像・添付ファイル処理
  - [ ] メタデータ含有設定
- [ ] コード抽出機能
  - [ ] コードブロック自動抽出
  - [ ] 言語別分類
  - [ ] ファイル形式での出力
  - [ ] 実行可能形式での出力
- [ ] インポート機能
  - [ ] 他システムからのインポート
  - [ ] データ形式変換
  - [ ] 重複データ処理
  - [ ] インポート結果レポート

### データ可視化機能

- [ ] 使用統計表示
  - [ ] セッション統計
  - [ ] メッセージ統計
  - [ ] ツール使用統計
  - [ ] 時間別利用状況
- [ ] チャート・グラフ機能
  - [ ] Chart.js 統合
  - [ ] 利用状況グラフ
  - [ ] パフォーマンスグラフ
  - [ ] 傾向分析表示
- [ ] ダッシュボード機能
  - [ ] 概要ダッシュボード
  - [ ] KPI 表示
  - [ ] アクティビティフィード
  - [ ] カスタマイズ可能ウィジェット

## ユーザビリティ向上

### インタラクションデザイン

- [ ] 直感的な UI 実装
  - [ ] ドラッグ&ドロップ機能
  - [ ] コンテキストメニュー
  - [ ] ツールチップ表示
  - [ ] プレビュー機能
- [ ] フィードバック改善
  - [ ] 操作成功・失敗の明確な表示
  - [ ] ローディング状態の改善
  - [ ] プログレス表示
  - [ ] エラー状態の改善
- [ ] ナビゲーション改善
  - [ ] ブレッドクラム実装
  - [ ] 戻る・進むボタン
  - [ ] クイックナビゲーション
  - [ ] 検索からの直接ジャンプ

### パフォーマンス UX

- [ ] 体感速度向上
  - [ ] 画面遷移の高速化
  - [ ] プリロード機能
  - [ ] キャッシュ戦略最適化
  - [ ] レスポンシブローディング
- [ ] オフライン対応
  - [ ] Service Worker 実装
  - [ ] オフライン通知
  - [ ] データ同期機能
  - [ ] オフライン履歴閲覧
- [ ] エラー回復 UX
  - [ ] 自動リトライ機能
  - [ ] エラー詳細情報
  - [ ] 復旧手順ガイド
  - [ ] サポート連絡機能

### ヘルプ・ガイド機能

- [ ] オンボーディング
  - [ ] 初回利用ガイド
  - [ ] インタラクティブチュートリアル
  - [ ] 機能紹介ツアー
  - [ ] 設定推奨事項
- [ ] ヘルプシステム
  - [ ] 統合ヘルプ画面
  - [ ] FAQ 実装
  - [ ] 動画ガイド埋め込み
  - [ ] 検索可能ヘルプ
- [ ] トラブルシューティング
  - [ ] 診断機能
  - [ ] 自動修復機能
  - [ ] ログ解析支援
  - [ ] サポート情報収集

## モバイル・タブレット対応

### タッチインターフェース

- [ ] タッチ操作最適化
  - [ ] スワイプジェスチャー
  - [ ] ピンチズーム
  - [ ] 長押し操作
  - [ ] マルチタッチ対応
- [ ] 仮想キーボード対応
  - [ ] キーボード表示時のレイアウト調整
  - [ ] 入力エリアの最適化
  - [ ] 予測入力機能
  - [ ] 音声入力対応準備

### モバイル特化機能

- [ ] プッシュ通知（PWA）
  - [ ] 重要な通知
  - [ ] バックグラウンド同期
  - [ ] 通知設定管理
- [ ] 省電力モード
  - [ ] アニメーション削減
  - [ ] 不要な通信削減
  - [ ] CPU 使用量最適化

## テスト・品質保証

### UI/UX テスト

- [ ] ユーザビリティテスト
  - [ ] タスク完了率測定
  - [ ] 操作時間測定
  - [ ] エラー率測定
  - [ ] 満足度調査
- [ ] アクセシビリティテスト
  - [ ] 自動テストツール活用
  - [ ] 手動テスト実施
  - [ ] スクリーンリーダーテスト
  - [ ] キーボード操作テスト
- [ ] 多環境テスト
  - [ ] 複数ブラウザテスト
  - [ ] デバイス間テスト
  - [ ] 画面サイズテスト
  - [ ] パフォーマンステスト

### デザインシステム

- [ ] コンポーネントライブラリ
  - [ ] 再利用可能コンポーネント
  - [ ] デザインガイドライン
  - [ ] コンポーネントカタログ
- [ ] 一貫性確保
  - [ ] デザイントークン
  - [ ] スタイルガイド
  - [ ] UI パターン集

## 成果物・確認項目

- [ ] 洗練されたユーザーインターフェース
- [ ] レスポンシブデザイン動作確認
- [ ] ダークモード完全対応
- [ ] アクセシビリティ基準達成
- [ ] 検索・エクスポート機能動作確認
- [ ] ユーザビリティテスト完了
- [ ] デザインシステム整備完了

## 技術的考慮事項

- [ ] パフォーマンス: UI 操作レスポンス時間測定
- [ ] アクセシビリティ: WCAG 2.1 準拠確認
- [ ] 互換性: 複数ブラウザでの動作確認

## 次フェーズへの準備

- [ ] パフォーマンス最適化対象の特定
- [ ] ユーザーフィードバックの収集
- [ ] 継続的改善計画の策定
