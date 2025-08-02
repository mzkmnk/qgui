# 02. 環境構築とツールチェーン設定

## 必要な依存関係のインストール

### バックエンド（NestJS）依存関係

```bash
# OpenAPI関連
npm install @nestjs/swagger swagger-ui-express

# バリデーション関連
npm install class-validator class-transformer

# 開発時依存関係
npm install -D @types/swagger-ui-express
```

### フロントエンド（Angular）依存関係

```bash
# HTTP通信関連
npm install @angular/common/http

# 型生成ツール
npm install -D @openapitools/openapi-generator-cli

# スキーマバリデーション
npm install ajv ajv-formats
```

### 共通開発ツール

```bash
# スキーマ検証
npm install -D swagger-parser @apidevtools/swagger-parser

# Git hooks
npm install -D husky lint-staged

# スキーマテスト
npm install -D jest-json-schema
```

## プロジェクト構造の設定

### ディレクトリ構造作成

```bash
# スキーマディレクトリ
mkdir -p libs/shared/schemas
mkdir -p libs/shared/types

# バックエンド構造
mkdir -p apps/backend/src/dto
mkdir -p apps/backend/src/validators

# フロントエンド構造  
mkdir -p apps/frontend/src/app/types
mkdir -p apps/frontend/src/app/services/api
```

### Nx設定の拡張

#### nx.json への追加設定

```json
{
  "targetDefaults": {
    "generate-types": {
      "executor": "@nx/workspace:run-commands",
      "options": {
        "commands": [
          "openapi-generator-cli generate -i libs/shared/schemas/api.yaml -g typescript-axios -o apps/frontend/src/app/types",
          "openapi-generator-cli generate -i libs/shared/schemas/api.yaml -g typescript-nestjs -o apps/backend/src/dto"
        ],
        "parallel": true
      }
    }
  }
}
```

## OpenAPI Generator設定

### openapitools.json 作成

```json
{
  "$schema": "node_modules/@openapitools/openapi-generator-cli/config.schema.json",
  "spaces": 2,
  "generator-cli": {
    "version": "7.0.1"
  }
}
```

### .openapi-generator-ignore 作成

```
# バージョン管理から除外するファイル
.openapi-generator/
docs/
README.md
git_push.sh
```

## NestJS Swagger設定

### main.ts の設定

```typescript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // グローバルバリデーションパイプ
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Swagger設定
  const config = new DocumentBuilder()
    .setTitle('Qgui API')
    .setDescription('Qguiアプリケーションのapi仕様')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // スキーマファイル出力
  const fs = require('fs');
  fs.writeFileSync('./libs/shared/schemas/api.yaml', require('yaml').stringify(document));

  await app.listen(3000);
}

bootstrap();
```

## Angular HTTP設定

### app.config.ts の更新

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(withInterceptorsFromDi()),
  ],
};
```

## 自動生成スクリプト設定

### package.json への追加

```json
{
  "scripts": {
    "schema:generate": "nx generate-types",
    "schema:validate": "swagger-parser validate libs/shared/schemas/api.yaml",
    "schema:watch": "nodemon --watch apps/backend/src --ext ts --exec \"npm run schema:generate\"",
    "dev:schema": "npm run backend:dev & npm run schema:watch"
  }
}
```

## Git Hooks設定

### .husky/pre-commit 作成

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# スキーマ検証
npm run schema:validate

# 型生成
npm run schema:generate

# 変更されたファイルをステージング
git add apps/frontend/src/app/types/
git add apps/backend/src/dto/

# リント実行
npm run lint

# テスト実行
npm run test
```

### lint-staged設定

```json
{
  "lint-staged": {
    "libs/shared/schemas/*.yaml": [
      "swagger-parser validate",
      "npm run schema:generate",
      "git add apps/frontend/src/app/types/ apps/backend/src/dto/"
    ],
    "apps/**/*.ts": [
      "eslint --fix",
      "git add"
    ]
  }
}
```

## VS Code設定

### .vscode/settings.json

```json
{
  "yaml.schemas": {
    "https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/schemas/v3.0/schema.yaml": [
      "libs/shared/schemas/*.yaml"
    ]
  },
  "yaml.format.enable": true,
  "editor.formatOnSave": true,
  "typescript.preferences.includePackageJsonAutoImports": "off"
}
```

### .vscode/extensions.json

```json
{
  "recommendations": [
    "redhat.vscode-yaml",
    "ms-vscode.vscode-typescript-next",
    "angular.ng-template",
    "bradlc.vscode-tailwindcss"
  ]
}
```

## 環境変数設定

### .env.example 作成

```bash
# バックエンド設定
BACKEND_PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/qgui

# フロントエンド設定
FRONTEND_PORT=4200
API_BASE_URL=http://localhost:3000

# 開発ツール設定
SWAGGER_UI_ENABLED=true
SCHEMA_AUTO_GENERATION=true
```

## 検証手順

### 1. 依存関係の確認

```bash
npm list @nestjs/swagger
npm list @openapitools/openapi-generator-cli
```

### 2. スキーマ生成テスト

```bash
# バックエンド起動
npm run backend:dev

# スキーマファイル確認
ls -la libs/shared/schemas/

# 型生成テスト
npm run schema:generate
```

### 3. 自動生成ファイル確認

```bash
# バックエンドDTO確認
ls -la apps/backend/src/dto/

# フロントエンド型定義確認
ls -la apps/frontend/src/app/types/
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. OpenAPI Generator実行エラー

```bash
# Javaバージョン確認
java -version

# Generator再インストール
npm uninstall @openapitools/openapi-generator-cli
npm install -D @openapitools/openapi-generator-cli
```

#### 2. スキーマ検証エラー

```bash
# 詳細なエラー表示
swagger-parser validate libs/shared/schemas/api.yaml --verbose

# YAML構文チェック
npx js-yaml libs/shared/schemas/api.yaml
```

#### 3. 型生成の失敗

```bash
# 生成ディレクトリクリア
rm -rf apps/frontend/src/app/types/*
rm -rf apps/backend/src/dto/*

# 再生成
npm run schema:generate
```