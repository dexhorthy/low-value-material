# AI-Enhanced Forecast View Specification

This specification extends `specs/forecast.md` with AI-powered day planning capabilities. The Forecast view becomes an intelligent planning hub that not only shows what's coming but actively helps optimize and plan your time.

## Overview

Traditional Forecast views show dates and items passively. AI-native Forecast transforms into an active planning assistant:

- **Auto-generated daily plans**: AI creates optimized schedules by placing tasks into time slots
- **Smart time blocking**: Automatic focus time protection and task scheduling
- **Visual workload analysis**: See capacity and commitments at a glance
- **Intelligent rescheduling**: Automatic adjustment when plans change
- **Predictive insights**: Understand consequences of current trajectory
- **Weekly planning assistant**: AI-guided weekly review and planning

## AI-Generated Daily Plans

### What Users See

Instead of just a list of due items, Forecast can generate a complete daily plan with tasks placed into specific time slots:

**Example:**
```
Wednesday, January 8 - Your Day

📊 Capacity: 5h 30m available / 4h 45m planned (86%)

Morning Focus Block (9:00 - 11:30)
├── 9:00   Write quarterly report (2h)
│           "Your most productive time for writing"
└── 11:00  Review pull requests (30m)
            "Quick task before standup"

11:30 Team Standup (calendar)

Afternoon (1:00 - 5:00)
├── 1:00   Client call (1h, calendar)
├── 2:00   Design review prep (45m)
│           "Blocks the 3pm meeting"
├── 2:45   Buffer time
└── 3:00   Design review (1h, calendar)

4:00 - 5:00 Open
├── Suggested: Quick email replies (15m)
└── Suggested: Process inbox (30m)

Evening (after 5:00)
└── Personal: Gym @gym (deferred to today)
```

### Plan Generation

When a user opens Forecast or requests a daily plan, the system creates an optimized schedule by considering:

**Task factors:**
- Due dates and deadlines
- Estimated durations
- Dependencies between tasks
- Task type (deep work vs shallow work)
- User tags and contexts

**Calendar factors:**
- Existing meetings and commitments
- Buffer time between meetings
- Work hours and availability
- Focus time preferences

**Personal factors:**
- Productivity patterns (when user does best work)
- Energy levels throughout the day
- Historical completion patterns
- Preferred task sequencing

### Plan Acceptance Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 📅 Your Day Plan for Wednesday                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ AI has scheduled 6 tasks across your available time.        │
│                                                              │
│ ✅ 2 deep work items in morning focus block                 │
│ ✅ All meetings have prep time allocated                    │
│ ✅ Buffer time between context switches                     │
│ ⚠️ 45 minutes unallocated (room for overflow)              │
│                                                              │
│ [Accept Plan]  [Adjust]  [Show as List Only]                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

Users can:
- **Accept Plan** - Commits time blocks to calendar/schedule
- **Adjust** - Opens interactive editor to modify the plan
- **Show as List Only** - View traditional Forecast without time blocking

## Smart Time Blocking

### Automatic Block Creation

The system creates different types of time blocks:

| Block Type | Purpose | Characteristics |
|------------|---------|-----------------|
| Focus Block | Deep work on complex tasks | 90-120 min, no interruptions |
| Task Block | Working through scheduled tasks | Variable length, includes buffer |
| Buffer Block | Transition and overflow time | 15-30 min between contexts |
| Admin Block | Quick tasks, emails, admin | Fragmented time, short items |
| Recovery Block | Breaks and energy restoration | After intense focus periods |

### Focus Time Defense

The system protects focus time by:
- Scheduling deep work during peak productivity hours
- Creating buffer zones around focus blocks
- Warning when meetings would fragment focus time
- Suggesting meeting alternatives that preserve focus

**Example warning:**
```
⚠️ Accepting this 10:30 meeting will fragment your morning focus block

Current plan: 9:00 - 12:00 focus time (3 hours)
With meeting: 9:00 - 10:15 + 11:15 - 12:00 (2 hours, fragmented)

Options:
• Suggest 8:30 AM instead (preserves focus)
• Suggest 1:00 PM instead (afternoon slot)
• Accept anyway
```

### Intelligent Task Placement

When users add a new task or drag an existing one, the system suggests optimal placement:

```
Task: Prepare presentation (1.5h)

Suggested slots:
┌────────────────────────────────────────────────┐
│ 1. Tomorrow 9:00 - 10:30 AM ★★★★★             │
│    "Morning focus block, matches your          │
│    presentation prep pattern"                  │
├────────────────────────────────────────────────┤
│ 2. Today 3:00 - 4:30 PM ★★★★☆                 │
│    "Available after your 2pm call,            │
│    but afternoon energy may be lower"          │
├────────────────────────────────────────────────┤
│ 3. Wednesday 2:00 - 3:30 PM ★★★☆☆            │
│    "Open slot, but close to deadline"          │
└────────────────────────────────────────────────┘
```

## Visual Workload Analysis

### Enhanced Piano Keys

The traditional date timeline is enhanced with capacity visualization:

```
        Mon    Tue    Wed    Thu    Fri    Sat    Sun
       ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐
Tasks  │  4  │  7  │  3  │  5  │  2  │  -  │  -  │
       ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤
Cap %  │ 65% │120% │ 45% │ 80% │ 30% │  -  │  -  │
       │ ███ │▓▓▓▓▓│ ██  │████ │ █   │     │     │
       │     │ ⚠️  │     │     │     │     │     │
       └─────┴─────┴─────┴─────┴─────┴─────┴─────┘

        █ = scheduled work    ▓ = overcommitted
```

### Capacity Indicators

Each day shows:
- Task count badge (as before)
- Capacity percentage bar
- Visual warning for overloaded days
- Color coding: green (light), yellow (full), red (over)

### Workload Heatmap View

An alternative visualization showing the full week's capacity:

```
┌─────────────────────────────────────────────────────────────┐
│ Week of January 6                                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Mon │▓▓▓▓▓▓▓▓░░│ 8h scheduled / 6h available               │
│ Tue │▓▓▓▓▓▓▓▓▓▓│ 10h scheduled / 6h available ⚠️ OVER      │
│ Wed │████░░░░░░│ 4h scheduled / 6h available                │
│ Thu │██████░░░░│ 6h scheduled / 6h available ✓ FULL         │
│ Fri │██░░░░░░░░│ 2h scheduled / 6h available                │
│                                                              │
│ 💡 Tuesday is overbooked by 4 hours                         │
│                                                              │
│ [Auto-balance Week]  [View Suggestions]                     │
└─────────────────────────────────────────────────────────────┘
```

## Intelligent Rescheduling

### Automatic Adjustment

When circumstances change, the system automatically proposes adjustments:

**Triggers for rescheduling:**
- New meeting added that conflicts with planned task
- Task takes longer than estimated
- Task is marked complete early
- User indicates they're blocked on something
- Calendar event is cancelled or moved

### Cascade Rescheduling

When one item moves, the system adjusts dependent items:

```
┌─────────────────────────────────────────────────────────────┐
│ 🔄 Plan Adjustment Needed                                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Your 2pm call extended by 30 minutes.                       │
│                                                              │
│ Current impact:                                              │
│ • "Design review prep" pushed to 2:45 PM (was 2:15 PM)     │
│ • "Email replies" moved to tomorrow (no time today)        │
│                                                              │
│ Suggested adjustment:                                        │
│ • Move "Email replies" to tomorrow 9:00 AM                  │
│ • Your day still ends on time                               │
│                                                              │
│ [Accept Changes]  [Adjust Manually]  [Keep Original]        │
└─────────────────────────────────────────────────────────────┘
```

### Proactive Warnings

The system warns before problems occur:

```
⚠️ Running Behind Schedule

You're 25 minutes behind on today's plan.

At this pace:
• "Review PRs" will push to tomorrow
• You'll miss your 5pm deadline for "Send report"

Options:
• Shorten remaining tasks by 25 min total
• Move "Review PRs" to tomorrow now
• Extend your work day by 25 minutes
```

## Predictive Insights

### Day Outcome Prediction

The system predicts what will happen based on current trajectory:

```
📊 Day Trajectory

If you continue at current pace:
✅ 4 of 6 tasks will complete
⚠️ "Send report" at risk (due 5pm, only 45 min available)
❌ "Review PRs" will not fit today

Likely end state:
• 2 tasks move to tomorrow
• Tomorrow capacity increases to 95%

[View Tomorrow Impact]  [Adjust Plan]
```

### What-If Scenarios

Users can explore consequences of decisions:

```
What if I take this call at 2pm?

Impact:
• Loses 1h of deep work time
• "Design review prep" must move
• Tomorrow gets 30 min busier

Alternatives:
• Propose 4pm instead (minimal impact)
• Propose tomorrow 10am (no impact today)
```

### Weekly Lookahead

At week start, provide predictive overview:

```
┌─────────────────────────────────────────────────────────────┐
│ 📆 Week Ahead - January 6-10                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Scheduled: 28 hours of tasks                                │
│ Available: 32 hours (after meetings)                        │
│ Buffer: 4 hours (12%)                                       │
│                                                              │
│ Concerns:                                                    │
│ • Tuesday is overbooked (needs 2h moved)                    │
│ • "Project proposal" due Friday, not started                │
│ • No focus time scheduled Wednesday                         │
│                                                              │
│ Recommendations:                                             │
│ • Start "Project proposal" by Wednesday                     │
│ • Move 2 tasks from Tuesday to Friday                       │
│ • Block 2h focus time Wednesday morning                     │
│                                                              │
│ [Apply Recommendations]  [Plan Week Manually]               │
└─────────────────────────────────────────────────────────────┘
```

## Weekly Planning Mode

### AI-Assisted Weekly Review

A structured weekly planning session with AI guidance:

**Step 1: Review Last Week**
```
Last Week Summary:
• Completed: 23 of 28 tasks (82%)
• On time: 19 tasks
• Rescheduled: 5 tasks
• Average accuracy of estimates: 85%

Patterns noticed:
• Monday tasks often moved to Tuesday
• Afternoon focus blocks rarely completed
• You work best before 11am
```

**Step 2: Assess Incoming**
```
This Week's Incoming:
• 15 tasks due this week
• 8 tasks deferred to this week
• 3 projects need attention
• 5 meetings scheduled

Estimated load: 34 hours
Your capacity: 30 hours

⚠️ You're 4 hours overcommitted
```

**Step 3: Prioritize and Schedule**
```
Let's plan your week. I suggest:

Must do (deadlines):
☐ Client proposal (due Wed) - Schedule Tuesday AM
☐ Tax documents (due Fri) - Schedule Thursday

Should do (important):
☐ Team 1:1 prep - Schedule before meetings
☐ Code review backlog - Spread across week

Could defer:
☐ Reorganize files - Move to next week?
☐ Research new tools - Move to next week?

[Accept Suggestions]  [Adjust]  [Plan Manually]
```

### Week Balance Optimization

The system can automatically rebalance the week:

```
[Auto-balance Week] clicked

Rebalancing 34 hours across 30 available...

Changes made:
• Moved 2 tasks from Tuesday to Friday (-2h Tue, +2h Fri)
• Shortened buffer times from 30min to 15min (+1.5h)
• Suggested deferring "Research tools" to next week (-1h)

New balance:
Mon: 6h | Tue: 5h | Wed: 6h | Thu: 6h | Fri: 7h

[Accept]  [Undo]  [Adjust]
```

## Day View Enhancements

### AI Commentary

Each day includes AI-generated insights:

```
Wednesday, January 8

💡 AI Insights:
• "Heavy meeting day - protect your 9am focus block"
• "You have 45 min before standup - great for quick tasks"
• "Consider prepping for the 3pm review during lunch"

📅 Calendar Events
   11:30 AM  Team standup
    3:00 PM  Design review

📌 Scheduled Tasks
   9:00 AM   Write quarterly report (2h)
   2:00 PM   Design review prep (45m)

⏰ Available Tasks
   Quick email replies
   Process inbox
```

### Smart Filtering

Forecast can intelligently filter what to show:

```
View Options:
• [x] Show only tasks that fit available time
• [x] Hide tasks blocked by dependencies
• [ ] Show all tasks regardless of schedule
```

### Time Slot Suggestions

When viewing an open slot, the system suggests appropriate tasks:

```
3:00 - 4:30 PM (1.5 hours available)

Good fits for this slot:
├── Prepare presentation (1.5h) - exact match
├── Review pull requests (30m) + Process inbox (45m) - combo
└── Code review (1h) + buffer time

[Schedule "Prepare presentation"]
[Build custom block]
```

## Calendar Integration Enhancements

### Smart Event Detection

The system understands calendar event types:

| Event Type | System Response |
|------------|-----------------|
| Meeting | Block time, suggest prep task |
| Focus time | Protect, assign deep work |
| Travel | Add buffer, suggest mobile tasks |
| Personal | Respect work boundaries |
| Tentative | Plan around but don't commit |

### Drag-to-Calendar Intelligence

When dragging a task to the calendar:

```
Dropping "Write proposal" onto Wednesday 2pm...

Suggestion:
• Duration: 2 hours (based on similar tasks)
• Calendar event: "Focus: Write proposal"
• Buffer: 15 min before next commitment
• Block as: Busy (protects your time)

[Create Event]  [Adjust Duration]  [Cancel]
```

### Two-Way Sync

Calendar changes automatically update the plan:
- New meeting → Reschedule affected tasks
- Cancelled meeting → Suggest tasks for freed time
- Meeting moved → Cascade adjustments

## Mobile Experience

### Quick Day View

Simplified mobile interface:

```
┌─────────────────────────────────────┐
│ Wednesday                    [Plan] │
├─────────────────────────────────────┤
│ Now: Team standup (ends 12:00)     │
│                                     │
│ Up Next:                            │
│ 12:00 Lunch break                   │
│ 1:00  Design review prep (45m)     │
│ 2:00  Buffer                        │
│ 3:00  Design review                 │
│                                     │
│ ────────────────────────────────    │
│ 4 tasks remaining today             │
│ Capacity: 65% used                  │
└─────────────────────────────────────┘
```

### Quick Reschedule

Swipe actions for fast adjustments:
- Swipe right: Mark complete
- Swipe left: Quick reschedule (tomorrow, next week)
- Long press: Full editing options

### Widget Support

Home screen widget showing:
- Next scheduled item
- Tasks remaining today
- Capacity indicator
- Quick access to add/plan

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Auto-generate daily plans | Off | Create plans automatically each morning |
| Show capacity in timeline | On | Display workload percentage on piano keys |
| Focus time protection | On | Warn when focus blocks would be fragmented |
| Auto-reschedule | Ask | Automatically adjust or prompt when plans change |
| Weekly planning prompt | On | Prompt for weekly planning session |
| Buffer between tasks | 15 min | Default transition time between scheduled items |
| Work hours | 9-5 | Hours considered for planning |
| Focus block minimum | 90 min | Minimum time to create a focus block |
| Show AI insights | On | Display AI commentary and suggestions |
| Predictive warnings | On | Warn about trajectory issues |

## Privacy Considerations

- Calendar data used for scheduling stays local when possible
- AI insights generated without sending task content to external services when configured for local processing
- Work patterns learned on-device
- Option to disable pattern learning entirely
- Clear data option for all learned preferences

## Edge Cases

### No Tasks Scheduled
- Show suggested tasks to plan
- Offer to pull from inbox or someday/maybe
- Display "Clear day - nice work!"

### All Tasks Overdue
- Prioritize by severity
- Suggest realistic catch-up plan
- Offer to batch reschedule with new dates

### Calendar Unavailable
- Fall back to simple task list
- Note that plan accuracy is reduced
- Offer to manually enter commitments

### Conflicting Deadlines
- Surface the conflict clearly
- Help prioritize which to address
- Suggest negotiating deadline changes

### User Rejects All Plans
- Remember preference for manual planning
- Still show capacity and insights
- Offer suggestions without auto-scheduling

## Related Specifications

- `specs/forecast.md` - Base forecast functionality
- `improved_specs/ai-scheduling.md` - Duration estimation and timing
- `improved_specs/ai-suggestions.md` - Task recommendations
- `improved_specs/ai-notifications.md` - Smart reminders
- `improved_specs/mcp-integration.md` - Calendar integration

## Sources

- [Reclaim.ai](https://reclaim.ai/) - AI calendar automation
- [Motion](https://www.usemotion.com/) - AI scheduling and time blocking
- [Trevor AI](https://www.trevorai.com) - AI day planning
- [Clockwise](https://www.getclockwise.com/) - Intelligent calendar management
- [Time Blocking Guide 2025](https://reclaim.ai/blog/time-blocking-guide)
- [AI Time Blocking Guide](https://www.usemotion.com/blog/ai-time-blocking)
