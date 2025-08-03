# 03. 実装ワークフローとベストプラクティス

## スキーマ駆動 TDD 実装フロー

### フェーズ 1: スキーマ設計

#### 1.1 要件分析とドメインモデリング

```yaml
# ユーザー管理機能の例
# libs/shared/schemas/user.schema.yaml
components:
  schemas:
    User:
      type: object
      required:
        - id
        - email
        - name
      properties:
        id:
          type: integer
          format: int64
          description: ユーザーID
        email:
          type: string
          format: email
          description: メールアドレス
        name:
          type: string
          minLength: 1
          maxLength: 100
          description: ユーザー名
        createdAt:
          type: string
          format: date-time
          description: 作成日時
```

#### 1.2 API エンドポイント設計

```yaml
# libs/shared/schemas/api.yaml
openapi: 3.0.0
info:
  title: Qgui API
  version: 1.0.0
  description: Qguiアプリケーションのapi仕様

paths:
  /users:
    get:
      summary: ユーザー一覧取得
      operationId: findAllUsers
      responses:
        '200':
          description: ユーザー一覧
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
    post:
      summary: ユーザー作成
      operationId: createUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserDto'
      responses:
        '201':
          description: 作成されたユーザー
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'

components:
  schemas:
    User:
      $ref: './user.schema.yaml#/components/schemas/User'
    CreateUserDto:
      type: object
      required:
        - email
        - name
      properties:
        email:
          type: string
          format: email
        name:
          type: string
          minLength: 1
          maxLength: 100
```

### フェーズ 2: バックエンド実装（TDD）

#### 2.1 型生成とテスト準備

```bash
# スキーマから型とDTOを生成
npm run schema:generate

# テストファイル作成
touch apps/backend/src/app/users.controller.spec.ts
touch apps/backend/src/app/users.service.spec.ts
```

#### 2.2 Red: 失敗するテストを書く

```typescript
// apps/backend/src/app/users.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto, User } from '../dto/api.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  describe('findAll', () => {
    it('すべてのユーザーを返すべき', async () => {
      const expectedUsers: User[] = [
        {
          id: 1,
          email: 'test@example.com',
          name: 'テストユーザー',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(expectedUsers);

      const result = await controller.findAll();

      expect(result).toEqual(expectedUsers);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('新しいユーザーを作成して返すべき', async () => {
      const createUserDto: CreateUserDto = {
        email: 'new@example.com',
        name: '新規ユーザー',
      };

      const expectedUser: User = {
        id: 2,
        email: createUserDto.email,
        name: createUserDto.name,
        createdAt: '2024-01-01T00:00:00Z',
      };

      jest.spyOn(service, 'create').mockResolvedValue(expectedUser);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(expectedUser);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });
});
```

#### 2.3 Green: テストをパスする最小限の実装

```typescript
// apps/backend/src/app/users.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, User } from '../dto/api.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiResponse({ type: [User] })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Post()
  @ApiResponse({ type: User, status: 201 })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }
}
```

```typescript
// apps/backend/src/app/users.service.ts
import { Injectable } from '@nestjs/common';
import { CreateUserDto, User } from '../dto/api.dto';

@Injectable()
export class UsersService {
  private users: User[] = [];
  private nextId = 1;

  async findAll(): Promise<User[]> {
    return this.users;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user: User = {
      id: this.nextId++,
      email: createUserDto.email,
      name: createUserDto.name,
      createdAt: new Date().toISOString(),
    };

    this.users.push(user);
    return user;
  }
}
```

#### 2.4 Refactor: 実装の改善

```typescript
// apps/backend/src/app/users.service.ts（リファクタリング後）
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, User } from '../dto/api.dto';

@Injectable()
export class UsersService {
  private users: Map<number, User> = new Map();
  private nextId = 1;

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async findById(id: number): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new NotFoundException(`ID ${id} のユーザーが見つかりません`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user: User = {
      id: this.nextId++,
      email: createUserDto.email,
      name: createUserDto.name,
      createdAt: new Date().toISOString(),
    };

    this.users.set(user.id, user);
    return user;
  }

  async update(id: number, updateData: Partial<CreateUserDto>): Promise<User> {
    const user = await this.findById(id);

    const updatedUser: User = {
      ...user,
      ...updateData,
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

### フェーズ 3: フロントエンド実装（TDD）

#### 3.1 型生成確認とサービス作成

```typescript
// apps/frontend/src/app/services/user.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { User, CreateUserDto } from '../types/api.types';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getUsers', () => {
    it('すべてのユーザーを取得できるべき', () => {
      const mockUsers: User[] = [
        {
          id: 1,
          email: 'test@example.com',
          name: 'テストユーザー',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ];

      service.getUsers().subscribe((users) => {
        expect(users).toEqual(mockUsers);
      });

      const req = httpMock.expectOne('/api/users');
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });
  });

  describe('createUser', () => {
    it('新しいユーザーを作成できるべき', () => {
      const createUserDto: CreateUserDto = {
        email: 'new@example.com',
        name: '新規ユーザー',
      };

      const mockUser: User = {
        id: 2,
        email: createUserDto.email,
        name: createUserDto.name,
        createdAt: '2024-01-01T00:00:00Z',
      };

      service.createUser(createUserDto).subscribe((user) => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne('/api/users');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createUserDto);
      req.flush(mockUser);
    });
  });
});
```

#### 3.2 サービス実装

```typescript
// apps/frontend/src/app/services/user.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUserDto } from '../types/api.types';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/users';

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(createUserDto: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.apiUrl, createUserDto);
  }

  updateUser(id: number, updateData: Partial<CreateUserDto>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, updateData);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

### フェーズ 4: コンポーネント実装（TDD）

#### 4.1 コンポーネントテスト

```typescript
// apps/frontend/src/app/components/user-list.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { UserListComponent } from './user-list.component';
import { UserService } from '../services/user.service';
import { User } from '../types/api.types';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let userService: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('UserService', ['getUsers']);

    await TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [{ provide: UserService, useValue: spy }, provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  it('コンポーネントが作成されるべき', () => {
    expect(component).toBeTruthy();
  });

  it('初期化時にユーザー一覧を読み込むべき', () => {
    const mockUsers: User[] = [
      {
        id: 1,
        email: 'test@example.com',
        name: 'テストユーザー',
        createdAt: '2024-01-01T00:00:00Z',
      },
    ];

    userService.getUsers.and.returnValue(of(mockUsers));

    component.ngOnInit();

    expect(userService.getUsers).toHaveBeenCalled();
    expect(component.users()).toEqual(mockUsers);
  });
});
```

#### 4.2 コンポーネント実装

```typescript
// apps/frontend/src/app/components/user-list.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { User } from '../types/api.types';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule],
  template: `
    <div class="user-list">
      <h2>ユーザー一覧</h2>

      @if (loading()) {
      <p>読み込み中...</p>
      } @else if (error()) {
      <p class="error">エラー: {{ error() }}</p>
      } @else {
      <ul>
        @for (user of users(); track user.id) {
        <li class="user-item">
          <div>
            <strong>{{ user.name }}</strong>
            <span>{{ user.email }}</span>
          </div>
          <small>作成日: {{ user.createdAt | date }}</small>
        </li>
        }
      </ul>
      }
    </div>
  `,
  styles: [
    `
      .user-list {
        padding: 1rem;
      }

      .user-item {
        padding: 0.5rem;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .error {
        color: red;
      }
    `,
  ],
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);

  readonly users = signal<User[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('ユーザーの読み込みに失敗しました');
        this.loading.set(false);
        console.error('Error loading users:', err);
      },
    });
  }
}
```

## ベストプラクティス

### 1. スキーマ設計

- **一意性の確保**: 各エンドポイントに`operationId`を設定
- **詳細な説明**: 各フィールドに日本語の説明を記載
- **バリデーション**: 適切な制約を設定（minLength, maxLength, format 等）
- **再利用性**: 共通スキーマは別ファイルに分離

### 2. テスト戦略

- **スキーマ準拠テスト**: 生成された DTO との整合性を検証
- **契約テスト**: フロントエンドとバックエンドの API 契約を検証
- **エラーケーステスト**: 異常系のテストも忘れずに

### 3. 型安全性

- **厳密な型チェック**: TypeScript の`strict`モードを有効化
- **型ガード**: 実行時の型チェックを実装
- **Null 安全**: Optional 型を活用

### 4. パフォーマンス

- **遅延読み込み**: 大きなスキーマは必要に応じて分割
- **キャッシュ活用**: 生成されたファイルのキャッシュを活用
- **最適化**: 不要な型生成を避ける

### 5. メンテナンス性

- **バージョン管理**: スキーマのバージョニング戦略
- **後方互換性**: API 変更時の互換性確保
- **ドキュメント**: スキーマ変更の理由を記録
