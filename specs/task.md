# Task Specification

A **Task** (also called an "Action" in GTD terminology) is the fundamental unit of work in the system.

## Data Model

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `title` | String | Short description of the action (1-500 chars) |
| `created_at` | Timestamp | When the task was created |
| `modified_at` | Timestamp | When the task was last modified |
| `status` | Enum | Current status (see below) |

### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `note` | RichText | null | Extended notes, supports formatting and attachments |
| `due_date` | DateTime | null | Hard deadline - when this MUST be completed |
| `defer_date` | DateTime | null | When task becomes available (hidden until this date) |
| `completed_at` | Timestamp | null | When the task was completed |
| `dropped_at` | Timestamp | null | When the task was dropped |
| `flagged` | Boolean | false | User-marked as important |
| `estimated_duration` | Duration | null | How long the task is expected to take |
| `project_id` | UUID | null | Parent project (null = inbox item) |
| `parent_task_id` | UUID | null | Parent task for nested subtasks |
| `tags` | UUID[] | [] | Associated tags |
| `order` | Integer | auto | Sort order within parent |

## Status Enum

| Value | Description |
|-------|-------------|
| `active` | Task is available to be worked on |
| `completed` | Task has been finished |
| `dropped` | Task was intentionally abandoned |

### Status Transitions

```
                  ┌──────────────┐
                  │   active     │
                  └──────┬───────┘
                         │
            ┌────────────┼────────────┐
            ▼            │            ▼
    ┌───────────┐        │     ┌───────────┐
    │ completed │◄───────┴────►│  dropped  │
    └───────────┘               └───────────┘
```

- Tasks start as `active`
- `active` → `completed`: User marks task done
- `active` → `dropped`: User abandons task
- `completed` → `active`: User unchecks task
- `dropped` → `active`: User restores task

## Availability

A task is **available** when ALL of these conditions are met:

1. Status is `active`
2. `defer_date` is null OR `defer_date` <= current time
3. If in a sequential project: all preceding sibling tasks are completed
4. Parent task (if any) is available

A task is **remaining** when:
- Status is `active` (regardless of defer date or project type)

A task is **overdue** when:
- Status is `active`
- `due_date` is not null AND `due_date` < current time

A task is **due soon** when:
- Status is `active`
- `due_date` is not null AND `due_date` is within a configurable threshold (default: 24 hours)

## Subtasks (Nested Tasks)

Tasks can contain other tasks, creating a hierarchy:

```
□ Plan birthday party
  □ Send invitations
  □ Order cake
  □ Buy decorations
```

### Subtask Behavior

- Subtasks inherit the `project_id` of their parent
- A parent task is automatically `completed` when all subtasks are `completed`
- A parent task cannot be directly completed if it has active subtasks
- Subtask `order` is relative to siblings
- Maximum nesting depth: implementation-defined (recommend 10 levels)

## Repeat/Recurrence

Tasks can repeat on a schedule. See `specs/repeat.md` for full specification.

Basic fields:
| Field | Type | Description |
|-------|------|-------------|
| `repeat_rule` | RepeatRule | null | How/when task repeats |
| `repeat_from` | Enum | null | `due_date` or `completion_date` |

## Operations

### Create Task

```
create_task(
  title: String,
  project_id?: UUID,
  parent_task_id?: UUID,
  ...optional_fields
) → Task
```

- If no `project_id` or `parent_task_id`, task goes to Inbox
- `order` auto-assigned to end of sibling list

### Complete Task

```
complete_task(task_id: UUID) → Task
```

- Sets `status` = `completed`
- Sets `completed_at` = now
- If task has `repeat_rule`, creates next occurrence instead

### Drop Task

```
drop_task(task_id: UUID) → Task
```

- Sets `status` = `dropped`
- Sets `dropped_at` = now
- Subtasks are NOT automatically dropped

### Restore Task

```
restore_task(task_id: UUID) → Task
```

- Sets `status` = `active`
- Clears `completed_at` and `dropped_at`

### Move Task

```
move_task(
  task_id: UUID,
  target_project_id?: UUID,
  target_parent_task_id?: UUID,
  position?: Integer
) → Task
```

- Moves task to new parent
- If no target specified, moves to Inbox
- Updates `order` of affected tasks

### Delete Task

```
delete_task(task_id: UUID, recursive: Boolean = true) → void
```

- Permanently removes task
- If `recursive`, also deletes all subtasks

## Queries

### List Available Tasks

Returns tasks that can be worked on now:
- Status = `active`
- Not deferred (or defer date passed)
- Not blocked by sequential project rules
- Parent available (if nested)

### List Remaining Tasks

Returns all non-completed tasks:
- Status = `active`
- Includes deferred and blocked tasks

### List Tasks By Tag

Returns tasks with specified tag(s):
- Can filter by any/all tag match
- Can include/exclude inherited tags from projects

## Edge Cases

### Empty Title
- Title must be non-empty after trimming whitespace
- Maximum 500 characters

### Circular Parent References
- System must prevent task from being its own ancestor
- Validate on every parent change

### Project Deletion
- When project is deleted, contained tasks can be:
  - Moved to Inbox (default)
  - Deleted recursively
  - Implementation choice

### Timezone Handling
- `due_date` and `defer_date` are stored as UTC with timezone info
- Display in user's local timezone
- "All day" dates have no time component

## Out of Scope (Future Specs)

- Rich text note format (see `specs/notes.md`)
- Attachment handling (see `specs/attachments.md`)
- Repeat rules (see `specs/repeat.md`)
- Tag inheritance (see `specs/tag.md`)
