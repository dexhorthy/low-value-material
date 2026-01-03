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

### What Users See

Each task can display an estimated duration with a confidence indicator. Users see both a point estimate and a range:

**Example:**
```
Task: Write quarterly report
Estimated: ~2 hours (1.5-3 hours range)
Confidence: High (based on 8 similar tasks)
```

### How Estimates are Generated

The system considers multiple signals to estimate duration:

| Signal | Description | Weight |
|--------|-------------|--------|
| Similar tasks | Duration of completed tasks with similar titles/content | Highest |
| User history | How long this user typically takes for this type of work | High |
| Tag averages | Average duration for tasks with the same tags | Medium |
| Project averages | Average duration for tasks in the same project | Medium |
| Content analysis | AI assessment of task complexity | Lower |

### Estimation Factors Display

When viewing an estimate, users can see what influenced it:

```
Estimated: 45 minutes

Why this estimate:
• Similar tasks: You completed 5 similar tasks averaging 42 min
• Your history: Your @calls tasks average 38 min
• Task complexity: Medium (single action, clear outcome)
```

### Learning from Actuals

The system improves over time by tracking actual vs estimated duration:
- When you complete a task, actual time is compared to the estimate
- Consistent over/under-estimation adjusts future predictions
- Tag and project averages update with new data
- Users who consistently take longer get calibrated estimates

## Optimal Timing Suggestions

### When to Schedule

When a user wants to schedule a task, the system suggests optimal time slots based on multiple factors:

**Example suggestion:**
```
Task: Write quarterly report (~2 hours)

Suggested times:
1. Tomorrow 9-11 AM ★★★★★
   "Your most productive time for writing tasks"

2. Wednesday 2-4 PM ★★★★☆
   "Large free block after your meetings"

3. Friday 10 AM-12 PM ★★★☆☆
   "Available, but you have a 1pm deadline"
```

### Timing Factors

The system considers:

| Factor | What it considers |
|--------|-------------------|
| Task type | Deep work in morning, admin in afternoon |
| Your patterns | When you typically complete similar tasks |
| Energy requirements | High-energy tasks when you're fresh |
| Deadline pressure | Urgent tasks scheduled earlier |
| Calendar availability | Gaps between meetings |

### Defer Date Suggestions

When deferring a task, the system suggests optimal dates:

**Reasons for defer suggestions:**
- **Workload balance**: "Tuesday is lighter - only 3 tasks scheduled"
- **Calendar conflict**: "You have meetings all day Monday"
- **Optimal timing**: "You usually do admin tasks on Fridays"
- **Dependencies**: "Wait for the design review to complete first"

```
Defer "Update documentation" to when?

Suggested: Thursday
  "You have a 2-hour focus block and lighter workload"

Alternatives:
  • Friday (similar workload)
  • Next Monday (start of week)
```

## Repeat Pattern Detection

### How It Works

The system notices when you create similar tasks repeatedly and offers to convert them into repeating tasks.

**Detection criteria:**
- At least 3 similar tasks created
- Regular intervals between creations (daily, weekly, monthly, etc.)
- Similar titles or content

### Pattern Types Detected

| Pattern | Example |
|---------|---------|
| Daily | "Morning standup notes" created every workday |
| Weekly | "Weekly team sync" created every Monday |
| Monthly | "Monthly report" created first of each month |
| Custom | "Water plants" created every 3 days |

### User Experience

When a pattern is detected, the user sees a suggestion:

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

Users can:
- Accept the suggestion and create a repeating task
- Dismiss temporarily ("Not Now")
- Permanently dismiss for this pattern ("Never Ask")

## Calendar-Aware Scheduling

### Calendar Integration

When connected to a calendar, the system understands your real availability:

**Work hours configuration:**
- Start/end times (e.g., 9 AM - 5 PM)
- Work days (e.g., Monday-Friday)
- Buffer time between events (e.g., 15 minutes)

### Finding Available Time

The system identifies different types of availability:

| Window Type | Description | Best For |
|-------------|-------------|----------|
| Focus block | 60+ minutes uninterrupted | Deep work, writing |
| Fragmented | 15-60 min between meetings | Quick tasks, admin |
| Buffer | Small gaps (< 15 min) | Very quick wins only |

**Example availability view:**
```
Today's availability:

9:00-10:30 AM   Focus block (1.5 hrs)
  ↳ Great for: Write quarterly report

11:00-11:30 AM  Fragmented (30 min)
  ↳ Great for: Review pull requests

2:00-4:00 PM    Focus block (2 hrs)
  ↳ Great for: Design document, planning
```

## Workload Balancing

### Workload Analysis

The system analyzes your scheduled work to show utilization by day:

**Workload status levels:**
| Status | Utilization | Meaning |
|--------|-------------|---------|
| Light | < 50% | Plenty of capacity |
| Balanced | 50-80% | Healthy workload |
| Heavy | 80-100% | Near capacity |
| Overloaded | > 100% | More work than available time |

### Workload View

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

### Rebalancing Suggestions

When overloaded days are detected, the system suggests ways to rebalance:

**Rebalancing actions:**
- **Move**: Shift a task to a lighter day
- **Defer**: Push a non-urgent task to later
- **Split**: Break a large task across multiple days

The system only suggests moving tasks that:
- Are not due on the overloaded day
- Are not blocked by dependencies
- Can fit in the destination day's available time

## Deadline Risk Prediction

### Risk Assessment

The system proactively identifies tasks at risk of missing their deadline based on:
- Available work hours until due date
- Estimated task duration
- Other scheduled commitments
- Historical completion patterns
- Dependencies that must complete first

### Risk Levels

| Level | Meaning | Indicator |
|-------|---------|-----------|
| Low | More than 2x buffer time | Green |
| Medium | 1-2x buffer time | Yellow |
| High | Less than 1x buffer time | Orange |
| Critical | Not enough time to complete | Red |

### Risk Factors

The system explains why a task is at risk:

```
Task: Complete project proposal
Due: Friday 5 PM
Risk: HIGH ⚠️

Risk factors:
• Estimated 4 hours, but only 3 available hours
• 2 blocking tasks must finish first (+2 hrs)
• You typically run 25% over estimates
• Heavy meeting schedule Thursday

Mitigation options:
• Start today instead of waiting
• Reschedule Thursday meetings
• Ask for deadline extension
```

## User Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Auto-estimate durations | On | Show duration estimates on tasks |
| Suggest optimal timing | On | Offer scheduling suggestions |
| Detect repeat patterns | On | Notice and suggest repeating tasks |
| Workload alerts | On | Warn when days are overloaded |
| Max tasks per day | 15 | Threshold for overload warnings |
| Target utilization | 75% | Ideal daily capacity usage |
| Buffer between tasks | 15 min | Gap between scheduled items |
| Work hours | 9 AM - 5 PM | When you're available for work |
| Work days | Mon-Fri | Days to include in scheduling |

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
