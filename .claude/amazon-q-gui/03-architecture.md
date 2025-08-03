# Amazon Q GUI - システムアーキテクチャ

## 1. アーキテクチャ概要

### 1.1 全体構成

```
┌────────────────────────────────────────────────────────────┐
│                        ユーザー層                            │
├────────────────────────────────────────────────────────────┤
│                    プレゼンテーション層                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  Angular 20 SPA                       │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐   │  │
│  │  │   Chat     │  │  History   │  │  Settings  │   │  │
│  │  │ Component  │  │ Component  │  │ Component  │   │  │
│  │  └────────────┘  └────────────┘  └────────────┘   │  │
│  │                    State Management (NgRx)           │  │
│  └──────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────┤
│                      ビジネスロジック層                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    NestJS Server                      │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐   │  │
│  │  │  WebSocket │  │    API     │  │   Auth     │   │  │
│  │  │  Gateway   │  │ Controller │  │   Guard    │   │  │
│  │  └────────────┘  └────────────┘  └────────────┘   │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │              Service Layer                     │ │  │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐   │ │  │
│  │  │  │ Amazon Q │  │ Session  │  │ Database │   │ │  │
│  │  │  │ Service  │  │ Service  │  │ Service  │   │ │  │
│  │  │  └──────────┘  └──────────┘  └──────────┘   │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────┤
│                        データアクセス層                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────┐  │
│  │   Amazon Q CLI  │  │  SQLite DB      │  │  Cache   │  │
│  │   (node-pty)    │  │  (TypeORM)      │  │ (Memory) │  │
│  └─────────────────┘  └─────────────────┘  └──────────┘  │
└────────────────────────────────────────────────────────────┘
```

### 1.2 レイヤー責務

| レイヤー           | 責務                           |           主要技術           |
| :----------------- | :----------------------------- | :--------------------------: |
| プレゼンテーション | UI 表示、ユーザー操作          | Angular 20, Angular Material |
| ビジネスロジック   | ビジネスルール、処理フロー     |      NestJS, TypeScript      |
| データアクセス     | データ永続化、外部システム連携 |      TypeORM, node-pty       |

## 2. フロントエンドアーキテクチャ

### 2.1 Nx モノレポとスタンドアロンアーキテクチャ

#### Nx ワークスペース構成

```json
// nx.json
{
  "tasksRunnerOptions": {
    "default": {
      "runner": "@nx/workspace/tasks-runners/default",
      "options": {
        "cacheableOperations": ["build", "lint", "test", "e2e"]
      }
    }
  },
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "cache": true
    }
  }
}
```

#### Angular アプリケーションのブートストラップ

```typescript
// apps/frontend/src/main.ts - Standalone Bootstrap
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { chatFeature } from '@amazon-q-gui/frontend/chat/data-access';
import { sessionFeature } from '@amazon-q-gui/frontend/session/data-access';
import * as chatEffects from '@amazon-q-gui/frontend/chat/data-access';
import { authInterceptor } from '@amazon-q-gui/frontend/auth/data-access';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    // Router
    provideRouter(routes, withComponentInputBinding()),

    // NgRx Store with feature states
    provideStore({
      [chatFeature.name]: chatFeature.reducer,
      [sessionFeature.name]: sessionFeature.reducer,
    }),

    // NgRx Effects
    provideEffects(chatEffects),

    // NgRx DevTools
    !environment.production ? provideStoreDevtools() : [],

    // Animations
    provideAnimations(),

    // HTTP with interceptors
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
  ],
});
```

### 2.2 状態管理（NgRx Standalone）

```typescript
// features/chat/store/index.ts - Feature State
import { createFeature, createReducer, on } from '@ngrx/store';
import { ChatActions } from './chat.actions';

export interface ChatState {
  messages: Message[];
  currentSessionId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messages: [],
  currentSessionId: null,
  isLoading: false,
  error: null,
};

export const chatFeature = createFeature({
  name: 'chat',
  reducer: createReducer(
    initialState,
    on(ChatActions.sendMessage, (state) => ({
      ...state,
      isLoading: true,
    })),
    on(ChatActions.messageReceived, (state, { message }) => ({
      ...state,
      messages: [...state.messages, message],
      isLoading: false,
    })),
    on(ChatActions.error, (state, { error }) => ({
      ...state,
      error,
      isLoading: false,
    }))
  ),
});

// Selectors are automatically generated
export const { selectChatState, selectMessages, selectCurrentSessionId, selectIsLoading, selectError } = chatFeature;
```

### 2.3 スタンドアロンコンポーネント階層

```
AppComponent (スタンドアロン)
├── HeaderComponent (スタンドアロン)
├── SidebarComponent (スタンドアロン)
│   ├── SessionListComponent
│   └── SettingsMenuComponent
└── RouterOutlet
    ├── ChatComponent (スタンドアロン)
    │   ├── MessageListComponent
    │   ├── InputAreaComponent
    │   └── ToolApprovalComponent
    ├── HistoryComponent (スタンドアロン)
    └── SettingsComponent (スタンドアロン)
```

#### AppComponent 例

````typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-surface-50 dark:bg-surface-900">
      <app-header class="flex-shrink-0" />
      <div class="flex flex-1 overflow-hidden">
        <app-sidebar class="w-64 flex-shrink-0" />
        <main class="flex-1 overflow-auto p-4">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: []
})
export class AppComponent {}

## 3. バックエンドアーキテクチャ

### 3.1 モジュール構成
```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    TypeOrmModule.forRoot(dbConfig),
    ChatModule,
    SessionModule,
    AuthModule,
    WebSocketModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
````

### 3.2 サービスレイヤー設計

```typescript
@Injectable()
export class AmazonQService {
  private sessions = new Map<string, IPty>();

  async createSession(sessionId: string): Promise<void> {
    const pty = spawn('q', ['chat'], {
      name: 'xterm-256color',
      env: process.env,
    });

    this.sessions.set(sessionId, pty);
  }

  async sendMessage(sessionId: string, message: string): Promise<void> {
    const pty = this.sessions.get(sessionId);
    if (!pty) throw new NotFoundException('Session not found');

    pty.write(message + '\n');
  }
}
```

### 3.3 WebSocket ゲートウェイ

```typescript
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'chat',
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  async handleMessage(@MessageBody() data: MessageDto, @ConnectedSocket() client: Socket): Promise<void> {
    const response = await this.amazonQService.processMessage(data);
    client.emit('response', response);
  }
}
```

## 4. データフロー

### 4.1 チャットメッセージフロー

```
1. ユーザー入力
   ↓
2. Angular Component → NgRx Action
   ↓
3. WebSocket Client → Send Message
   ↓
4. NestJS Gateway → Receive Message
   ↓
5. Amazon Q Service → PTY Process
   ↓
6. Amazon Q CLI → Process & Response
   ↓
7. PTY Output → Parse & Format
   ↓
8. WebSocket Server → Emit Response
   ↓
9. Angular Component → Update UI
```

### 4.2 セッション管理フロー

```
1. 新規セッション作成
   - UUID生成
   - PTYプロセス起動
   - DBにセッション情報保存

2. セッション復元
   - セッションID検証
   - 履歴データ読み込み
   - UI状態復元

3. セッション終了
   - PTYプロセス終了
   - リソースクリーンアップ
   - 履歴保存
```

## 5. セキュリティアーキテクチャ

### 5.1 認証フロー

#### JWT 認証の目的

JWT 認証は、Amazon Q GUI アプリケーション自体へのアクセス制御を行うためのものです。

**主な役割**:

- **マルチユーザー対応**: 複数のユーザーが GUI を使用する場合のアクセス制御
- **セッション管理**: 各ユーザーのチャットセッションを分離
- **API 保護**: バックエンド API への不正アクセス防止
- **監査ログ**: 誰がいつ Amazon Q を使用したかの追跡

**注意**: Amazon Q CLI 自体の認証（AWS 認証）は別途必要です。JWT は GUI アプリケーションの認証のみを担当します。

```
Client                    Server                    Amazon Q CLI
  │                         │                          │
  ├─── Login Request ───────>                         │
  │    (GUIアクセス用)       │                          │
  │<─── JWT Token ──────────┤                         │
  │                         │                          │
  ├─── WS Connect + JWT ────>                         │
  │                         │                          │
  │                         ├─── Use AWS Creds ──────>
  │                         │    (サーバー側で設定)     │
  │<─── Connection OK ──────┤<─── CLI Ready ────────┤
```

### 5.2 セキュリティレイヤー

- **API 層**: JWT 認証、CORS 設定
- **WebSocket 層**: 接続時トークン検証
- **サービス層**: 権限チェック、入力検証
- **データ層**: SQL インジェクション対策

## 6. エラーハンドリング

### 6.1 フロントエンドエラー処理

```typescript
// Global Error Handler
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: Error): void {
    if (error instanceof HttpErrorResponse) {
      // HTTP エラー処理
    } else if (error instanceof WebSocketError) {
      // WebSocket エラー処理
    } else {
      // その他のエラー
    }
  }
}
```

### 6.2 バックエンドエラー処理

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: this.getErrorMessage(exception),
    });
  }
}
```

## 7. パフォーマンス最適化

### 7.1 フロントエンド最適化

- **`ChangeDetection.OnPush`**: 不要な再レンダリング防止
- **TrackBy 関数**: リスト表示の最適化
- **Lazy Loading**: ルートレベルでの遅延読み込み
- **仮想スクロール**: 大量メッセージの効率的表示
- **Tailwind CSS v4 JIT**: 使用されるクラスのみ生成
- **CSS 最小化**: PostCSS による最適化

### 7.2 バックエンド最適化

- **接続プーリング**: データベース接続の再利用
- **メッセージバッファリング**: 小さなメッセージの集約
- **圧縮**: WebSocket メッセージの圧縮
- **キャッシング**: 頻繁にアクセスされるデータ

## 8. ローカル環境最適化

### 8.1 リソース管理

```
        ローカルマシン
             │
    ┌────────┴────────┐
    │                 │
Frontend(4200)  Backend(3000)
    │                 │
    └────────┬────────┘
             │
        SQLite (Local DB)
```

### 8.2 パフォーマンス戦略

- **メモリ効率**: ローカルリソースの効率的利用
- **ファイルベース DB**: SQLite による軽量データ管理
- **開発用キャッシュ**: ブラウザキャッシュの活用
- **ホットリロード**: 開発効率の最大化

## 9. 監視とロギング

### 9.1 監視ポイント

- WebSocket 接続数
- レスポンスタイム
- エラー率
- CPU/メモリ使用率

### 9.2 ログ設計

```typescript
// ログレベルと出力先
const logConfig = {
  error: 'error.log', // エラーログ
  warn: 'warning.log', // 警告ログ
  info: 'application.log', // アプリケーションログ
  debug: 'debug.log', // デバッグログ（開発環境のみ）
};
```

## 10. ローカル開発環境

### 10.1 開発サーバー構成

```bash
# 開発サーバー同時起動
npx nx run-many --target=serve --projects=frontend,backend --parallel

# 個別起動（推奨）
# Terminal 1 - Backend:
npx nx serve backend

# Terminal 2 - Frontend:
npx nx serve frontend
```

### 10.2 ローカル実行設定

```typescript
// apps/backend/src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });
  await app.listen(3000);
  console.log(`Backend is running on: http://localhost:3000`);
}

// apps/frontend/src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  wsUrl: 'ws://localhost:3000',
};
```

### 10.3 開発ツール

- **Nx Console**: VS Code 拡張機能で開発効率化
- **Chrome DevTools**: フロントエンドデバッグ
- **WebSocket Debugger**: Socket.io 通信の確認
- **SQLite Browser**: ローカル DB 確認

## まとめ

このアーキテクチャは、保守性、拡張性、パフォーマンスを考慮して設計されています。レイヤードアーキテクチャとマイクロサービスの原則に従い、各コンポーネントが明確な責務を持つことで、変更に強い柔軟なシステムを実現します。
