# Forecast View Specification

The **Forecast** perspective provides a date-centric view of upcoming work. It displays items by their due dates, defer dates, and planned dates, optionally alongside calendar events.

## Overview

Forecast answers: "What needs attention today and in the coming days?"

Key features:
- Date-based timeline ("piano keys")
- Past/overdue section
- Today with Forecast Tag integration
- Calendar event integration
- Defer date visibility
- Planned date support (4.7+)

## Data Model

### Forecast Configuration

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `show_deferred_items` | Boolean | true | Show items becoming available |
| `show_calendar_events` | Boolean | true | Show external calendar events |
| `show_planned_items` | Boolean | true | Show items by planned date |
| `forecast_tag_id` | UUID | null | Tag for Today section |
| `badge_includes_deferred` | Boolean | false | Include deferred in badge counts |
| `calendars` | UUID[] | [] | Which calendars to display |
| `days_to_show` | Integer | 14 | Days visible in timeline |

### ForecastDay Object

Each day in the forecast has:

| Field | Type | Description |
|-------|------|-------------|
| `date` | Date | The calendar date |
| `status` | ForecastStatus | Urgency indicator |
| `badge_count` | Integer | Number of items |
| `due_items` | Task[] | Items due this day |
| `deferred_items` | Task[] | Items becoming available |
| `planned_items` | Task[] | Items planned for this day |
| `calendar_events` | Event[] | External calendar events |
| `tagged_items` | Task[] | Items with forecast tag (today only) |

### ForecastStatus Enum

| Status | Meaning | Visual |
|--------|---------|--------|
| `none` | No items | No badge |
| `available` | Items but none urgent | Normal badge |
| `due_soon` | At least one due soon | Amber badge |
| `overdue` | At least one overdue | Red badge |

## Timeline Structure

### Piano Keys

The timeline displays as a row of date tiles:

```
[Past] [Today] [Tomorrow] [+2] [+3] [+4] ... [Future]
  2      5        3        1    0    2         8
```

Each tile shows:
- Date label (or "Past"/"Future")
- Badge with item count
- Color indicating urgency

### Date Range

| Section | Contains |
|---------|----------|
| Past | All overdue items (before today) |
| Today | Due today + Forecast tag items |
| Tomorrow through +N | Due on each day |
| Future | Due after visible range |

### Visible Days

Number of days shown depends on:
- Screen width (responsive)
- User preference
- Default: 14 days typically

## Sections Within a Day

When viewing a specific day, items are organized:

### Section Order

1. **Calendar Events** (if enabled)
2. **Due** - Items due on this date
3. **Deferred** - Items becoming available (if enabled)
4. **Tagged** - Forecast tag items (Today only)
5. **Flagged** - Flagged items (optional)
6. **Planned** - Items with planned date (if enabled)

### Section Visibility

| Section | When Shown |
|---------|------------|
| Calendar Events | `show_calendar_events = true` |
| Due | Always (if items exist) |
| Deferred | `show_deferred_items = true` |
| Tagged | Today only, if `forecast_tag_id` set |
| Planned | `show_planned_items = true` |

## Forecast Tag

A designated tag whose items appear in Today regardless of due date.

### Configuration

```
set_forecast_tag(tag_id: UUID) → void
get_forecast_tag() → Tag | null
clear_forecast_tag() → void
```

### Behavior

- Items with forecast tag appear in Today section
- Shown even if not due today
- Provides "do today" list without fake due dates
- Common tag names: "Today", "Next", "Focus"

### Display

```
Today
├── Calendar Events
│   └── 9:00 AM - Team Meeting
├── Due
│   └── ☐ Submit report (due 5 PM)
├── Tagged (Today)
│   └── ☐ Review pull requests
│   └── ☐ Call dentist
└── Deferred
    └── ☐ Weekly planning (available today)
```

## Calendar Integration

### Supported Calendars

Integration with system calendar APIs:
- iCloud Calendar
- Google Calendar
- Exchange/Outlook
- CalDAV
- Local calendars

### Calendar Selection

```
set_forecast_calendars(calendar_ids: UUID[]) → void
get_forecast_calendars() → Calendar[]
```

### Event Display

Calendar events show:
- Time (or "All Day")
- Title
- Calendar color indicator
- Duration

### Drag to Calendar

Items can be dragged from Forecast to calendar:
- Creates calendar event with link back to task
- Sets planned time for the task

## Badge Counts

### Calculation

```
badge_count(date) =
  count of available items due on date
  + (if badge_includes_deferred: deferred items count)
```

### Color Logic

```
IF any item on date is overdue:
  badge_color = red
ELSE IF any item is due_soon:
  badge_color = amber
ELSE:
  badge_color = normal
```

### Past Badge

Past badge count = total overdue items across all past dates.

### Future Badge

Future badge count = total items due after visible range.

## Date Modification

### Drag and Drop

Items can be dragged to different dates:

| Modifier | Action |
|----------|--------|
| No modifier | Set due date |
| ⌘ (Cmd) | Set due date |
| ⌥ (Option) | Set defer date |
| ⇧ (Shift) | Set planned date |

### Quick Reschedule

```
reschedule_to_tomorrow(item_id: UUID) → Item
reschedule_to_date(item_id: UUID, date: Date) → Item
```

For repeating items in Deferred section:
- Reschedule affects defer date (not due)

## Queries

### Items for Date

```
forecast_items(date: Date) → {
  due: Task[],
  deferred: Task[],
  planned: Task[],
  tagged: Task[],
  events: CalendarEvent[]
}
```

### Date Range

```
forecast_range(start: Date, end: Date) → ForecastDay[]
```

### Overdue Items

```
overdue_items() → Task[]
```

All items with due date < today.

### Today Items

```
today_items() → Task[]
```

Items due today + forecast tagged items.

## Operations

### View Date

```
view_forecast_date(date: Date) → void
```

Navigate to specific date in Forecast.

### Mark Today

```
mark_for_today(item_id: UUID) → Item
```

Adds forecast tag to item (appears in Today).

### Remove from Today

```
remove_from_today(item_id: UUID) → Item
```

Removes forecast tag from item.

## Visual Design

### Timeline (Piano Keys)

```
┌─────┬───────┬──────────┬─────┬─────┬─────┬────────┐
│Past │ Today │ Tomorrow │ Wed │ Thu │ Fri │ Future │
│ 2   │  5    │    3     │  1  │  0  │  2  │   8    │
│ 🔴  │  🟡   │          │     │     │     │        │
└─────┴───────┴──────────┴─────┴─────┴─────┴────────┘
```

### Day View

```
Wednesday, January 8

📅 Calendar Events
   9:00 AM  Team standup
   2:00 PM  Client call (1h)

📌 Due
   ☐ Finish proposal        due 5:00 PM
   ☐ Send invoice           due end of day

⏰ Deferred (becoming available)
   ☐ Follow up on RFP

📋 Planned
   ☐ Code review session
```

## Interaction Patterns

### Tap/Click Date

- Shows full list of items for that date
- Scrolls outline to that date section

### Swipe Item

- Left swipe: Quick actions (complete, reschedule)
- Right swipe: Flag/unflag

### Long Press Date

- Shows date picker for quick navigation
- Jump to specific date

## Settings

### Forecast Preferences

| Setting | Options |
|---------|---------|
| Show deferred items | On/Off |
| Show calendar events | On/Off |
| Show planned items | On/Off |
| Forecast tag | Select tag |
| Badge includes deferred | On/Off |
| Calendars to show | Multi-select |

## Edge Cases

### No Items

- Date tile shows no badge (or "0")
- Day view shows empty state message

### All-Day vs Timed

- All-day items: No time shown
- Timed items: Show time in list

### Timezone Travel

- Dates calculated in local timezone
- Items may shift when timezone changes

### Repeating Items

- Show on each occurrence date
- Completing creates next occurrence

### Far Future Items

- Grouped in "Future" section
- Expand to see full list

## Performance

### Optimization

- Calculate visible date range only
- Lazy load extended range
- Cache badge counts

### Refresh Triggers

- Time passes midnight
- Item dates change
- Items complete
- Forecast tag changes

## Best Practices

### Effective Forecast Use

1. Use due dates sparingly (real deadlines only)
2. Use Forecast tag for "do today" items
3. Review Past/overdue section daily
4. Plan using calendar integration

### Common Patterns

| Goal | Approach |
|------|----------|
| Daily planning | Review Today each morning |
| Catch overdue | Check Past section daily |
| Time blocking | Drag items to calendar |
| Flexible today list | Use Forecast tag |

## Related Specifications

- `specs/due-dates.md` - Due date behavior
- `specs/defer-dates.md` - Defer date behavior
- `specs/tag.md` - Forecast tag configuration
- `specs/perspectives.md` - Perspective framework
- `specs/notifications.md` - Due date notifications
