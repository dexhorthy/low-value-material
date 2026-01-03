# AI-Enhanced Settings & Preferences

This specification defines the intelligent settings system that adapts to user behavior, provides personalized recommendations, and simplifies preference management through AI-powered assistance.

## Overview

The AI settings system transforms static configuration into a dynamic, learning experience. Instead of overwhelming users with options, the system observes behavior, suggests optimizations, and adapts settings based on context and usage patterns.

Key capabilities:

- **Adaptive Settings**: Settings that auto-adjust based on context and behavior
- **Intelligent Recommendations**: AI suggests optimal settings based on usage patterns
- **Natural Language Configuration**: "Make my tasks easier to see" → appropriate changes
- **Settings Health Check**: Proactive identification of suboptimal configurations
- **Smart Onboarding**: AI-guided setup personalized to user goals
- **Profile Management**: Context-aware settings profiles (work, personal, travel)
- **Cross-Device Intelligence**: Smart sync decisions for device-appropriate settings

## Design Principles

1. **Progressive Disclosure**: Show simple settings first, reveal complexity when needed
2. **Learn Before Asking**: Observe behavior before prompting for preferences
3. **Explain Changes**: Always tell users why a setting is being suggested
4. **User Override**: AI suggestions are recommendations, not requirements
5. **Transparency**: Users can view what the system has learned about them
6. **Sensible Defaults**: Work well out of the box for most users

## Settings Categories

### Synced vs Local Settings

| Category | Synced | Rationale |
|----------|--------|-----------|
| Workflow preferences | Yes | Consistent task management approach |
| Organization rules | Yes | Same cleanup/processing logic everywhere |
| Date/time defaults | Yes | Consistent scheduling behavior |
| Appearance settings | No | Device-specific (screen size, ambient light) |
| Layout preferences | No | Device-specific (desktop vs mobile) |
| Notification settings | Partial | Some sync, delivery settings are device-specific |
| AI feature toggles | Yes | Consistent AI assistance across devices |
| AI learning data | Yes | Unified understanding of user patterns |

### Core Settings Groups

**General**: Outlining mode, shortcuts, interaction patterns
**Organization**: Inbox cleanup rules, project defaults, resolved item handling
**Appearance**: Color palette, font size, visual indicators, layout mode
**Dates & Times**: Default times, due soon threshold, timezone handling
**Notifications**: Delivery preferences, sounds, badges, briefing schedule
**Focus**: Focus persistence, inbox visibility during focus, search scope
**Quick Capture**: Entry layout, visible fields, default project/tags
**Sync**: Server configuration, automatic sync, push notifications
**AI Features**: Feature toggles, learning preferences, automation levels
**Privacy**: App lock, biometric unlock, data sharing preferences

## AI-Powered Settings Recommendations

### Behavioral Analysis

The system observes your usage patterns to identify optimization opportunities:

| Observation | Potential Recommendation |
|-------------|-------------------------|
| Often reschedule tasks to morning | "Your default defer time is midnight. Would you prefer 8:00 AM?" |
| Rarely use tags in certain project | "The 'Personal' project has low tag usage. Would you like automatic tag suggestions?" |
| Frequently override due soon threshold | "You often act on items 3+ days before due. Increase due soon threshold?" |
| High notification dismissal rate | "You dismiss 60% of notifications. Enable smarter bundling?" |
| Long review sessions | "Reviews average 45 min. Would you like shorter, more frequent reviews?" |
| Heavy evening task completion | "Most completions happen after 6pm. Adjust notification quiet hours?" |

### Recommendation Timing

Recommendations appear at appropriate moments:

| Timing | Example |
|--------|---------|
| After pattern detection | "You've rescheduled morning tasks 5 times this week..." |
| During relevant action | While changing defer time: "Most users in your timezone prefer 8am" |
| In periodic health check | Weekly: "3 settings could be optimized based on your usage" |
| After milestone | "You've completed 100 tasks! Here's how to level up your workflow..." |

### Recommendation Interface

When presenting recommendations:

```
┌─────────────────────────────────────────────────────────────┐
│ 💡 Settings Suggestion                                      │
│                                                             │
│ Your notification response time averages 3 hours during    │
│ work hours. Would you like notifications batched for       │
│ check-in windows instead of delivered immediately?         │
│                                                             │
│ What this does:                                             │
│ • Groups non-urgent notifications until 9am, 1pm, 5pm      │
│ • Urgent items still delivered immediately                  │
│ • Reduces interruptions by ~40%                            │
│                                                             │
│ [Try for 1 week]  [Apply permanently]  [Dismiss]  [Why?]  │
└─────────────────────────────────────────────────────────────┘
```

### Trial Periods

Users can try recommendations before committing:

- **1 week trial**: Temporary setting change with easy rollback
- **Progress tracking**: "Day 3 of trying batched notifications"
- **Outcome summary**: "During trial: 30% fewer interruptions, same completion rate"
- **One-click revert**: Return to previous setting instantly

## Adaptive Settings

### Context-Aware Adjustments

Some settings can adapt automatically based on context:

| Context | Adaptations |
|---------|-------------|
| **Work hours** | Show work projects/tags, work notification rules |
| **Personal time** | Personal projects prominent, work notifications silenced |
| **Travel** | Location tags surfaced, travel-friendly layouts |
| **Focus session** | Simplified interface, minimal distractions |
| **Low connectivity** | Aggressive sync on connection, offline-first behavior |
| **Low battery** | Reduce sync frequency, disable background features |

### Context Detection

The system infers context from:

- Time of day and day of week
- Calendar events (work meetings, personal appointments)
- Location (office, home, travel)
- Connected networks (work wifi, home wifi)
- System Focus modes (iOS/macOS Focus integration)
- Active applications (work apps vs personal apps)

### Adaptive Rules

Users can define context rules:

```
When: System Focus is "Work"
  → Show: Work folder, flagged items
  → Hide: Personal, Someday/Maybe
  → Notifications: Work projects only
  → Due soon threshold: 24 hours (tighter)

When: Location is "Home" AND after 6pm
  → Show: Personal, Home, Evening Routines
  → Hide: Work folder
  → Notifications: Critical only from work
```

## Natural Language Settings

### Conversational Configuration

Users can describe what they want in natural language:

| User Says | System Does |
|-----------|-------------|
| "Make my tasks easier to read" | Increases font size, enables full title display |
| "I want less notifications" | Enables bundling, increases thresholds, suggests digest mode |
| "Help me see what's urgent" | Enables due coloring, adjusts due soon threshold, surfaces flagged |
| "I work nights" | Adjusts default times, notification hours, briefing schedule |
| "Set up for a busy week" | Tightens due soon, enables workload alerts, suggests focus mode |
| "I don't use tags much" | Hides tag column, removes from quick capture fields |

### Natural Language Interface

```
┌─────────────────────────────────────────────────────────────┐
│ ⚙️ Settings                                    🔍 [Search]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Ask me anything:                                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ "I want to see more at once without scrolling..."      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ I can help with:                                            │
│ • "Show me less clutter"                                    │
│ • "I keep missing deadlines"                                │
│ • "Make it work better on my phone"                         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Or browse settings:                                         │
│ > General                                                   │
│ > Organization                                              │
│ > Appearance                                                │
│ ...                                                         │
└─────────────────────────────────────────────────────────────┘
```

### Explanation Mode

For any setting, users can ask "why?":

- "Why is my due soon threshold 48 hours?" → "This is the default. Based on your patterns, you typically act on tasks 2-3 days before due dates, so this seems appropriate for you."
- "Why am I getting so many notifications?" → "You have 12 projects with notifications enabled. Consider using bundling or project-specific rules."

## Settings Health Check

### Periodic Analysis

The system periodically analyzes settings for optimization opportunities:

**Weekly Health Check Report:**

```
┌─────────────────────────────────────────────────────────────┐
│ Settings Health Check                                       │
│                                                             │
│ Overall: Good (3 suggestions)                               │
│                                                             │
│ ⚠️ Potential Issues:                                        │
│ • Notification overload: 47 notifications/day average       │
│   → Consider bundling or stricter rules                     │
│                                                             │
│ 💡 Optimization Opportunities:                              │
│ • Unused setting: Column layout enabled but never used      │
│ • Suboptimal timing: Default due time is 5pm but you        │
│   complete 80% of due tasks after 6pm                       │
│                                                             │
│ ✓ Working Well:                                             │
│ • Quick capture shortcuts used 12x/day                      │
│ • Focus mode settings match your deep work patterns         │
│                                                             │
│ [Review suggestions]  [Dismiss for now]                     │
└─────────────────────────────────────────────────────────────┘
```

### Conflict Detection

The system identifies contradictory or conflicting settings:

| Conflict | Explanation |
|----------|-------------|
| Strict cleanup + no default project | Tasks can't leave inbox without project, but no default set |
| High notification frequency + bundling disabled | Many interruptions; bundling would help |
| Focus mode + location notifications | Location alerts can interrupt focus sessions |
| Tight due soon threshold + disabled due coloring | You won't see the urgency you configured |

### Unused Settings Detection

Identifies settings that aren't being utilized:

- "You have columns layout enabled but haven't used it in 30 days"
- "Clippings shortcut is set but you've never used it"
- "Project templates defined but not used in 60 days"

## Intelligent Onboarding

### Personalized Setup Flow

New user onboarding adapts based on stated goals:

**Step 1: Goal Selection**
```
What do you want to accomplish?

○ Get organized and stop forgetting things
○ Manage a heavy workload with many projects
○ Track personal goals and habits
○ Coordinate with a team
○ All of the above
```

**Step 2: Work Style Assessment**
```
How do you prefer to work?

○ Detailed planning - I like to schedule everything
○ Flexible - I work on what feels right
○ Deadline-driven - I focus on what's due soon
○ Project-focused - I work in focused bursts
```

**Step 3: Complexity Preference**
```
How much do you want to configure?

○ Keep it simple - I'll adjust later if needed
○ Some customization - Show me the key settings
○ Full control - I want to configure everything
```

### Onboarding Outcomes

Based on responses, the system:

- Pre-configures appropriate defaults
- Shows/hides advanced features
- Sets up starter perspectives
- Configures notification style
- Creates sample projects if helpful

### Progressive Feature Introduction

Instead of overwhelming new users:

1. **Week 1**: Core capture and completion
2. **Week 2**: Introduce projects and tags
3. **Week 3**: Perspectives and views
4. **Week 4**: Advanced scheduling
5. **Ongoing**: Suggest features based on observed needs

## Settings Profile Management

### Profile Types

Users can create and switch between settings profiles:

| Profile Type | Use Case |
|--------------|----------|
| **Work** | Professional projects visible, work notification rules |
| **Personal** | Personal projects, relaxed deadlines, home errands |
| **Travel** | Location-aware, offline-optimized, minimal sync |
| **Focus** | Simplified view, notifications off, single project |
| **Sprint** | Deadline mode - tight thresholds, frequent alerts |

### Profile Contents

A profile can override:

- Visible folders/projects
- Active perspectives
- Notification rules
- Due soon threshold
- Layout preferences
- Focus mode settings

### Automatic Profile Switching

Profiles can switch automatically based on triggers:

```
Profile: Work Mode
Activates when:
  - System Focus is "Work"
  - OR connected to office wifi
  - OR calendar shows work meeting

Profile: Personal
Activates when:
  - After 6pm on weekdays
  - OR weekends
  - OR System Focus is "Personal"
```

### Profile Inheritance

Profiles only override specific settings - everything else uses defaults:

```
Base Settings
├── Font size: 1.0x
├── Color palette: automatic
├── Due soon: 48 hours
└── Notifications: on

Work Profile (overrides)
├── Due soon: 24 hours (tighter)
└── Notifications: work projects only

Result when Work active:
├── Font size: 1.0x (inherited)
├── Color palette: automatic (inherited)
├── Due soon: 24 hours (overridden)
└── Notifications: work projects only (overridden)
```

## Cross-Device Settings Intelligence

### Smart Sync Decisions

The system determines which settings should sync vs. stay local:

| Setting | Decision Logic |
|---------|----------------|
| Font size | Local - desktop/mobile have different needs |
| Due soon threshold | Sync - workflow consistency |
| Layout mode | Local - device-specific |
| Quick capture fields | Sync - same workflow everywhere |
| Notification sounds | Local - device-specific audio |
| AI learning data | Sync - unified user model |

### Device-Specific Recommendations

The system makes device-appropriate suggestions:

- **Mobile**: "Compact layout works better on smaller screens"
- **Desktop**: "Column layout gives you more control with a larger display"
- **Tablet**: "Fluid layout adapts well to both orientations"

### New Device Setup

When signing in on a new device:

```
┌─────────────────────────────────────────────────────────────┐
│ Welcome to your new device!                                 │
│                                                             │
│ Your workflow settings have synced from your other devices. │
│                                                             │
│ For this device, we recommend:                              │
│                                                             │
│ Layout: Compact (optimized for 11" screen)                 │
│ Font size: 1.1x (common for laptops)                       │
│ Notifications: Mirror your phone settings                   │
│                                                             │
│ [Use recommendations]  [Customize]  [Copy from device ▼]   │
└─────────────────────────────────────────────────────────────┘
```

## Settings Migration Assistant

### Import from Other Apps

AI-assisted migration from other task managers:

**Supported Sources:**
- OmniFocus (direct import)
- Todoist (API import)
- Things (JSON export)
- Reminders (iOS/macOS integration)
- Asana, Trello (CSV/API)
- Generic formats (CSV, JSON, TaskPaper)

### Migration Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ Import from Todoist                                         │
│                                                             │
│ Found:                                                      │
│ • 234 tasks across 12 projects                              │
│ • 8 labels → will become tags                               │
│ • 45 tasks with due dates                                   │
│ • 3 recurring tasks                                         │
│                                                             │
│ Settings translation:                                       │
│ • "Priority 1" → Flagged items                             │
│ • "Priority 2-4" → Tag "priority-2", "priority-3", etc.   │
│ • Todoist "Today" view → Available perspective              │
│                                                             │
│ [Preview import]  [Customize mapping]  [Import]            │
└─────────────────────────────────────────────────────────────┘
```

### Concept Mapping

The AI maps concepts between systems:

| Source Concept | Translated To | Notes |
|---------------|---------------|-------|
| Todoist priorities | Flag + tags | P1 → Flagged |
| Things areas | Folders | Top-level organization |
| Asana sections | Projects | Task grouping |
| Labels | Tags | 1:1 mapping |
| Subtasks | Action groups | Hierarchical tasks |

### Settings Recommendation After Import

After migration, the system suggests settings based on previous app usage:

"Based on your Todoist setup, you might like:
- Enabling 'Notify on deferred' (you used Todoist reminders heavily)
- Setting due soon threshold to 24 hours (matching Todoist 'Today' focus)
- Creating a 'Priority' perspective to replace your Todoist Priority view"

## Predictive Settings

### Anticipating Needs

The system predicts when settings changes would be helpful:

| Situation | Prediction | Suggestion |
|-----------|------------|------------|
| Major deadline approaching | Stress mode incoming | "Enable tighter deadlines and workload alerts?" |
| Vacation on calendar | Time off detected | "Switch to minimal notifications mode?" |
| New project spike | Heavy workload period | "Enable daily planning assistant?" |
| Review overdue by weeks | Review system not working | "Try shorter review intervals?" |
| Evening task completion dropping | Burnout signals | "Extend quiet hours earlier?" |

### Seasonal Adjustments

The system learns annual patterns:

- "Last December, you completed 40% fewer tasks. Adjust expectations?"
- "Tax season is coming - you usually focus on finance tasks"
- "Summer schedule detected - shift to flexible mode?"

## Settings Export & Backup

### Export Format

Settings export to portable JSON:

```json
{
  "version": "1.0",
  "exported_at": "2026-01-03T10:00:00Z",
  "synced_settings": {
    "organization": {
      "clean_up_inbox": "requires_both",
      "default_project_type": "parallel"
    },
    "dates": {
      "due_soon_threshold_hours": 48,
      "default_defer_time": "08:00",
      "default_due_time": "17:00"
    },
    "ai_features": {
      "smart_timing": true,
      "adaptive_settings": true,
      "recommendations_enabled": true
    }
  },
  "profiles": [
    {
      "name": "Work Mode",
      "trigger": "system_focus:Work",
      "overrides": { ... }
    }
  ],
  "ai_learning": {
    "include": false,
    "note": "AI learning data not included for privacy"
  }
}
```

### Sharing Configurations

Users can share their settings configurations:

- Export without personal data
- Import as "starting point" with option to modify
- Community templates for common workflows (GTD, Agile, Academic)

## User Settings Summary

### AI Feature Controls

| Setting | Default | Description |
|---------|---------|-------------|
| Settings recommendations | On | Suggest setting optimizations |
| Adaptive settings | On | Allow context-based adjustments |
| Natural language settings | On | Enable conversational configuration |
| Settings health check | On | Periodic optimization analysis |
| Predictive suggestions | On | Anticipate settings needs |
| Learning data sync | On | Unify AI learning across devices |
| Trial periods | On | Test recommendations before committing |

### Privacy Controls

| Setting | Default | Description |
|---------|---------|-------------|
| Include learning in export | Off | Exclude AI patterns from exports |
| Share anonymous usage | Off | Opt-in aggregate usage data |
| Reset AI learning | - | Clear all learned patterns |
| View learned patterns | - | See what AI has learned about you |

## Privacy & Transparency

### What the System Learns

Users can view exactly what patterns the AI has detected:

```
┌─────────────────────────────────────────────────────────────┐
│ What I've Learned About You                                 │
│                                                             │
│ Activity Patterns:                                          │
│ • Most active: 9am-11am, 2pm-4pm                           │
│ • Typical task completion: 6-8 tasks/day                   │
│ • Preferred capture method: Quick capture (72%)            │
│                                                             │
│ Preference Signals:                                         │
│ • You rarely use column layout                              │
│ • You often dismiss evening notifications                   │
│ • You complete flagged items 3x faster than others         │
│                                                             │
│ [Reset all learning]  [Download data]  [Disable learning]  │
└─────────────────────────────────────────────────────────────┘
```

### Data Controls

- **View learned data**: See all AI observations
- **Selective reset**: Clear specific pattern categories
- **Full reset**: Clear all AI learning, start fresh
- **Disable learning**: Stop collecting new patterns
- **Export data**: Download all learned patterns as JSON

## Platform Differences

| Feature | Desktop | Mobile | Web |
|---------|---------|--------|-----|
| All settings | Full | Full | Core only |
| Natural language | Full | Full | Limited |
| Profiles | Full | Full | Session-based |
| Adaptive settings | Full | Full | Limited |
| Keyboard shortcuts | Full | N/A | Limited |
| Health check | Full | Condensed | Limited |
| Import/export | Full | Limited | Export only |

## Best Practices

### For Users

1. **Start with defaults**: Let the system learn before customizing heavily
2. **Try recommendations**: Use trial periods to test suggestions
3. **Create profiles**: Separate work and personal contexts
4. **Check health reports**: Review monthly for optimization opportunities
5. **Ask naturally**: Use conversational interface for complex changes

### For the System

1. **Observe before suggesting**: Collect sufficient data before recommendations
2. **Explain reasoning**: Always tell users why a change is suggested
3. **Respect explicit choices**: User overrides take precedence over AI
4. **Provide rollback**: Make it easy to undo any change
5. **Progressive complexity**: Simple first, advanced available

## API Access

### Settings API Endpoints

```
GET  /settings                    # All settings for current user
GET  /settings/{category}         # Settings for specific category
PUT  /settings/{category}/{key}   # Update specific setting
POST /settings/import             # Import settings from JSON
GET  /settings/export             # Export settings as JSON

GET  /settings/profiles           # List all profiles
POST /settings/profiles           # Create new profile
PUT  /settings/profiles/{id}      # Update profile
DELETE /settings/profiles/{id}    # Delete profile

GET  /settings/recommendations    # Current AI recommendations
POST /settings/recommendations/{id}/apply  # Apply recommendation
POST /settings/recommendations/{id}/trial  # Start trial period
POST /settings/recommendations/{id}/dismiss # Dismiss recommendation

GET  /settings/health             # Health check report
GET  /settings/learning           # View AI learned patterns
DELETE /settings/learning         # Reset AI learning
```

### CLI Access

```bash
# View settings
lvm settings list
lvm settings get organization.clean_up_inbox

# Update settings
lvm settings set dates.default_due_time "17:00"

# Profiles
lvm settings profile list
lvm settings profile activate "Work Mode"
lvm settings profile create "Sprint Mode" --from current

# Export/Import
lvm settings export > my-settings.json
lvm settings import < shared-settings.json

# AI features
lvm settings recommendations
lvm settings health-check
lvm settings learning --view
lvm settings learning --reset
```

## Related Specifications

- `improved_specs/ai-notifications.md` - Notification settings integration
- `improved_specs/ai-focus-mode.md` - Focus mode settings
- `improved_specs/ai-capture.md` - Quick capture settings
- `improved_specs/ai-sync.md` - Sync settings and behavior
- `improved_specs/ai-data-management.md` - Export/backup settings
