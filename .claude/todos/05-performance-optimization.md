# フェーズ 5: パフォーマンス最適化 - TDD + スキーマ駆動開発 TODO リスト

## 概要

t-wada 推奨の TDD + スキーマ駆動開発手法に従い、パフォーマンス最適化を実施する
パフォーマンス要件をスキーマ化し、測定可能な指標に基づくテスト駆動最適化を実践

## Feature 1: フロントエンドパフォーマンス最適化

### Phase 1: パフォーマンススキーマ定義

#### 1.1 パフォーマンス要件スキーマ

- [ ] **パフォーマンス要件スキーマ**: `schemas/performance.schema.yaml` 作成

  ```yaml
  PerformanceMetrics:
    type: object
    required: [fcp, lcp, cls, fid, ttfb]
    properties:
      fcp: { type: number, maximum: 1500, description: 'First Contentful Paint (ms)' }
      lcp: { type: number, maximum: 2500, description: 'Largest Contentful Paint (ms)' }
      cls: { type: number, maximum: 0.1, description: 'Cumulative Layout Shift' }
      fid: { type: number, maximum: 100, description: 'First Input Delay (ms)' }
      ttfb: { type: number, maximum: 800, description: 'Time to First Byte (ms)' }

  BundleMetrics:
    type: object
    properties:
      initialBundleSize: { type: number, maximum: 250000, description: 'Initial bundle size (bytes)' }
      totalBundleSize: { type: number, maximum: 1000000, description: 'Total bundle size (bytes)' }
      chunkCount: { type: number, maximum: 50, description: 'Number of chunks' }
  ```

#### 1.2 最適化ターゲット定義

- [ ] **最適化設定スキーマ**: `schemas/optimization-config.schema.yaml` 作成
  - [ ] ChangeDetection 戦略設定（OnPush, Default）
  - [ ] LazyLoading 設定（route, component, module）
  - [ ] Caching 戦略設定（memory, disk, network）

### Phase 2: Red フェーズ（パフォーマンステスト作成）

#### 2.1 Core Web Vitals テスト

- [ ] **テストファイル作成**: `performance.spec.ts`
- [ ] **失敗テスト作成**: FCP（First Contentful Paint）テスト
  ```typescript
  describe('Performance Metrics', () => {
    it('First Contentful Paint should be under 1.5 seconds', async () => {
      const startTime = performance.now();

      await page.goto('/');
      await page.waitForSelector('[data-testid="main-content"]');

      const fcpTime = performance.now() - startTime;
      expect(fcpTime).toBeLessThan(1500);
    });
  });
  ```
- [ ] **失敗テスト作成**: バンドルサイズテスト
- [ ] **失敗テスト作成**: メモリリークテスト

#### 2.2 Angular 最適化テスト

- [ ] **テストファイル作成**: `change-detection.spec.ts`
- [ ] **失敗テスト作成**: OnPush 戦略テスト
  ```typescript
  describe('ChangeDetection Optimization', () => {
    it('should use OnPush strategy for heavy components', () => {
      const component = fixture.componentInstance;
      const changeDetectionRef = (component as any).cdr;

      expect(changeDetectionRef.strategy).toBe(ChangeDetectionStrategy.OnPush);
    });
  });
  ```

### Phase 3: Green フェーズ（パフォーマンス最適化仮実装）

#### 3.1 ChangeDetection 最適化仮実装

- [ ] **OnPush コンポーネント変換**: 主要コンポーネントの変更検知最適化
  ```typescript
  @Component({
    changeDetection: ChangeDetectionStrategy.OnPush, // OnPush戦略適用
    template: `
      <div>
        <h2>{{ title() }}</h2>
        <div>{{ data() | json }}</div>
      </div>
    `,
  })
  export class OptimizedComponent {
    title = signal('Optimized Component');
    data = signal<any[]>([]);

    // signals使用で効率的な状態管理（仮実装）
    updateData(newData: any[]): void {
      this.data.set(newData); // signalで変更検知を最小化
    }
  }
  ```

#### 3.2 遅延読み込み仮実装

- [ ] **LazyLoadingService 作成**: 最小限の遅延読み込み機能
  ```typescript
  @Injectable({ providedIn: 'root' })
  export class LazyLoadingService {
    loadComponent(componentName: string): Promise<Type<any>> {
      // ハードコード仮実装
      if (componentName === 'heavy-component') {
        return Promise.resolve(MockHeavyComponent);
      }
      throw new Error('Component not found');
    }
  }
  ```

### Phase 4: Refactor フェーズ（パフォーマンス実装改善）

#### 4.1 実際の最適化実装

- [ ] **Angular DevKit 統合**: 実際のバンドル分析と Tree-shaking
- [ ] **Virtual Scrolling**: 大量データ表示の最適化
- [ ] **Service Worker**: キャッシング戦略の実装
- [ ] **Preloading Strategy**: 適応的プリロード戦略

#### 4.2 測定・監視システム

- [ ] **Performance Observer**: リアルタイムパフォーマンス測定
- [ ] **Web Vitals API**: Core Web Vitals 自動測定
- [ ] **Bundle Analyzer**: バンドルサイズ継続監視

### Phase 5: パフォーマンス次のテストケース追加

#### 5.1 高負荷テスト

- [ ] **ストレステスト**: 大量データ処理性能
- [ ] **メモリテスト**: 長時間実行時のメモリ使用量
- [ ] **並行処理テスト**: 複数セッション同時処理性能

## Feature 2: バックエンドパフォーマンス最適化

### Phase 1: バックエンドパフォーマンススキーマ定義

#### 1.1 API パフォーマンス要件

- [ ] **API パフォーマンススキーマ**: `schemas/api-performance.schema.yaml` 作成
  ```yaml
  APIPerformanceMetrics:
    type: object
    properties:
      responseTime: { type: number, maximum: 200, description: 'Response time (ms)' }
      throughput: { type: number, minimum: 1000, description: 'Requests per second' }
      errorRate: { type: number, maximum: 0.01, description: 'Error rate (percentage)' }
      cpuUsage: { type: number, maximum: 0.8, description: 'CPU usage (percentage)' }
      memoryUsage: { type: number, maximum: 512000000, description: 'Memory usage (bytes)' }
  ```

### Phase 2: Red フェーズ（バックエンドパフォーマンステスト）

#### 2.1 API パフォーマンステスト

- [ ] **テストファイル作成**: `api-performance.spec.ts`
- [ ] **失敗テスト作成**: レスポンス時間テスト
  ```typescript
  describe('API Performance', () => {
    it('should respond within 200ms for session endpoints', async () => {
      const startTime = Date.now();

      const response = await request(app.getHttpServer()).get('/api/sessions').expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(200);
    });
  });
  ```

### Phase 3: Green フェーズ（バックエンド最適化仮実装）

#### 3.1 キャッシング仮実装

- [ ] **CacheService 作成**: 最小限のキャッシング機能
  ```typescript
  @Injectable()
  export class CacheService {
    private cache = new Map<string, { data: any; expiry: number }>();

    get(key: string): any | null {
      const item = this.cache.get(key);
      if (!item || Date.now() > item.expiry) {
        return null; // 期限切れは削除（仮実装）
      }
      return item.data;
    }

    set(key: string, data: any, ttl = 300000): void {
      this.cache.set(key, { data, expiry: Date.now() + ttl }); // ハードコード仮実装
    }
  }
  ```

### Phase 4: Refactor フェーズ（バックエンド実装改善）

#### 4.1 実際の最適化実装

- [ ] **Redis 統合**: 分散キャッシング
- [ ] **データベース最適化**: インデックス、クエリ最適化
- [ ] **接続プール**: データベース接続の効率化
- [ ] **圧縮**: レスポンス圧縮（gzip, brotli）

## Feature 3: WebSocket・PTY 最適化

### Phase 1: リアルタイム通信最適化スキーマ

#### 1.1 WebSocket パフォーマンススキーマ

- [ ] **WebSocket 最適化スキーマ**: `schemas/websocket-performance.schema.yaml` 作成
  - [ ] メッセージ処理レイテンシ要件（< 50ms）
  - [ ] 同時接続数要件（> 100 connections）
  - [ ] メッセージスループット要件（> 1000 msg/sec）

### Phase 2-4: WebSocket 最適化実装

#### 2.1 メッセージ処理最適化

- [ ] **バッファリング機能**: 大量メッセージの効率的処理
- [ ] **バックプレッシャー制御**: 処理能力に応じた流量制御
- [ ] **圧縮**: WebSocket メッセージ圧縮

## ベビーステップ実践例

### Example: コンポーネント最適化

#### Step 1: パフォーマンス要件定義

```yaml
ComponentPerformance:
  renderTime: { maximum: 16, description: '60fps target' }
  memoryUsage: { maximum: 10000000, description: '10MB limit' }
```

#### Step 2: Red

```typescript
it('should render within 16ms', () => {
  const startTime = performance.now();

  fixture.detectChanges();

  const renderTime = performance.now() - startTime;
  expect(renderTime).toBeLessThan(16);
});
```

#### Step 3: Green

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush, // 最小限の最適化
})
export class FastComponent {}
```

#### Step 4: Refactor

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (data(); track trackByFn) {
    <!-- trackBy最適化適用 -->
    }
  `,
})
export class OptimizedComponent {
  trackByFn = (index: number, item: any) => item.id; // 効率的なtrackBy
}
```

## 完了条件

### パフォーマンス目標の達成

- [ ] **Core Web Vitals**: すべて閾値以内（FCP < 1.5s, LCP < 2.5s, CLS < 0.1）
- [ ] **API レスポンス**: 95 パーセンタイルで 200ms 以内
- [ ] **メモリ使用量**: 長時間実行でもメモリリークなし
- [ ] **バンドルサイズ**: 初期バンドル 250KB 以内

## 次フェーズ（品質保証）への引き継ぎ

- [ ] **パフォーマンス監視**: 継続的なパフォーマンス測定機能
- [ ] **負荷テスト**: ローカル環境での品質確認
- [ ] **パフォーマンス回帰テスト**: CI/CD パイプラインでの自動チェック
- [ ] Tree Shaking 最適化
  - [ ] 不要なライブラリコードの削除
  - [ ] barrel exports の最適化
  - [ ] 使用していないコードの特定・削除
- [ ] バンドルサイズ分析
  - [ ] webpack-bundle-analyzer 導入
  - [ ] バンドルサイズ監視
  - [ ] 大きなライブラリの代替検討
  - [ ] 不要な依存関係の削除

### 仮想スクロール実装

- [ ] CDK Virtual Scrolling 導入
  - [ ] メッセージ一覧の仮想スクロール
  - [ ] セッション一覧の仮想スクロール
  - [ ] 検索結果の仮想スクロール
- [ ] カスタム仮想スクロール実装
  - [ ] 可変高さアイテム対応
  - [ ] 水平スクロール対応
  - [ ] スムーズスクロール実装
- [ ] パフォーマンス測定
  - [ ] スクロールパフォーマンス測定
  - [ ] メモリ使用量監視
  - [ ] FPS 測定

### レンダリング最適化

- [ ] DOM 操作最適化
  - [ ] バッチ DOM アップデート
  - [ ] リフロー・リペイント最小化
  - [ ] CSS アニメーション最適化
- [ ] 画像・メディア最適化
  - [ ] 遅延画像読み込み
  - [ ] WebP 形式対応
  - [ ] 画像圧縮最適化
  - [ ] レスポンシブ画像実装
- [ ] フォント最適化
  - [ ] フォント表示最適化
  - [ ] Web Fonts 読み込み最適化
  - [ ] フォールバックフォント設定

## バックエンド最適化

### NestJS パフォーマンス最適化

- [ ] ミドルウェア最適化
  - [ ] 不要なミドルウェアの削除
  - [ ] ミドルウェア実行順序最適化
  - [ ] 条件付きミドルウェア実行
- [ ] インターセプター最適化
  - [ ] ログインターセプターの最適化
  - [ ] レスポンス変換の最適化
  - [ ] エラーハンドリングの最適化
- [ ] ガード最適化
  - [ ] 認証ガードの高速化
  - [ ] 権限チェックの最適化
  - [ ] キャッシュ活用

### データベース最適化

- [ ] クエリ最適化
  - [ ] N+1 問題の解決
  - [ ] 複雑なクエリの分割
  - [ ] バッチ処理の実装
  - [ ] プリロード戦略
- [ ] インデックス最適化
  - [ ] 既存インデックスの見直し
  - [ ] 複合インデックスの追加
  - [ ] 不要なインデックスの削除
  - [ ] インデックス使用状況監視
- [ ] 接続プール設定
  - [ ] 接続プールサイズ最適化
  - [ ] 接続タイムアウト設定
  - [ ] アイドル接続管理
- [ ] SQLite 最適化
  - [ ] PRAGMA 設定最適化
  - [ ] WAL モード有効化
  - [ ] メモリ設定調整
  - [ ] 定期的な VACUUM 実行

### キャッシング戦略

- [ ] メモリキャッシュ実装
  - [ ] Node.js memory cache 導入
  - [ ] LRU キャッシュ実装
  - [ ] TTL 設定
  - [ ] キャッシュヒット率監視
- [ ] API レスポンスキャッシュ
  - [ ] 静的データのキャッシュ
  - [ ] 条件付きキャッシュ
  - [ ] キャッシュ無効化戦略
- [ ] セッションキャッシュ
  - [ ] セッション情報のキャッシュ
  - [ ] ユーザー情報キャッシュ
  - [ ] 権限情報キャッシュ

## WebSocket 通信最適化

### 通信効率化

- [ ] メッセージバッファリング
  - [ ] 小さなメッセージのバッチ送信
  - [ ] 送信間隔の調整
  - [ ] バッファサイズ最適化
- [ ] データ圧縮
  - [ ] gzip 圧縮の有効化
  - [ ] カスタム圧縮アルゴリズム
  - [ ] 差分データ送信
- [ ] プロトコル最適化
  - [ ] バイナリデータ形式の検討
  - [ ] メッセージ形式の最適化
  - [ ] 不要なメタデータ削除

### 接続管理最適化

- [ ] 接続プール管理
  - [ ] 最大接続数制限
  - [ ] アイドル接続の管理
  - [ ] 接続再利用の最適化
- [ ] レート制限実装
  - [ ] メッセージ送信制限
  - [ ] 接続頻度制限
  - [ ] スパム対策
- [ ] ハートビート最適化
  - [ ] 適切なハートビート間隔
  - [ ] 接続状態監視
  - [ ] 自動再接続最適化

## PTY プロセス最適化

### プロセス管理最適化

- [ ] プロセス起動時間短縮
  - [ ] プロセスプリウォーミング
  - [ ] 設定キャッシュ
  - [ ] 初期化処理最適化
- [ ] メモリ使用量最適化
  - [ ] プロセスメモリ監視
  - [ ] メモリリーク検出
  - [ ] ガベージコレクション最適化
- [ ] CPU 使用率最適化
  - [ ] プロセス優先度設定
  - [ ] CPU 使用率監視
  - [ ] 負荷分散実装

### 出力処理最適化

- [ ] ANSI 処理最適化
  - [ ] 正規表現最適化
  - [ ] パース処理の高速化
  - [ ] キャッシュの活用
- [ ] ストリーミング最適化
  - [ ] バッファサイズ調整
  - [ ] 送信頻度最適化
  - [ ] 遅延最小化
- [ ] 大容量出力対応
  - [ ] 出力量制限実装
  - [ ] 分割送信機能
  - [ ] 途中打ち切り機能

## メモリ管理最適化

### フロントエンドメモリ管理

- [ ] メモリリーク対策
  - [ ] イベントリスナー管理
  - [ ] DOM 参照管理
  - [ ] オブザーバー管理
  - [ ] 定期的なメモリクリーンアップ
- [ ] オブジェクトプール実装
  - [ ] 頻繁に作成されるオブジェクトのプール化
  - [ ] DOM 要素の再利用
  - [ ] 描画オブジェクトの管理
- [ ] ガベージコレクション最適化
  - [ ] 不要な参照の削除
  - [ ] WeakMap の活用
  - [ ] 循環参照の回避

### バックエンドメモリ管理

- [ ] Node.js メモリ設定
  - [ ] ヒープサイズ調整
  - [ ] ガベージコレクション設定
  - [ ] メモリ使用量監視
- [ ] オブジェクト管理
  - [ ] オブジェクトライフサイクル管理
  - [ ] 不要なオブジェクトの削除
  - [ ] メモリプロファイリング

## ネットワーク最適化

### 通信量削減

- [ ] データ最小化
  - [ ] 不要なデータの送信停止
  - [ ] データ形式の最適化
  - [ ] 差分データ送信
- [ ] リクエスト数削減
  - [ ] バッチ API 実装
  - [ ] データのプリフェッチ
  - [ ] 不要な API 呼び出し削除
- [ ] CDN 活用準備
  - [ ] 静的リソースの分離
  - [ ] キャッシュヘッダー設定
  - [ ] 配信最適化

### レイテンシ削減

- [ ] 接続最適化
  - [ ] Keep-Alive 有効化
  - [ ] HTTP/2 対応準備
  - [ ] 並列接続最適化
- [ ] リクエスト優先順位
  - [ ] 重要なリクエストの優先処理
  - [ ] バックグラウンド処理の分離
  - [ ] 遅延可能な処理の特定

## パフォーマンス監視・分析

### メトリクス収集

- [ ] フロントエンドメトリクス
  - [ ] Core Web Vitals 測定
  - [ ] ページ読み込み時間
  - [ ] ユーザーインタラクション時間
  - [ ] エラー率監視
- [ ] バックエンドメトリクス
  - [ ] API レスポンス時間
  - [ ] データベースクエリ時間
  - [ ] メモリ使用量
  - [ ] CPU 使用率
- [ ] WebSocket メトリクス
  - [ ] 接続数監視
  - [ ] メッセージレート監視
  - [ ] 遅延測定
  - [ ] エラー率監視

### パフォーマンステスト

- [ ] 負荷テスト実装
  - [ ] 同時接続数テスト
  - [ ] 大量メッセージ処理テスト
  - [ ] 長時間稼働テスト
- [ ] ストレステスト
  - [ ] 限界性能の測定
  - [ ] 障害復旧テスト
  - [ ] リソース枯渇テスト
- [ ] ベンチマークテスト
  - [ ] 他システムとの比較
  - [ ] 改善前後の比較
  - [ ] 継続的なベンチマーク

### 継続的最適化

- [ ] パフォーマンス監視ダッシュボード
  - [ ] リアルタイム監視
  - [ ] アラート設定
  - [ ] トレンド分析
- [ ] 自動最適化
  - [ ] 自動スケーリング準備
  - [ ] 自動キャッシュクリア
  - [ ] 自動リソース調整
- [ ] レポート機能
  - [ ] 定期的なパフォーマンスレポート
  - [ ] 改善提案機能
  - [ ] コスト効果分析

## ローカル環境最適化

### 開発環境パフォーマンス

- [ ] ビルド時間短縮
  - [ ] インクリメンタルビルド
  - [ ] 並列ビルド設定
  - [ ] キャッシュ活用
- [ ] 開発サーバー最適化
  - [ ] ホットリロード最適化
  - [ ] ソースマップ最適化
  - [ ] プロキシ設定最適化
- [ ] デバッグパフォーマンス
  - [ ] デバッグ情報の最適化
  - [ ] ログ出力の最適化
  - [ ] プロファイリング機能

### ローカルストレージ最適化

- [ ] データベースファイル最適化
  - [ ] 定期的な VACUUM 実行
  - [ ] インデックス再構築
  - [ ] 古いデータの自動削除
- [ ] ログファイル管理
  - [ ] ログローテーション
  - [ ] 圧縮保存
  - [ ] 自動削除機能
- [ ] キャッシュ管理
  - [ ] ブラウザキャッシュ最適化
  - [ ] アプリケーションキャッシュ管理
  - [ ] 一時ファイル管理

## 成果物・確認項目

- [ ] パフォーマンス指標の大幅改善
- [ ] メモリ使用量の最適化確認
- [ ] 応答時間の短縮確認
- [ ] 同時接続数の向上確認
- [ ] バッテリー消費量の最適化確認
- [ ] 継続的監視体制の構築完了

## 技術的考慮事項

- [ ] パフォーマンス vs 機能性のバランス
- [ ] 最適化コストと効果の評価
- [ ] ユーザー体験への影響評価

## 次フェーズへの準備

- [ ] 品質保証での性能テスト項目策定
- [ ] 継続的な性能改善プロセスの確立
- [ ] 性能劣化防止策の検討
