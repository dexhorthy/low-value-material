# Notifications

This specification defines the notification system for alerting users about tasks, due dates, deferrals, locations, and other time-sensitive events.

## Overview

The notification system provides alerts through multiple channels to keep users informed about task deadlines and availability changes. Notifications can be configured globally (applying to all items) or per-item (for custom alert timing).

## Notification Types

### Automatic Notifications

Automatic notifications are triggered based on item dates and global settings:

| Type | Trigger | Description |
|------|---------|-------------|
| `due` | Due date/time arrives | Item has reached its due date |
| `deferred` | Defer date/time arrives | Item has become available |
| `latest_start` | Due date minus estimated duration | Latest time to begin while finishing on time |
| `planned` | Planned date/time arrives | Scheduled work time (OmniFocus 4.7+) |
| `location` | User enters/exits geofence | Location-based tag triggered |

### Per-Item Notifications

Individual items can have custom notifications:

| Type | Description | Pro Feature |
|------|-------------|-------------|
| `before_due` | Fires N time before due date | No |
| `custom` | Fires at specific date/time | Yes |

## Data Model

### Notification Object

```
Notification {
  id: UUID
  task_id: UUID                    // Parent task/project
  kind: NotificationKind           // Type of notification

  // For absolute notifications
  absolute_fire_date: DateTime?    // Fixed date/time (custom only)

  // For relative notifications
  relative_fire_offset: Integer?   // Seconds from anchor (negative = before)
  anchor: NotificationAnchor?      // What the offset is relative to

  // Computed
  initial_fire_date: DateTime      // When notification will fire

  // Optional
  repeat_interval: Integer?        // Recurrence in seconds
}
```

### NotificationKind Enum

```
enum NotificationKind {
  Absolute,        // Fixed date/time (custom)
  DueRelative,     // Relative to due date
  DeferRelative,   // Relative to defer date
  PlannedRelative, // Relative to planned date
  LatestStart,     // Due minus estimated duration
  Location         // Geofence-based
}
```

### NotificationAnchor Enum

```
enum NotificationAnchor {
  DueDate,
  DeferDate,
  PlannedDate
}
```

## Before Due Notification Options

Predefined intervals for before-due notifications:

| Label | Offset (seconds) |
|-------|------------------|
| 1 minute before | -60 |
| 5 minutes before | -300 |
| 15 minutes before | -900 |
| 30 minutes before | -1800 |
| 1 hour before | -3600 |
| 2 hours before | -7200 |
| 1 day before | -86400 |
| 2 days before | -172800 |
| 3 days before | -259200 |
| 1 week before | -604800 |
| 2 weeks before | -1209600 |
| 4 weeks before | -2419200 |

Available options depend on how far in the future the due date is set.

## Global Notification Settings

### Automatic Notification Settings

```
NotificationSettings {
  // Enable/disable automatic notification types
  notify_on_due: Boolean           // Default: true
  notify_on_deferred: Boolean      // Default: false
  notify_on_latest_start: Boolean  // Default: false
  notify_on_planned: Boolean       // Default: false (4.7+)
  notify_on_location: Boolean      // Default: true (mobile only)

  // Platform-specific
  notify_on_this_device: Boolean   // Enable all date/time notifications
}
```

### Due Soon Settings

```
DueSoonSettings {
  due_soon_threshold: DueSoonThreshold  // Default: two_days
}

enum DueSoonThreshold {
  today,           // Items due today only
  twenty_four_hours, // Rest of today + next 24 hours
  two_days,        // Default
  three_days,
  four_days,
  five_days,
  one_week
}
```

Note: Most options use full calendar days. `twenty_four_hours` is a rolling window.

## Badge Configuration

### App Icon Badge

The app icon badge displays a count of items matching configured criteria.

```
BadgeSettings {
  include_overdue: Boolean    // Default: true
  include_due_soon: Boolean   // Default: true
  include_flagged: Boolean    // Default: false
}
```

Badge count formula:
```
badge_count =
  (include_overdue ? count(overdue_tasks) : 0) +
  (include_due_soon ? count(due_soon_tasks) : 0) +
  (include_flagged ? count(flagged_available_tasks) : 0)
```

### Sidebar Badges

Optional badges in Projects, Tags, and Review sidebars:

```
SidebarBadgeSettings {
  show_sidebar_badges: Boolean    // Default: false
  // When enabled, shows:
  // - Red badge: overdue item count
  // - Yellow badge: due soon item count
}
```

### iOS Badge Limitations

On iOS, badge counts cannot update in the background based on time passage alone. Updates occur only when:

1. **Push notifications** trigger sync from other devices
2. **Background App Refresh** runs based on iOS usage patterns

iOS may restrict background activity to preserve battery, so badge updates are not guaranteed to be immediate.

Badge settings are **not synced** between devices.

## Sound Settings

```
SoundSettings {
  play_sounds: Boolean           // Master toggle

  // Per-notification-type sounds
  due_sound: SoundOption         // Default: system_default
  deferred_sound: SoundOption    // Default: system_default
  location_sound: SoundOption    // Default: system_default
}

enum SoundOption {
  none,
  system_default,
  custom(sound_name: String)
}
```

## Notification Actions

Interactive notifications provide quick actions:

| Action | Description |
|--------|-------------|
| `complete` | Mark the item complete |
| `snooze` | Delay notification by 15 minutes (does not change dates) |

On iOS, notifications default to **Time Sensitive** alert behavior for immediate delivery.

## Today Widget / Notification Center

### Widget Item Types

Configurable items to display in Today widget:

```
TodayWidgetSettings {
  show_overdue: Boolean          // Default: true
  show_due_today: Boolean        // Default: true
  show_due_soon: Boolean         // Default: false
  show_deferred_today: Boolean   // Default: false
  show_flagged: Boolean          // Default: false
  show_inbox: Boolean            // Default: false

  // Pro feature
  custom_perspective_id: UUID?   // Show custom perspective instead
}
```

### Forecast Widget

Displays a calendar row showing items due per day, with optional item list.

### Widget Behavior

- Items appear in same order as their source perspective
- Checking off items updates the main app via sync
- Widget shows most relevant item by default (based on settings)

## Apple Watch

### Complications

Watch face complications display item counts and alerts:

```
WatchSettings {
  complication_source: ComplicationSource
}

enum ComplicationSource {
  overdue,
  due_today,
  due_soon,
  flagged,
  inbox,
  custom_perspective(id: UUID)   // Pro feature
}
```

### Watch App Notifications

- Notifications mirror iPhone settings
- Interactive alerts support Complete and Snooze actions
- Watch app syncs full database independently

## Location Notifications

Location-based notifications trigger when entering/exiting a geofence:

```
LocationNotification {
  task_id: UUID
  tag_id: UUID                   // Tag with location data
  trigger: LocationTrigger
}

enum LocationTrigger {
  on_arrival,    // Enter geofence
  on_departure   // Exit geofence
}
```

Available on iPhone, iPad, and Apple Vision Pro only. macOS can edit location data but does not trigger location notifications.

## Calendar Alarms Integration

Publish due items as calendar alarms:

```
CalendarAlarmSettings {
  publish_alarms: Boolean        // Default: false
  lookahead_days: Integer        // Default: 14, max: 14
}
```

Limitations:
- Only publishes items due within 14 days
- Prevents inaccurate predictions for distant future
- Calendar must be configured to receive alarms

## Operations

### Add Notification

```
add_notification(task_id, notification_type, params) -> Notification

// Examples:
// Absolute (Pro)
add_notification(task_id, "custom", { fire_date: "2024-01-15T09:00:00" })

// Before due
add_notification(task_id, "before_due", { offset_seconds: -86400 }) // 1 day before

// Via automation (seconds relative to due)
task.addNotification(-3600)  // 1 hour before due
task.addNotification(new Date("2024-01-15T09:00:00"))  // Absolute
```

### Remove Notification

```
remove_notification(notification_id)

// Or via automation
task.removeNotification(notification)
```

### Clear All Notifications

```
clear_notifications(task_id)  // Remove all custom notifications from task
```

## Notification Lifecycle

### Automatic Notification Updates

When item dates change:

| Notification Type | Behavior |
|-------------------|----------|
| `due` | Updates to new due date |
| `deferred` | Updates to new defer date |
| `latest_start` | Recalculates from new due date |
| `planned` | Updates to new planned date |
| `before_due` | Recalculates from new due date |
| `custom` | **No change** (fixed date/time) |

### Repeating Items

When a repeating item completes and creates a new instance:

- Automatic notifications (due, deferred, latest_start): **Regenerated** for new dates
- Before-due notifications: **Regenerated** relative to new due date
- Custom notifications: **Removed** (not carried to new instance)

### Removing Dates

If a due date is removed from an item:
- Due notification: Removed
- Latest start notification: Removed
- Before-due notifications: Removed

## Queries

### Items Needing Notification

```sql
-- Items with due dates that haven't been notified
SELECT * FROM tasks
WHERE due_date IS NOT NULL
  AND due_date <= NOW()
  AND due_notified_at IS NULL
  AND completion_date IS NULL
```

### Upcoming Notifications

```sql
-- All pending notifications in next 24 hours
SELECT n.*, t.title FROM notifications n
JOIN tasks t ON n.task_id = t.id
WHERE n.initial_fire_date BETWEEN NOW() AND NOW() + INTERVAL '24 hours'
  AND t.completion_date IS NULL
ORDER BY n.initial_fire_date
```

## Visual Indicators

### Due State Colors

| State | Title Color | Status Circle |
|-------|-------------|---------------|
| Normal | Default | Gray |
| Due Soon | Amber/Yellow | Amber |
| Overdue | Red | Red |

Color styling can be toggled in settings:
```
StyleSettings {
  color_due_soon_titles: Boolean   // Default: true
  color_overdue_titles: Boolean    // Default: true
}
```

## Platform Differences

| Feature | macOS | iOS | Apple Watch | Web |
|---------|-------|-----|-------------|-----|
| Date notifications | Yes | Yes | Yes | No |
| Location notifications | No | Yes | No | No |
| Badge updates | Real-time | Sync-triggered | Via iPhone | N/A |
| Calendar alarms | Yes | Yes | No | No |
| Today widget | Yes | Yes | Complication | N/A |
| Interactive actions | Yes | Yes | Yes | No |

## Best Practices

1. **Use sparingly**: Too many notifications cause alert fatigue
2. **Due notifications**: Enable only for hard deadlines
3. **Deferred notifications**: Useful for time-sensitive availability
4. **Before-due**: Set based on task complexity (simple: day before, complex: week before)
5. **Custom notifications**: Reserve for specific events that don't align with due dates
6. **Badge configuration**: Include only actionable categories to maintain relevance
7. **Location notifications**: Most useful for errands and context-specific tasks
