# Amazon Q GUI - API仕様書

## 1. API概要

### 1.1 基本情報
| 項目 | 値 |
|:-----|:---|
| **ベースURL** | `http://localhost:3000/api` |
| **WebSocket URL** | `ws://localhost:3000` |
| **認証方式** | JWT Bearer Token |
| **コンテンツタイプ** | `application/json` |

### 1.2 共通レスポンス形式
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
```

## 2. REST API エンドポイント

### 2.1 認証関連

#### POST /api/auth/login
ユーザーログイン

**リクエスト**:
```typescript
interface LoginDto {
  username: string;
  password: string;
}
```

**レスポンス**:
```typescript
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    username: string;
    email: string;
  };
}
```

**例**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "user@example.com", "password": "password123"}'
```

#### POST /api/auth/refresh
トークンリフレッシュ

**リクエスト**:
```typescript
interface RefreshDto {
  refreshToken: string;
}
```

**レスポンス**:
```typescript
interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
}
```

### 2.2 セッション管理

#### GET /api/sessions
セッション一覧取得

**クエリパラメータ**:
- `page`: number (デフォルト: 1)
- `limit`: number (デフォルト: 20)
- `status`: 'active' | 'closed' (オプション)

**レスポンス**:
```typescript
interface SessionListResponse {
  sessions: Session[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface Session {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'closed';
  messageCount: number;
}
```

#### GET /api/sessions/:id
セッション詳細取得

**レスポンス**:
```typescript
interface SessionDetailResponse {
  id: string;
  title: string;
  messages: ChatMessage[];
  metadata: {
    workspace?: string;
    tags?: string[];
  };
  createdAt: string;
  updatedAt: string;
}
```

#### POST /api/sessions
新規セッション作成

**リクエスト**:
```typescript
interface CreateSessionDto {
  title?: string;
  workspace?: string;
  metadata?: Record<string, any>;
}
```

#### DELETE /api/sessions/:id
セッション削除

### 2.3 履歴検索

#### GET /api/history/search
履歴検索

**クエリパラメータ**:
- `q`: string (検索クエリ)
- `sessionId`: string (オプション)
- `startDate`: string (ISO 8601)
- `endDate`: string (ISO 8601)
- `page`: number
- `limit`: number

**レスポンス**:
```typescript
interface SearchResponse {
  results: SearchResult[];
  pagination: PaginationInfo;
  facets: {
    sessions: { id: string; count: number }[];
    dates: { date: string; count: number }[];
  };
}

interface SearchResult {
  messageId: string;
  sessionId: string;
  content: string;
  highlight: string;
  timestamp: string;
  score: number;
}
```

### 2.4 設定管理

#### GET /api/settings
設定取得

**レスポンス**:
```typescript
interface SettingsResponse {
  theme: 'light' | 'dark';
  fontSize: number;
  enableSounds: boolean;
  autoSave: boolean;
  amazonQSettings: {
    trustAllTools: boolean;
    timeout: number;
    model: string;
  };
}
```

#### PUT /api/settings
設定更新

**リクエスト**: `Partial<SettingsResponse>`

## 3. WebSocket API

### 3.1 接続確立

```typescript
// クライアント側
const socket = io('ws://localhost:3000', {
  auth: {
    token: 'Bearer YOUR_JWT_TOKEN'
  }
});

socket.on('connect', () => {
  console.log('Connected with ID:', socket.id);
});
```

### 3.2 イベント仕様

#### クライアント → サーバー

##### message
チャットメッセージ送信

```typescript
socket.emit('message', {
  content: string;
  sessionId?: string;
  metadata?: {
    workspace?: string;
    context?: any;
  };
});
```

##### resize
ターミナルサイズ変更

```typescript
socket.emit('resize', {
  cols: number;
  rows: number;
});
```

##### cancel
現在の処理をキャンセル

```typescript
socket.emit('cancel', {
  sessionId: string;
});
```

##### tool_approval
ツール実行の承認/拒否

```typescript
socket.emit('tool_approval', {
  requestId: string;
  approved: boolean;
  sessionId: string;
});
```

#### サーバー → クライアント

##### message
Amazon Qからの出力

```typescript
interface OutputMessage {
  type: 'output';
  payload: {
    content: string;
    format: 'text' | 'ansi' | 'markdown';
    timestamp: string;
  };
  sessionId: string;
}

socket.on('message', (data: OutputMessage) => {
  // 出力を処理
});
```

##### tool_approval_request
ツール承認リクエスト

```typescript
interface ToolApprovalRequest {
  type: 'tool_approval_request';
  payload: {
    requestId: string;
    tool: {
      name: string;
      command: string;
      purpose: string;
      risk: 'low' | 'medium' | 'high';
    };
  };
  sessionId: string;
}
```

##### status
ステータス更新

```typescript
interface StatusMessage {
  type: 'status';
  payload: {
    status: 'idle' | 'processing' | 'waiting_approval';
    message?: string;
  };
  sessionId: string;
}
```

##### error
エラー通知

```typescript
interface ErrorMessage {
  type: 'error';
  payload: {
    code: string;
    message: string;
    retryable: boolean;
  };
  sessionId: string;
}
```

### 3.3 接続管理

#### 再接続処理
```typescript
socket.on('disconnect', (reason) => {
  if (reason === 'io server disconnect') {
    // サーバー側から切断された
    socket.connect();
  }
  // それ以外は自動的に再接続される
});

socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected after', attemptNumber, 'attempts');
});
```

#### ハートビート
```typescript
// 30秒ごとにping/pongで接続確認
socket.on('ping', () => {
  console.log('Ping received');
});
```

## 4. エラーコード

### 4.1 HTTPステータスコード
| コード | 説明 | 例 |
|:-------|:------|:-----|
| 200 | 成功 | 正常なレスポンス |
| 201 | 作成成功 | リソース作成 |
| 400 | リクエスト不正 | バリデーションエラー |
| 401 | 認証エラー | トークン無効 |
| 403 | 権限エラー | アクセス拒否 |
| 404 | リソースなし | セッション不存在 |
| 409 | 競合 | 重複作成 |
| 429 | レート制限 | リクエスト過多 |
| 500 | サーバーエラー | 内部エラー |

### 4.2 アプリケーションエラーコード
```typescript
enum ErrorCode {
  // 認証関連
  AUTH_INVALID_CREDENTIALS = 'AUTH001',
  AUTH_TOKEN_EXPIRED = 'AUTH002',
  AUTH_TOKEN_INVALID = 'AUTH003',
  
  // セッション関連
  SESSION_NOT_FOUND = 'SESSION001',
  SESSION_ALREADY_CLOSED = 'SESSION002',
  SESSION_LIMIT_EXCEEDED = 'SESSION003',
  
  // Amazon Q関連
  AMAZON_Q_NOT_INSTALLED = 'AQ001',
  AMAZON_Q_PROCESS_FAILED = 'AQ002',
  AMAZON_Q_TIMEOUT = 'AQ003',
  
  // WebSocket関連
  WS_CONNECTION_FAILED = 'WS001',
  WS_MESSAGE_INVALID = 'WS002',
  
  // システム関連
  RATE_LIMIT_EXCEEDED = 'SYS001',
  DATABASE_ERROR = 'SYS002',
  INTERNAL_ERROR = 'SYS999'
}
```

## 5. レート制限

### 5.1 API レート制限
| ユーザータイプ | 制限 |
|:-----------|:-----|
| **認証済みユーザー** | 1000リクエスト/時 |
| **未認証ユーザー** | 100リクエスト/時 |
| **WebSocket メッセージ** | 100メッセージ/分 |

### 5.2 レート制限ヘッダー
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## 6. データ型定義（TypeScript）

### 6.1 共通型
```typescript
// 日時はISO 8601形式
export type DateTime = string;

// UUID v4形式
export type UUID = string;

// ページネーション
interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
```

### 6.2 ドメイン型
```typescript
interface ChatMessage {
  id: UUID;
  sessionId: UUID;
  role: 'user' | 'assistant' | 'system';
  content: string;
  format: 'text' | 'markdown' | 'code';
  metadata?: {
    tool?: string;
    language?: string;
    error?: boolean;
  };
  timestamp: DateTime;
}

interface Tool {
  name: string;
  command: string;
  purpose: string;
  parameters?: Record<string, any>;
  risk: 'low' | 'medium' | 'high';
}
```

## 7. サンプルコード

### 7.1 Angular HTTPクライアント（Standalone）
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';

  getSession(id: string): Observable<SessionDetailResponse> {
    return this.http.get<ApiResponse<SessionDetailResponse>>(
      `${this.baseUrl}/sessions/${id}`
    ).pipe(
      map(response => response.data!),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.error?.error) {
      return throwError(() => new Error(error.error.error.message));
    }
    return throwError(() => new Error('An error occurred'));
  }
}
```

### 7.2 WebSocketクライアント（Signal対応）
```typescript
import { Injectable, inject, signal, computed, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatWebSocketService implements OnDestroy {
  private socket: Socket | null = null;
  private messageSubject = new Subject<OutputMessage>();
  
  // Signals for reactive state
  private readonly _isConnected = signal(false);
  private readonly _connectionError = signal<string | null>(null);
  
  readonly isConnected = this._isConnected.asReadonly();
  readonly connectionError = this._connectionError.asReadonly();
  readonly hasError = computed(() => this.connectionError() !== null);

  connect(token: string): void {
    this.socket = io(environment.wsUrl, {
      auth: { token: `Bearer ${token}` },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      this._isConnected.set(true);
      this._connectionError.set(null);
    });

    this.socket.on('disconnect', () => {
      this._isConnected.set(false);
    });

    this.socket.on('connect_error', (error) => {
      this._connectionError.set(error.message);
    });

    this.socket.on('message', (data: OutputMessage) => {
      this.messageSubject.next(data);
    });
  }

  sendMessage(content: string, sessionId: string): void {
    this.socket?.emit('message', { content, sessionId });
  }

  onMessage() {
    return this.messageSubject.asObservable();
  }

  ngOnDestroy(): void {
    this.socket?.disconnect();
  }
}
```

## 8. セキュリティ考慮事項

### 8.1 認証・認可
- **JWT認証**: すべてのAPIエンドポイントで必要
- **WebSocket検証**: 接続時にトークン検証を実施
- **トークン有効期限**: 
  - アクセストークン: 1時間
  - リフレッシュトークン: 7日間

### 8.2 入力検証
- **バリデーション**: すべての入力に対して実施
- **SQLインジェクション対策**: パラメータ化クエリ使用
- **XSS対策**: HTMLエスケープ処理

### 8.3 通信の暗号化
- **プロトコル**: HTTPS/WSS（本番環境）
- **TLSバージョン**: 1.3推奨

## 9. バージョニング

### 9.1 APIバージョン管理
- **URLパスベース**: `/api/v1/`, `/api/v2/`
- **後方互換性**: 常に保持
- **非推奨API**: 最低6ヶ月間維持

### 9.2 WebSocketプロトコルバージョン
- **バージョンネゴシエーション**: 接続時に実施
- **非対応バージョン**: 接続拒否

## まとめ

このAPI仕様書は、Amazon Q GUIのフロントエンドとバックエンド間の通信インターフェースを定義しています。RESTful APIとWebSocketを組み合わせることで、効率的なリアルタイム通信を実現しています。型定義を明確にすることで、TypeScriptの恩恵を最大限に活用できます。