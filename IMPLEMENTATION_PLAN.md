# Implementation Plan

This document tracks the implementation of the AI-native task management application based on specifications in `specs/` and `improved_specs/`.

## Tech Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **Monorepo**: Turborepo
- **Linting/Formatting**: oxlint, oxformat
- **Database**: PostgreSQL with Drizzle ORM
- **Sync**: Electric SQL
- **API Layer**: oRPC
- **Frontend**: React, TanStack (Query, Router, Table)
- **CLI**: Ink (React for CLI)
- **AI Processing**: BAML / BoundaryML
- **Local Dev**: Docker Compose (Postgres + Electric)

## Project Structure

```
packages/
  db/                 # Drizzle schema, migrations, Electric sync
  api/                # oRPC router and procedures
  core/               # Shared types, business logic
  ai/                 # BAML definitions and AI processing (future)
apps/
  cli/                # Ink-based CLI application
  web/                # React web application (future)
  mobile/             # React Native app (future)
```

## Implementation Phases

### Phase 1: Foundation
**Status**: COMPLETE

Core infrastructure and data model:

| Feature | Status | Notes |
|---------|--------|-------|
| Project scaffold with Turborepo | ✅ Done | monorepo with bun workspaces |
| Drizzle schema for Task entity | ✅ Done | specs/task.md implemented |
| Docker Compose (Postgres + Electric) | ✅ Done | local dev ready |
| Basic oRPC API for CRUD | ✅ Done | create/read/update/delete/complete/drop/restore |
| CLI scaffold with Ink | ✅ Done | basic task list with keyboard nav |
| Core types with Zod | ✅ Done | Task, CreateTaskInput, UpdateTaskInput, TaskFilter |
| Unit tests | ✅ Done | core package tests passing |

### Phase 2: Core Data Model
**Status**: COMPLETE

Complete the data model from specs:

| Feature | Status | Spec |
|---------|--------|------|
| Project entity | ✅ Done | specs/project.md - Drizzle schema, Zod types, oRPC CRUD |
| Folder entity | ✅ Done | specs/folder.md - Hierarchical folders with status |
| Tag entity | ✅ Done | specs/tag.md - Many-to-many with tasks/projects, location support |
| Inbox behavior | ✅ Done | specs/inbox.md - Tentative assignments, clean-up, stats |
| Entity relationships | ✅ Done | foreign keys, cascades, junction tables |

### Phase 3: Date/Time System
**Status**: Not Started

| Feature | Status | Spec |
|---------|--------|------|
| Due dates | ⏳ Pending | specs/due-dates.md |
| Defer dates | ⏳ Pending | specs/defer-dates.md |
| Repeat patterns | ⏳ Pending | specs/repeat.md |
| Availability calculation | ⏳ Pending | specs/availability.md |

### Phase 4: Views & Perspectives
**Status**: Not Started

| Feature | Status | Spec |
|---------|--------|------|
| Built-in perspectives | ⏳ Pending | specs/perspectives.md |
| Forecast view | ⏳ Pending | specs/forecast.md |
| Review system | ⏳ Pending | specs/review.md |
| Custom perspectives | ⏳ Pending | specs/custom-perspectives.md |

### Phase 5: AI Features
**Status**: Not Started

| Feature | Status | Spec |
|---------|--------|------|
| BAML schema setup | ⏳ Pending | improved_specs/ai-processing-reference.md |
| AI capture & NLP parsing | ⏳ Pending | improved_specs/ai-capture.md |
| Task suggestions | ⏳ Pending | improved_specs/ai-suggestions.md |
| Auto-tagging | ⏳ Pending | improved_specs/ai-organization.md |
| Smart scheduling | ⏳ Pending | improved_specs/ai-scheduling.md |
| Semantic search | ⏳ Pending | improved_specs/ai-search.md |
| AI review assistant | ⏳ Pending | improved_specs/ai-review.md |

### Phase 6: Platform Features
**Status**: Not Started

| Feature | Status | Spec |
|---------|--------|------|
| Electric SQL sync | ⏳ Pending | specs/sync.md |
| Notifications | ⏳ Pending | specs/notifications.md |
| MCP integrations | ⏳ Pending | improved_specs/mcp-integration.md |
| Focus mode | ⏳ Pending | specs/focus-mode.md |
| Quick capture | ⏳ Pending | specs/quick-capture.md |
| Search | ⏳ Pending | specs/search.md |
| Batch editing | ⏳ Pending | specs/batch-editing.md |

### Phase 7: Data Extensions
**Status**: Not Started

| Feature | Status | Spec |
|---------|--------|------|
| Attachments | ⏳ Pending | specs/attachments.md |
| Rich text notes | ⏳ Pending | specs/notes.md |
| Location tags | ⏳ Pending | specs/location-tags.md |

## Progress Log

| Date | Phase | Work Done |
|------|-------|-----------|
| 2026-01-03 | Phase 1 | Created IMPLEMENTATION_PLAN.md |
| 2026-01-03 | Phase 1 | Bootstrapped Turborepo monorepo with bun workspaces |
| 2026-01-03 | Phase 1 | Created packages/core with Zod schemas for Task types |
| 2026-01-03 | Phase 1 | Created packages/db with Drizzle schema for tasks table |
| 2026-01-03 | Phase 1 | Created packages/api with oRPC procedures for task CRUD |
| 2026-01-03 | Phase 1 | Created apps/cli with Ink-based task list UI |
| 2026-01-03 | Phase 1 | Set up Docker Compose for Postgres + Electric SQL |
| 2026-01-03 | Phase 1 | Added unit tests for core package |
| 2026-01-03 | Phase 1 | All checks passing (typecheck, lint, tests) |
| 2026-01-03 | Phase 2 | Created Folder entity (schema, types, API) |
| 2026-01-03 | Phase 2 | Created Project entity with type enum (parallel/sequential/single_actions) |
| 2026-01-03 | Phase 2 | Created Tag entity with many-to-many relations and location support |
| 2026-01-03 | Phase 2 | Added Inbox behavior with tentative assignments |
| 2026-01-03 | Phase 2 | Created junction tables for task-tag and project-tag relationships |
| 2026-01-03 | Phase 2 | Added unit tests for new schemas (19 tests passing) |

## Commands

```bash
# Development
bun install          # Install dependencies
bun dev              # Start dev servers
bun check            # Run typecheck via turbo
bun test             # Run tests
bun lint             # Run oxlint
bun format           # Run oxformat

# Database
bun db:generate      # Generate Drizzle migrations
bun db:migrate       # Run migrations
bun db:push          # Push schema to database
bun db:studio        # Open Drizzle Studio

# Docker
docker compose up -d # Start Postgres + Electric
docker compose down  # Stop services
```

## Next Steps

1. ~~Bootstrap Turborepo monorepo structure~~ ✅
2. ~~Create packages/db with Drizzle schema for Task~~ ✅
3. ~~Set up Docker Compose for local development~~ ✅
4. ~~Create packages/api with basic oRPC procedures~~ ✅
5. ~~Create apps/cli with Ink scaffold~~ ✅
6. ~~Implement Project entity (Phase 2)~~ ✅
7. ~~Implement Folder entity (Phase 2)~~ ✅
8. ~~Implement Tag entity (Phase 2)~~ ✅
9. ~~Implement Inbox behavior (Phase 2)~~ ✅
10. Generate and run database migrations (Phase 2)
11. Implement due dates and defer dates (Phase 3)
12. Implement repeat patterns (Phase 3)
13. Add Electric SQL sync layer (Phase 6)
