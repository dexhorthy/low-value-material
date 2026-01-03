# Predictive Scheduling Specification

This specification extends `specs/due-dates.md`, `specs/defer-dates.md`, and `specs/repeat.md` with AI-powered scheduling capabilities. The system predicts task durations, suggests optimal timing, detects repeat patterns, and balances workloads.

## Overview

Traditional scheduling requires manual estimates and date selection. AI-native scheduling assists by:
- **Duration estimation**: Predict how long tasks will take
- **Optimal timing**: Suggest when to schedule based on context
- **Pattern detection**: Auto-detect repeat patterns from behavior
- **Calendar awareness**: Integrate with calendar for realistic scheduling
- **Workload balancing**: Prevent overcommitment and burnout

## Duration Estimation

### Estimation Model

```typescript
interface DurationEstimate {
  task_id: UUID;
  estimated_minutes: number;
  confidence: number;              // 0-1
  estimation_method: EstimationMethod;
  factors: EstimationFactor[];
  range: DurationRange;
}

interface DurationRange {
  min_minutes: number;
  max_minutes: number;
  p50_minutes: number;             // Median estimate
  p90_minutes: number;             // Conservative estimate
}

enum EstimationMethod {
  SIMILAR_TASKS = "similar_tasks",       // Based on similar completed tasks
  USER_HISTORY = "user_history",         // Based on user's past performance
  TAG_AVERAGE = "tag_average",           // Average for tasks with same tags
  PROJECT_AVERAGE = "project_average",   // Average for project tasks
  CONTENT_ANALYSIS = "content_analysis", // LLM analysis of complexity
  DEFAULT = "default"                    // Fallback default
}

interface EstimationFactor {
  name: string;
  impact: "increases" | "decreases" | "neutral";
  weight: number;
  details: string;
}
```

### Estimation Algorithm

```typescript
async function estimateDuration(task: Task): Promise<DurationEstimate> {
  const factors: EstimationFactor[] = [];
  const estimates: number[] = [];

  // 1. Similar tasks (highest weight)
  const similar = await findSimilarCompletedTasks(task, 10);
  if (similar.length >= 3) {
    const avgDuration = average(similar.map(t => t.actual_duration));
    estimates.push({ value: avgDuration, weight: 0.4 });
    factors.push({
      name: "Similar tasks",
      impact: "neutral",
      weight: 0.4,
      details: `Based on ${similar.length} similar completed tasks`
    });
  }

  // 2. User history for task type
  const userHistory = await getUserHistoryByType(task, task.user_id);
  if (userHistory.length >= 5) {
    const userAvg = average(userHistory.map(t => t.actual_duration));
    estimates.push({ value: userAvg, weight: 0.3 });
    factors.push({
      name: "Your history",
      impact: userAvg > 30 ? "increases" : "neutral",
      weight: 0.3,
      details: `Your average for this type: ${userAvg} min`
    });
  }

  // 3. Tag-based average
  const tagAvg = await getTagAverageDuration(task.tags);
  if (tagAvg) {
    estimates.push({ value: tagAvg, weight: 0.2 });
  }

  // 4. Content complexity analysis
  const complexity = await analyzeComplexity(task);
  const complexityEstimate = complexityToMinutes(complexity);
  estimates.push({ value: complexityEstimate, weight: 0.1 });
  factors.push({
    name: "Task complexity",
    impact: complexity.score > 0.7 ? "increases" : "neutral",
    weight: 0.1,
    details: `Complexity score: ${complexity.score}`
  });

  // Calculate weighted average
  const totalWeight = estimates.reduce((s, e) => s + e.weight, 0);
  const weightedAvg = estimates.reduce(
    (s, e) => s + (e.value * e.weight), 0
  ) / totalWeight;

  // Calculate range
  const stdDev = calculateStdDev(similar.map(t => t.actual_duration));

  return {
    task_id: task.id,
    estimated_minutes: Math.round(weightedAvg),
    confidence: calculateConfidence(similar.length, stdDev),
    estimation_method: determineMethod(estimates),
    factors,
    range: {
      min_minutes: Math.max(5, Math.round(weightedAvg - stdDev)),
      max_minutes: Math.round(weightedAvg + stdDev * 2),
      p50_minutes: Math.round(weightedAvg),
      p90_minutes: Math.round(weightedAvg + stdDev * 1.5)
    }
  };
}
```

### Learning from Actuals

Track actual vs estimated duration:

```typescript
interface DurationTracking {
  task_id: UUID;
  estimated_minutes: number;
  actual_minutes: number;
  variance: number;                // actual - estimated
  variance_percent: number;
  completed_at: DateTime;
}

function updateDurationModel(tracking: DurationTracking): void {
  // Store for model improvement
  saveDurationSample(tracking);

  // Update user-specific bias correction
  if (Math.abs(tracking.variance_percent) > 20) {
    updateUserBias(tracking.task.user_id, tracking.variance_percent);
  }

  // Update tag-specific averages
  for (const tag of tracking.task.tags) {
    updateTagDurationAverage(tag, tracking.actual_minutes);
  }
}
```

## Optimal Timing Suggestions

### When to Schedule

```typescript
interface TimingSuggestion {
  task_id: UUID;
  suggested_slots: TimeSlot[];
  reasoning: string;
  factors: TimingFactor[];
}

interface TimeSlot {
  start: DateTime;
  end: DateTime;
  score: number;                   // 0-1 suitability
  conflicts: Conflict[];
  reasons: string[];
}

interface TimingFactor {
  name: string;
  weight: number;
  prefers: "morning" | "afternoon" | "evening" | "flexible";
  details: string;
}
```

### Timing Algorithm

```typescript
async function suggestTiming(
  task: Task,
  calendar: CalendarEvents[],
  preferences: UserPreferences
): Promise<TimingSuggestion> {
  const duration = await estimateDuration(task);
  const factors: TimingFactor[] = [];

  // 1. Task type preferences
  const taskType = inferTaskType(task);
  const typePreference = getTypeTimePreference(taskType);
  factors.push({
    name: "Task type",
    weight: 0.3,
    prefers: typePreference,
    details: `${taskType} tasks typically done in ${typePreference}`
  });

  // 2. User historical patterns
  const userPattern = await getUserCompletionPatterns(task);
  if (userPattern) {
    factors.push({
      name: "Your patterns",
      weight: 0.3,
      prefers: userPattern.preferred_time,
      details: `You usually do similar tasks in the ${userPattern.preferred_time}`
    });
  }

  // 3. Energy requirements
  const energy = inferEnergyRequirement(task);
  factors.push({
    name: "Energy level",
    weight: 0.2,
    prefers: energy === "high" ? "morning" : "flexible",
    details: `This task requires ${energy} energy`
  });

  // 4. Due date pressure
  if (task.due_date) {
    const urgency = calculateUrgency(task.due_date, duration.estimated_minutes);
    if (urgency === "high") {
      factors.push({
        name: "Deadline pressure",
        weight: 0.4,
        prefers: "morning",
        details: "Due soon - schedule early in day"
      });
    }
  }

  // Find available slots
  const slots = findAvailableSlots(
    calendar,
    duration.estimated_minutes,
    preferences.work_hours,
    7 // days to look ahead
  );

  // Score each slot
  const scoredSlots = slots.map(slot => ({
    ...slot,
    score: scoreSlot(slot, factors, preferences),
    reasons: generateSlotReasons(slot, factors)
  }));

  return {
    task_id: task.id,
    suggested_slots: scoredSlots.sort((a, b) => b.score - a.score).slice(0, 5),
    reasoning: generateTimingReasoning(factors),
    factors
  };
}
```

### Defer Date Suggestions

```typescript
interface DeferSuggestion {
  task_id: UUID;
  suggested_defer: DateTime;
  reason: DeferReason;
  alternative_dates: DateTime[];
}

enum DeferReason {
  WORKLOAD_BALANCE = "workload_balance",     // Too many tasks that day
  DEPENDENCY = "dependency",                  // Wait for another task
  CONTEXT_MISMATCH = "context_mismatch",     // Wrong location/time
  CALENDAR_CONFLICT = "calendar_conflict",   // Meetings that day
  OPTIMAL_TIMING = "optimal_timing"          // Better day for this type
}

function suggestDeferDate(task: Task, context: SchedulingContext): DeferSuggestion {
  // Don't show until there's time to do it
  const workload = getWorkloadByDay(context.calendar, 14);

  // Find days with lower workload
  const lightDays = workload
    .filter(d => d.available_minutes >= task.estimated_duration * 1.5)
    .filter(d => d.task_count < context.preferences.max_tasks_per_day);

  if (lightDays.length === 0) {
    // All days are busy - suggest based on due date
    return suggestBasedOnDueDate(task);
  }

  // Score days by suitability
  const scored = lightDays.map(d => ({
    date: d.date,
    score: scoreDeferDate(d, task, context)
  }));

  return {
    task_id: task.id,
    suggested_defer: scored[0].date,
    reason: determineDeferReason(scored[0], task),
    alternative_dates: scored.slice(1, 4).map(s => s.date)
  };
}
```

## Repeat Pattern Detection

### Pattern Recognition

Detect when users create similar tasks repeatedly:

```typescript
interface DetectedPattern {
  id: UUID;
  pattern_type: PatternType;
  confidence: number;
  sample_tasks: UUID[];
  suggested_repeat: RepeatRule;
  first_detected: DateTime;
}

enum PatternType {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  WEEKDAY = "weekday",
  CUSTOM_INTERVAL = "custom_interval"
}

interface RepeatRule {
  interval: number;
  unit: "day" | "week" | "month";
  weekdays?: number[];             // For weekly
  day_of_month?: number;           // For monthly
  anchor: "due" | "defer" | "completion";
}
```

### Detection Algorithm

```typescript
function detectRepeatPatterns(tasks: Task[]): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  // Group tasks by similarity
  const clusters = clusterSimilarTasks(tasks);

  for (const cluster of clusters) {
    if (cluster.tasks.length < 3) continue;

    // Analyze temporal patterns
    const creationDates = cluster.tasks.map(t => t.created_at).sort();
    const intervals = calculateIntervals(creationDates);

    // Check for regular intervals
    const avgInterval = average(intervals);
    const stdDev = calculateStdDev(intervals);
    const isRegular = stdDev / avgInterval < 0.3; // Low variance

    if (isRegular) {
      const patternType = intervalToPatternType(avgInterval);
      patterns.push({
        id: generateUUID(),
        pattern_type: patternType,
        confidence: 1 - (stdDev / avgInterval),
        sample_tasks: cluster.tasks.map(t => t.id),
        suggested_repeat: generateRepeatRule(avgInterval, patternType),
        first_detected: now()
      });
    }
  }

  return patterns;
}

function clusterSimilarTasks(tasks: Task[]): TaskCluster[] {
  // Group by title similarity
  const clusters: TaskCluster[] = [];

  for (const task of tasks) {
    let matched = false;
    for (const cluster of clusters) {
      if (isSimilarTitle(task.title, cluster.representative.title)) {
        cluster.tasks.push(task);
        matched = true;
        break;
      }
    }
    if (!matched) {
      clusters.push({
        representative: task,
        tasks: [task]
      });
    }
  }

  return clusters.filter(c => c.tasks.length >= 3);
}
```

### Pattern Notification

```
┌─────────────────────────────────────────────────────────┐
│ 🔄 Repeat pattern detected                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ You've created "Weekly team sync notes" 8 times,        │
│ approximately every 7 days.                              │
│                                                          │
│ Would you like to make this a repeating task?           │
│                                                          │
│ Suggested: Repeat every 1 week on Monday                │
│                                                          │
│ [Create Repeating Task] [Not Now] [Never Ask]           │
└─────────────────────────────────────────────────────────┘
```

## Calendar-Aware Scheduling

### Calendar Integration

```typescript
interface CalendarContext {
  events: CalendarEvent[];
  work_hours: WorkHours;
  time_zone: string;
  buffer_minutes: number;          // Between events
}

interface WorkHours {
  start: Time;                     // e.g., "09:00"
  end: Time;                       // e.g., "17:00"
  work_days: number[];             // 0=Sun, 1=Mon, etc.
}

interface AvailabilityWindow {
  start: DateTime;
  end: DateTime;
  duration_minutes: number;
  quality: WindowQuality;
}

enum WindowQuality {
  FOCUS_BLOCK = "focus_block",     // Large uninterrupted block
  FRAGMENTED = "fragmented",       // Between meetings
  BUFFER = "buffer",               // Small gap
  OVERFLOW = "overflow"            // Outside work hours
}
```

### Finding Available Time

```typescript
function findAvailableSlots(
  calendar: CalendarContext,
  needed_minutes: number,
  days_ahead: number
): AvailabilityWindow[] {
  const windows: AvailabilityWindow[] = [];

  for (let day = 0; day < days_ahead; day++) {
    const date = addDays(today(), day);

    // Skip non-work days
    if (!calendar.work_hours.work_days.includes(date.getDay())) {
      continue;
    }

    // Get events for this day
    const dayEvents = calendar.events.filter(e =>
      isSameDay(e.start, date)
    ).sort((a, b) => a.start - b.start);

    // Find gaps between events
    let currentTime = setTime(date, calendar.work_hours.start);
    const endTime = setTime(date, calendar.work_hours.end);

    for (const event of dayEvents) {
      const gap = minutesBetween(currentTime, event.start);

      if (gap >= needed_minutes + calendar.buffer_minutes * 2) {
        windows.push({
          start: addMinutes(currentTime, calendar.buffer_minutes),
          end: addMinutes(event.start, -calendar.buffer_minutes),
          duration_minutes: gap - calendar.buffer_minutes * 2,
          quality: gap >= 60 ? WindowQuality.FOCUS_BLOCK : WindowQuality.FRAGMENTED
        });
      }

      currentTime = event.end;
    }

    // Check time after last event
    const remainingGap = minutesBetween(currentTime, endTime);
    if (remainingGap >= needed_minutes) {
      windows.push({
        start: addMinutes(currentTime, calendar.buffer_minutes),
        end: endTime,
        duration_minutes: remainingGap - calendar.buffer_minutes,
        quality: remainingGap >= 90 ? WindowQuality.FOCUS_BLOCK : WindowQuality.FRAGMENTED
      });
    }
  }

  return windows;
}
```

## Workload Balancing

### Workload Analysis

```typescript
interface WorkloadAnalysis {
  date: Date;
  total_tasks: number;
  total_estimated_minutes: number;
  available_minutes: number;
  utilization: number;             // 0-1, can exceed 1 if overloaded
  status: WorkloadStatus;
  tasks: Task[];
}

enum WorkloadStatus {
  LIGHT = "light",                 // < 50% utilization
  BALANCED = "balanced",           // 50-80% utilization
  HEAVY = "heavy",                 // 80-100% utilization
  OVERLOADED = "overloaded"        // > 100% utilization
}

function analyzeWorkload(
  tasks: Task[],
  calendar: CalendarContext,
  days: number
): WorkloadAnalysis[] {
  const analysis: WorkloadAnalysis[] = [];

  for (let day = 0; day < days; day++) {
    const date = addDays(today(), day);
    const dayTasks = tasks.filter(t =>
      isScheduledForDay(t, date) || isDueOnDay(t, date)
    );

    const totalEstimated = dayTasks.reduce(
      (sum, t) => sum + (t.estimated_duration || 30), 0
    );

    const available = calculateAvailableMinutes(date, calendar);
    const utilization = totalEstimated / available;

    analysis.push({
      date,
      total_tasks: dayTasks.length,
      total_estimated_minutes: totalEstimated,
      available_minutes: available,
      utilization,
      status: utilizationToStatus(utilization),
      tasks: dayTasks
    });
  }

  return analysis;
}
```

### Rebalancing Suggestions

```typescript
interface RebalanceSuggestion {
  type: "move" | "defer" | "split" | "delegate";
  task: Task;
  from_date: Date;
  to_date: Date;
  reason: string;
  impact: WorkloadImpact;
}

interface WorkloadImpact {
  from_day_utilization_before: number;
  from_day_utilization_after: number;
  to_day_utilization_before: number;
  to_day_utilization_after: number;
}

function suggestRebalancing(workload: WorkloadAnalysis[]): RebalanceSuggestion[] {
  const suggestions: RebalanceSuggestion[] = [];

  // Find overloaded days
  const overloaded = workload.filter(w => w.status === WorkloadStatus.OVERLOADED);

  // Find light days
  const light = workload.filter(w => w.status === WorkloadStatus.LIGHT);

  for (const heavy of overloaded) {
    // Find moveable tasks (not due that day, not blocked)
    const moveable = heavy.tasks.filter(t =>
      !isDueOnDay(t, heavy.date) &&
      !isBlocked(t)
    );

    for (const task of moveable) {
      // Find best destination day
      const destination = findBestDestination(task, light, workload);

      if (destination) {
        suggestions.push({
          type: "move",
          task,
          from_date: heavy.date,
          to_date: destination.date,
          reason: `${formatDate(heavy.date)} is overloaded (${Math.round(heavy.utilization * 100)}%)`,
          impact: calculateImpact(task, heavy, destination)
        });
      }
    }
  }

  return suggestions;
}
```

### Workload UI

```
┌─────────────────────────────────────────────────────────┐
│ 📊 Workload This Week                                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Mon   ████████████████████░░░░ 85%  (5h 30m / 6h 30m)  │
│ Tue   ████████████████████████ 120% ⚠️ Overloaded      │
│ Wed   ████████████░░░░░░░░░░░░ 55%                     │
│ Thu   ██████████████░░░░░░░░░░ 62%                     │
│ Fri   ████████░░░░░░░░░░░░░░░░ 35%                     │
│                                                          │
│ 💡 Tuesday is overloaded. Suggestions:                  │
│   • Move "Write documentation" to Friday (+1h 30m)     │
│   • Defer "Review PRs" to Wednesday (+45m)             │
│                                                          │
│ [Apply Suggestions] [Adjust Manually] [Dismiss]         │
└─────────────────────────────────────────────────────────┘
```

## Deadline Risk Prediction

### Risk Model

```typescript
interface DeadlineRisk {
  task_id: UUID;
  risk_level: RiskLevel;
  probability_of_miss: number;     // 0-1
  estimated_completion: DateTime;
  buffer_hours: number;
  risk_factors: RiskFactor[];
  mitigation_options: MitigationOption[];
}

enum RiskLevel {
  LOW = "low",                     // > 2x buffer
  MEDIUM = "medium",               // 1-2x buffer
  HIGH = "high",                   // < 1x buffer
  CRITICAL = "critical"            // Negative buffer
}

interface RiskFactor {
  name: string;
  impact: number;                  // Hours of risk
  description: string;
}

interface MitigationOption {
  action: string;
  impact: string;
  effort: "low" | "medium" | "high";
}
```

### Risk Calculation

```typescript
function assessDeadlineRisk(task: Task, context: SchedulingContext): DeadlineRisk {
  if (!task.due_date) return null;

  const estimate = await estimateDuration(task);
  const workHoursAvailable = calculateWorkHoursBetween(
    now(),
    task.due_date,
    context.calendar
  );

  // Factor in existing commitments
  const existingCommitments = sumScheduledTasks(
    context.tasks,
    now(),
    task.due_date
  );

  const netAvailable = workHoursAvailable - existingCommitments;
  const buffer = netAvailable - (estimate.estimated_minutes / 60);

  const riskFactors: RiskFactor[] = [];

  // Check dependencies
  const blockers = getBlockingTasks(task);
  if (blockers.length > 0) {
    const blockerTime = sumEstimates(blockers);
    riskFactors.push({
      name: "Blocking tasks",
      impact: blockerTime / 60,
      description: `${blockers.length} tasks must complete first`
    });
  }

  // Check historical variance
  const historicalOverrun = getUserAverageOverrun(task.user_id);
  if (historicalOverrun > 0.2) {
    riskFactors.push({
      name: "Historical overruns",
      impact: estimate.estimated_minutes * historicalOverrun / 60,
      description: `You typically take ${Math.round(historicalOverrun * 100)}% longer than estimated`
    });
  }

  // Check calendar conflicts
  const conflicts = findConflicts(task, context.calendar);
  if (conflicts.length > 0) {
    riskFactors.push({
      name: "Calendar conflicts",
      impact: conflicts.length * 0.5,
      description: `${conflicts.length} meetings may reduce focus time`
    });
  }

  const totalRiskHours = riskFactors.reduce((s, f) => s + f.impact, 0);
  const adjustedBuffer = buffer - totalRiskHours;

  return {
    task_id: task.id,
    risk_level: bufferToRiskLevel(adjustedBuffer, estimate.estimated_minutes),
    probability_of_miss: calculateMissProbability(adjustedBuffer, estimate),
    estimated_completion: calculateEstimatedCompletion(task, context),
    buffer_hours: adjustedBuffer,
    risk_factors: riskFactors,
    mitigation_options: generateMitigations(task, riskFactors)
  };
}
```

## API Endpoints

### Duration Estimation

```
GET /api/tasks/{task_id}/duration-estimate

Response: DurationEstimate
```

### Timing Suggestions

```
GET /api/tasks/{task_id}/timing-suggestions
Query: days_ahead=7

Response: TimingSuggestion
```

### Pattern Detection

```
GET /api/patterns/detected

Response: {
  patterns: DetectedPattern[],
  pending_suggestions: number
}
```

### Workload Analysis

```
GET /api/workload
Query: days=7

Response: {
  analysis: WorkloadAnalysis[],
  suggestions: RebalanceSuggestion[],
  overall_status: WorkloadStatus
}
```

### Deadline Risks

```
GET /api/tasks/deadline-risks

Response: {
  at_risk: DeadlineRisk[],
  critical_count: number,
  high_count: number
}
```

## Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `scheduling.auto_estimate` | Boolean | true | Auto-estimate durations |
| `scheduling.suggest_timing` | Boolean | true | Suggest when to do tasks |
| `scheduling.detect_patterns` | Boolean | true | Detect repeat patterns |
| `scheduling.workload_alerts` | Boolean | true | Warn about overload |
| `scheduling.max_daily_tasks` | Integer | 15 | Max tasks per day threshold |
| `scheduling.target_utilization` | Float | 0.75 | Target daily utilization |
| `scheduling.buffer_minutes` | Integer | 15 | Buffer between scheduled items |
| `scheduling.work_hours_start` | Time | 09:00 | Work day start |
| `scheduling.work_hours_end` | Time | 17:00 | Work day end |
| `scheduling.work_days` | Integer[] | [1,2,3,4,5] | Work days (Mon-Fri) |

## Performance

| Operation | Target Latency |
|-----------|---------------|
| Duration estimate | < 200ms |
| Timing suggestions | < 500ms |
| Pattern detection | < 1s (batch) |
| Workload analysis | < 300ms |
| Risk calculation | < 200ms |

## Related Specifications

- `specs/due-dates.md` - Due date handling
- `specs/defer-dates.md` - Defer date handling
- `specs/repeat.md` - Repeat patterns
- `specs/forecast.md` - Calendar view
- `improved_specs/ai-suggestions.md` - Task recommendations
- `improved_specs/mcp-integration.md` - Calendar integration

## Sources

- [AI Scheduling Algorithms](https://callin.io/ai-scheduling-algorithms/)
- [AI Task Managers & Scheduling 2025](https://www.getclockwise.com/blog/ai-task-managers-scheduling-tools)
- [Motion - AI Scheduling](https://www.usemotion.com/)
- [Trevor AI](https://www.trevorai.com)
- [Intelligent Scheduling Research](https://www.intechopen.com/chapters/1215824)
