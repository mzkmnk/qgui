# CRUSH.md

Repository quick facts
- Nx monorepo: Angular (frontend) + NestJS (backend); Vitest (FE), Jest (BE); Playwright E2E
- Follow CLAUDE.md (日本語方針, TDD+スキーマ駆動, YAGNI, PrimeNG優先)
- Cursor/Copilot rules: none found except .cursor/rules directory present (no files)

Run servers
- All dev: npm run dev
- Frontend: npm run frontend:dev
- Backend: npm run backend:dev

Build/format
- Build all: npm run build
- Format write/check: npm run format / npm run format:check

Test commands
- All unit: npm run test
- Frontend unit: npm run frontend:test
- Backend unit: npm run backend:test
- Watch: npm run frontend:test:watch / npm run backend:test:watch
- Single test file: npx nx test frontend --testFile=path/to.spec.ts | npx nx test backend --testFile=path/to.spec.ts
- E2E: npm run e2e | npm run frontend:e2e | npm run backend:e2e

Lint
- All: npm run lint
- Frontend: npm run frontend:lint
- Backend: npm run backend:lint
- Affected only: npm run affected:build | affected:test | affected:lint | affected:e2e

Type generation
- npm run generate:types (websocket, pty, foundation api from OpenAPI)

Code style
- Formatting: Prettier (.prettierrc), EditorConfig enforced; use nx format:check in CI
- Imports: absolute within app/lib per tsconfig base; no barrel exports per CLAUDE.md; keep 1ファイル1責務
- Types: strict TS 5.8; avoid any, prefer unknown; interfaces/types first (スキーマファースト)
- Naming: camelCase vars/fns, PascalCase types/classes, kebab-case files; Angular standalone comps, OnPush
- Angular: signals for state, inputs/outputs functions, use PrimeNG first, prefer inline templates for small comps
- Services/DI: providedIn: 'root'; use inject(); single responsibility
- Error handling: throw typed errors; no secret logging; return Result-like or fail fast in services; map infra errors to domain
- Tests: Red-Green-Refactor, AAA, 1 assertion focus; FE Vitest utils, BE Nest Testing; avoid testing PrimeNG internals
