# AI-Powered Task Suggestions Specification

This specification extends `specs/availability.md`, `specs/forecast.md`, and `specs/perspectives.md` with intelligent task recommendation capabilities. The system answers "What should I work on next?" using context, patterns, and priorities.

## Overview

Traditional task managers show what's available. AI-native suggestions actively recommend what to work on based on:
- **Urgency**: Due dates, overdue status, deadline risk
- **Context**: Time of day, location, calendar, energy level
- **Patterns**: When user typically does certain tasks
- **Dependencies**: What unblocks other work
- **Effort**: Task duration vs available time

## Context Signals

The system uses real-time context to personalize suggestions:

### Time Context
- Current time of day (morning, afternoon, evening, night)
- Day of week
- Proximity to scheduled events

### Location Context
- Current location compared to location-tagged tasks
- Tags like `@office`, `@home`, `@errands` matched to user's position

### Calendar Context
- Time until next commitment
- Available free blocks
- Busy vs light days

### Energy Context
- User-provided energy level (high, medium, low)
- Or inferred from time patterns

### Recent Activity
- Tags and projects recently worked on
- Number of tasks completed this session

## Why Tasks Are Suggested

Each suggestion includes an explanation. Common reasons include:

**Urgency Reasons**
- Overdue - task is past its due date
- Due today - task must be completed today
- Due soon - deadline approaching within configured threshold
- Deadline risk - not enough time to complete before due date

**Context Reasons**
- Location match - you're at or near the tagged location
- Time of day match - this type of task fits the current time
- Calendar fit - task duration fits your available free time
- Energy match - task complexity matches your current energy

**Pattern Reasons**
- Typical time - you usually do this type of task at this time
- Routine task - part of your regular workflow
- Similar context - past completions happened in similar situations

**Productivity Reasons**
- Quick win - short task you can knock out quickly
- Unblocks others - completing this enables other tasks
- Project momentum - keeps an active project moving
- Stalled project - project hasn't had progress recently

**Variety Reasons**
- Different project - balance work across projects
- Different tag - avoid task fatigue from repetition

## Task Ranking

The system ranks tasks to show the most important first, balancing several considerations:

**What matters when ranking tasks:**
- **Urgency**: Overdue tasks and approaching deadlines come first
- **Context match**: Tasks suited to your current situation (location, time, energy level)
- **Your patterns**: Tasks you typically do at this time of day or in similar situations
- **Practical fit**: Whether you have enough time to actually start and make progress
- **Unblocking value**: Whether completing this task enables other important work

### Urgency Levels

| Situation | Priority |
|-----------|----------|
| Overdue | Highest |
| Due within 24 hours | Very High |
| Due within 48 hours | High |
| Due this week | Medium |
| Future or no due date | Lower |

### Balancing Suggestions

To avoid overwhelming you with suggestions from only one project or type of work, suggestions are diversified across:
- Different projects and areas
- Different task types
- Quick wins alongside deeper work

## Deadline Risk Assessment

The system proactively warns about tasks at risk of missing their deadline.

### Risk Levels

| Level | Meaning | Visual |
|-------|---------|--------|
| Low | More than 2x buffer time | Green |
| Medium | 1-2x buffer time | Yellow |
| High | Less than 1x buffer time | Orange |
| Critical | Not enough time to complete | Red |

### Understanding Risk

The system flags tasks at risk when there isn't enough time or resources to complete them. When you see a risk warning, it means you should consider:
- Starting sooner rather than waiting
- Asking for a deadline extension
- Breaking the task into smaller pieces
- Rescheduling other commitments

**Example:**
```
Task: Complete project proposal
Due: Friday 5 PM
Risk: HIGH

This task needs more time than you have available with your current
commitments. Consider starting today or discussing a deadline extension.
```

## Proactive Surfacing

### Morning Briefing

A daily summary shown when the user starts their day:

**Contents:**
- Greeting and date
- Count of overdue tasks
- Tasks due today
- Tasks at risk of missing deadline
- Top 3-5 suggested focus tasks
- Quick wins (tasks under 15 minutes)
- Calendar overview (busy hours, free blocks)
- Workload assessment (light, normal, heavy, overloaded)
- Recommendations if overloaded

### Smart Notifications

Suggestions can be triggered at optimal moments:

| Trigger | Example |
|---------|---------|
| Location arrival | "You're near downtown - pick up dry cleaning?" |
| Calendar gap | "You have 30 minutes free - here's a quick task" |
| Energy window | "Morning is your best time for deep work" |
| Deadline approaching | "This task is due in 4 hours" |
| Context change | "Now that you're home, here are your @home tasks" |

## User Interface

### "What's Next?" Widget

```
┌─────────────────────────────────────────────┐
│ What's Next?                        [Refresh]│
├────────────────────────────────────────���────┤
│                                              │
│ Submit quarterly report                      │
│    Overdue • Due yesterday                   │
│    [Start] [Reschedule]                      │
│                                              │
│ Review pull request                          │
│    Quick win • 10 min before your meeting    │
│    [Start] [Skip]                            │
│                                              │
│ Pick up dry cleaning                         │
│    You're near downtown                      │
│    [Start] [Not now]                         │
│                                              │
│ ────────────────────────────────────────     │
│ 3 tasks at risk • 2 overdue                  │
│ [View all suggestions]                       │
└─────────────────────────────────────────────┘
```

### Inline Suggestions in Perspectives

Suggestions can appear contextually within task views:

```
Today
├── Due Today (3)
│   └── ...
├── Suggested (2)
│   ├── Quick email reply (fits your 10 min gap)
│   └── Call dentist (typical time for calls)
└── Flagged (1)
    └── ...
```

### Suggestion Actions

Users can respond to suggestions:
- **Start** - Begin working on the task
- **Skip/Not now** - Dismiss temporarily
- **Snooze 1h** - Hide for one hour
- **Snooze today** - Hide until tomorrow
- **Never suggest** - Stop suggesting this specific task

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Enable suggestions | On | Show AI-powered task suggestions |
| Suggestion count | 5 | Maximum suggestions to display |
| Auto-refresh | On | Update suggestions when context changes |
| Morning briefing | On | Show daily summary on first open |
| Risk warnings | On | Warn about tasks at risk of missing deadline |
| Location-aware | On | Use location to match tagged tasks |
| Calendar-aware | On | Consider calendar when suggesting |
| Learn patterns | On | Improve suggestions based on your habits |
| Energy tracking | Off | Prompt for current energy level |
| Custom weights | Defaults | Adjust scoring factor weights |

## Privacy

- Location data processed locally when possible
- Pattern learning stored on-device by default
- No task content shared externally for suggestions
- User can disable any context source individually
- Option to clear all learned patterns

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
- `improved_specs/ai-scheduling.md` - Duration estimation and scheduling

## Sources

- [AI Task Prioritization Guide](https://www.averi.ai/guides/how-ai-improves-task-prioritization-step-by-step)
- [Smart Task Prioritization](https://gibion.ai/blog/smart-task-prioritization-ai-decides-what-matters/)
- [AI Task Managers 2025](https://monday.com/blog/task-management/ai-task-manager/)
- [AI-Enhanced Productivity](https://taskfire.io/ai-enhanced-productivity/)
- [Recommendation Systems](https://www.nvidia.com/en-us/glossary/recommendation-system/)
