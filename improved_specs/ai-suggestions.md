# AI-Powered Task Suggestions Specification

This specification extends `specs/availability.md`, `specs/forecast.md`, and `specs/perspectives.md` with intelligent task recommendation capabilities. The system answers "What should I work on next?" using context, patterns, and priorities.

## Overview

Traditional task managers show what's available. AI-native suggestions actively recommend what to work on based on:
- **Urgency**: Due dates, overdue status, deadline risk
- **Context**: Time of day, location, calendar, energy level
- **Patterns**: When user typically does certain tasks
- **Dependencies**: What unblocks other work
- **Effort**: Task duration vs available time

## Suggestion Engine Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Suggestion Engine                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Urgency    │  │   Context    │  │   Pattern    │      │
│  │   Scorer     │  │   Matcher    │  │   Learner    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │               │
│         └─────────────────┼──────────────────┘               │
│                           │                                  │
│                    ┌──────▼───────┐                         │
│                    │   Ranker     │                         │
│                    │  (combine    │                         │
│                    │   scores)    │                         │
│                    └──────┬───────┘                         │
│                           │                                  │
│                    ┌──────▼───────┐                         │
│                    │  Diversifier │                         │
│                    │  (variety)   │                         │
│                    └──────────────┘                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Data Model

### UserContext

Real-time context for suggestions:

```typescript
interface UserContext {
  // Time context
  current_time: DateTime;
  day_of_week: DayOfWeek;
  time_of_day: "morning" | "afternoon" | "evening" | "night";

  // Location context
  location?: {
    latitude: number;
    longitude: number;
    place_name?: string;
    matching_tags: UUID[];  // Tags with nearby locations
  };

  // Calendar context
  next_event?: {
    title: string;
    starts_at: DateTime;
    minutes_until: number;
  };
  free_time_minutes?: number;  // Until next commitment

  // Energy context (user-provided or inferred)
  energy_level?: "high" | "medium" | "low";

  // Recent activity
  recently_completed_tags: UUID[];
  recently_completed_projects: UUID[];
  session_tasks_completed: number;
}
```

### TaskScore

Computed score for ranking:

```typescript
interface TaskScore {
  task_id: UUID;

  // Individual scores (0-1)
  urgency_score: number;
  context_score: number;
  pattern_score: number;
  effort_match_score: number;
  dependency_score: number;

  // Combined score
  total_score: number;

  // Explanation
  primary_reason: SuggestionReason;
  secondary_reasons: SuggestionReason[];
}
```

### SuggestionReason

Why a task is suggested:

```typescript
enum SuggestionReason {
  // Urgency reasons
  OVERDUE = "overdue",
  DUE_TODAY = "due_today",
  DUE_SOON = "due_soon",
  DEADLINE_RISK = "deadline_risk",

  // Context reasons
  LOCATION_MATCH = "location_match",
  TIME_OF_DAY_MATCH = "time_of_day_match",
  CALENDAR_FIT = "calendar_fit",
  ENERGY_MATCH = "energy_match",

  // Pattern reasons
  TYPICAL_TIME = "typical_time",
  ROUTINE_TASK = "routine_task",
  SIMILAR_CONTEXT = "similar_context",

  // Productivity reasons
  QUICK_WIN = "quick_win",
  UNBLOCKS_OTHERS = "unblocks_others",
  PROJECT_MOMENTUM = "project_momentum",
  STALLED_PROJECT = "stalled_project",

  // Variety reasons
  DIFFERENT_PROJECT = "different_project",
  DIFFERENT_TAG = "different_tag",
  BREAK_SUGGESTED = "break_suggested"
}
```

### Suggestion

A task recommendation:

```typescript
interface Suggestion {
  task: Task;
  score: TaskScore;

  // Display
  headline: string;         // "Quick win before your meeting"
  explanation: string;      // "This 10-minute task fits your 15-minute gap"

  // Actions
  dismiss_action?: "snooze_1h" | "snooze_today" | "not_now";
  alternative_tasks?: Task[];
}
```

## Scoring Components

### 1. Urgency Scorer

Prioritizes time-sensitive tasks:

```typescript
function urgencyScore(task: Task, now: DateTime): number {
  const due = task.effective_due_date;
  if (!due) return 0.1;  // No urgency if no due date

  const hours_until_due = hoursBetween(now, due);

  if (hours_until_due < 0) {
    // Overdue - highest urgency
    return 1.0;
  } else if (hours_until_due < 24) {
    // Due within 24h
    return 0.9;
  } else if (hours_until_due < 48) {
    // Due soon (default threshold)
    return 0.7;
  } else if (hours_until_due < 168) {
    // Due this week
    return 0.4;
  } else {
    // Future
    return 0.2;
  }
}
```

### 2. Context Scorer

Matches task to current context:

```typescript
function contextScore(task: Task, context: UserContext): number {
  let score = 0;
  let factors = 0;

  // Location match
  if (context.location && task.tags.some(t =>
    context.location.matching_tags.includes(t))) {
    score += 1.0;
    factors++;
  }

  // Time of day match (from tag or task metadata)
  const time_tags = getTimeOfDayTags(task);
  if (time_tags.includes(context.time_of_day)) {
    score += 0.8;
    factors++;
  }

  // Calendar fit
  if (context.free_time_minutes && task.estimated_duration) {
    const fits = task.estimated_duration <= context.free_time_minutes;
    score += fits ? 0.9 : 0.2;
    factors++;
  }

  // Energy match
  if (context.energy_level) {
    const task_energy = inferTaskEnergy(task);  // From tags or estimation
    const match = task_energy === context.energy_level;
    score += match ? 0.8 : 0.3;
    factors++;
  }

  return factors > 0 ? score / factors : 0.5;
}
```

### 3. Pattern Scorer

Learns from user behavior:

```typescript
function patternScore(task: Task, context: UserContext, history: CompletionHistory): number {
  // When does user typically complete tasks like this?
  const similar_completions = history.filter(h =>
    h.tags.some(t => task.tags.includes(t)) ||
    h.project_id === task.project_id
  );

  if (similar_completions.length < 3) {
    return 0.5;  // Not enough data
  }

  // Check time patterns
  const typical_hour = mode(similar_completions.map(c => c.completed_at.hour));
  const typical_day = mode(similar_completions.map(c => c.completed_at.dayOfWeek));

  let score = 0;
  if (Math.abs(context.current_time.hour - typical_hour) <= 2) {
    score += 0.5;
  }
  if (context.day_of_week === typical_day) {
    score += 0.3;
  }

  return score;
}
```

### 4. Effort Match Scorer

Matches task duration to available time:

```typescript
function effortMatchScore(task: Task, context: UserContext): number {
  if (!task.estimated_duration || !context.free_time_minutes) {
    return 0.5;  // No data
  }

  const ratio = task.estimated_duration / context.free_time_minutes;

  if (ratio <= 0.5) {
    // Quick win - easily fits
    return 0.9;
  } else if (ratio <= 0.8) {
    // Good fit
    return 0.8;
  } else if (ratio <= 1.0) {
    // Tight fit
    return 0.6;
  } else {
    // Won't fit
    return 0.2;
  }
}
```

### 5. Dependency Scorer

Prioritizes tasks that unblock others:

```typescript
function dependencyScore(task: Task, all_tasks: Task[]): number {
  // In sequential projects, completing this task unblocks the next
  const project = getProject(task.project_id);

  if (project?.type === "sequential" && isFirstAvailable(task, project)) {
    const blocked_count = countBlockedTasks(task, project);
    if (blocked_count > 0) {
      return Math.min(0.5 + (blocked_count * 0.1), 1.0);
    }
  }

  // Task in stalled project
  if (isOnlyTaskInProject(task)) {
    return 0.6;  // Completing moves project forward
  }

  return 0.3;  // Default
}
```

## Ranking Algorithm

### Score Combination

```typescript
function calculateTotalScore(
  task: Task,
  context: UserContext,
  weights: ScoringWeights
): TaskScore {
  const urgency = urgencyScore(task, context.current_time);
  const ctx = contextScore(task, context);
  const pattern = patternScore(task, context, getHistory());
  const effort = effortMatchScore(task, context);
  const dependency = dependencyScore(task, getAllTasks());

  // Weighted combination
  const total =
    urgency * weights.urgency +
    ctx * weights.context +
    pattern * weights.pattern +
    effort * weights.effort +
    dependency * weights.dependency;

  return {
    task_id: task.id,
    urgency_score: urgency,
    context_score: ctx,
    pattern_score: pattern,
    effort_match_score: effort,
    dependency_score: dependency,
    total_score: total,
    primary_reason: determinePrimaryReason(urgency, ctx, pattern, effort, dependency),
    secondary_reasons: determineSecondaryReasons(...)
  };
}
```

### Default Weights

```typescript
const DEFAULT_WEIGHTS: ScoringWeights = {
  urgency: 0.35,      // Deadlines matter most
  context: 0.25,      // Current situation
  pattern: 0.15,      // User habits
  effort: 0.15,       // Time available
  dependency: 0.10    // Unblocking value
};
```

### Diversification

Prevent suggesting only one type of task:

```typescript
function diversifySuggestions(
  ranked: TaskScore[],
  limit: number,
  context: UserContext
): TaskScore[] {
  const result: TaskScore[] = [];
  const seen_projects = new Set<UUID>();
  const seen_primary_reasons = new Set<SuggestionReason>();

  for (const score of ranked) {
    // Always include top urgency items
    if (score.urgency_score > 0.8) {
      result.push(score);
      continue;
    }

    // Diversify by project
    if (seen_projects.has(score.task.project_id) && result.length > 2) {
      continue;  // Skip, already have task from this project
    }

    // Diversify by reason (don't show 5 "quick wins")
    if (seen_primary_reasons.has(score.primary_reason) &&
        countReason(result, score.primary_reason) >= 2) {
      continue;
    }

    result.push(score);
    seen_projects.add(score.task.project_id);
    seen_primary_reasons.add(score.primary_reason);

    if (result.length >= limit) break;
  }

  return result;
}
```

## Deadline Risk Assessment

Proactive warnings about at-risk tasks:

```typescript
interface DeadlineRisk {
  task: Task;
  risk_level: "low" | "medium" | "high" | "critical";
  estimated_completion_time: Duration;
  time_available: Duration;
  warning: string;
  suggested_action: string;
}

function assessDeadlineRisk(task: Task, context: UserContext): DeadlineRisk | null {
  if (!task.effective_due_date) return null;

  const hours_until_due = hoursBetween(context.current_time, task.effective_due_date);
  const estimated_hours = (task.estimated_duration || 60) / 60;

  // Factor in work hours only
  const work_hours_available = calculateWorkHours(
    context.current_time,
    task.effective_due_date,
    context.calendar
  );

  const buffer_ratio = work_hours_available / estimated_hours;

  if (buffer_ratio < 1.0) {
    return {
      task,
      risk_level: "critical",
      estimated_completion_time: estimated_hours,
      time_available: work_hours_available,
      warning: "Not enough time to complete before deadline",
      suggested_action: "Start immediately or reschedule"
    };
  } else if (buffer_ratio < 1.5) {
    return {
      task,
      risk_level: "high",
      estimated_completion_time: estimated_hours,
      time_available: work_hours_available,
      warning: "Very tight deadline",
      suggested_action: "Prioritize today"
    };
  } else if (buffer_ratio < 2.0) {
    return {
      task,
      risk_level: "medium",
      estimated_completion_time: estimated_hours,
      time_available: work_hours_available,
      warning: "Limited buffer time",
      suggested_action: "Plan time this week"
    };
  }

  return null;  // Low risk, no warning needed
}
```

## Proactive Surfacing

### Morning Briefing

Daily summary with suggestions:

```typescript
interface MorningBriefing {
  greeting: string;
  date: Date;

  // Priority items
  overdue_count: number;
  due_today: Task[];
  at_risk: DeadlineRisk[];

  // Suggestions
  suggested_focus: Suggestion[];  // Top 3-5 for today
  quick_wins: Task[];             // < 15 min tasks

  // Calendar context
  busy_hours: number;
  free_blocks: TimeBlock[];

  // Wellness
  workload_assessment: "light" | "normal" | "heavy" | "overloaded";
  recommendation?: string;  // "Consider deferring non-urgent tasks"
}
```

### Smart Notifications

Trigger suggestions at optimal times:

```typescript
interface SmartNotification {
  type: "suggestion" | "reminder" | "risk_warning";
  task: Task;
  trigger: NotificationTrigger;
  message: string;
  actions: NotificationAction[];
}

enum NotificationTrigger {
  LOCATION_ARRIVAL = "location_arrival",     // Arrived at tagged location
  CALENDAR_GAP = "calendar_gap",             // Free time detected
  ENERGY_WINDOW = "energy_window",           // Optimal time for task type
  DEADLINE_APPROACHING = "deadline_approaching",
  CONTEXT_CHANGE = "context_change"          // Left office, got home
}
```

## API Endpoints

### Get Suggestions

```
GET /api/suggestions
Query params:
  limit: number (default: 5)
  context: UserContext (optional, auto-detected if not provided)

Response:
{
  suggestions: Suggestion[],
  context_used: UserContext,
  at_risk_tasks: DeadlineRisk[],
  generated_at: DateTime
}
```

### Get Morning Briefing

```
GET /api/briefing
Query params:
  date: Date (default: today)

Response: MorningBriefing
```

### Dismiss Suggestion

```
POST /api/suggestions/{task_id}/dismiss
Body:
{
  action: "snooze_1h" | "snooze_today" | "not_now" | "never_suggest"
}
```

### Update Context

```
POST /api/context
Body: UserContext

Response:
{
  updated: true,
  new_suggestions: Suggestion[]
}
```

### Set Energy Level

```
POST /api/context/energy
Body:
{
  level: "high" | "medium" | "low"
}
```

## BAML Schema for LLM Suggestions

For complex suggestion explanations:

```baml
class SuggestionExplanation {
  headline string @description("Short, actionable headline like 'Quick win before your meeting'")
  explanation string @description("2-3 sentence explanation of why this task is suggested")
  tips string[] @description("Optional tips for completing the task")
}

function ExplainSuggestion(
  task_title: string,
  task_project: string,
  primary_reason: string,
  context: string
) -> SuggestionExplanation {
  client Claude
  prompt #"
    Generate a friendly, actionable explanation for why we're suggesting this task.

    Task: {{ task_title }}
    Project: {{ task_project }}
    Primary reason: {{ primary_reason }}
    User context: {{ context }}

    Be concise and motivating. Focus on the benefit of doing this task now.

    {{ ctx.output_format }}
  "#
}
```

## Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `suggestions.enabled` | Boolean | true | Enable AI suggestions |
| `suggestions.limit` | Integer | 5 | Max suggestions to show |
| `suggestions.auto_refresh` | Boolean | true | Refresh on context change |
| `suggestions.morning_briefing` | Boolean | true | Show morning summary |
| `suggestions.risk_warnings` | Boolean | true | Warn about at-risk deadlines |
| `suggestions.location_aware` | Boolean | true | Use location for context |
| `suggestions.calendar_aware` | Boolean | true | Use calendar for context |
| `suggestions.learn_patterns` | Boolean | true | Learn from completion patterns |
| `suggestions.energy_tracking` | Boolean | false | Prompt for energy level |
| `suggestions.weights` | ScoringWeights | defaults | Custom scoring weights |

## UI Integration

### "What's Next?" Widget

```
┌─────────────────────────────────────────────┐
│ ✨ What's Next?                     [Refresh]│
├─────────────────────────────────────────────┤
│                                              │
│ 🔴 Submit quarterly report                   │
│    Overdue • Due yesterday                   │
│    [Start] [Reschedule]                      │
│                                              │
│ ⚡ Review pull request                       │
│    Quick win • 10 min before your meeting    │
│    [Start] [Skip]                            │
│                                              │
│ 📍 Pick up dry cleaning                      │
│    You're near downtown                      │
│    [Start] [Not now]                         │
│                                              │
│ ────────────────────────────────────────     │
│ 3 tasks at risk • 2 overdue                  │
│ [View all suggestions]                       │
└─────────────────────────────────────────────┘
```

### Inline Suggestions in Perspectives

Suggestions can appear contextually:

```
Today
├── Due Today (3)
│   └── ...
├── ✨ Suggested (2)
│   ├── ☐ Quick email reply (fits your 10 min gap)
│   └── ☐ Call dentist (typical time for calls)
└── Flagged (1)
    └── ...
```

## Privacy Considerations

- Location data processed locally when possible
- Pattern learning stored on-device by default
- No task content shared for suggestions
- User can disable any context source
- Clear data option for learned patterns

## Performance Requirements

| Operation | Target Latency |
|-----------|---------------|
| Calculate suggestions | < 200ms |
| Context update | < 100ms |
| Pattern query | < 50ms |
| Morning briefing | < 500ms |

## Edge Cases

### No Available Tasks
- Show "All caught up!" message
- Suggest reviewing someday/maybe list

### All Tasks High Priority
- Diversify by project/tag
- Suggest breaking tasks down
- Warn about overcommitment

### New User (No Patterns)
- Use defaults and context only
- Explain why suggestions are made
- Ask for feedback to improve

### Calendar Unavailable
- Fall back to time-of-day only
- Note that calendar integration improves suggestions

### Conflicting Signals
- Urgency wins for critical items
- Explain trade-offs to user
- Allow manual override

## Related Specifications

- `specs/availability.md` - Available task definition
- `specs/forecast.md` - Date-based planning
- `specs/perspectives.md` - View framework
- `specs/review.md` - Project review system
- `improved_specs/ai-capture.md` - Task creation
- `improved_specs/ai-processing-reference.md` - BAML patterns

## Sources

- [AI Task Prioritization Guide](https://www.averi.ai/guides/how-ai-improves-task-prioritization-step-by-step)
- [Smart Task Prioritization](https://gibion.ai/blog/smart-task-prioritization-ai-decides-what-matters/)
- [AI Task Managers 2025](https://monday.com/blog/task-management/ai-task-manager/)
- [AI-Enhanced Productivity](https://taskfire.io/ai-enhanced-productivity/)
- [Recommendation Systems](https://www.nvidia.com/en-us/glossary/recommendation-system/)
