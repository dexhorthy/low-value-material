# Project Specification

A **Project** is a collection of tasks (actions) working toward a common goal. Projects define how their contained tasks become available based on their type.

## Data Model

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `title` | String | Project name (1-500 chars) |
| `created_at` | Timestamp | When the project was created |
| `modified_at` | Timestamp | When the project was last modified |
| `status` | Enum | Current status (see below) |
| `type` | Enum | Project type (see below) |

### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `note` | RichText | null | Extended notes with formatting/attachments |
| `due_date` | DateTime | null | Hard deadline for project completion |
| `defer_date` | DateTime | null | When project becomes available |
| `completed_at` | Timestamp | null | When project was completed |
| `dropped_at` | Timestamp | null | When project was dropped |
| `flagged` | Boolean | false | User-marked as important |
| `folder_id` | UUID | null | Parent folder (null = root level) |
| `review_interval` | Duration | 7 days | How often to review this project |
| `last_reviewed_at` | Timestamp | null | When project was last reviewed |
| `tags` | UUID[] | [] | Associated tags |
| `order` | Integer | auto | Sort order within parent folder |

## Project Type Enum

| Value | Description |
|-------|-------------|
| `parallel` | Tasks can be completed in any order; first task is "next action" |
| `sequential` | Tasks must be completed in order; only first incomplete task is available |
| `single_actions` | Standalone tasks with no inherent relationship; ALL tasks are available |

### Type Behavior

#### Parallel Projects

```
□ Plan vacation (parallel)
  ■ Book flights        ← available (first)
  ○ Reserve hotel       ← available
  ○ Rent car            ← available
```

- All active tasks are **remaining**
- Only the first active task is the **next action** by default
- User can work on any task in any order
- Default type for new projects

#### Sequential Projects

```
□ Build deck (sequential)
  ■ Get permits         ← available (first incomplete)
  ○ Buy lumber          ← blocked
  ○ Pour foundation     ← blocked
  ○ Build frame         ← blocked
```

- Only the first incomplete task is **available**
- Subsequent tasks are **blocked** until predecessors complete
- Completing a task automatically makes the next one available
- Use for workflows with strict dependencies

#### Single Action Lists

```
□ Groceries (single_actions)
  ■ Milk                ← available
  ■ Eggs                ← available
  ■ Bread               ← available
```

- ALL tasks are **available** and considered **next actions**
- Tasks are standalone; no implicit relationship
- Order is irrelevant for availability
- Project is never "complete" in the traditional sense
- Use for ongoing collections (errands, someday/maybe, routines)

### Comparison Table

| Behavior | Parallel | Sequential | Single Actions |
|----------|----------|------------|----------------|
| First task available | Yes | Yes | Yes |
| Other tasks available | Yes | No (blocked) | Yes |
| First task is "next action" | Yes | Yes | All are next actions |
| Implies completion goal | Yes | Yes | No |
| Icon/visual distinction | Project | Project | List/bucket |

## Project Status Enum

| Value | Description |
|-------|-------------|
| `active` | Project is current and ongoing |
| `on_hold` | Project is paused; tasks become unavailable |
| `completed` | Project has been finished |
| `dropped` | Project was intentionally abandoned |

### Status Transitions

```
              ┌─────────────────┐
              │     active      │
              └────────┬────────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
       ▼               ▼               ▼
┌─────────────┐  ┌───────────┐  ┌───────────┐
│   on_hold   │  │ completed │  │  dropped  │
└──────┬──────┘  └───────────┘  └───────────┘
       │               ▲               ▲
       └───────────────┴───────────────┘
              (can restore to active)
```

- Projects start as `active`
- `active` → `on_hold`: Temporarily pause work
- `active` → `completed`: All tasks done or manually marked
- `active` → `dropped`: Abandon project
- `on_hold` → `active`: Resume work
- `completed`/`dropped` → `active`: Restore project

### Status Effects

| Status | Tasks Available | Shows in Views | Counts as Remaining |
|--------|-----------------|----------------|---------------------|
| `active` | Yes (per type rules) | Yes | Yes |
| `on_hold` | No | Optional filter | Yes |
| `completed` | No | Optional filter | No |
| `dropped` | No | Optional filter | No |

## Review System

Projects should be periodically reviewed to ensure they're still relevant and on track.

| Field | Type | Description |
|-------|------|-------------|
| `review_interval` | Duration | Time between reviews (e.g., 7 days, 1 month) |
| `last_reviewed_at` | Timestamp | When project was last marked reviewed |
| `next_review_at` | Computed | `last_reviewed_at` + `review_interval` |

### Review States

A project is **due for review** when:
- `next_review_at` <= current time
- Status is `active` or `on_hold`

A project is **stalled** when:
- Status is `active`
- Has zero remaining tasks

### Mark as Reviewed

```
mark_reviewed(project_id: UUID) → Project
```

- Sets `last_reviewed_at` = now
- Does not change project status

## Completion Rules

### Auto-Complete

A project can be configured to auto-complete when all tasks are completed:

| Setting | Behavior |
|---------|----------|
| `auto_complete: true` | Project status → `completed` when last task completes |
| `auto_complete: false` | Project remains `active` even with no remaining tasks |

Default: `true` for `parallel` and `sequential`, `false` for `single_actions`

### Manual Complete

Projects can always be manually marked complete, even with remaining tasks.

## Availability

A project is **available** when:
1. Status is `active`
2. `defer_date` is null OR `defer_date` <= current time
3. No blocking conditions from parent folder

A project is **remaining** when:
- Status is `active` OR `on_hold`

A project **has available tasks** when:
- Project is available
- At least one task meets availability criteria for the project type

## Operations

### Create Project

```
create_project(
  title: String,
  type: ProjectType = parallel,
  folder_id?: UUID,
  ...optional_fields
) → Project
```

### Complete Project

```
complete_project(project_id: UUID) → Project
```

- Sets `status` = `completed`
- Sets `completed_at` = now
- Tasks within remain in their current state

### Drop Project

```
drop_project(project_id: UUID, drop_tasks: Boolean = false) → Project
```

- Sets `status` = `dropped`
- Sets `dropped_at` = now
- If `drop_tasks`, also drops all contained tasks

### Put On Hold

```
hold_project(project_id: UUID) → Project
```

- Sets `status` = `on_hold`
- Tasks become unavailable but retain their individual status

### Activate Project

```
activate_project(project_id: UUID) → Project
```

- Sets `status` = `active`
- Clears `completed_at`, `dropped_at`
- Tasks become available again per type rules

### Move Project

```
move_project(
  project_id: UUID,
  target_folder_id?: UUID,
  position?: Integer
) → Project
```

### Delete Project

```
delete_project(project_id: UUID, delete_tasks: Boolean = true) → void
```

- If `delete_tasks` = false, tasks move to Inbox

## Nested Action Groups

Tasks within a project can themselves contain subtasks (Action Groups). Each action group can have its own type, independent of the parent project:

```
□ Launch product (sequential project)
  □ Design phase (parallel action group)
    ○ Create mockups       ← available
    ○ Write copy           ← available
  □ Development phase      ← blocked (waiting on Design)
    ○ Build frontend
    ○ Build backend
```

This allows mixing sequential and parallel behaviors within a single project.

## Queries

### List Available Projects

Projects where:
- Status = `active`
- Not deferred
- Has at least one available task

### List Projects Due for Review

Projects where:
- Status in [`active`, `on_hold`]
- `next_review_at` <= now

### List Stalled Projects

Projects where:
- Status = `active`
- Zero remaining tasks
- Type is not `single_actions`

## Edge Cases

### Empty Projects
- A project with no tasks is valid
- Empty `parallel`/`sequential` projects are "stalled"
- Empty `single_actions` projects are normal

### Completing Last Task
- If `auto_complete` enabled, project completes
- If disabled, project remains active (stalled)

### Changing Project Type
- Allowed at any time
- Immediately affects task availability
- No data loss

### Folder Deletion
- Projects can be moved to root or deleted with folder
- Implementation choice

## Out of Scope (Future Specs)

- Folder hierarchy (see `specs/folder.md`)
- Tag inheritance to tasks (see `specs/tag.md`)
- Review perspectives (see `specs/review.md`)
