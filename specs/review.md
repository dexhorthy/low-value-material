# Review System Specification

The **Review** system supports GTD's Weekly Review practice by helping users periodically assess all projects. Each project has a review interval and the Review perspective guides users through projects due for review.

## Overview

Regular review is essential for GTD:
- Ensures projects are still relevant
- Identifies stalled projects needing next actions
- Maintains trust in the system
- Prevents items from falling through cracks

The Review perspective presents projects in order of when they need review.

## Data Model

### Project Review Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `review_interval` | Duration | 7 days | How often to review |
| `last_reviewed_at` | Timestamp | null | When last marked reviewed |
| `next_review_at` | DateTime | computed | When next review is due |

### Computed Properties

```
next_review_at = last_reviewed_at + review_interval
```

If `last_reviewed_at` is null:
```
next_review_at = created_at + review_interval
```

### Review State

| State | Condition |
|-------|-----------|
| `needs_review` | `next_review_at <= now` |
| `reviewed` | `next_review_at > now` |

## Review Interval

### Default Interval

| Setting | Type | Default |
|---------|------|---------|
| `default_review_interval` | Duration | 7 days (1 week) |

Configurable in preferences. Common values:
- 3 days
- 7 days (weekly) - **default**
- 14 days (bi-weekly)
- 30 days (monthly)

### Per-Project Interval

Each project can have its own review interval:

```
set_review_interval(
  project_id: UUID,
  interval: Duration
) → Project
```

### Bulk Update

```
set_review_interval_bulk(
  project_ids: UUID[],
  interval: Duration
) → Project[]
```

## Review Perspective

### Display Order

Projects are sorted by:
1. `next_review_at` (ascending - oldest first)
2. Projects past review date appear first
3. Then projects approaching review

### Visual Indicators

| Indicator | Meaning |
|-----------|---------|
| Maroon/red dot | Needs review |
| No indicator | Already reviewed |
| Stalled badge | Project has no remaining actions |

### Grouping

Projects can be grouped by:
- Review date (Today, This Week, Later)
- Folder
- Status (Active, On Hold)

### Filtering

Review perspective typically shows:
- Active projects
- On-hold projects (optionally)
- NOT completed or dropped projects

## Stalled Projects

A project is **stalled** when:
- Status is `active`
- Has zero remaining (active) tasks
- Type is NOT `single_actions`

### Stalled Detection

```
is_stalled(project) =
  project.status = active
  AND project.type != single_actions
  AND count(remaining_tasks(project)) = 0
```

### Stalled in Review

Stalled projects are highlighted in Review:
- Special visual indicator
- Grouped separately (optionally)
- Require adding next action or changing status

## Review Workflow

### 1. Enter Review Perspective

Open Review perspective to see projects needing review.

### 2. For Each Project

Assess and take action:

| Question | Actions |
|----------|---------|
| Still relevant? | Keep, complete, or drop |
| Correct status? | Change to active/on-hold |
| Has next action? | Add task if stalled |
| Actions accurate? | Add, remove, or update tasks |
| Proper priority? | Adjust flags, dates |

### 3. Mark Reviewed

```
mark_reviewed(project_id: UUID) → Project
```

- Sets `last_reviewed_at = now`
- Calculates new `next_review_at`
- Project moves out of "needs review" list

### 4. Continue

Move to next project until all reviewed.

## Operations

### Mark Reviewed

```
mark_reviewed(project_id: UUID) → Project
```

Effects:
- `last_reviewed_at = now`
- `next_review_at = now + review_interval`

### Mark Multiple Reviewed

```
mark_reviewed_bulk(project_ids: UUID[]) → Project[]
```

### Set Next Review Date

```
set_next_review(
  project_id: UUID,
  date: DateTime
) → Project
```

Override the calculated next review date.

### Skip Review

```
skip_review(project_id: UUID) → Project
```

Equivalent to `set_next_review(project_id, now + review_interval)` without updating `last_reviewed_at`.

### Reset Review

```
reset_review(project_id: UUID) → Project
```

- Clears `last_reviewed_at`
- `next_review_at` recalculated from creation date

## Queries

### Projects Needing Review

```
projects_needing_review() → Project[]
```

Returns projects where `next_review_at <= now`.

### Review Count

```
review_count() → Integer
```

Count of projects needing review (for badges).

### Stalled Projects

```
stalled_projects() → Project[]
```

Active projects with zero remaining tasks.

### Review Schedule

```
review_schedule(days: Integer = 7) → {
  date: Date,
  projects: Project[]
}[]
```

Projects grouped by their next review date.

### Last Reviewed

```
last_reviewed(project_id: UUID) → DateTime | null
```

## Sidebar Badge

Review perspective shows badge count:
- Number of projects needing review
- Updates as reviews are completed
- Updates as new projects become due

## Settings

### Review Preferences

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `default_review_interval` | Duration | 7 days | Default for new projects |
| `review_on_hold` | Boolean | true | Include on-hold projects |
| `show_stalled_separately` | Boolean | true | Group stalled projects |

### Per-Project Settings

Accessed via inspector:
- Review interval
- Next review date (override)

## Automation

### Scheduled Review Reminder

Can trigger reminders when:
- Projects are due for review
- Many projects need review
- Weekly review day arrives

### Review Report

```
review_summary() → {
  needs_review: Integer,
  reviewed_today: Integer,
  reviewed_this_week: Integer,
  stalled_count: Integer,
  average_interval: Duration
}
```

## Visual Design

### Review Perspective Layout

```
Review
├── Needs Review (3)
│   ├── 📋 Website Redesign      due Jan 1  ⚠️ stalled
│   ├── 📋 Q1 Planning           due Jan 2
│   └── 📋 Home Renovation       due Jan 3
├── This Week (5)
│   ├── 📋 Product Launch        due Jan 5
│   └── ...
└── Later (12)
    └── ...
```

### Review Controls

When project selected:
```
┌─────────────────────────────────────────┐
│  [Mark Reviewed]  Review every: [1 week ▼]  │
└─────────────────────────────────────────┘
```

### Stalled Indicator

```
📋 Website Redesign  ⚠️ No remaining actions
   └── Add an action to continue this project
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| ⌘⇧R | Mark Reviewed |
| ⌘↓ | Next project in review |
| ⌘↑ | Previous project in review |

## Edge Cases

### New Projects

- Start with `last_reviewed_at = null`
- `next_review_at = created_at + default_interval`
- Appear in review after interval passes

### Completed/Dropped Projects

- Do not appear in Review perspective
- Review dates preserved (in case restored)

### On-Hold Projects

- Configurable whether to include
- May need different review cadence
- Still benefit from periodic review

### Single Action Lists

- Never stalled (by definition)
- Still subject to review interval
- Review ensures list is still relevant

### Very Long Intervals

- Some projects reviewed monthly or quarterly
- Valid for stable, low-activity projects
- System supports any interval

### Zero Interval

- Effectively "always needs review"
- Not recommended
- Consider daily review custom perspective

## Integration with Other Features

### Focus Mode

When focused on folder/project:
- Review shows only focused projects
- Badge count reflects focus scope

### Custom Perspectives

Can create custom review-like perspectives:
- Filter by review status
- Group by folder
- Sort by review date

### Notifications

Can notify when:
- Weekly review day (e.g., Sunday)
- Projects overdue for review
- Stalled projects detected

## Best Practices

### Weekly Review Workflow

1. **Clear Inbox** - Process all captured items
2. **Review Projects** - Use Review perspective
3. **Check Stalled** - Add next actions
4. **Update Status** - Complete or drop finished projects
5. **Look Ahead** - Check Forecast for upcoming week

### Review Interval Guidelines

| Project Type | Suggested Interval |
|--------------|-------------------|
| Active, fast-moving | 3-7 days |
| Steady, ongoing | 7 days (weekly) |
| Background, stable | 14-30 days |
| Someday/maybe | 30+ days |

### Avoiding Review Fatigue

- Set realistic intervals
- Use shorter intervals only for active projects
- Mark reviewed even if no changes needed
- Batch similar projects together

## Related Specifications

- `specs/project.md` - Project data model
- `specs/perspectives.md` - Perspective framework
- `specs/availability.md` - Stalled project definition
- `specs/notifications.md` - Review reminders
