# Amazon Q GUI データスキーマ定義

## 1. 基本型定義

```typescript
// 共通型
export type UUID = string;
export type DateTime = string; // ISO 8601形式
export type UserId = string;
export type SessionId = UUID;
export type MessageId = UUID;

// 列挙型
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
  TOOL = 'tool'
}

export enum MessageFormat {
  TEXT = 'text',
  MARKDOWN = 'markdown',
  CODE = 'code',
  ANSI = 'ansi'
}

export enum SessionStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  ERROR = 'error'
}

export enum ToolApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  DENIED = 'denied',
  TRUSTED = 'trusted'
}

export enum ToolRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum ProcessingStatus {
  IDLE = 'idle',
  THINKING = 'thinking',
  PROCESSING = 'processing',
  WAITING_APPROVAL = 'waiting_approval',
  EXECUTING_TOOL = 'executing_tool'
}
```

## 2. ドメインモデル

### User（ユーザー）
```typescript
export interface User {
  id: UserId;
  username: string;
  email: string;
  createdAt: DateTime;
  updatedAt: DateTime;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  fontSize: number;
  enableSounds: boolean;
  autoSave: boolean;
  defaultModel?: string;
  trustAllTools?: boolean;
  trustedTools?: string[];
}
```

### Session（セッション）
```typescript
export interface Session {
  id: SessionId;
  userId: UserId;
  title: string;
  workspace?: string;
  status: SessionStatus;
  model: string;
  createdAt: DateTime;
  updatedAt: DateTime;
  lastMessageAt?: DateTime;
  messageCount: number;
  metadata?: SessionMetadata;
  ptyProcessId?: number;
}

export interface SessionMetadata {
  tags?: string[];
  description?: string;
  context?: Record<string, any>;
}
```

### Message（メッセージ）
```typescript
export interface Message {
  id: MessageId;
  sessionId: SessionId;
  role: MessageRole;
  content: string;
  format: MessageFormat;
  timestamp: DateTime;
  metadata?: MessageMetadata;
  toolRequest?: ToolRequest;
  toolResponse?: ToolResponse;
}

export interface MessageMetadata {
  model?: string;
  thinkingTime?: number; // ミリ秒
  processingTime?: number; // ミリ秒
  error?: boolean;
  errorMessage?: string;
}
```

### Tool（ツール）
```typescript
export interface Tool {
  name: string;
  displayName: string;
  description: string;
  category: string;
  riskLevel: ToolRiskLevel;
  requiresApproval: boolean;
  parameters?: ToolParameter[];
}

export interface ToolParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
  default?: any;
}

export interface ToolRequest {
  id: string;
  toolName: string;
  command: string;
  purpose: string;
  parameters?: Record<string, any>;
  riskLevel: ToolRiskLevel;
  approvalStatus: ToolApprovalStatus;
  requestedAt: DateTime;
  approvedAt?: DateTime;
  approvedBy?: UserId;
}

export interface ToolResponse {
  requestId: string;
  success: boolean;
  output?: string;
  error?: string;
  executionTime: number; // ミリ秒
  completedAt: DateTime;
}
```

### MCPServer（MCPサーバー）
```typescript
export interface MCPServer {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  timeout: number;
  disabled: boolean;
  scope: 'global' | 'workspace';
  status?: MCPServerStatus;
}

export interface MCPServerStatus {
  initialized: boolean;
  initTime?: number; // ミリ秒
  error?: string;
  warnings?: string[];
  availableTools?: string[];
}
```

## 3. リアルタイム通信モデル

### WebSocketメッセージ
```typescript
// クライアント → サーバー
export interface ClientMessage {
  type: 'message' | 'resize' | 'cancel' | 'tool_approval';
  payload: MessagePayload | ResizePayload | CancelPayload | ToolApprovalPayload;
  sessionId: SessionId;
  timestamp: DateTime;
}

export interface MessagePayload {
  content: string;
  metadata?: {
    workspace?: string;
    context?: any;
  };
}

export interface ResizePayload {
  cols: number;
  rows: number;
}

export interface CancelPayload {
  // 空のペイロード
}

export interface ToolApprovalPayload {
  requestId: string;
  approved: boolean;
  trustForSession?: boolean;
}

// サーバー → クライアント
export interface ServerMessage {
  type: 'output' | 'tool_request' | 'status' | 'error' | 'session_update';
  payload: OutputPayload | ToolRequestPayload | StatusPayload | ErrorPayload | SessionUpdatePayload;
  sessionId: SessionId;
  timestamp: DateTime;
}

export interface OutputPayload {
  content: string;
  format: MessageFormat;
  role: MessageRole;
  complete: boolean; // ストリーミング完了フラグ
}

export interface ToolRequestPayload {
  requestId: string;
  tool: {
    name: string;
    command: string;
    purpose: string;
    riskLevel: ToolRiskLevel;
  };
}

export interface StatusPayload {
  status: ProcessingStatus;
  message?: string;
}

export interface ErrorPayload {
  code: string;
  message: string;
  retryable: boolean;
  details?: any;
}

export interface SessionUpdatePayload {
  title?: string;
  messageCount?: number;
  lastMessageAt?: DateTime;
}
```

## 4. PTY出力パース用モデル

```typescript
export interface ParsedOutput {
  type: 'text' | 'thinking' | 'tool_usage' | 'code_block' | 'prompt' | 'system';
  content: string;
  metadata?: ParsedOutputMetadata;
}

export interface ParsedOutputMetadata {
  toolName?: string;
  toolStatus?: 'trusted' | 'untrusted';
  codeLanguage?: string;
  ansiCodes?: string[];
  timestamp?: DateTime;
}

export interface ANSIStyle {
  foreground?: string;
  background?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}
```

## 5. データベーススキーマ（SQLite）

```sql
-- ユーザーテーブル
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  preferences TEXT -- JSON
);

-- セッションテーブル
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  workspace TEXT,
  status TEXT NOT NULL,
  model TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_message_at DATETIME,
  message_count INTEGER DEFAULT 0,
  metadata TEXT, -- JSON
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- メッセージテーブル
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  format TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT, -- JSON
  tool_request TEXT, -- JSON
  tool_response TEXT, -- JSON
  FOREIGN KEY (session_id) REFERENCES sessions (id)
);

-- ツール承認履歴テーブル
CREATE TABLE tool_approvals (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  command TEXT NOT NULL,
  approval_status TEXT NOT NULL,
  requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  approved_at DATETIME,
  FOREIGN KEY (session_id) REFERENCES sessions (id),
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- インデックス
CREATE INDEX idx_sessions_user_id ON sessions (user_id);
CREATE INDEX idx_sessions_status ON sessions (status);
CREATE INDEX idx_messages_session_id ON messages (session_id);
CREATE INDEX idx_messages_timestamp ON messages (timestamp);
CREATE INDEX idx_tool_approvals_session_id ON tool_approvals (session_id);
```

## 6. API レスポンスモデル

```typescript
// 共通レスポンス
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: DateTime;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// ページネーション
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// セッション一覧レスポンス
export interface SessionListResponse extends PaginatedResponse<SessionSummary> {}

export interface SessionSummary {
  id: SessionId;
  title: string;
  status: SessionStatus;
  createdAt: DateTime;
  updatedAt: DateTime;
  lastMessageAt?: DateTime;
  messageCount: number;
  preview?: string; // 最後のメッセージの一部
}

// 履歴検索レスポンス
export interface SearchResponse extends PaginatedResponse<SearchResult> {
  facets: {
    sessions: { id: string; count: number }[];
    dates: { date: string; count: number }[];
  };
}

export interface SearchResult {
  messageId: MessageId;
  sessionId: SessionId;
  content: string;
  highlight: string;
  timestamp: DateTime;
  score: number;
}
```

## 7. フロントエンド状態管理（NgRx）

```typescript
// Chat Feature State
export interface ChatState {
  currentSession: Session | null;
  messages: Message[];
  isLoading: boolean;
  isThinking: boolean;
  processingStatus: ProcessingStatus;
  pendingToolRequest: ToolRequest | null;
  error: string | null;
}

// Session Feature State
export interface SessionState {
  sessions: SessionSummary[];
  selectedSessionId: SessionId | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// WebSocket State
export interface WebSocketState {
  isConnected: boolean;
  connectionError: string | null;
  reconnectAttempts: number;
  lastActivity: DateTime | null;
}

// Root State
export interface AppState {
  chat: ChatState;
  session: SessionState;
  webSocket: WebSocketState;
  user: User | null;
}
```

## 8. 設定ファイルモデル

```typescript
// Amazon Q設定
export interface AmazonQSettings {
  defaultModel: string;
  trustAllTools: boolean;
  trustedTools: string[];
  timeout: number;
  enableNotifications: boolean;
}

// MCP設定
export interface MCPConfig {
  mcpServers: Record<string, MCPServer>;
}

// アプリケーション設定
export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
  };
  webSocket: {
    url: string;
    reconnectInterval: number;
    maxReconnectAttempts: number;
  };
  ui: {
    theme: 'light' | 'dark';
    fontSize: number;
    fontFamily: string;
    syntaxHighlightTheme: string;
  };
}
```

## まとめ

このデータスキーマは、Amazon Q CLIをWebベースのGUIで操作するために必要なすべてのデータ構造を定義しています。TypeScriptの型安全性を活用し、フロントエンドとバックエンド間の一貫性を保証します。SQLiteによる軽量なデータ永続化と、WebSocketによるリアルタイム通信をサポートしています。