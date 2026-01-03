# Inbox Specification

The **Inbox** is a dedicated capture point for quick thought collection. It holds items that haven't yet been processed (assigned to projects or otherwise organized).

## Overview

The Inbox is central to the GTD "capture" phase:
- Quick entry point for anything that has your attention
- Items don't need to be fully thought out
- Reduces friction for capturing ideas
- Goal: Process to zero regularly (typically daily)

## Data Model

The Inbox is not a project or folder—it's a special container at the system level.

### System-Level Inbox

| Property | Type | Description |
|----------|------|-------------|
| `beginning` | Position | Insert position at start of inbox |
| `ending` | Position | Insert position at end of inbox |

There is exactly ONE Inbox per database/account.

## Inbox Items

Inbox items are tasks that have no `project_id` and no `parent_task_id`. They use the same Task data model but with special semantics.

### Identifying Inbox Items

A task is an **inbox item** when:
- `project_id` IS NULL
- `parent_task_id` IS NULL

### Inbox Item Properties

Inbox items support ALL Task properties:

| Field | Behavior |
|-------|----------|
| `title` | Required - short description |
| `note` | Optional - extended details |
| `due_date` | Optional - can set even before processing |
| `defer_date` | Optional - can set even before processing |
| `flagged` | Optional - can flag for importance |
| `tags` | Optional - can tag before processing |
| `estimated_duration` | Optional - can estimate |

### Tentative Assignment

Inbox items can have a **tentative project assignment** that isn't yet applied:

| Field | Type | Description |
|-------|------|-------------|
| `tentative_project_id` | UUID | null | Project to assign on cleanup |
| `tentative_parent_task_id` | UUID | null | Parent task to assign on cleanup |

Tentative assignments:
- Allow batching capture and organization
- Applied when user triggers "Clean Up" operation
- Don't affect inbox item status until applied

## Capture Methods

### Direct Entry

Create items directly in the Inbox view:
- Minimal friction (just title required)
- Press Return twice for rapid entry
- Additional fields can be filled in later

### Quick Entry

System-wide capture available from anywhere:
- Keyboard shortcut triggers floating entry panel
- Creates inbox item immediately
- Can optionally set project, tags, dates during capture
- Closes without interrupting current work

### External Capture

Items can be created from:
- Share sheet on mobile
- Email forwarding (implementation-defined)
- Shortcuts/automation
- Voice input (Siri integration)
- Clipboard capture

### Capture with Context

Quick Entry can pre-fill fields:
- Project (tentative)
- Tags
- Due date
- Defer date
- Flag status

## Processing

Processing transforms inbox items into organized actions.

### Processing Operations

#### Assign to Project

```
process_to_project(
  inbox_item_id: UUID,
  project_id: UUID,
  position?: Integer
) → Task
```

- Sets `project_id` on the task
- Task is no longer an inbox item
- Inherits project's default tags (at assignment time)
- Positioned at end of project by default

#### Assign as Subtask

```
process_to_task(
  inbox_item_id: UUID,
  parent_task_id: UUID,
  position?: Integer
) → Task
```

- Sets `parent_task_id` on the task
- Inherits `project_id` from parent
- Task is no longer an inbox item

#### Complete Directly

```
complete_inbox_item(inbox_item_id: UUID) → Task
```

- Marks item as completed without moving it
- Good for quick two-minute tasks
- Remains in inbox (as completed) until manually cleaned

#### Drop Directly

```
drop_inbox_item(inbox_item_id: UUID) → Task
```

- Marks item as dropped without processing
- For captured items no longer relevant

#### Convert to Project

```
convert_to_project(
  inbox_item_id: UUID,
  type: ProjectType = parallel
) → Project
```

- Creates new project from inbox item
- Item title becomes project title
- Item note becomes project note
- Original item is deleted
- Can optionally move other inbox items into new project

### Clean Up Operation

```
clean_up_inbox() → void
```

Applies all tentative assignments:
- Items with `tentative_project_id` are moved to that project
- Items with `tentative_parent_task_id` are moved under that task
- Clears tentative fields after applying
- Items without assignments remain in inbox

## Availability

Inbox items follow modified availability rules:

### Available Inbox Items

An inbox item is **available** when:
1. Status is `active`
2. `defer_date` is null OR `defer_date` <= current time
3. No tag has `allows_next_action = false`
4. No tag has `status = on_hold`

### Remaining Inbox Items

All inbox items with `status = active` are "remaining."

### Inbox vs. Project Availability

| Aspect | Inbox Items | Project Tasks |
|--------|-------------|---------------|
| Sequential blocking | Never blocked | Depends on project type |
| Always available | Yes (if active/not deferred) | Depends on project |
| Shows in "Available" view | Yes | Depends on multiple factors |

## Queries

### List Inbox Items

```
list_inbox(
  include_completed: Boolean = false,
  include_dropped: Boolean = false
) → Task[]
```

Returns all inbox items, ordered by `order` field.

### Inbox Count

```
inbox_count() → Integer
```

Returns count of active (unprocessed) inbox items.

### Has Inbox Items

```
has_inbox_items() → Boolean
```

Quick check for badge/notification display.

### Inbox Statistics

```
inbox_stats() → {
  total: Integer,           // All inbox items
  active: Integer,          // Not completed/dropped
  available: Integer,       // Available now
  deferred: Integer,        // Active but deferred
  completed: Integer,       // Completed in inbox
  flagged: Integer,         // Flagged items
  with_due_date: Integer,   // Have due dates
  overdue: Integer,         // Past due
}
```

## Views

### Inbox View

Primary view for inbox items:
- Shows all active inbox items by default
- Can filter to show completed/dropped
- Supports inline editing of all properties
- Drag-and-drop to projects/folders

### Badge Count

The inbox count is typically shown:
- In navigation/sidebar
- As app icon badge
- As indicator that processing is needed

Badge shows: count of active inbox items (not completed/dropped).

## Ordering

### Manual Ordering

```
reorder_inbox(
  item_id: UUID,
  position: Integer
) → void
```

Users can manually reorder inbox items.

### Sort Options

Inbox can be sorted by:
- Manual order (default)
- Date added
- Due date
- Flag status
- Alphabetical

## Edge Cases

### Empty Inbox

- Empty inbox is the goal state
- UI should celebrate/acknowledge inbox zero
- Not an error condition

### Processing to Dropped Project

- If target project is `dropped`, item still moves
- Item inherits project's visibility (hidden from normal views)
- Consider warning user before processing to dropped project

### Circular Assignment

- Cannot assign inbox item as child of itself
- Validation required

### Inbox Item with Subtasks

Inbox items can have subtasks:
- Subtasks are also in inbox (inherit null project_id)
- Processing parent automatically processes children to same project
- Children can be processed independently first

### Maximum Inbox Size

- Implementation-defined limit (recommend 10,000 items)
- If limit reached, still allow Quick Entry (critical path)
- Warn user to process inbox

### Sync and Conflict

- Inbox items sync like any other task
- Conflicts resolved by standard sync rules
- Processing on one device should sync to others

## Two-Minute Rule Integration

For GTD practitioners, the two-minute rule applies during processing:

If an inbox item can be completed in under two minutes:
1. Do it immediately
2. Mark complete directly in inbox
3. Continue processing

This is a workflow pattern, not a system requirement.

## Out of Scope (Future Specs)

- Quick Entry UI/UX (see `specs/quick-capture.md`)
- Email capture rules (see `specs/notifications.md`)
- Voice capture (see `specs/quick-capture.md`)
- Inbox perspectives (see `specs/perspectives.md`)
