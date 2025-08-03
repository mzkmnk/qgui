# フェーズ 4: UI/UX 基本改善 - 機能単位 TDD 実装

## 概要

YAGNI原則に従い、Amazon Q GUI の使いやすさに必要最小限のUI/UX改善のみを実装する。
複雑な機能は必要になるまで実装しない。

## フロントエンドUI/UX実装

### 1. 基本レスポンシブ対応（Frontend PR #7）

#### 1.1 モバイル/デスクトップ切り替えのみ

- [ ] **Red**: `app.component.spec.ts` - 画面幅による表示切り替えテスト
  ```typescript
  it('600px以下でモバイルレイアウトになる', () => {
    window.innerWidth = 500;
    component.ngOnInit();
    expect(component.isMobile()).toBe(true);
  });
  ```
- [ ] **Green**: `app.component.ts` - 基本的なレスポンシブ判定実装
- [ ] **動作確認**: モバイルでサイドバーが隠れることを確認

### 2. 基本テーマ機能（Frontend PR #8）

#### 2.1 ライト/ダークテーマ切り替え

- [ ] **Red**: `theme.service.spec.ts` - テーマ切り替えテスト
  ```typescript
  it('テーマを切り替えてlocalStorageに保存する', () => {
    themeService.toggleTheme();
    expect(localStorage.getItem('theme')).toBe('dark');
  });
  ```
- [ ] **Green**: `theme.service.ts` - 最小限のテーマ切り替え実装
- [ ] **動作確認**: ダークテーマでターミナル背景が暗くなる

### 3. テーマボタンUI（Frontend PR #9）

#### 3.1 テーマ切り替えボタン

- [ ] **Red**: `theme-toggle.component.spec.ts` - ボタンクリックテスト
- [ ] **Green**: `theme-toggle.component.ts` - シンプルなボタン実装
- [ ] **動作確認**: ボタンクリックでテーマが切り替わる

### 4. 基本アクセシビリティ（Frontend PR #10）

#### 4.1 最小限のキーボード操作

- [ ] **Red**: `app.component.spec.ts` - Enterキーでの送信テスト
  ```typescript
  it('Enterキーでコマンドを送信する', () => {
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    component.handleKeydown(event);
    expect(component.sendCommand).toHaveBeenCalled();
  });
  ```
- [ ] **Green**: キーボードイベントハンドリング実装
- [ ] **動作確認**: キーボードのみで基本操作ができる

### 5. フォントサイズ調整（Frontend PR #11）

#### 5.1 3段階のフォントサイズ

- [ ] **Red**: `font-size.service.spec.ts` - フォントサイズ変更テスト
- [ ] **Green**: `font-size.service.ts` - small/medium/large の3段階
- [ ] **動作確認**: 設定でフォントサイズが変更できる

## スタイル改善

### 6. 基本的なスタイル調整（Frontend PR #12）

#### 6.1 最小限のCSS改善

- [ ] **実装**: ターミナル部分の見やすさ改善
  - [ ] 適切な行間設定
  - [ ] 読みやすいフォント設定（等幅フォント）
  - [ ] 十分なパディング
- [ ] **動作確認**: 長時間使用しても目が疲れない

## 削除した項目（YAGNI原則）

以下の項目は実際に必要になるまで実装しない：

- 複雑なアニメーション・トランジション
- 高度なレスポンシブブレークポイント（tablet等）
- カスタムテーマ作成機能
- アクセシビリティの完全対応（WCAG準拠等）
- マイクロインタラクション
- タッチジェスチャー
- プログレスインジケーター
- オンボーディング機能
- ヘルプシステム
- 検索機能
- エクスポート機能
- データ可視化
- 設定画面（最小限の設定以外）
- モバイルアプリ機能（PWA等）
- 国際化対応

## 各PRの完了条件

### フロントエンドPR

- [ ] 対象機能のテストが全てGreen
- [ ] `npm run frontend:lint` エラーなし
- [ ] TypeScriptコンパイルエラーなし
- [ ] 実装は最小限（必要十分なUI）

## 次のフェーズへの移行条件

- [ ] モバイル/デスクトップの基本レスポンシブ対応完了
- [ ] ライト/ダークテーマが動作
- [ ] Enterキーでコマンド送信できる
- [ ] フォントサイズ変更が動作
- [ ] 基本的なスタイルが適用済み