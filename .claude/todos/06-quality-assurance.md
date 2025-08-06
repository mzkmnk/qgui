# フェーズ 6: 品質保証とテスト戦略

## 概要

Amazon Q CLI統合アプリケーションの品質を保証するための最小限のテスト戦略。
YAGNI原則に従い、必要最小限のテストのみ実装し、過度なテスト作成は避ける。

## テスト戦略

### 優先度高: コアビジネスロジックのテスト

#### 1. Amazon Q統合テスト

##### 1.1 コマンド実行テスト

- [ ] **Red**: `amazon-q.service.spec.ts` - Amazon Qコマンド実行テスト
  ```typescript
  it('Amazon Q chatコマンドを実行できる', async () => {
    const response = await service.executeChat('Hello');
    expect(response).toContain('response');
  });
  ```
- [ ] **Green**: モックを使用した統合テスト実装
- [ ] **動作確認**: 実際のAmazon Q CLIとの連携確認

##### 1.2 エラーハンドリングテスト

- [ ] **Red**: AWS認証エラー時の処理テスト
  ```typescript
  it('認証エラー時に適切なメッセージを返す', async () => {
    mockAuthService.hasValidCredentials.mockReturnValue(false);
    await expect(service.executeCommand('q chat'))
      .rejects.toThrow('AWS credentials not configured');
  });
  ```
- [ ] **Green**: エラーケースの適切な処理実装

#### 2. セキュリティテスト

##### 2.1 危険なコマンドのブロック

- [ ] **Red**: `command-filter.spec.ts` - 危険コマンドテスト
  ```typescript
  it('rm -rf /をブロックする', () => {
    expect(filter.isSafe('rm -rf /')).toBe(false);
    expect(filter.isSafe('sudo rm -rf')).toBe(false);
  });
  ```
- [ ] **Green**: フィルタリングロジック実装

### 優先度中: UIインタラクションテスト

#### 3. コンポーネントテスト

##### 3.1 ターミナルコンポーネント

- [ ] **Red**: `terminal.component.spec.ts` - 基本動作テスト
  ```typescript
  it('コマンド入力後にWebSocketで送信される', () => {
    component.executeCommand('ls');
    expect(mockWebSocketService.send).toHaveBeenCalledWith({
      type: 'command',
      data: 'ls'
    });
  });
  ```
- [ ] **Green**: コンポーネントロジック実装

##### 3.2 AI応答表示

- [ ] **Red**: `ai-response.component.spec.ts` - マークダウン表示テスト
- [ ] **Green**: レンダリングロジック実装

### 優先度低: E2Eテスト（最小限）

#### 4. クリティカルパスのE2E

##### 4.1 基本フロー

- [ ] **テストシナリオ**: 
  1. アプリ起動
  2. AWS認証設定
  3. コマンド実行
  4. 結果表示
- [ ] **Playwright実装**: 最小限のE2Eテスト

## テストカバレッジ目標

### 現実的な目標

- **ビジネスロジック**: 80%以上
- **UIコンポーネント**: 60%以上
- **ユーティリティ**: 90%以上
- **全体**: 70%程度で十分

## 削除・簡略化した項目（YAGNI原則）

### 実装しないテスト

- **パフォーマンステスト**: 問題が発生してから
- **負荷テスト**: スケール要件がないため不要
- **ビジュアルリグレッションテスト**: 過度な品質管理
- **Mutation Testing**: 過剰な品質保証
- **契約テスト**: マイクロサービスではない
- **スナップショットテスト**: メンテナンスコスト高
- **プロパティベーステスト**: 複雑すぎる
- **カオスエンジニアリング**: 規模に見合わない

## CI/CD最小構成

### GitHub Actions設定

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run lint
      - run: npm run build
```

## テスト実行コマンド

### 開発時

```bash
# ユニットテスト（ウォッチモード）
npm run test:watch

# 特定ファイルのテスト
npm run test -- amazon-q.service

# カバレッジ確認（必要時のみ）
npm run test:coverage
```

### CI環境

```bash
# 全テスト実行
npm run test:ci

# リント
npm run lint

# ビルド確認
npm run build
```

## テスト作成ガイドライン

### やるべきこと

1. **ビジネスロジックを優先**
2. **エッジケースより正常系**
3. **モックは最小限**
4. **読みやすさ重視**
5. **実行速度重視**

### やらないこと

1. **100%カバレッジを目指さない**
2. **getterやsetterのテストは不要**
3. **フレームワーク機能のテストは不要**
4. **過度なモック使用**
5. **テストのためのテスト**

## デバッグとトラブルシューティング

### よくある問題と対処

#### テストが遅い
- 不要なsetTimeout削除
- beforeEachの処理を最小化
- 並列実行を活用

#### フレーキーテスト
- 非同期処理を適切にawait
- タイムアウトを適切に設定
- 外部依存を完全にモック化

## 各PRの完了条件

- [ ] 新機能に対する最小限のテスト追加
- [ ] 既存テストが全てパス
- [ ] リントエラーなし
- [ ] ビルド成功
- [ ] クリティカルパスの動作確認

## まとめ

テストは**保険**であり、開発速度を犠牲にしてまで完璧を求めない。
重要な機能が壊れないことを保証する最小限のテストで十分。
テストメンテナンスのコストを常に意識し、ROIの高いテストのみ作成する。