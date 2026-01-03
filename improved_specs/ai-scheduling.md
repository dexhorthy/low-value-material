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

The system estimates duration by learning from your patterns:

- **Similar tasks you've done**: How long similar tasks took in the past
- **Your work patterns**: How much time you typically spend on different types of work
- **Task complexity**: AI assessment of the effort required

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

The system improves over time by learning from your actual task completion times. As you complete tasks, estimates become more accurate for similar work in the future.

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

The system suggests timing based on:

- **Your productivity patterns**: When you typically complete similar types of work
- **Your calendar**: Gaps and focus time between meetings
- **Task requirements**: High-focus work when you have uninterrupted time
- **Urgency**: Tighter deadlines get priority consideration

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

The system recognizes when you're creating similar tasks on a regular schedule and offers to automate them.

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

When connected to a calendar, the system understands your real availability by knowing:

- Your work hours
- Your working days
- Time needed between meetings (buffer/transition time)

### Finding Available Time

The system identifies different types of time blocks and suggests appropriate tasks for each:

- **Uninterrupted focus time**: For deep work and complex tasks
- **Fragmented windows**: For quick tasks and administrative work
- **Small gaps**: For very quick wins that fill spare moments

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

The system analyzes your scheduled work to show if your days are balanced:

**Workload status levels:**
| Status | Meaning |
|--------|---------|
| Light | Plenty of free time |
| Balanced | Healthy amount of scheduled work |
| Heavy | Nearing your capacity |
| Overloaded | More work scheduled than available time |

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

The system considers task dependencies, due dates, and available time when making suggestions.

## Deadline Risk Prediction

### Risk Assessment

The system proactively identifies tasks at risk of missing their deadline by comparing:
- Estimated time needed
- Available time before the deadline
- Other commitments you've already scheduled

### Risk Levels

| Level | Meaning |
|-------|---------|
| Low | Plenty of time to complete |
| Medium | Doable but getting tight |
| High | At risk without changes |
| Critical | Not enough time remaining |

### Risk Factors

The system explains why a task is at risk and suggests actions to mitigate:

```
Task: Complete project proposal
Due: Friday 5 PM
Risk: HIGH ⚠️

Why at risk:
• Estimated time is close to available time
• Blocking tasks need to complete first
• Heavy meetings scheduled before deadline

Options to reduce risk:
• Start working today
• Reschedule some meetings
• Request a deadline extension
```

## User Settings

Users can configure:

| Setting | Description |
|---------|-------------|
| Duration estimates | Enable/disable estimated task durations |
| Timing suggestions | Enable/disable scheduling recommendations |
| Repeat detection | Detect and suggest repeating tasks |
| Workload alerts | Warn when scheduled work exceeds capacity |
| Work availability | Set your work hours and available days |
| Task spacing | Preferred gaps between scheduled items |
| Capacity targets | How much of your day to fill with scheduled work |

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
