# 04. 実践的なサンプルコードとパターン

## 完全なユーザー管理機能の実装例

### スキーマ定義

#### ユーザースキーマ

```yaml
# libs/shared/schemas/user.schema.yaml
openapi: 3.0.0
info:
  title: User Schema
  version: 1.0.0

components:
  schemas:
    User:
      type: object
      required:
        - id
        - email
        - name
        - status
      properties:
        id:
          type: integer
          format: int64
          description: ユーザーID
          example: 1
        email:
          type: string
          format: email
          description: メールアドレス
          example: 'user@example.com'
        name:
          type: string
          minLength: 1
          maxLength: 100
          description: ユーザー名
          example: '山田太郎'
        status:
          type: string
          enum: [active, inactive, pending]
          description: ユーザーステータス
          example: 'active'
        profile:
          $ref: '#/components/schemas/UserProfile'
        createdAt:
          type: string
          format: date-time
          description: 作成日時
          example: '2024-01-01T00:00:00Z'
        updatedAt:
          type: string
          format: date-time
          description: 更新日時
          example: '2024-01-01T00:00:00Z'

    UserProfile:
      type: object
      properties:
        bio:
          type: string
          maxLength: 500
          description: 自己紹介
          example: 'エンジニアです'
        avatar:
          type: string
          format: uri
          description: アバター画像URL
          example: 'https://example.com/avatar.jpg'
        preferences:
          $ref: '#/components/schemas/UserPreferences'

    UserPreferences:
      type: object
      properties:
        theme:
          type: string
          enum: [light, dark, auto]
          default: auto
          description: テーマ設定
        language:
          type: string
          enum: [ja, en]
          default: ja
          description: 言語設定
        notifications:
          type: boolean
          default: true
          description: 通知設定

    CreateUserDto:
      type: object
      required:
        - email
        - name
      properties:
        email:
          type: string
          format: email
          description: メールアドレス
        name:
          type: string
          minLength: 1
          maxLength: 100
          description: ユーザー名
        profile:
          type: object
          properties:
            bio:
              type: string
              maxLength: 500
            preferences:
              $ref: '#/components/schemas/UserPreferences'

    UpdateUserDto:
      type: object
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 100
        status:
          type: string
          enum: [active, inactive, pending]
        profile:
          type: object
          properties:
            bio:
              type: string
              maxLength: 500
            avatar:
              type: string
              format: uri
            preferences:
              $ref: '#/components/schemas/UserPreferences'

    UserListResponse:
      type: object
      properties:
        users:
          type: array
          items:
            $ref: '#/components/schemas/User'
        pagination:
          $ref: '#/components/schemas/Pagination'

    Pagination:
      type: object
      properties:
        page:
          type: integer
          minimum: 1
          description: 現在のページ番号
        limit:
          type: integer
          minimum: 1
          maximum: 100
          description: 1ページあたりの件数
        total:
          type: integer
          minimum: 0
          description: 総件数
        totalPages:
          type: integer
          minimum: 0
          description: 総ページ数

    ApiError:
      type: object
      required:
        - message
        - statusCode
      properties:
        message:
          type: string
          description: エラーメッセージ
        statusCode:
          type: integer
          description: HTTPステータスコード
        details:
          type: array
          items:
            type: string
          description: 詳細エラー情報
```

#### API 仕様

```yaml
# libs/shared/schemas/user-api.yaml
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0
  description: ユーザー管理API

paths:
  /users:
    get:
      summary: ユーザー一覧取得
      operationId: findAllUsers
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            minimum: 1
            default: 1
          description: ページ番号
        - name: limit
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
          description: 1ページあたりの件数
        - name: status
          in: query
          schema:
            type: string
            enum: [active, inactive, pending]
          description: ステータスフィルター
        - name: search
          in: query
          schema:
            type: string
          description: 名前またはメールでの検索
      responses:
        '200':
          description: ユーザー一覧
          content:
            application/json:
              schema:
                $ref: './user.schema.yaml#/components/schemas/UserListResponse'
        '400':
          description: 不正なリクエスト
          content:
            application/json:
              schema:
                $ref: './user.schema.yaml#/components/schemas/ApiError'

    post:
      summary: ユーザー作成
      operationId: createUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: './user.schema.yaml#/components/schemas/CreateUserDto'
      responses:
        '201':
          description: 作成されたユーザー
          content:
            application/json:
              schema:
                $ref: './user.schema.yaml#/components/schemas/User'
        '400':
          description: バリデーションエラー
          content:
            application/json:
              schema:
                $ref: './user.schema.yaml#/components/schemas/ApiError'
        '409':
          description: メールアドレス重複エラー
          content:
            application/json:
              schema:
                $ref: './user.schema.yaml#/components/schemas/ApiError'

  /users/{id}:
    get:
      summary: ユーザー詳細取得
      operationId: findUserById
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
            format: int64
          description: ユーザーID
      responses:
        '200':
          description: ユーザー詳細
          content:
            application/json:
              schema:
                $ref: './user.schema.yaml#/components/schemas/User'
        '404':
          description: ユーザーが見つからない
          content:
            application/json:
              schema:
                $ref: './user.schema.yaml#/components/schemas/ApiError'

    patch:
      summary: ユーザー更新
      operationId: updateUser
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
            format: int64
          description: ユーザーID
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: './user.schema.yaml#/components/schemas/UpdateUserDto'
      responses:
        '200':
          description: 更新されたユーザー
          content:
            application/json:
              schema:
                $ref: './user.schema.yaml#/components/schemas/User'
        '400':
          description: バリデーションエラー
          content:
            application/json:
              schema:
                $ref: './user.schema.yaml#/components/schemas/ApiError'
        '404':
          description: ユーザーが見つからない
          content:
            application/json:
              schema:
                $ref: './user.schema.yaml#/components/schemas/ApiError'

    delete:
      summary: ユーザー削除
      operationId: deleteUser
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
            format: int64
          description: ユーザーID
      responses:
        '204':
          description: 削除成功
        '404':
          description: ユーザーが見つからない
          content:
            application/json:
              schema:
                $ref: './user.schema.yaml#/components/schemas/ApiError'
```

### バックエンド実装

#### DTO クラスの定義

```typescript
// apps/backend/src/dto/user.dto.ts
import { IsEmail, IsString, IsOptional, IsEnum, IsInt, Min, Max, IsBoolean, IsUrl, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto',
}

export enum Language {
  JA = 'ja',
  EN = 'en',
}

export class UserPreferencesDto {
  @ApiPropertyOptional({ enum: Theme, default: Theme.AUTO })
  @IsOptional()
  @IsEnum(Theme)
  theme?: Theme = Theme.AUTO;

  @ApiPropertyOptional({ enum: Language, default: Language.JA })
  @IsOptional()
  @IsEnum(Language)
  language?: Language = Language.JA;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  notifications?: boolean = true;
}

export class UserProfileDto {
  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ format: 'uri' })
  @IsOptional()
  @IsUrl()
  avatar?: string;

  @ApiPropertyOptional({ type: UserPreferencesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserPreferencesDto)
  preferences?: UserPreferencesDto;
}

export class CreateUserDto {
  @ApiProperty({ format: 'email' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 1, maxLength: 100 })
  @IsString()
  name: string;

  @ApiPropertyOptional({ type: UserProfileDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserProfileDto)
  profile?: UserProfileDto;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ minLength: 1, maxLength: 100 })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({ type: UserProfileDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserProfileDto)
  profile?: UserProfileDto;
}

export class UserDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ format: 'email' })
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiPropertyOptional({ type: UserProfileDto })
  profile?: UserProfileDto;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt: string;
}

export class PaginationDto {
  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  page: number;

  @ApiProperty({ minimum: 1, maximum: 100 })
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number;

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  total: number;

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  totalPages: number;
}

export class UserListResponseDto {
  @ApiProperty({ type: [UserDto] })
  users: UserDto[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}

export class FindUsersQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
```

#### サービス実装

```typescript
// apps/backend/src/services/users.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto, UserDto, UserStatus, FindUsersQueryDto, UserListResponseDto } from '../dto/user.dto';

@Injectable()
export class UsersService {
  private users: Map<number, UserDto> = new Map();
  private nextId = 1;

  constructor() {
    // テスト用の初期データ
    this.seedData();
  }

  private seedData(): void {
    const testUsers: Omit<UserDto, 'id'>[] = [
      {
        email: 'admin@example.com',
        name: '管理者',
        status: UserStatus.ACTIVE,
        profile: {
          bio: 'システム管理者です',
          preferences: {
            theme: 'dark' as any,
            language: 'ja' as any,
            notifications: true,
          },
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];

    testUsers.forEach((user) => {
      const userWithId: UserDto = { ...user, id: this.nextId++ };
      this.users.set(userWithId.id, userWithId);
    });
  }

  async findAll(query: FindUsersQueryDto): Promise<UserListResponseDto> {
    let filteredUsers = Array.from(this.users.values());

    // ステータスフィルター
    if (query.status) {
      filteredUsers = filteredUsers.filter((user) => user.status === query.status);
    }

    // 検索フィルター
    if (query.search) {
      const searchTerm = query.search.toLowerCase();
      filteredUsers = filteredUsers.filter((user) => user.name.toLowerCase().includes(searchTerm) || user.email.toLowerCase().includes(searchTerm));
    }

    // ページネーション
    const total = filteredUsers.length;
    const totalPages = Math.ceil(total / query.limit);
    const startIndex = (query.page - 1) * query.limit;
    const endIndex = startIndex + query.limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return {
      users: paginatedUsers,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
      },
    };
  }

  async findById(id: number): Promise<UserDto> {
    const user = this.users.get(id);
    if (!user) {
      throw new NotFoundException(`ID ${id} のユーザーが見つかりません`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    // メールアドレスの重複チェック
    const existingUser = Array.from(this.users.values()).find((user) => user.email === createUserDto.email);

    if (existingUser) {
      throw new ConflictException('このメールアドレスは既に使用されています');
    }

    const now = new Date().toISOString();
    const user: UserDto = {
      id: this.nextId++,
      email: createUserDto.email,
      name: createUserDto.name,
      status: UserStatus.ACTIVE,
      profile: createUserDto.profile || {},
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(user.id, user);
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserDto> {
    const existingUser = await this.findById(id);

    const updatedUser: UserDto = {
      ...existingUser,
      ...updateUserDto,
      profile: updateUserDto.profile ? { ...existingUser.profile, ...updateUserDto.profile } : existingUser.profile,
      updatedAt: new Date().toISOString(),
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async delete(id: number): Promise<void> {
    const user = await this.findById(id);
    this.users.delete(id);
  }
}
```

#### コントローラー実装

```typescript
// apps/backend/src/controllers/users.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { CreateUserDto, UpdateUserDto, UserDto, FindUsersQueryDto, UserListResponseDto } from '../dto/user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'ユーザー一覧取得' })
  @ApiResponse({
    status: 200,
    description: 'ユーザー一覧',
    type: UserListResponseDto,
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'pending'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(@Query() query: FindUsersQueryDto): Promise<UserListResponseDto> {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ユーザー詳細取得' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'ユーザー詳細',
    type: UserDto,
  })
  @ApiResponse({ status: 404, description: 'ユーザーが見つからない' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<UserDto> {
    return this.usersService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'ユーザー作成' })
  @ApiResponse({
    status: 201,
    description: '作成されたユーザー',
    type: UserDto,
  })
  @ApiResponse({ status: 400, description: 'バリデーションエラー' })
  @ApiResponse({ status: 409, description: 'メールアドレス重複エラー' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'ユーザー更新' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: '更新されたユーザー',
    type: UserDto,
  })
  @ApiResponse({ status: 400, description: 'バリデーションエラー' })
  @ApiResponse({ status: 404, description: 'ユーザーが見つからない' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto): Promise<UserDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'ユーザー削除' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: '削除成功' })
  @ApiResponse({ status: 404, description: 'ユーザーが見つからない' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.usersService.delete(id);
  }
}
```

### フロントエンド実装

#### 型定義（自動生成）

```typescript
// apps/frontend/src/app/types/user.types.ts
// ※ 実際はOpenAPI Generatorで自動生成される

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto',
}

export enum Language {
  JA = 'ja',
  EN = 'en',
}

export interface UserPreferences {
  theme?: Theme;
  language?: Language;
  notifications?: boolean;
}

export interface UserProfile {
  bio?: string;
  avatar?: string;
  preferences?: UserPreferences;
}

export interface User {
  id: number;
  email: string;
  name: string;
  status: UserStatus;
  profile?: UserProfile;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  name: string;
  profile?: Partial<UserProfile>;
}

export interface UpdateUserDto {
  name?: string;
  status?: UserStatus;
  profile?: Partial<UserProfile>;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UserListResponse {
  users: User[];
  pagination: Pagination;
}

export interface FindUsersQuery {
  page?: number;
  limit?: number;
  status?: UserStatus;
  search?: string;
}
```

#### サービス実装

```typescript
// apps/frontend/src/app/services/user.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUserDto, UpdateUserDto, UserListResponse, FindUsersQuery } from '../types/user.types';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/users';

  getUsers(query?: FindUsersQuery): Observable<UserListResponse> {
    let params = new HttpParams();

    if (query) {
      if (query.page) params = params.set('page', query.page.toString());
      if (query.limit) params = params.set('limit', query.limit.toString());
      if (query.status) params = params.set('status', query.status);
      if (query.search) params = params.set('search', query.search);
    }

    return this.http.get<UserListResponse>(this.apiUrl, { params });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(createUserDto: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.apiUrl, createUserDto);
  }

  updateUser(id: number, updateUserDto: UpdateUserDto): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, updateUserDto);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

#### コンポーネント実装

```typescript
// apps/frontend/src/app/components/user-list.component.ts
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { User, UserStatus, FindUsersQuery } from '../types/user.types';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="user-list">
      <div class="header">
        <h2>ユーザー管理</h2>
      </div>

      <!-- 検索・フィルター -->
      <div class="filters">
        <div class="search-box">
          <input type="text" placeholder="名前またはメールで検索" [(ngModel)]="searchTerm" (input)="onSearchChange()" class="search-input" />
        </div>

        <div class="status-filter">
          <select [(ngModel)]="statusFilter" (change)="onFilterChange()" class="status-select">
            <option value="">すべてのステータス</option>
            <option value="active">アクティブ</option>
            <option value="inactive">非アクティブ</option>
            <option value="pending">保留中</option>
          </select>
        </div>

        <button (click)="loadUsers()" class="refresh-btn">更新</button>
      </div>

      <!-- ローディング・エラー表示 -->
      @if (loading()) {
      <div class="loading">読み込み中...</div>
      } @else if (error()) {
      <div class="error">
        エラー: {{ error() }}
        <button (click)="loadUsers()" class="retry-btn">再試行</button>
      </div>
      } @else {
      <!-- ユーザー一覧 -->
      <div class="user-grid">
        @for (user of users(); track user.id) {
        <div class="user-card" [attr.data-status]="user.status">
          <div class="user-avatar">
            @if (user.profile?.avatar) {
            <img [src]="user.profile.avatar" [alt]="user.name" />
            } @else {
            <div class="avatar-placeholder">
              {{ getInitials(user.name) }}
            </div>
            }
          </div>

          <div class="user-info">
            <h3>{{ user.name }}</h3>
            <p class="email">{{ user.email }}</p>
            <span class="status" [class]="'status-' + user.status">
              {{ getStatusLabel(user.status) }}
            </span>
            @if (user.profile?.bio) {
            <p class="bio">{{ user.profile.bio }}</p>
            }
          </div>

          <div class="user-actions">
            <button (click)="editUser(user)" class="edit-btn">編集</button>
            <button (click)="deleteUser(user)" class="delete-btn">削除</button>
          </div>
        </div>
        }
      </div>

      <!-- ページネーション -->
      @if (pagination()) {
      <div class="pagination">
        <button (click)="goToPage(pagination().page - 1)" [disabled]="pagination().page <= 1" class="page-btn">前へ</button>

        <span class="page-info"> {{ pagination().page }} / {{ pagination().totalPages }} ページ (全 {{ pagination().total }} 件) </span>

        <button (click)="goToPage(pagination().page + 1)" [disabled]="pagination().page >= pagination().totalPages" class="page-btn">次へ</button>
      </div>
      } }
    </div>
  `,
  styles: [
    `
      .user-list {
        padding: 1rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .header {
        margin-bottom: 2rem;
      }

      .filters {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
      }

      .search-input,
      .status-select {
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
      }

      .search-input {
        min-width: 200px;
      }

      .refresh-btn,
      .retry-btn {
        padding: 0.5rem 1rem;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }

      .loading,
      .error {
        text-align: center;
        padding: 2rem;
      }

      .error {
        color: #dc3545;
      }

      .user-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .user-card {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .user-card[data-status='active'] {
        border-left: 4px solid #28a745;
      }

      .user-card[data-status='inactive'] {
        border-left: 4px solid #dc3545;
      }

      .user-card[data-status='pending'] {
        border-left: 4px solid #ffc107;
      }

      .user-avatar img,
      .avatar-placeholder {
        width: 50px;
        height: 50px;
        border-radius: 50%;
      }

      .avatar-placeholder {
        background: #6c757d;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
      }

      .status {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: bold;
      }

      .status-active {
        background: #d4edda;
        color: #155724;
      }
      .status-inactive {
        background: #f8d7da;
        color: #721c24;
      }
      .status-pending {
        background: #fff3cd;
        color: #856404;
      }

      .user-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: auto;
      }

      .edit-btn,
      .delete-btn {
        padding: 0.25rem 0.5rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.8rem;
      }

      .edit-btn {
        background: #17a2b8;
        color: white;
      }

      .delete-btn {
        background: #dc3545;
        color: white;
      }

      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
      }

      .page-btn {
        padding: 0.5rem 1rem;
        border: 1px solid #ddd;
        background: white;
        cursor: pointer;
      }

      .page-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,
  ],
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);

  // Signals for reactive state management
  readonly users = signal<User[]>([]);
  readonly pagination = signal<any>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  // Filter states
  searchTerm = '';
  statusFilter = '';
  currentPage = 1;

  // Computed values
  readonly hasUsers = computed(() => this.users().length > 0);
  readonly isEmpty = computed(() => !this.loading() && !this.hasUsers() && !this.error());

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    const query: FindUsersQuery = {
      page: this.currentPage,
      limit: 12,
    };

    if (this.searchTerm) {
      query.search = this.searchTerm;
    }

    if (this.statusFilter) {
      query.status = this.statusFilter as UserStatus;
    }

    this.loading.set(true);
    this.error.set(null);

    this.userService.getUsers(query).subscribe({
      next: (response) => {
        this.users.set(response.users);
        this.pagination.set(response.pagination);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('ユーザーの読み込みに失敗しました');
        this.loading.set(false);
        console.error('Error loading users:', err);
      },
    });
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getStatusLabel(status: UserStatus): string {
    switch (status) {
      case UserStatus.ACTIVE:
        return 'アクティブ';
      case UserStatus.INACTIVE:
        return '非アクティブ';
      case UserStatus.PENDING:
        return '保留中';
      default:
        return status;
    }
  }

  editUser(user: User): void {
    // TODO: 編集ダイアログを開く
    console.log('Edit user:', user);
  }

  deleteUser(user: User): void {
    // TODO: 削除確認ダイアログを表示
    if (confirm(`${user.name} を削除しますか？`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (err) => {
          console.error('Delete error:', err);
          alert('削除に失敗しました');
        },
      });
    }
  }
}
```

このサンプルコードは、スキーマ駆動開発と TDD を組み合わせた完全な実装例を示しています。実際のプロジェクトでは、データベース接続、認証・認可、エラーハンドリングなどの追加実装が必要になります。
