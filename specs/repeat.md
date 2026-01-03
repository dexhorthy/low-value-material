# Repeat Patterns Specification

**Repeat patterns** allow tasks and projects to recur on a schedule. When a repeating item is completed, a new instance is created with updated dates.

## Overview

Repeating tasks are essential for:
- Regular maintenance (weekly reviews, monthly reports)
- Habits and routines (daily exercise, medication)
- Recurring obligations (rent, subscriptions)
- Periodic reminders (check-ins, follow-ups)

OmniFocus supports three fundamental approaches to repetition, each suited to different use cases.

## Data Model

### Repeat Rule Fields

| Field | Type | Description |
|-------|------|-------------|
| `repeat_rule` | RepeatRule | null | The recurrence pattern |
| `repeat_schedule_type` | Enum | How recurrence is calculated |
| `repeat_anchor_date` | Enum | Which date to use for calculations |
| `repeat_end_date` | DateTime | null | Stop repeating after this date |
| `repeat_end_count` | Integer | null | Stop after this many occurrences |
| `catch_up_automatically` | Boolean | Skip missed occurrences (regular only) |

### RepeatRule Object

```
RepeatRule {
  rule_string: String    // ICS-format recurrence string
  interval: Integer      // How many units between occurrences
  unit: TimeUnit         // minute, hour, day, week, month, year
  weekdays: Weekday[]    // Optional: specific days for weekly
  day_of_month: Integer  // Optional: specific day for monthly
}
```

## Schedule Types

### Regularly ("Repeat Every")

Fixed schedule regardless of when completed.

```
schedule_type = regularly
```

| Behavior | Description |
|----------|-------------|
| Next date | Calculated from original date + interval |
| Missed occurrences | Can pile up OR catch up automatically |
| Best for | Appointments, meetings, fixed deadlines |

**Example:** "Pay rent" due on the 1st of every month. Whether you pay on the 1st or the 5th, next occurrence is still the 1st of next month.

### From Completion - Due Again

Next due date calculated from completion date.

```
schedule_type = from_completion
anchor_date = due_date
```

| Behavior | Description |
|----------|-------------|
| Next date | Completion date + interval |
| Missed occurrences | Not possible (always relative to completion) |
| Best for | Items with natural cooldown periods |

**Example:** "Water cactus" due every 10 days. If you water it today, it's due again in 10 days—not before.

### From Completion - Defer Again

Next defer date calculated from completion date.

```
schedule_type = from_completion
anchor_date = defer_date
```

| Behavior | Description |
|----------|-------------|
| Next date | Completion date + interval (applied to defer) |
| Preserves | Original defer-to-due gap |
| Best for | Items that shouldn't reappear until interval passes |

**Example:** "Dentist checkup" deferred 6 months from completion. Won't clutter your view until 6 months after your last visit.

### Comparison Table

| Repeat Type | Next Date Based On | Skips When Late | Use Case |
|-------------|-------------------|-----------------|----------|
| Regularly | Original schedule | Optional (catch up) | Fixed schedules |
| Due Again | Completion + interval | N/A | Minimum gap before due again |
| Defer Again | Completion + interval | N/A | Minimum gap before available again |

## Anchor Date

Specifies which date property to use for calculations:

| Value | Applies Interval To |
|-------|-------------------|
| `defer_date` | Defer/start date |
| `due_date` | Due/deadline date |
| `planned_date` | Planned date (4.7+) |

### Date Preservation

When repeating, the relationship between dates is preserved:

```
Original:
  defer: Jan 1
  due: Jan 5
  (4-day gap)

After completion on Jan 3 with "Due Again 1 week":
  defer: Jan 6 (maintains 4-day gap)
  due: Jan 10 (7 days after completion)
```

## Repeat Intervals

### Time Units

| Unit | Examples |
|------|----------|
| `minute` | Every 30 minutes (rare) |
| `hour` | Every 2 hours |
| `day` | Daily, every 3 days |
| `week` | Weekly, every 2 weeks |
| `month` | Monthly, quarterly |
| `year` | Annually |

### Weekly with Specific Days

For weekly repeats, specific weekdays can be selected:

```
Repeat every 1 week on Monday, Wednesday, Friday
```

| Field | Value |
|-------|-------|
| `unit` | week |
| `interval` | 1 |
| `weekdays` | [monday, wednesday, friday] |

### Monthly Options

Monthly repeats can anchor to:
- Day of month: "1st of every month"
- Weekday of month: "First Monday of every month"
- Last day: "Last day of every month"

## Repeat Limits

### End After Date

```
repeat_end_date = 2025-12-31
```

- Repeat stops after specified date
- No new occurrence created after end date
- Useful for: temporary projects, contracts with end dates

### End After Count

```
repeat_end_count = 12
```

- Repeat stops after N occurrences
- Counter decrements with each completion
- Useful for: series with known number of repetitions

### No Limit (Default)

```
repeat_end_date = null
repeat_end_count = null
```

- Repeats indefinitely
- Most common configuration

## Catch Up Automatically

For `regularly` scheduled items only:

| Setting | Behavior When Overdue |
|---------|----------------------|
| `true` | Skips to next future occurrence |
| `false` | Creates each missed occurrence (pile up) |

**Example with catch_up = true:**
```
"Weekly review" due every Saturday
Current date: Monday Jan 20
Item overdue since: Saturday Jan 11 (missed 2 Saturdays)

On completion: Next due = Saturday Jan 25 (next future Saturday)
```

**Example with catch_up = false:**
```
Same scenario...
On completion: Next due = Saturday Jan 18 (immediate next)
Then still overdue, complete again for Jan 25
```

## Completion Behavior

When a repeating item is completed:

### 1. Original Item

```
original.status = completed
original.completed_at = now
```

### 2. New Instance Created

```
new_instance = clone(original)
new_instance.id = new UUID
new_instance.status = active
new_instance.completed_at = null
new_instance.defer_date = calculated_next_defer
new_instance.due_date = calculated_next_due
new_instance.planned_date = calculated_next_planned
```

### 3. Properties Carried Forward

| Property | Carried Forward |
|----------|-----------------|
| Title | Yes |
| Note | Yes |
| Tags | Yes |
| Flagged | Yes |
| Estimated duration | Yes |
| Project assignment | Yes |
| Repeat rule | Yes |
| Repeat count | Decremented if set |

### 4. Properties NOT Carried

| Property | Behavior |
|----------|----------|
| Completed status | Reset to active |
| Completion date | Reset to null |
| Task ID | New UUID |

## Operations

### Set Repeat Rule

```
set_repeat(
  item_id: UUID,
  schedule_type: ScheduleType,
  interval: Integer,
  unit: TimeUnit,
  anchor_date: AnchorDateKey = due_date,
  weekdays?: Weekday[],
  end_date?: DateTime,
  end_count?: Integer,
  catch_up?: Boolean
) → Item
```

### Clear Repeat

```
clear_repeat(item_id: UUID) → Item
```

Removes repeat rule. Item will not recur after completion.

### Skip Occurrence

```
skip_occurrence(item_id: UUID) → Item
```

- Marks current as completed
- Creates next occurrence
- Without actually doing the task

### Change Next Occurrence

```
change_next_occurrence(
  item_id: UUID,
  new_defer?: DateTime,
  new_due?: DateTime
) → Item
```

- Modifies dates for current instance only
- Does not affect repeat rule
- Next occurrence uses original pattern

## Queries

### Repeating Items

```
repeating_items() → Item[]
```

Returns all items with active repeat rules.

### Next Occurrence

```
next_occurrence(item_id: UUID) → {
  defer_date: DateTime | null,
  due_date: DateTime | null,
  planned_date: DateTime | null
}
```

Preview of what dates the next instance will have.

### Occurrences in Range

```
occurrences_in_range(
  item_id: UUID,
  start: DateTime,
  end: DateTime
) → OccurrencePreview[]
```

Projects future occurrences of a repeating item.

## Repeating Projects

Projects can repeat, creating a new project with:
- Same tasks (reset to active)
- Updated defer/due dates
- Same folder assignment
- Same tags

### Project Repeat Behavior

```
📋 Monthly Report (repeat every 1 month)
  □ Gather data
  □ Analyze trends
  □ Write summary
  □ Send to team
```

On project completion:
1. Original project marked complete
2. New project created with fresh tasks
3. All tasks are active again

## Edge Cases

### No Defer or Due Date

If repeating item has no dates:
- `from_completion` uses completion date as base
- `regularly` has nothing to increment (warn user)

### Defer Without Due

```
defer: Jan 1, due: null
Repeat every 1 week anchored to defer
```

- Only defer date recalculates
- Due remains null

### Due Without Defer

```
defer: null, due: Jan 5
Repeat every 1 week anchored to due
```

- Only due date recalculates
- Defer remains null

### Completion Before Defer Date

If item completed before its defer date:
- Next occurrence still calculated normally
- May result in next defer being in past (immediately available)

### Repeat End Reached

When `repeat_end_date` passed or `repeat_end_count` = 0:
- Item completes normally
- No new instance created
- Repeat rule effectively cleared

### Dropping Repeating Item

- Item is dropped (not completed)
- NO new instance created
- Repeat rule preserved if item is restored

### Subtasks of Repeating Tasks

- Subtasks are cloned with parent
- Subtask completion status is reset
- Subtasks do not have independent repeat rules

## Notifications

Repeating items can trigger notifications:
- Standard due/defer notifications apply
- Each occurrence is independent
- See `specs/notifications.md`

## Visual Indicators

| Indicator | Meaning |
|-----------|---------|
| Repeat icon | Item has repeat rule |
| "Repeats every X" | Hover/detail text |
| End date shown | When repeat limit set |

## Best Practices

### Use Regularly For

- Fixed calendar events
- Regular meetings
- Bill due dates
- Scheduled maintenance

### Use Due Again For

- Items with minimum gap between completions
- Health-related (medication, checkups)
- Items where early completion shouldn't accelerate next due

### Use Defer Again For

- Items you don't want to see until interval passes
- Periodic reviews
- Follow-ups after waiting period

### Avoid Over-Repeating

- Not every routine needs a repeat
- Consider if task list adds value
- Some things are better as habits than tracked tasks

## Related Specifications

- `specs/due-dates.md` - Due date behavior
- `specs/defer-dates.md` - Defer date behavior
- `specs/availability.md` - How repeat affects availability
- `specs/notifications.md` - Repeat notification triggers
