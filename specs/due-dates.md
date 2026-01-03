# Due Dates Specification

A **Due Date** represents when a task or project must be completed. Due dates are hard deadlines with consequences if missed.

## Overview

Due dates should be used sparingly—only for items with genuine deadlines. Overusing due dates leads to a constantly "overdue" system that loses meaning. For soft targets or preferred completion times, see `specs/defer-dates.md` (defer until) or the planned dates feature.

## Data Model

### Due Date Fields

| Field | Type | Description |
|-------|------|-------------|
| `due_date` | DateTime | null | When item must be completed |
| `due_time_specified` | Boolean | Whether a specific time was set |

### DateTime Storage

Due dates are stored as:
- UTC timestamp internally
- With timezone information for display
- Either with specific time OR as all-day

### All-Day vs. Specific Time

| Type | Behavior |
|------|----------|
| All-day | No time component; uses default time for calculations |
| Specific time | Exact time when item is due |

When user enters a date without time:
- `due_time_specified` = false
- Effective time uses configurable default (see Settings)

## Settings

### Due Soon Threshold

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `due_soon_hours` | Integer | 48 | Hours before due date when item becomes "due soon" |

Configurable options typically include:
- 24 hours (1 day)
- 48 hours (2 days) - **default**
- 72 hours (3 days)
- 1 week
- Custom value

### Default Due Time

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `default_due_time` | Time | 17:00 | Time used when no time specified |

Common configurations:
- 17:00 (5 PM) - end of business day **default**
- 23:59 - end of day
- 09:00 - start of day

## Due States

Items with due dates can be in one of these states:

### Normal

```
due_date > now + due_soon_threshold
```

- No special visual treatment
- Appears in Forecast on its due date

### Due Soon

```
now < due_date <= now + due_soon_threshold
```

- Visual indicator: amber/yellow coloring
- Appears in Forecast's "Due Soon" section
- May trigger notifications

### Overdue

```
due_date < now
```

- Visual indicator: red coloring
- Prominently displayed in Forecast
- Persists until completed, rescheduled, or dropped

### State Diagram

```
                    ┌─────────────┐
                    │   Normal    │
                    │  (future)   │
                    └──────┬──────┘
                           │
                           │ threshold reached
                           ▼
                    ┌─────────────┐
                    │  Due Soon   │
                    │  (amber)    │
                    └──────┬──────┘
                           │
                           │ due date passed
                           ▼
                    ┌─────────────┐
                    │   Overdue   │
                    │   (red)     │
                    └─────────────┘
```

## Effective Due Date

Items inherit due dates from their containers. The **effective due date** is the earliest due date in the item's hierarchy.

### Calculation

```
effective_due_date(item) =
  min(
    item.due_date,
    parent_task.effective_due_date (if exists),
    project.due_date (if exists)
  )
  where null values are ignored
```

### Examples

**Task with project due date:**
```
📋 Project A (due: Jan 15)
  □ Task 1 (due: null)     → effective due: Jan 15
  □ Task 2 (due: Jan 10)   → effective due: Jan 10 (earlier)
  □ Task 3 (due: Jan 20)   → effective due: Jan 15 (project due first)
```

**Nested action groups:**
```
📋 Project (due: Jan 30)
  □ Phase 1 (due: Jan 15)
    □ Subtask A (due: null)  → effective due: Jan 15
    □ Subtask B (due: Jan 10) → effective due: Jan 10
  □ Phase 2 (due: null)
    □ Subtask C (due: null)  → effective due: Jan 30
```

### Inheritance Properties

| Property | Type | Description |
|----------|------|-------------|
| `due_date` | DateTime | null | Locally set due date |
| `effective_due_date` | DateTime | null | Computed due date including inheritance |
| `has_local_due_date` | Boolean | Whether item has its own due date (not inherited) |

## Due Dates on Different Items

### Tasks

- Can have direct due date
- Inherit from parent task or project
- Due state affects visual treatment

### Projects

- Can have due date for overall completion
- All tasks within implicitly share this as maximum due date
- Project due date doesn't override earlier task due dates

### Action Groups (Parent Tasks)

- Can have due date
- Children inherit if they have no earlier date
- Action group is due when any child needs to be done

### Inbox Items

- Can have due date even before processing
- Due date preserved when moved to project
- Effective due date only considers local date (no inheritance)

## Operations

### Set Due Date

```
set_due_date(
  item_id: UUID,
  due_date: DateTime | null,
  time_specified: Boolean = false
) → Item
```

- Pass null to clear due date
- `time_specified` indicates whether time is meaningful

### Reschedule

```
reschedule_due(
  item_id: UUID,
  new_due_date: DateTime
) → Item
```

- Changes due date without other side effects
- Common action for overdue items

### Defer to Due

```
defer_to_due(item_id: UUID) → Item
```

- Sets defer date equal to due date minus buffer
- Makes item appear at last responsible moment

## Queries

### Due On Date

```
due_on(date: Date) → Item[]
```

Returns items with effective due date on specified date.

### Due Before

```
due_before(date: DateTime, include_overdue: Boolean = true) → Item[]
```

Returns items due before specified date.

### Overdue Items

```
overdue() → Item[]
```

Returns all items past their effective due date.

### Due Soon Items

```
due_soon() → Item[]
```

Returns items within due soon threshold.

### Due in Range

```
due_in_range(start: DateTime, end: DateTime) → Item[]
```

Returns items with effective due date in range.

## Forecast Integration

Due dates drive the Forecast perspective:

### Forecast View Structure

```
Past (Overdue)
  - Overdue items grouped by date

Today
  - Items due today
  - Items with "today" tag (configurable)

Tomorrow
  - Items due tomorrow

[Future dates...]
  - Items due on each date
```

### Forecast Tag

One tag can be designated as the "Forecast Tag":
- Items with this tag appear in Forecast even without due dates
- Typically used for "Today" or "Scheduled" items
- See `specs/tag.md` for configuration

## Notifications

Due dates can trigger notifications:

| Trigger | Timing | Content |
|---------|--------|---------|
| Due soon | At threshold | "Item due in X days" |
| Due today | Morning | "Item due today" |
| Overdue | At due time | "Item is now overdue" |

See `specs/notifications.md` for full notification system.

## Edge Cases

### No Due Date

- Item has no deadline
- `effective_due_date` may still exist from inheritance
- Item doesn't appear in date-based Forecast sections

### Same Due Date as Parent

- No special handling needed
- Effective due date calculation is idempotent

### Due Date in Past on Creation

- Allowed (for capturing already-overdue items)
- Immediately shows as overdue
- Consider warning user

### Changing Project Due Date

- Immediately affects all children's effective due dates
- May cause tasks to become due soon or overdue
- UI should reflect changes instantly

### Timezone Changes

- Due dates stored in UTC
- Effective due time adjusts with user's timezone
- Travel may cause items to suddenly be due soon/overdue

### Repeating Items

- Due date on repeat recalculates based on repeat rule
- See `specs/repeat.md` for repeat date handling

## Best Practices

### When to Use Due Dates

Use due dates for:
- External deadlines (meetings, submissions)
- Time-sensitive commitments
- Dependencies with real consequences

### When NOT to Use Due Dates

Avoid due dates for:
- Aspirational completion targets
- Self-imposed "I'd like to" dates
- Organizing daily work (use defer or planned dates instead)

### Recommended Workflow

1. Reserve due dates for hard deadlines
2. Use defer dates for "don't show until" scenarios
3. Use planned dates for scheduling work sessions
4. Use the Forecast tag for "do today" without false urgency

## Related Specifications

- `specs/defer-dates.md` - When items become available
- `specs/repeat.md` - How due dates work with repeating items
- `specs/forecast.md` - Date-based view and planning
- `specs/notifications.md` - Alerting on due dates
- `specs/availability.md` - How due dates affect item availability
