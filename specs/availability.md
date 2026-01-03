# Availability Specification

**Availability** determines whether a task can be worked on right now. This is the central concept that filters what users see in their "Available" views, separating actionable work from blocked, deferred, or future items.

## Overview

Availability is a computed property derived from multiple factors:
- Item's own status and dates
- Container (project/parent) status and dates
- Project type (sequential vs parallel)
- Tag status

Understanding availability is crucial for GTD practitioners who want to see only what they can act on now.

## Task Status Enum

Every task has a computed status:

| Status | Description |
|--------|-------------|
| `available` | Can be worked on now |
| `blocked` | Active but not currently workable |
| `next` | First available task in project |
| `due_soon` | Available and approaching due date |
| `overdue` | Available and past due date |
| `completed` | Task is done |
| `dropped` | Task was abandoned |

### Status Hierarchy

```
                    ┌─────────────┐
                    │   active    │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │  available  │ │   blocked   │ │ unavailable │
    └──────┬──────┘ └─────────────┘ └─────────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌────────┐  ┌──────────┐
│  next  │  │ due_soon │
└────────┘  │ overdue  │
            └──────────┘
```

## Availability Calculation

A task is **available** when ALL of the following are true:

### 1. Task Status is Active

```
task.status = active
```

Completed and dropped tasks are never available.

### 2. Defer Date Has Passed

```
task.effective_defer_date IS NULL
  OR task.effective_defer_date <= now
```

Deferred tasks are not available until their defer date.

### 3. Not Blocked by Sequential Project

```
IF project.type = sequential:
  task = first_incomplete_task_in_project
  OR task.parent is available (for nested groups)
```

In sequential projects, only the first incomplete task is available.

### 4. Project is Available

```
project.status = active
  AND (project.defer_date IS NULL OR project.defer_date <= now)
```

Tasks in on-hold, completed, or dropped projects are not available.

### 5. No Blocking Tags

```
FOR ALL tags ON task:
  tag.status != on_hold
  AND tag.allows_next_action = true
```

Any on-hold tag or tag with `allows_next_action = false` blocks the task.

### 6. Parent Task is Available (if nested)

```
IF task.parent_task_id IS NOT NULL:
  parent_task.is_available = true
```

Subtasks inherit blocking from parent tasks.

## Complete Availability Formula

```
is_available(task) =
  task.status = active
  AND effective_defer_date_passed(task)
  AND not_blocked_by_sequential(task)
  AND project_is_available(task.project)
  AND no_blocking_tags(task)
  AND (task.parent IS NULL OR is_available(task.parent))
```

## Remaining vs Available

| Category | Definition | Includes |
|----------|------------|----------|
| **Remaining** | Not completed or dropped | Blocked, deferred, on-hold, available |
| **Available** | Can be worked on now | Only currently actionable items |

### Set Relationship

```
Available ⊂ Remaining ⊂ All
```

All available items are remaining, but not all remaining items are available.

## Blocking Conditions

### Deferred (Future Defer Date)

```
effective_defer_date > now
```

- Task hidden from Available views
- Shown grayed in Remaining views
- Becomes available when defer date passes

### Sequential Blocking

```
project.type = sequential
AND task.order > first_incomplete_task.order
```

- Later tasks blocked by earlier incomplete tasks
- Unblocks when preceding task completes
- Can be unblocked by moving task to top

### On-Hold Project

```
project.status = on_hold
```

- All tasks in project become unavailable
- Tasks remain active (not individually on-hold)
- Become available when project reactivated

### On-Hold Tag

```
ANY tag.status = on_hold
```

- Task becomes unavailable
- Even if other tags are active
- Any on-hold tag blocks the task

### Waiting For Tag

```
ANY tag.allows_next_action = false
```

- Task blocked from being "next action"
- Common for "Waiting For" context
- Task may still show in some views

### Parent Unavailable

```
parent_task.is_available = false
```

- Subtasks inherit parent's blocking status
- Recursive up the hierarchy

## Project Type Effects

### Parallel Projects

```
project.type = parallel
```

| Task Position | Status |
|---------------|--------|
| First incomplete | Next action |
| Other incomplete | Available |
| Completed | Completed |

All incomplete tasks are available; first is designated "next."

### Sequential Projects

```
project.type = sequential
```

| Task Position | Status |
|---------------|--------|
| First incomplete | Available (Next) |
| Later incomplete | Blocked |
| Completed | Completed |

Only first incomplete task is available.

### Single Action Lists

```
project.type = single_actions
```

| Task Position | Status |
|---------------|--------|
| Any incomplete | Available (all are "next") |
| Completed | Completed |

All incomplete tasks are both available and next actions.

## Nested Action Groups

Action groups (parent tasks with subtasks) can have their own type:

```
📋 Launch Website (sequential project)
  □ Design Phase (parallel group)    ← available (first in sequence)
    □ Create mockups                 ← available (parallel)
    □ Write copy                     ← available (parallel)
  □ Development Phase                ← blocked (sequential)
    □ Build frontend
    □ Build backend
```

### Group Availability Rules

1. Group follows project's sequential/parallel rules
2. Group's children follow the group's type
3. Group must be available for children to be available

## First Available

The **first available** task is the first task in a project that is available.

### Calculation

```
first_available(project) =
  project.tasks
    .filter(t => t.is_available)
    .sort_by(t => t.order)
    .first()
```

### Special Cases

| Scenario | First Available |
|----------|-----------------|
| All tasks deferred | None (project has no first available) |
| First task has blocking tag | None or skip to next available |
| Sequential with deferred first | None until defer passes |
| Parallel with all available | First by order |

## Effective Properties

Several properties are computed considering the full hierarchy:

### Effective Defer Date

```
effective_defer_date = max(
  task.defer_date,
  parent_task.effective_defer_date,
  project.defer_date
)
```

Latest defer date wins (most restrictive).

### Effective Due Date

```
effective_due_date = min(
  task.due_date,
  parent_task.effective_due_date,
  project.due_date
)
```

Earliest due date wins (most urgent).

### Effective Flagged

```
effective_flagged =
  task.flagged
  OR parent_task.effective_flagged
  OR project.flagged
```

Flag inherits down (any ancestor flagged = flagged).

### Effective Availability

```
effective_availability =
  is_available(task)
  AND is_available(parent)
  AND project_is_available(project)
```

Must pass all levels.

## Queries

### Available Tasks

```
available_tasks() → Task[]
```

Returns all tasks where `is_available = true`.

### Remaining Tasks

```
remaining_tasks() → Task[]
```

Returns all tasks with `status = active`.

### Blocked Tasks

```
blocked_tasks() → Task[]
```

Returns tasks where `status = active AND is_available = false`.

### Available in Project

```
available_in_project(project_id: UUID) → Task[]
```

Returns available tasks within a specific project.

### Next Actions

```
next_actions() → Task[]
```

Returns tasks that are:
- Available
- First available in their project (parallel/sequential)
- OR any available in single-action lists

### Blocked By

```
blocked_by(task_id: UUID) → BlockingReason
```

Returns why a task is blocked:
- `deferred` - Future defer date
- `sequential` - Preceding task incomplete
- `project_on_hold` - Project is on hold
- `project_deferred` - Project has future defer
- `tag_on_hold` - Has on-hold tag
- `tag_blocks_next` - Tag disallows next action
- `parent_blocked` - Parent task is blocked

## View Filtering

### Available View

Shows only available tasks:
- Defer dates passed
- Not blocked by sequence
- Project and tags active

### Remaining View

Shows all active tasks:
- Available tasks (normal styling)
- Blocked tasks (may be grayed or grouped)
- Deferred tasks (grayed)

### All View

Shows everything:
- Available, blocked, deferred
- Completed (optional)
- Dropped (optional)

## Visual Indicators

| State | Visual Treatment |
|-------|-----------------|
| Available | Normal text, enabled checkbox |
| Blocked | Gray text, may show "blocked" indicator |
| Deferred | Gray text, shows defer date |
| Due Soon | Amber text/badge |
| Overdue | Red text/badge |
| Next Action | May have special indicator |

## Notifications

Availability changes can trigger notifications:

| Event | Notification |
|-------|--------------|
| Defer date reached | "Task is now available" |
| Preceding task completed | "Next task unblocked" |
| Project reactivated | "Project tasks available" |

## Edge Cases

### Circular Dependencies

Not possible in this model—sequential ordering is linear.

### Empty Sequential Project

No available tasks (project may show as "stalled").

### All Tasks Deferred

Project has remaining tasks but no available tasks.

### Completed Parent with Active Children

Children become orphaned—move to inbox or handle as error.

### Tag Status Change

When tag goes on-hold:
- All tasks with that tag become blocked
- Immediate effect, no delay

When tag reactivates:
- Tasks may become available (if no other blockers)

### Project Type Change

When project changes from sequential to parallel:
- Previously blocked tasks become available immediately

When project changes from parallel to sequential:
- Only first incomplete task remains available
- Others become blocked

## Performance Considerations

Availability calculation can be expensive:
- Cache computed availability
- Invalidate on relevant changes
- Consider denormalized `is_available` column

### Invalidation Triggers

Recalculate availability when:
- Task status changes
- Task defer date changes
- Task order changes (sequential projects)
- Parent availability changes
- Project status/type/defer changes
- Tag status changes
- Task tag assignments change

## Related Specifications

- `specs/defer-dates.md` - Defer date blocking
- `specs/due-dates.md` - Due soon and overdue states
- `specs/project.md` - Project types affecting availability
- `specs/tag.md` - Tag status and allows_next_action
- `specs/perspectives.md` - View filtering by availability
