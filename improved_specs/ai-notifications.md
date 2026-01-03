# AI-Enhanced Notifications & Smart Alerts

This specification defines the intelligent notification system for alerting users about tasks, deadlines, and time-sensitive events. The system uses machine learning to optimize timing, reduce alert fatigue, and deliver context-aware notifications that respect user focus and productivity.

## Overview

The AI notification system moves beyond simple time-triggered alerts to deliver the right information at the right time in the right context. Key capabilities:

- **Smart Timing**: ML-optimized delivery based on user engagement patterns
- **Context Awareness**: Notifications that understand current activity and focus state
- **Intelligent Bundling**: LLM-powered summarization of related alerts
- **Predictive Reminders**: Proactive alerts before you need them
- **Fatigue Prevention**: Dynamic throttling to maintain notification relevance
- **Cross-Platform Intelligence**: Unified notification strategy across all devices

## Core Notification Types

### Time-Based Notifications

| Type | Trigger | AI Enhancement |
|------|---------|----------------|
| `due` | Due date/time arrives | Smart timing adjustment |
| `deferred` | Defer date/time arrives | Availability-aware delivery |
| `latest_start` | Due minus estimated duration | Adjusted for actual work patterns |
| `planned` | Planned date/time arrives | Calendar-aware timing |
| `predictive` | AI predicts you'll need reminder | Proactive surfacing |

### Context-Based Notifications

| Type | Trigger | Description |
|------|---------|-------------|
| `location` | Enter/exit geofence | Location-aware task surfacing |
| `calendar_gap` | Open time detected | "You have 30 minutes, here are quick tasks" |
| `momentum` | Completing related tasks | "While you're at it..." suggestions |
| `stale_warning` | Task approaching zombie status | "This hasn't been touched in a while" |

### AI-Generated Notifications

| Type | Trigger | Description |
|------|---------|-------------|
| `daily_briefing` | Morning routine detected | Summarized day ahead |
| `evening_review` | End-of-day pattern | Incomplete task summary |
| `deadline_risk` | Predicted deadline miss | Early warning system |
| `workload_alert` | Capacity threshold exceeded | "Tomorrow looks heavy" |

## Smart Timing Engine

### User Pattern Learning

The system learns individual notification engagement patterns:

```
UserNotificationProfile {
  user_id: UUID

  // Engagement windows (when user typically acts on notifications)
  high_engagement_windows: TimeWindow[]
  low_engagement_windows: TimeWindow[]

  // Response patterns by notification type
  response_latency_by_type: Map<NotificationType, Duration>

  // Device preferences
  preferred_device_by_context: Map<Context, DeviceType>

  // Interaction patterns
  typical_first_check_time: Time
  typical_last_check_time: Time
  average_response_time: Duration

  // Focus patterns
  deep_work_periods: TimeWindow[]
  meeting_heavy_days: DayOfWeek[]
}
```

### Timing Optimization

Instead of firing at exact due times, notifications are optimized:

```
optimize_notification_timing(
  base_time: DateTime,
  notification_type: NotificationType,
  urgency: Urgency,
  user_profile: UserNotificationProfile
) -> OptimizedTiming {
  scheduled_time: DateTime,      // When to actually send
  delivery_window: TimeWindow,   // Acceptable range
  reason: String                 // "Delayed 15 min to align with your usual check-in"
}
```

**Timing Rules:**

| Urgency | Optimization |
|---------|--------------|
| Critical | Deliver immediately regardless of patterns |
| High | Deliver within 15 minutes, prefer engagement windows |
| Normal | Shift to nearest engagement window (up to 2 hours) |
| Low | Bundle for next briefing or batch delivery |

### Do Not Disturb Intelligence

Beyond system DND, the AI detects implicit focus states:

- **Calendar analysis**: Meeting in progress → defer non-urgent
- **Activity detection**: Deep work patterns → batch for later
- **Time of day**: Outside typical active hours → hold until morning
- **Consecutive completions**: In flow state → don't interrupt

## Intelligent Bundling & Summarization

### Notification Bundling

Instead of bombarding users with individual alerts, related notifications are bundled:

```
NotificationBundle {
  id: UUID
  bundle_type: BundleType
  notifications: Notification[]
  summary: String                // LLM-generated summary
  priority: Priority             // Highest priority in bundle
  created_at: DateTime

  // Unbundling
  expand_action: Action          // View individual notifications
  primary_action: Action         // Act on most important
}

enum BundleType {
  same_project,          // Multiple notifications from one project
  same_tag,              // Tasks sharing context tag
  same_timeframe,        // All due this afternoon
  deadline_cluster,      // Multiple deadlines approaching
  low_priority_digest    // Daily roundup of low-priority items
}
```

### LLM Summarization

Bundles receive AI-generated summaries:

**Input:** 5 notifications from "Website Redesign" project
**Output:** "Website Redesign: Review wireframes is overdue, 2 tasks due today, design review meeting in 2 hours"

**Input:** 8 low-priority notifications accumulated overnight
**Output:** "Morning catch-up: 3 newsletter tasks available, 2 recurring items ready, pharmacy errand near your route"

### Bundle Triggers

| Condition | Action |
|-----------|--------|
| 3+ notifications from same project in 10 min | Bundle as project update |
| 5+ low-priority notifications pending | Create digest bundle |
| Multiple deadlines within 4 hours | Create deadline cluster |
| Location + related tasks available | Create location bundle |

## Predictive Reminders

### Proactive Notification System

The AI surfaces tasks before explicit due dates based on:

1. **Travel time estimation**: "Leave now to arrive on time for dentist appointment"
2. **Preparation requirements**: "Start tax prep tomorrow to finish before deadline"
3. **Dependency chains**: "Complete review before Sarah can proceed"
4. **Historical patterns**: "You usually do weekly planning Sunday evening"

### Prediction Triggers

```
PredictiveReminder {
  task_id: UUID
  predicted_need_time: DateTime
  confidence: Float              // 0.0 to 1.0
  reasoning: String              // "Based on similar tasks taking ~2 hours"

  // User feedback loop
  was_helpful: Boolean?
  user_adjustment: Duration?     // "Remind me 1 hour earlier next time"
}
```

### Prediction Types

| Type | Example | Trigger |
|------|---------|---------|
| Duration-based | "Start now to finish on time" | Estimated duration vs time until due |
| Preparation | "Gather materials for tomorrow's meeting" | Pattern of prep work before events |
| Travel | "Leave in 20 minutes for appointment" | Location + calendar + traffic |
| Dependency | "Complete so blocked tasks can proceed" | Dependency analysis |
| Behavioral | "You usually review PRs Monday morning" | Historical pattern detection |

## Alert Fatigue Prevention

### Notification Health Metrics

The system monitors notification effectiveness:

```
NotificationHealth {
  period: DateRange

  // Volume metrics
  total_sent: Integer
  total_acted_upon: Integer
  action_rate: Float             // Target: >30%

  // Timing metrics
  average_response_time: Duration
  notifications_during_dnd: Integer

  // Fatigue indicators
  dismiss_without_action_rate: Float
  batch_dismiss_events: Integer
  notification_settings_visits: Integer

  // Quality score
  health_score: Float            // 0-100, computed from above
}
```

### Automatic Throttling

When fatigue indicators rise, the system adapts:

| Indicator | Response |
|-----------|----------|
| Action rate < 20% | Increase bundling aggressiveness |
| High dismiss rate | Reduce low-priority notification frequency |
| Multiple batch dismisses | Suggest notification preference review |
| Settings visits spike | Proactively offer to adjust settings |

### Relevance Scoring

Each notification receives a relevance score before delivery:

```
calculate_relevance(
  notification: Notification,
  user_context: UserContext
) -> RelevanceScore {
  score: Float,                  // 0.0 to 1.0
  factors: Map<String, Float>,   // Contributing factors
  recommendation: DeliveryRecommendation
}

enum DeliveryRecommendation {
  deliver_immediately,
  deliver_in_engagement_window,
  bundle_with_similar,
  include_in_digest,
  suppress                       // Too low relevance
}
```

## Context-Aware Delivery

### Context Detection

The system understands current user context:

```
UserContext {
  // Activity state
  current_activity: ActivityType  // working, commuting, meeting, etc.
  focus_state: FocusState        // deep_work, shallow_work, break, etc.

  // Environmental
  location: Location?
  time_of_day: TimeOfDay
  day_type: DayType              // workday, weekend, holiday

  // Calendar state
  in_meeting: Boolean
  time_until_next_meeting: Duration?
  available_time_block: Duration?

  // Device state
  active_device: DeviceType
  last_interaction: DateTime

  // Task state
  currently_working_on: Task?
  recent_completions: Task[]
  active_projects: Project[]
}
```

### Context-Based Rules

| Context | Notification Behavior |
|---------|----------------------|
| In meeting | Critical only, others queued |
| Deep work detected | Bundle for next break |
| Commuting | Location and audio-friendly only |
| Just completed tasks | "While you're at it" suggestions |
| End of day | Evening summary, defer morning tasks |
| Weekend | Personal only unless critical work |

### Device Intelligence

Notifications route to the optimal device:

| Situation | Preferred Device | Rationale |
|-----------|-----------------|-----------|
| At desk, laptop active | Desktop | Rich interaction available |
| Mobile only active | Phone | Only available device |
| Watch + phone | Watch for glance, phone for action | Triage vs. act |
| All devices available | User preference + context | Learned behavior |

## Notification Data Model

### Notification Object

```
Notification {
  id: UUID
  task_id: UUID?                 // Parent task (if task-related)

  // Content
  title: String
  body: String
  category: NotificationCategory
  priority: Priority

  // Timing
  original_fire_time: DateTime   // When it "should" fire
  optimized_fire_time: DateTime  // When it will actually fire
  timing_reason: String?         // Why timing was adjusted

  // Delivery
  delivered_at: DateTime?
  delivered_to_device: DeviceType?

  // Bundling
  bundle_id: UUID?
  is_bundle_summary: Boolean

  // Interaction
  read_at: DateTime?
  acted_upon_at: DateTime?
  action_taken: NotificationAction?
  dismissed_at: DateTime?

  // AI metadata
  relevance_score: Float
  prediction_confidence: Float?  // For predictive notifications

  // Per-item settings
  custom_timing: Duration?       // Override: fire N seconds from anchor
  anchor: NotificationAnchor?
  repeat_interval: Duration?
}
```

### Priority Levels

| Priority | Timing | Bundling | Examples |
|----------|--------|----------|----------|
| Critical | Immediate, bypass DND | Never bundled | System alerts, imminent deadlines |
| High | Within 15 min | Rarely bundled | Due today, blocked tasks |
| Normal | Next engagement window | May be bundled | Standard reminders |
| Low | Digest/batch only | Always bundled | Available tasks, suggestions |

## User Settings

### Global Notification Preferences

```
NotificationSettings {
  // Master controls
  notifications_enabled: Boolean

  // Automatic notification types
  notify_on_due: Boolean                    // Default: true
  notify_on_deferred: Boolean               // Default: false
  notify_on_latest_start: Boolean           // Default: false
  notify_on_predicted_need: Boolean         // Default: true

  // AI features
  smart_timing_enabled: Boolean             // Default: true
  bundling_enabled: Boolean                 // Default: true
  daily_briefing_enabled: Boolean           // Default: true
  evening_summary_enabled: Boolean          // Default: false
  predictive_reminders_enabled: Boolean     // Default: true

  // Timing preferences
  earliest_notification_time: Time          // Default: 07:00
  latest_notification_time: Time            // Default: 22:00
  respect_calendar_busy: Boolean            // Default: true
  respect_system_focus: Boolean             // Default: true

  // Bundling preferences
  bundle_threshold: Integer                 // Default: 3
  digest_time: Time                         // Default: 08:00

  // Device preferences
  preferred_device: DeviceType?             // null = auto
  sync_across_devices: Boolean              // Default: true
}
```

### Per-Project/Tag Notification Rules

```
NotificationRule {
  scope: Project | Tag | Folder

  // Override settings
  priority_override: Priority?
  timing_override: NotificationTiming?
  bundle_behavior: BundleBehavior?

  // Examples:
  // "Work" folder: No notifications after 6pm
  // "Urgent" tag: Always high priority, never bundle
  // "Someday" project: Low priority, digest only
}
```

## Briefing & Summary Notifications

### Morning Briefing

Delivered at user's typical start-of-day:

```
MorningBriefing {
  greeting: String               // "Good morning! Here's your day:"

  overdue_summary: String?       // "2 items overdue"
  today_summary: String          // "5 items due today"
  calendar_summary: String       // "3 meetings, 2.5 hours of open time"

  top_priorities: Task[]         // AI-selected top 3
  deadline_warnings: String[]    // "Quarterly report due in 2 days"

  forecast: String               // "Moderate workload, good day for deep work"
}
```

### Evening Summary

Delivered at end-of-day pattern detection:

```
EveningSummary {
  completed_count: Integer
  completed_highlights: String   // "Finished website redesign milestone!"

  incomplete_today: Task[]       // What didn't get done
  tomorrow_preview: String       // "3 items due, 2 meetings"

  suggestions: String[]          // "Consider deferring X to reduce tomorrow's load"
}
```

### Weekly Digest

Optional weekly overview:

```
WeeklyDigest {
  week_in_review: String         // "Completed 23 tasks across 5 projects"

  wins: String[]                 // Notable completions
  concerns: String[]             // Stalled projects, aging tasks

  next_week_preview: String
  workload_assessment: String    // "Next week looks heavy on Tuesday"
}
```

## Notification Actions

### Quick Actions

Notifications include context-appropriate actions:

| Action | Description | When Available |
|--------|-------------|----------------|
| Complete | Mark task done | Task notifications |
| Snooze | Delay 15 min / 1 hour / tomorrow | All |
| Defer | Set new defer date | Available task notifications |
| View | Open task/project | All |
| Bundle | Add to digest | Low priority |

### Snooze Intelligence

Snooze learns from patterns:

```
SmartSnooze {
  // Standard options
  fifteen_minutes: Duration
  one_hour: Duration
  tomorrow_morning: DateTime

  // Learned options
  suggested_time: DateTime       // "Snooze until your 2pm break?"
  reason: String                 // Based on pattern recognition
}
```

## Badge & Visual Indicators

### App Badge

```
BadgeSettings {
  include_overdue: Boolean       // Default: true
  include_due_soon: Boolean      // Default: true
  include_flagged: Boolean       // Default: false
  include_inbox: Boolean         // Default: false

  // AI additions
  include_ai_suggestions: Boolean // Default: false
  cap_at: Integer?               // Max badge number (null = unlimited)
}
```

### Due State Colors

| State | Indicator | AI Enhancement |
|-------|-----------|----------------|
| Normal | Default | - |
| Due Soon | Amber | Threshold adjusts per user patterns |
| Overdue | Red | Intensity increases with age |
| At Risk | Orange pulse | Predicted to become overdue |

## Location Notifications

### Geofence Integration

```
LocationNotification {
  tag_id: UUID                   // Tag with location data
  trigger: LocationTrigger       // arriving, leaving

  // AI enhancements
  smart_trigger: Boolean         // Learn actual useful trigger points
  travel_aware: Boolean          // Account for travel time
  errand_bundling: Boolean       // "3 tasks near this location"
}
```

### Smart Location Timing

Instead of triggering exactly at geofence:

- **Arrival prediction**: "You'll arrive in 10 minutes, here are your tasks"
- **Errand routing**: "Hardware store is on your way to grocery store"
- **Dwell detection**: Only trigger if actually stopping, not passing through

## Cross-Platform Behavior

| Feature | Desktop | Mobile | Watch | Web |
|---------|---------|--------|-------|-----|
| All notifications | Yes | Yes | Summary | Yes |
| Smart timing | Yes | Yes | Via phone | Yes |
| Location triggers | Limited | Yes | Via phone | No |
| Quick actions | Full | Full | Limited | Limited |
| Briefings | Yes | Yes | Condensed | Yes |
| Bundles | Expandable | Expandable | Summary only | Expandable |

## API Operations

### Schedule Notification

```
schedule_notification(
  task_id: UUID,
  type: NotificationType,
  params: NotificationParams
) -> Notification
```

### Cancel Notification

```
cancel_notification(notification_id: UUID) -> void
cancel_notifications_for_task(task_id: UUID) -> void
```

### Get Pending Notifications

```
get_pending_notifications(
  filter: NotificationFilter?
) -> Notification[]
```

### Notification Feedback

```
record_notification_feedback(
  notification_id: UUID,
  feedback: NotificationFeedback
) -> void

NotificationFeedback {
  was_helpful: Boolean
  was_timely: Boolean
  preferred_timing: Duration?    // "I wanted this 30 min earlier"
  should_bundle: Boolean?        // "This could have been in a digest"
}
```

## Privacy & Data

### What's Analyzed

- Notification interaction timestamps
- Response patterns by type and time
- Device usage patterns
- Location (if location notifications enabled)
- Calendar free/busy (not event details)

### What's NOT Analyzed

- Notification content for advertising
- Data shared with third parties
- Cross-user pattern aggregation without consent

### User Controls

- View learned patterns
- Reset notification learning
- Export notification history
- Disable specific AI features individually

## Best Practices

### For Users

1. **Start with defaults**: Let the AI learn before customizing
2. **Provide feedback**: "Not helpful" teaches the system
3. **Use briefings**: Reduces need for individual notifications
4. **Trust bundling**: Individual alerts often aren't necessary

### For the System

1. **Err on side of fewer notifications**: Quality over quantity
2. **Respect explicit preferences**: User settings override AI
3. **Explain decisions**: "Delayed because you were in a meeting"
4. **Graceful degradation**: Work without AI if features disabled

## Related Specifications

- `improved_specs/ai-scheduling.md` - Predictive scheduling integration
- `improved_specs/ai-suggestions.md` - Task suggestion notifications
- `improved_specs/ai-capture.md` - Capture confirmation notifications
- `improved_specs/ai-review.md` - Review reminder notifications
