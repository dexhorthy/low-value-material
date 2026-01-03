# Defer Dates Specification

A **Defer Date** (also called "Defer Until") represents when a task or project becomes available for work. Items with future defer dates are hidden from available views until that date arrives.

## Overview

Defer dates control visibility and availability, not deadlines. They answer the question "When can I start working on this?" rather than "When must this be done?" This prevents premature clutter and keeps focus on actionable work.

Key distinctions:
- **Due Date**: When something must be completed (deadline)
- **Defer Date**: When something becomes available to work on (start date)
- **Planned Date**: When you intend to work on something (scheduling, without hiding)

## Data Model

### Defer Date Fields

| Field | Type | Description |
|-------|------|-------------|
| `defer_date` | DateTime | null | When item becomes available |
| `defer_time_specified` | Boolean | Whether a specific time was set |

### DateTime Storage

Defer dates are stored as:
- UTC timestamp internally
- With timezone information for display
- Either with specific time OR as all-day

### All-Day vs. Specific Time

| Type | Behavior |
|------|----------|
| All-day | Uses default defer time for calculations |
| Specific time | Exact time when item becomes available |

When user enters a date without time:
- `defer_time_specified` = false
- Effective time uses configurable default (see Settings)

## Settings

### Default Defer Time

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `default_defer_time` | Time | 00:00 | Time used when no time specified |

Common configurations:
- 00:00 (midnight) - start of day **default**
- 06:00 (6 AM) - morning start
- 09:00 (9 AM) - work day start

Note: Default defer time is typically earlier than default due time (00:00 vs 17:00).

## Defer States

Items with defer dates can be in one of these states:

### Deferred (Not Yet Available)

```
defer_date > now
```

- Visual indicator: grayed out text
- Hidden from "Available" views
- Visible in "Remaining" views (optionally)
- Cannot be the "next action" in sequential projects

### Available (Defer Date Reached)

```
defer_date <= now OR defer_date is null
```

- Normal text coloring
- Appears in "Available" views
- Can be worked on immediately

### State Transition

```
                    ┌─────────────┐
                    │  Deferred   │
                    │  (grayed)   │
                    └──────┬──────┘
                           │
                           │ defer_date reached
                           ▼
                    ┌─────────────┐
                    │  Available  │
                    │  (normal)   │
                    └─────────────┘
```

Unlike due dates (normal → due soon → overdue), defer dates have a simple binary transition.

## Effective Defer Date

Items inherit defer dates from their containers. The **effective defer date** is the latest defer date in the item's hierarchy.

### Calculation

```
effective_defer_date(item) =
  max(
    item.defer_date,
    parent_task.effective_defer_date (if exists),
    project.defer_date (if exists)
  )
  where null values are treated as "no deferral"
```

Note: Uses `max` (latest), opposite of effective due date which uses `min` (earliest). A parent deferral blocks children.

### Examples

**Task with project defer date:**
```
📋 Project A (defer: Jan 15)
  □ Task 1 (defer: null)     → effective defer: Jan 15 (from project)
  □ Task 2 (defer: Jan 10)   → effective defer: Jan 15 (project is later)
  □ Task 3 (defer: Jan 20)   → effective defer: Jan 20 (task is later)
```

**Nested action groups:**
```
📋 Project (defer: Jan 5)
  □ Phase 1 (defer: Jan 10)
    □ Subtask A (defer: null)  → effective defer: Jan 10
    □ Subtask B (defer: Jan 8) → effective defer: Jan 10
  □ Phase 2 (defer: null)
    □ Subtask C (defer: null)  → effective defer: Jan 5
```

### Inheritance Properties

| Property | Type | Description |
|----------|------|-------------|
| `defer_date` | DateTime | null | Locally set defer date |
| `effective_defer_date` | DateTime | null | Computed defer date including inheritance |
| `has_local_defer_date` | Boolean | Whether item has its own defer date (not inherited) |
| `is_deferred` | Boolean | Whether effective defer date is in the future |

## Defer Dates on Different Items

### Tasks

- Can have direct defer date
- Inherit from parent task or project
- Deferred tasks hidden from Available view
- Deferred tasks cannot be "next action"

### Projects

- Can have defer date for entire project
- All tasks within inherit this minimum defer
- Project-level deferral hides all tasks until date
- Useful for "don't think about this until later"

### Action Groups (Parent Tasks)

- Can have defer date
- Children inherit this as minimum
- Action group availability gates child availability

### Inbox Items

- Can have defer date even before processing
- Defer date preserved when moved to project
- Effective defer date only considers local date (no inheritance)

## Interaction with Other Date Types

### Defer + Due Combination

Common pattern for time-boxed work:

```
Task: Submit expense report
  defer: Jan 25 (when receipts are ready)
  due: Jan 31 (deadline for submission)
```

The task is hidden until Jan 25, then visible and due by Jan 31.

### Validity Rules

| Scenario | Behavior |
|----------|----------|
| defer_date > due_date | Allowed but warns user (no time to complete) |
| defer_date = due_date | Valid (available and due same day) |
| defer_date < due_date | Normal case |

### Defer to Due Operation

```
defer_to_due(item_id: UUID, buffer_hours: Integer = 24) → Item
```

Sets defer date to `due_date - buffer_hours`. Makes item appear at "last responsible moment."

## Planned Dates (OmniFocus 4.7+)

Planned dates are a third date type for scheduling without hiding:

| Date Type | Controls | Effect on Availability |
|-----------|----------|----------------------|
| Defer | When available | Hides until date |
| Due | When must complete | No effect on availability |
| Planned | When intend to work | No effect on availability |

### Planned Date Use Cases

- Scheduling work sessions without hiding
- Appearing in Forecast without false urgency
- Replacing misused due dates for "when I'd like to do this"

### Combining Planned + Defer

For recurring tasks you want to schedule but keep hidden:
```
Task: Weekly report
  defer: Monday 9am (hidden on weekends)
  planned: Monday 10am (scheduled slot)
  due: Monday 5pm (actual deadline)
```

## Operations

### Set Defer Date

```
set_defer_date(
  item_id: UUID,
  defer_date: DateTime | null,
  time_specified: Boolean = false
) → Item
```

- Pass null to clear defer date
- `time_specified` indicates whether time is meaningful

### Defer Until

```
defer_until(
  item_id: UUID,
  when: DateTime | RelativeTime
) → Item
```

Common relative times:
- Tomorrow
- Next week
- Next month
- Custom date

### Clear Defer

```
clear_defer(item_id: UUID) → Item
```

Makes item immediately available.

### Bulk Defer

```
defer_all(
  item_ids: UUID[],
  defer_date: DateTime
) → Item[]
```

Defer multiple items to same date.

## Queries

### Available Items

```
available() → Item[]
```

Returns items where:
- `effective_defer_date` is null OR <= now
- Status is `active`
- Not blocked by sequential project rules
- No tags with `on_hold` status

### Deferred Items

```
deferred() → Item[]
```

Returns items where:
- `effective_defer_date` > now
- Status is `active`

### Becoming Available

```
becoming_available_on(date: Date) → Item[]
```

Returns items whose defer date falls on the specified date.

### Deferred Until Range

```
deferred_until_range(start: DateTime, end: DateTime) → Item[]
```

Returns items with defer dates in the specified range.

## View Filtering

### Available View

Shows only items that:
- Have passed their defer date (or have no defer date)
- Are otherwise actionable

### Remaining View

Can optionally include deferred items:
- Deferred items shown in gray
- Indicates future work without cluttering available tasks

### Forecast View

Deferred items can optionally appear:
- On the date they become available
- Styled differently from due items
- Helps with capacity planning

## Visual Treatment

### Deferred Items

| Element | Style |
|---------|-------|
| Title text | Gray/dimmed |
| Checkbox | Gray/dimmed |
| Date badge | Shows "Deferred until [date]" |
| In lists | Optionally hidden or at bottom |

### Transition Animation

When defer date arrives:
- Item text transitions from gray to black
- Item may animate into available section
- Badge changes from "deferred" to normal

## Edge Cases

### Defer Date in Past

- Allowed (for capturing already-available items)
- Item is immediately available
- No special handling needed

### Defer Same as Due

- Valid but leaves no time buffer
- Consider warning user
- Item appears and is immediately due

### Changing Project Defer Date

- Immediately affects all children's effective defer dates
- May cause tasks to suddenly become available or deferred
- UI should reflect changes instantly

### Timezone Changes

- Defer dates stored in UTC
- Effective defer time adjusts with user's timezone
- Travel may cause items to suddenly become available

### Repeating Items

- Defer date on repeat recalculates based on repeat rule
- Can repeat "from defer date" or "from completion"
- See `specs/repeat.md` for repeat date handling

### Completing Deferred Items

- Deferred items can still be completed directly
- Useful for items that were done early
- No special handling needed

## Notifications

Defer dates can trigger notifications:

| Trigger | Timing | Content |
|---------|--------|---------|
| Now available | At defer time | "Item is now available" |
| Tomorrow available | Evening before | "Item available tomorrow" |

See `specs/notifications.md` for full notification system.

## Best Practices

### When to Use Defer Dates

Use defer dates for:
- Items that can't be started until a certain date
- Hiding future work from current views
- Vacation-related tasks (defer until return)
- Periodic tasks that shouldn't clutter daily view
- Follow-ups that shouldn't be seen until later

### When NOT to Use Defer Dates

Avoid defer dates for:
- Scheduling when you'll work on something (use Planned dates)
- Creating artificial urgency
- Items you want to see but not act on yet (use tags)

### Recommended Workflow

1. Use defer dates to hide genuinely future work
2. Use planned dates to schedule work sessions
3. Use due dates only for real deadlines
4. Review deferred items periodically to ensure dates still make sense

## Related Specifications

- `specs/due-dates.md` - When items must be completed
- `specs/availability.md` - How defer dates affect item availability
- `specs/repeat.md` - How defer dates work with repeating items
- `specs/forecast.md` - Date-based view and planning
- `specs/notifications.md` - Alerting when defer dates arrive
