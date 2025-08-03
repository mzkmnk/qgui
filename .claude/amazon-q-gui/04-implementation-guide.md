# Amazon Q GUI - 実装ガイド

## 1. 開発環境セットアップ

### 1.1 前提条件

- **Node.js 22 LTS**
- **Amazon Q CLI** インストール済み
- **Git**
- **VSCode**（推奨）または**WebStorm**

### 1.2 Nx ワークスペース初期化

#### Nx ワークスペース作成

```bash
# Nxワークスペースの作成
npx create-nx-workspace@latest amazon-q-gui \
  --preset=apps \
  --packageManager=npm \
  --nxCloud=skip

cd amazon-q-gui
```

#### プロジェクト構造

```
amazon-q-gui/
├── apps/                    # アプリケーション
│   ├── frontend/           # Angularアプリ
│   ├── frontend-e2e/      # E2Eテスト
│   ├── backend/            # NestJSアプリ
│   └── backend-e2e/       # APIテスト
├── libs/                    # 共有ライブラリ
│   ├── shared/
│   │   └── interfaces/    # 共有型定義
│   ├── ui/                # UIコンポーネント
│   └── utils/             # ユーティリティ
├── nx.json                 # Nx設定
├── package.json
└── tsconfig.base.json      # TypeScriptベース設定
```

## 2. フロントエンド実装

### 2.1 Angular アプリケーション作成

```bash
# NxでAngularアプリケーションを生成
npx nx g @nx/angular:application frontend \
  --directory=apps/frontend \
  --style=scss \
  --routing \
  --standalone \
  --e2eTestRunner=cypress \
  --tags="scope:frontend,type:app"

# 必要なライブラリインストール
npm install primeng primeicons
npm install tailwindcss@next @tailwindcss/vite@next
npm install socket.io-client xterm xterm-addon-fit
npm install @ngrx/store @ngrx/effects @ngrx/store-devtools @ngrx/signals

# Tailwind CSS v4 設定
npx nx g setup-tailwind frontend
```

### 2.2 プロジェクト構造

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/                 # コア機能
│   │   │   ├── services/
│   │   │   │   ├── websocket.service.ts
│   │   │   │   └── auth.service.ts
│   │   │   ├── guards/
│   │   │   └── interceptors/
│   │   ├── shared/               # 共有コンポーネント
│   │   │   ├── components/
│   │   │   └── pipes/
│   │   ├── features/             # 機能別コンポーネント
│   │   │   ├── chat/
│   │   │   │   ├── components/
│   │   │   │   ├── services/
│   │   │   │   └── store/      # 機能別store
│   │   │   └── history/
│   │   ├── layout/               # レイアウトコンポーネント
│   │   ├── app.component.ts
│   │   ├── app.routes.ts
│   │   └── app.config.ts
│   └── environments/
```

### 2.3 WebSocket サービス実装

```typescript
// core/services/websocket.service.ts
import { Injectable, OnDestroy, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService implements OnDestroy {
  private socket: Socket | null = null;
  private messageSubject = new Subject<any>();

  connect(url: string): void {
    this.socket = io(url, {
      transports: ['websocket'],
      auth: {
        token: this.getAuthToken(),
      },
    });

    this.socket.on('message', (data) => {
      this.messageSubject.next(data);
    });
  }

  sendMessage(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  onMessage(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  private getAuthToken(): string {
    return localStorage.getItem('auth_token') || '';
  }

  ngOnDestroy(): void {
    this.socket?.disconnect();
  }
}
```

### 2.4 チャットコンポーネント実装

```typescript
// features/chat/components/chat-interface/chat-interface.component.ts
import { Component, OnInit, ViewChild, ElementRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TerminalModule } from 'primeng/terminal';
import { Store } from '@ngrx/store';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { ChatActions } from '../../store/chat.actions';
import { chatFeature } from '../../store';

@Component({
  selector: 'app-chat-interface',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, InputTextareaModule, TerminalModule],
  template: `
    <div class="flex flex-col h-full bg-surface-50 dark:bg-surface-900">
      <p-card class="flex-1 m-4" [style]="{ height: 'calc(100vh - 2rem)' }">
        <ng-template pTemplate="header">
          <div class="flex items-center justify-between px-4 py-3">
            <h2 class="text-2xl font-semibold text-surface-800 dark:text-surface-100">Amazon Q Chat</h2>
            <span class="flex items-center gap-2">
              @if (isConnected()) {
              <i class="pi pi-circle-fill text-green-500 text-xs"></i>
              <span class="text-sm text-surface-600 dark:text-surface-400">Connected</span>
              } @else {
              <i class="pi pi-circle-fill text-red-500 text-xs"></i>
              <span class="text-sm text-surface-600 dark:text-surface-400">Disconnected</span>
              }
            </span>
          </div>
        </ng-template>

        <div #terminalContainer class="h-[calc(100%-8rem)] bg-black rounded-lg p-2"></div>

        <ng-template pTemplate="footer">
          <div class="flex gap-2">
            <span class="p-input-icon-left flex-1">
              <i class="pi pi-comment"></i>
              <input pInputText class="w-full" placeholder="Type your message..." [ngModel]="currentMessage()" (ngModelChange)="currentMessage.set($event)" (keyup.enter)="sendMessage()" />
            </span>
            <p-button label="Send" icon="pi pi-send" [disabled]="!currentMessage().trim()" (onClick)="sendMessage()" styleClass="px-6" />
          </div>
        </ng-template>
      </p-card>
    </div>
  `,
  styleUrl: './chat-interface.component.scss',
})
export class ChatInterfaceComponent implements OnInit {
  @ViewChild('terminal', { static: true }) terminalEl!: ElementRef;

  // Signals for reactive state
  currentMessage = signal('');
  isConnected = signal(false);

  // Inject dependencies
  private readonly store = inject(Store);
  private readonly chatService = inject(ChatService);

  terminal!: Terminal;
  fitAddon = new FitAddon();

  ngOnInit(): void {
    this.initializeTerminal();
    this.subscribeToMessages();
  }

  private initializeTerminal(): void {
    this.terminal = new Terminal({
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
      },
    });

    this.terminal.loadAddon(this.fitAddon);
    this.terminal.open(this.terminalEl.nativeElement);
    this.fitAddon.fit();
  }

  sendMessage(): void {
    const message = this.currentMessage();
    if (message.trim()) {
      this.store.dispatch(
        ChatActions.sendMessage({
          content: message,
        })
      );
      this.currentMessage.set('');
    }
  }

  ngOnDestroy(): void {
    this.terminal?.dispose();
  }
}
```

## 3. バックエンド実装

### 3.1 NestJS アプリケーション作成

```bash
# NxでNestJSアプリケーションを生成
npx nx g @nx/nest:application backend \
  --directory=apps/backend \
  --tags="scope:backend,type:app"

# 必要なライブラリインストール
npm install @nestjs/websockets @nestjs/platform-socket.io
npm install @nestjs/typeorm typeorm sqlite3
npm install node-pty @types/node-pty
```

### 3.2 プロジェクト構造

```
backend/
├── src/
│   ├── modules/
│   │   ├── chat/
│   │   │   ├── chat.gateway.ts
│   │   │   ├── chat.service.ts
│   │   │   ├── chat.module.ts
│   │   │   └── dto/
│   │   ├── session/
│   │   └── auth/
│   ├── common/
│   │   ├── filters/
│   │   ├── guards/
│   │   └── pipes/
│   ├── config/
│   └── main.ts
└── test/
```

### 3.3 Amazon Q サービス実装

```typescript
// modules/chat/amazon-q.service.ts
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { spawn, IPty } from 'node-pty';
import { EventEmitter } from 'events';

@Injectable()
export class AmazonQService implements OnModuleDestroy {
  private readonly logger = new Logger(AmazonQService.name);
  private sessions = new Map<string, AmazonQSession>();

  createSession(sessionId: string): AmazonQSession {
    const ptyProcess = spawn('q', ['chat', '--trust-all-tools'], {
      name: 'xterm-256color',
      cols: 80,
      rows: 30,
      cwd: process.cwd(),
      env: {
        ...process.env,
        LANG: 'en_US.UTF-8',
        LC_ALL: 'en_US.UTF-8',
      },
    });

    const session = new AmazonQSession(sessionId, ptyProcess);
    this.sessions.set(sessionId, session);

    ptyProcess.onData((data) => {
      session.emit('data', this.parseOutput(data));
    });

    ptyProcess.onExit(({ exitCode }) => {
      this.logger.log(`Session ${sessionId} exited with code ${exitCode}`);
      this.sessions.delete(sessionId);
    });

    return session;
  }

  getSession(sessionId: string): AmazonQSession | undefined {
    return this.sessions.get(sessionId);
  }

  private parseOutput(data: string): ParsedOutput {
    // ANSIコードの処理とツール承認の検出
    const cleanData = this.stripAnsi(data);
    const isToolApproval = this.detectToolApproval(cleanData);

    return {
      raw: data,
      clean: cleanData,
      isToolApproval,
      timestamp: new Date(),
    };
  }

  private stripAnsi(str: string): string {
    return str.replace(/\x1b\[[0-9;]*m/g, '');
  }

  private detectToolApproval(data: string): boolean {
    return data.includes('Tool approval required') || data.includes('Using tool:');
  }

  onModuleDestroy(): void {
    this.sessions.forEach((session) => session.destroy());
    this.sessions.clear();
  }
}

export class AmazonQSession extends EventEmitter {
  constructor(public readonly id: string, private readonly ptyProcess: IPty) {
    super();
  }

  write(data: string): void {
    this.ptyProcess.write(data);
  }

  resize(cols: number, rows: number): void {
    this.ptyProcess.resize(cols, rows);
  }

  destroy(): void {
    this.ptyProcess.kill();
    this.removeAllListeners();
  }
}
```

### 3.4 WebSocket Gateway 実装

```typescript
// modules/chat/chat.gateway.ts
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '../../common/guards/ws-auth.guard';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  },
})
@UseGuards(WsAuthGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly amazonQService: AmazonQService, private readonly sessionService: SessionService) {}

  async handleConnection(client: Socket): Promise<void> {
    const sessionId = await this.sessionService.createSession(client.id);
    const session = this.amazonQService.createSession(sessionId);

    session.on('data', (data) => {
      client.emit('message', {
        type: 'output',
        payload: data,
        sessionId,
      });
    });

    client.join(sessionId);
  }

  async handleDisconnect(client: Socket): Promise<void> {
    const session = await this.sessionService.getSessionByClientId(client.id);
    if (session) {
      const amazonQSession = this.amazonQService.getSession(session.id);
      amazonQSession?.destroy();
    }
  }

  @SubscribeMessage('message')
  async handleMessage(@MessageBody() data: { content: string }, @ConnectedSocket() client: Socket): Promise<void> {
    const session = await this.sessionService.getSessionByClientId(client.id);
    if (!session) return;

    const amazonQSession = this.amazonQService.getSession(session.id);
    amazonQSession?.write(data.content + '\n');
  }

  @SubscribeMessage('resize')
  async handleResize(@MessageBody() data: { cols: number; rows: number }, @ConnectedSocket() client: Socket): Promise<void> {
    const session = await this.sessionService.getSessionByClientId(client.id);
    if (!session) return;

    const amazonQSession = this.amazonQService.getSession(session.id);
    amazonQSession?.resize(data.cols, data.rows);
  }
}
```

## 4. 共有型定義

### 4.1 共有ライブラリ作成

```bash
# 共有インターフェースライブラリを作成
npx nx g @nx/js:library shared-interfaces \
  --directory=libs/shared/interfaces \
  --publishable \
  --importPath="@amazon-q-gui/shared/interfaces" \
  --tags="scope:shared,type:util"
```

### 4.2 型定義

```typescript
// shared/src/interfaces/websocket.interface.ts
export interface WebSocketMessage<T = unknown> {
  type: MessageType;
  payload: T;
  sessionId: string;
  timestamp: string;
}

export enum MessageType {
  CHAT = 'chat',
  OUTPUT = 'output',
  TOOL_APPROVAL = 'tool_approval',
  ERROR = 'error',
  STATUS = 'status',
}

// shared/src/interfaces/chat.interface.ts
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  metadata?: MessageMetadata;
}

export type MessageRole = ChatMessage['role'];

export interface MessageMetadata {
  toolName?: string;
  toolCommand?: string;
  error?: boolean;
}
```

## 5. データベース設定

### 5.1 TypeORM 設定

```typescript
// backend/src/config/database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SessionEntity } from '../entities/session.entity';
import { MessageEntity } from '../entities/message.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: 'amazon-q-gui.sqlite',
  entities: [SessionEntity, MessageEntity],
  synchronize: true, // ローカル開発用
  logging: process.env.NODE_ENV === 'development',
};
```

### 5.2 エンティティ定義

```typescript
// backend/src/entities/session.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('sessions')
export class SessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  closedAt: Date | null;
}
```

## 6. 環境設定

### 6.1 環境変数（.env）

```bash
# backend/.env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:4200
JWT_SECRET=your-secret-key
DATABASE_PATH=./data/amazon-q-gui.sqlite
```

### 6.2 Angular 環境設定

```typescript
// frontend/src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  wsUrl: 'ws://localhost:3000'
};

// 注意: ローカル専用アプリケーションのため、
environment.prod.tsは作成しないでください

// frontend/tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': 'rgb(var(--primary-color) / <alpha-value>)',
        'surface': {
          50: 'rgb(var(--surface-50) / <alpha-value>)',
          100: 'rgb(var(--surface-100) / <alpha-value>)',
          // ... PrimeNGテーマと統合
        }
      }
    },
  },
  plugins: [],
} satisfies Config;

// frontend/src/styles.scss
@import 'primeng/resources/themes/lara-light-blue/theme.css';
@import 'primeng/resources/primeng.css';
@import 'primeicons/primeicons.css';
@import 'tailwindcss';
```

## 7. 開発ワークフロー

### 7.0 重要: ローカル開発専用

このアプリケーションはローカル開発専用です。

- プロダクション設定やデプロイスクリプトを作成しないでください
- すべてのサービスは localhost で実行されます

### 7.1 開発サーバー起動

```bash
# フロントエンドとバックエンドを同時起動
npx nx run-many --target=serve --projects=frontend,backend --parallel

# または個別に
# Terminal 1:
npx nx serve backend

# Terminal 2:
npx nx serve frontend
```

### 7.2 ビルド（開発用）

```bash
# 開発用ビルド（ローカル実行用）
npx nx run-many --target=build --all --configuration=development

# 影響を受けたプロジェクトのみビルド
npx nx affected --target=build --configuration=development

# 個別ビルド
npx nx build frontend --configuration=development
npx nx build backend --configuration=development
```

### 7.3 テスト実行

```bash
# 全テスト実行
npx nx run-many --target=test --all

# 影響を受けたプロジェクトのみテスト
npx nx affected --target=test

# E2Eテスト
npx nx e2e frontend-e2e
```

### 7.4 依存関係の可視化

```bash
# 依存関係グラフの表示
npx nx graph
```

## 8. テスト実装

### 8.1 単体テスト（バックエンド）

```typescript
// backend/src/modules/chat/chat.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatService],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('should create a session', async () => {
    const session = await service.createSession('user-123');
    expect(session).toBeDefined();
    expect(session.userId).toBe('user-123');
  });
});
```

### 8.2 E2E テスト（フロントエンド）

```typescript
// frontend/cypress/e2e/chat.cy.ts
describe('Chat Feature', () => {
  it('should send and receive messages', () => {
    cy.visit('/chat');
    cy.get('[data-cy=message-input]').type('Hello Amazon Q');
    cy.get('[data-cy=send-button]').click();
    cy.get('[data-cy=message-list]').should('contain', 'Hello Amazon Q');
  });
});
```

## 9. デバッグ設定

### 9.1 VSCode launch.json

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug NestJS",
      "runtimeArgs": ["run", "start:debug"],
      "cwd": "${workspaceFolder}/backend",
      "autoAttachChildProcesses": true
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug Angular",
      "url": "http://localhost:4200",
      "webRoot": "${workspaceFolder}/frontend"
    }
  ]
}
```

## 10. 次のステップ

1. **認証実装**: JWT 認証の追加
2. **エラーハンドリング**: グローバルエラーハンドラー
3. **ログ実装**: Winston 統合
4. **開発効率化**: Nx Console 活用、デバッグ設定最適化
5. **テスト拡充**: 単体テスト・E2E テストのカバレッジ向上

## まとめ

この実装ガイドに従って開発を進めることで、型安全で保守性の高い Amazon Q GUI アプリケーションを構築できます。各セクションのコード例を参考に、実際の要件に合わせてカスタマイズしてください。
