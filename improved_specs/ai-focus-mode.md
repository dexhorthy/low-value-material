# AI-Powered Focus Mode Specification

This specification extends `specs/focus-mode.md` with intelligent focus session management. The system helps users enter deep work states at optimal times, suggests appropriate focus scopes, and learns from work patterns to maximize productivity.

## Overview

Traditional focus mode is manual—users select what to focus on and when. AI-native focus mode is proactive and adaptive:

- **Smart initiation**: Suggests when to start focus sessions
- **Scope intelligence**: Recommends what to focus on based on context
- **Deep work detection**: Automatically recognizes and protects flow states
- **Adaptive duration**: Learns optimal session lengths per user and task type
- **System integration**: Syncs with OS-level Focus modes across devices
- **Break optimization**: Schedules breaks at natural stopping points

## Core Focus Functionality

### Focus State

Focus mode narrows the app to selected projects or folders. While focused, all perspectives show only items within the focused scope.

| Field | Type | Description |
|-------|------|-------------|
| `is_focused` | Boolean | Whether focus is active |
| `focused_items` | UUID[] | IDs of focused projects/folders |
| `session_start` | Timestamp | When current session started |
| `session_type` | Enum | `manual`, `suggested`, `automatic` |
| `planned_duration` | Integer | Expected session length in minutes |

### Focus Scope Options

Focus can include:
- One or more projects
- One or more folders
- Mix of projects and folders
- Items contained within focused folders are automatically included

### Focus Operations

**Enter Focus**
- Accept project and/or folder IDs
- Optionally specify planned duration
- Track session start time

**Exit Focus (Unfocus)**
- Clear focus state
- Record session completion
- Log session metrics for learning

**Toggle Focus**
- If unfocused: focus on items
- If focused on same items: unfocus
- If focused on different items: change focus

**Expand/Narrow Focus**
- Add items to current focus scope
- Remove items from focus scope
- If last item removed, unfocus entirely

## AI-Suggested Focus Sessions

The system proactively recommends when and what to focus on.

### Suggestion Triggers

| Trigger | Example |
|---------|---------|
| Calendar availability | "You have 2 hours free—ready for deep work?" |
| Task urgency | "Report due tomorrow—focus session recommended" |
| Time of day | "It's your typical morning focus time" |
| Pattern recognition | "You usually focus on Marketing now" |
| Workload assessment | "Heavy deadline day—let's plan focus blocks" |
| Context change | "Work Focus just activated—ready to focus?" |

### Focus Session Suggestions

```
┌─────────────────────────────────────────────────────┐
│ Ready for Deep Work?                                │
├─────────────────────────────────────────────────────┤
│                                                     │
│ You have 90 minutes before your next meeting.       │
│                                                     │
│ Suggested Focus: Q4 Planning                        │
│ Why: 3 tasks due this week, this is your peak time  │
│                                                     │
│ [Start 60-min Session]  [Start 90-min Session]      │
│ [Choose Different Scope]  [Not Now]                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Scope Recommendations

The system suggests focus scope based on:

**Urgency signals**
- Tasks with approaching deadlines
- Overdue items needing attention
- High-priority flagged tasks

**Context signals**
- Projects you typically work on at this time
- Tags matching your current situation
- Recent activity and momentum

**Workload signals**
- Projects with the most remaining work
- Stalled projects needing attention
- Quick-win opportunities

### Recommendation UI

```
┌─────────────────────────────────────────────────────┐
│ What should you focus on?                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ○ Q4 Planning                        [Recommended]  │
│   3 tasks due this week • your morning focus area   │
│                                                     │
│ ○ Client Project A                                  │
│   Stalled for 3 days • 2 tasks ready to work        │
│                                                     │
│ ○ Marketing                                         │
│   5 available tasks • matches your energy level     │
│                                                     │
│ ○ Choose manually...                                │
│                                                     │
│ [Start Focus]                                       │
└─────────────────────────────────────────────────────┘
```

## Automatic Deep Work Detection

The system recognizes when you enter a flow state and protects it.

### Flow State Indicators

The system monitors for signs of deep work:
- Sustained task activity without context switching
- Long periods without app switching
- Sequential completions within same project
- Extended time on single complex task

### Automatic Protection

When deep work is detected:
- Suppress non-urgent notifications
- Defer incoming distractions
- Optionally activate system DND
- Shield the session from interruptions

### Detection Sensitivity

| Setting | Behavior |
|---------|----------|
| Aggressive | Detect flow after ~10 min of focused activity |
| Balanced | Detect flow after ~20 min of focused activity |
| Conservative | Detect flow after ~30 min of focused activity |
| Off | Never automatically detect flow |

### Flow Protection UI

```
┌─────────────────────────────────────────────────────┐
│ Flow State Detected                                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│ You've been in deep work for 25 minutes.            │
│ Notifications paused to protect your flow.          │
│                                                     │
│ 2 notifications held • Next meeting in 45 min       │
│                                                     │
│ [Continue Focused]  [See Notifications]  [Exit Flow]│
└─────────────────────────────────────────────────────┘
```

## Adaptive Session Duration

The system learns optimal focus durations from your patterns.

### Duration Learning

The system tracks:
- Session lengths by project/tag type
- Natural break points (when you naturally pause)
- Productivity vs session length correlation
- Time of day effects on session duration

### Duration Recommendations

| Context | Typical Recommendation |
|---------|------------------------|
| Morning deep work | 60-90 minutes |
| Afternoon tasks | 25-45 minutes |
| Creative work | 45-90 minutes |
| Administrative tasks | 15-30 minutes |
| Before meetings | Time until meeting minus buffer |

### Adaptive Intervals

Rather than fixed Pomodoro intervals, the system suggests durations based on:
- Your historical patterns for this type of work
- Available time until next commitment
- Complexity of tasks in scope
- Your current energy level

```
Suggested session: 52 minutes
Based on: Your average focus on Marketing is 48-55 min
Available time: 75 min until standup
```

## System Focus Mode Integration

Bidirectional sync with iOS/macOS Focus modes.

### System-to-App Sync

When OS Focus activates, the app can respond:

| System Focus | App Response |
|--------------|--------------|
| Work | Focus on Work folder + suggest starting session |
| Personal | Focus on Personal folder |
| Do Not Disturb | Offer to start focus session |
| Sleep | No change (app likely closed) |
| Fitness | No change |
| Custom Focus | Map to configured folder/project |

### App-to-System Sync

When starting a focus session in the app:
- Optionally activate matching system Focus
- Sync notification filtering to OS level
- Coordinate DND across all devices

### Configuration

```
┌─────────────────────────────────────────────────────┐
│ System Focus Integration                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│ When system "Work" Focus activates:                 │
│ [✓] Auto-focus on: Work                             │
│ [✓] Suggest starting focus session                  │
│ [ ] Start session automatically                     │
│                                                     │
│ When starting focus session:                        │
│ [✓] Activate matching system Focus                  │
│ [ ] Always ask first                                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Smart Break Scheduling

AI-optimized breaks to maintain productivity without burnout.

### Break Recommendations

The system suggests breaks based on:
- Session duration and intensity
- Natural stopping points in tasks
- Upcoming calendar events
- Accumulated focus time today
- Signs of fatigue (slower completion, more errors)

### Break Types

| Type | Duration | When Suggested |
|------|----------|----------------|
| Micro-break | 2-5 min | After 25-30 min of focus |
| Short break | 5-15 min | After 50-60 min of focus |
| Long break | 15-30 min | After 2-3 hours of focus |
| Activity break | 10-20 min | After detecting sedentary pattern |

### Break Prompts

```
┌─────────────────────────────────────────────────────┐
│ Break Time?                                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│ You've been focused for 55 minutes.                 │
│ A 10-minute break would help maintain your energy.  │
│                                                     │
│ You just finished "Review proposal" - good          │
│ stopping point.                                     │
│                                                     │
│ [Take Break]  [5 More Minutes]  [Continue Working]  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Break Dismissal Learning

The system learns from your break decisions:
- If you consistently skip breaks after 45 min, adjust suggestion timing
- If you take breaks but shorter than suggested, adjust duration
- If you always take breaks after certain tasks, suggest breaks then

## Focus Session Analytics

Track and optimize focus patterns over time.

### Session Metrics

For each session:
- Duration (planned vs actual)
- Tasks completed
- Focus scope
- Interruptions count
- Time of day
- Day of week
- Session rating (optional user input)

### Pattern Insights

```
┌─────────────────────────────────────────────────────┐
│ Your Focus Patterns                                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│ This Week                                           │
│ ───────────────────────────────────                 │
│ Total focus time: 12.5 hours                        │
│ Sessions: 14                                        │
│ Avg session: 54 minutes                             │
│ Tasks completed: 28                                 │
│                                                     │
│ Peak Performance                                    │
│ ───────────────────────────────────                 │
│ Best time: 9-11 AM (2.3x more completions)          │
│ Best day: Tuesday                                   │
│ Best duration: 45-60 minutes                        │
│                                                     │
│ Recommendations                                     │
│ ───────────────────────────────────                 │
│ • Schedule important work 9-11 AM                   │
│ • Your Wednesday focus is 40% lower—protect it      │
│ • Sessions >75 min show declining productivity      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Trend Analysis

Over time, the system identifies:
- Optimal focus times by day and week
- Effective session durations by task type
- Correlation between breaks and productivity
- Impact of interruptions on output
- Seasonal or cyclical patterns

## Effect on Perspectives

### During Focus Sessions

All perspectives are filtered to focus scope:
- **Inbox**: Configurable (visible, hidden, or separate section)
- **Projects**: Only focused folders/projects visible
- **Tags**: Shows all tags but only tasks within focus scope
- **Forecast**: Only due/deferred items from focused scope
- **Review**: Only projects within focus scope
- **Custom perspectives**: Results intersected with focus scope

### Focus Bar

When focused, a persistent bar shows session status:

```
┌─────────────────────────────────────────────────────────────┐
│ Focused: Q4 Planning │ 34 min │ 3 completed │ [Pause][End] │
└─────────────────────────────────────────────────────────────┘
```

Components:
- Focus scope name
- Session duration
- Tasks completed this session
- Pause/End controls
- Optional: time remaining if planned duration set

## Voice & Natural Language

### Voice Commands

- "Start focus session" - Begin with AI-recommended scope
- "Focus on [project name]" - Focus on specific project
- "Focus for one hour" - Start timed session
- "End focus" or "Unfocus" - Exit focus mode
- "What should I focus on?" - Get AI recommendations
- "Take a break" - Pause session for break

### Natural Language Scope

- "Focus on work stuff" → Focus on Work folder
- "Focus on things due this week" → Focus on projects with imminent deadlines
- "Focus on client projects" → Focus on @client tagged items

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Cmd+Shift+F | Focus on selection / Unfocus |
| Cmd+Shift+Option+F | Add selection to focus |
| Cmd+Shift+B | Take break (pause session) |
| Cmd+Shift+S | Start suggested focus session |

## API & Automation

### REST API

```
POST /focus/start
Body: { scope_ids: [...], duration_minutes: 60 }

POST /focus/end

GET /focus/status
Response: { is_focused, scope, duration, tasks_completed }

GET /focus/suggestions
Response: { recommended_scope, reason, suggested_duration }

GET /focus/analytics
Query: { period: "week" }
```

### CLI Interface

```bash
# Start focus session
lvm focus start --scope "Work" --duration 60

# End focus session
lvm focus end

# Get focus suggestions
lvm focus suggest

# View analytics
lvm focus stats --period week
```

### Automation Triggers

| Event | Available Actions |
|-------|-------------------|
| System Focus activated | Start focus session, focus on scope |
| Calendar event starting | End focus session, take break |
| Location change | Suggest focus scope |
| Time trigger | Suggest focus session |
| Session completed | Log metrics, suggest break |

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `focus_suggestions` | On | Show AI focus session suggestions |
| `auto_flow_detection` | Balanced | Detect and protect flow states |
| `system_focus_sync` | On | Integrate with OS Focus modes |
| `break_reminders` | On | Suggest breaks during long sessions |
| `default_session_duration` | 45 min | Default when not specified |
| `inbox_during_focus` | visible | Show inbox while focused |
| `remember_focus` | false | Restore focus on app launch |
| `analytics_tracking` | On | Track session metrics |
| `voice_commands` | On | Allow voice control of focus |
| `auto_dnd` | Ask | Activate DND when focusing |

## Privacy

- Focus patterns analyzed locally by default
- No task content shared for focus suggestions
- System Focus status read but not stored
- Analytics stored on-device
- Option to disable all pattern learning
- Can clear focus history

## Edge Cases

### Conflicting System Focus
- If system Focus suggests different scope than user selects, user choice wins
- Show note about mismatched Focus contexts

### Very Short Sessions
- Sessions under 5 minutes not counted in analytics
- Don't suggest breaks for micro-sessions

### Interrupted Sessions
- Track interruptions separately from completed sessions
- Learn which interruption sources to block

### No Available Tasks in Scope
- Suggest expanding focus scope
- Or suggest different focus area
- Show "All caught up!" if truly empty

### Multiple Devices
- Focus state is per-device (not synced)
- Analytics can sync for unified insights
- System Focus sync handles cross-device coordination

## Related Specifications

- `specs/focus-mode.md` - Base focus functionality
- `specs/perspectives.md` - View framework
- `specs/project.md` - Project structure
- `specs/folder.md` - Folder hierarchy
- `improved_specs/ai-suggestions.md` - Task recommendations
- `improved_specs/ai-notifications.md` - Notification management
- `improved_specs/ai-scheduling.md` - Duration estimation

## Sources

- [AI Focus & Deep Work Tools 2025](https://www.taskfoundry.com/2025/06/best-ai-tools-for-focus-and-deep-work.html)
- [Reclaim AI Pomodoro Technique](https://reclaim.ai/blog/pomodoro-technique)
- [Pomodoro 2.0: AI-Optimized Intervals](https://skoodosbridge.com/blog/pomodoro-2-ai-optimized-study-intervals-attention-span)
- [iOS 18 Focus Mode Integration](https://medium.com/@bhumibhuva18/ios-18-focus-modes-the-secret-to-building-apps-users-actually-want-to-keep-486175211e34)
- [Apple Focus API](https://developer.apple.com/documentation/appintents/focus)
- [macOS Focus Mode Guide 2025](https://www.fileminutes.com/blog/everything-you-need-to-know-about-macos-focus-mode-2025/)
- [Zapier Pomodoro Apps 2025](https://zapier.com/blog/best-pomodoro-apps/)
- [Focuzed.io Energy-Based Planning](https://focuzed.io/blog/best-apps-for-focusing/)
