# AI-Powered Perspectives Specification

This specification extends `specs/perspectives.md` and `specs/custom-perspectives.md` with intelligent perspective creation, context-aware recommendations, and natural language filtering. The goal is to make powerful custom perspectives accessible to all users, not just power users.

## Overview

Traditional perspectives require manual filter construction using hierarchical rules. AI-native perspectives enable:
- **Natural language creation**: "Show me quick tasks I can do at home"
- **Smart recommendations**: Suggested perspectives based on your workflow
- **Context-aware switching**: Automatic perspective selection by context
- **Intelligent optimization**: Refinement based on usage patterns
- **Template customization**: Pre-built perspectives adapted to your data

## Natural Language Perspective Creation

Create perspectives by describing what you want to see in plain language.

### Text Input

Type a description and the system generates appropriate filter rules:

```
Input: "Show me available tasks from work projects that take less than 30 minutes"

Generated Perspective:
  Name: Quick Work Tasks
  Filter:
    - availability = available
    - folder = Work (detected from your folders)
    - estimated_duration < 30 minutes
  Grouping: by project
  Sorting: by due date
```

### Understanding Your Request

The system interprets various phrasings:

| You Say | System Interprets |
|---------|------------------|
| "quick tasks" | duration < 15 minutes |
| "important items" | flagged = true OR overdue |
| "home errands" | tag matches @home, @errands |
| "stale projects" | modified > 6 months ago |
| "waiting on others" | tag = "Waiting For" |
| "deep work" | duration > 60 minutes, not calls/emails |

### Ambiguity Resolution

When your request could mean multiple things, the system asks:

```
Input: "Show me tasks for today"

Which tasks?
□ Due today
□ Deferred to today
□ Tagged for Forecast
□ All of the above (recommended)

[Create Perspective]
```

### Iterative Refinement

After creating a perspective, you can refine it conversationally:

```
User: "Show me work tasks"
System: [Creates perspective with folder = Work]

User: "Only the quick ones"
System: [Adds duration < 30 minutes]

User: "Sort by project"
System: [Changes grouping to project]
```

## Smart Perspective Suggestions

The system proactively suggests perspectives based on your workflow patterns.

### When Suggestions Appear

| Trigger | Example Suggestion |
|---------|-------------------|
| Repeated filtering | "You often filter by @errands - create an Errands perspective?" |
| Time patterns | "You check flagged tasks each morning - create a Morning Review perspective?" |
| Location patterns | "You review @office tasks when at work - create an Office perspective?" |
| Project phases | "New project detected - create a perspective for Project Alpha?" |

### Suggested Perspective Types

**Context-Based Perspectives**
- Location: "Tasks for when you're @office / @home / @downtown"
- Time: "Morning planning tasks / Evening wrap-up tasks"
- Energy: "High energy deep work / Low energy admin tasks"

**Workflow Perspectives**
- Project-specific: "All tasks for Project X"
- Status-based: "Blocked tasks / Waiting for responses"
- Maintenance: "Tasks without due dates / Tasks missing estimates"

**Temporal Perspectives**
- "Overdue items needing attention"
- "This week's priorities"
- "Next month's planning tasks"

### Accepting Suggestions

```
┌────────────────────────────────────────────┐
│ 💡 Perspective Suggestion                  │
│                                            │
│ You frequently view flagged work tasks.    │
│                                            │
│ Create "Work Priorities" perspective?      │
│  • Flagged items                           │
│  • From Work folder                        │
│  • Grouped by project                      │
│                                            │
│ [Create] [Customize First] [Not Now]       │
└────────────────────────────────────────────┘
```

## Intelligent Filter Recommendations

When manually creating a perspective, the system suggests relevant filters.

### Context-Aware Suggestions

As you build filters, the system recommends additions:

```
You've filtered by:
  ✓ folder = Work
  ✓ availability = available

💡 Consider adding:
  • duration < 30 minutes (you often filter by time)
  • has_due_date = true (70% of your work tasks have deadlines)
  • tag ∈ [@computer, @office] (common work contexts)
```

### Avoiding Empty Perspectives

Before finalizing, the system warns if no items match:

```
⚠️ No tasks match these filters

This might be because:
  • Your "Research" folder has no available tasks right now
  • Try: Remove "flagged = true" to see 5 more tasks

[Adjust Filters] [Create Anyway]
```

### Pattern Recognition

The system identifies common perspective patterns:

| Pattern Detected | Suggestion |
|-----------------|------------|
| Single tag filter | "Add availability filter to exclude completed?" |
| Due date only | "Add project grouping to organize by area?" |
| Very broad filter | "This shows 200+ tasks - consider narrowing scope" |
| Complex nesting | "Simplify this rule structure for better performance" |

## Perspective Templates

Pre-built perspectives that adapt to your data.

### Template Library

| Template | Adapts To |
|----------|-----------|
| **Focus Today** | Your flagged items, due dates, and forecast tags |
| **Quick Wins** | Your duration estimates and availability |
| **[Project] Dashboard** | Specific project with status sections |
| **Energy Zones** | Your energy-level tags or task types |
| **Location Contexts** | Your location-tagged items |
| **Weekly Review** | Your review schedule and stalled projects |
| **Waiting Zone** | Your "waiting for" tags and blocked tasks |

### Template Customization

```
Choose template: Quick Wins

Customize for your workflow:
  Duration threshold: [15] minutes
  Include projects: [All] or [Work only] or [Personal only]
  Exclude tags: [@waiting] [@someday]
  Sort by: [Duration] or [Due date] or [Project]

[Create Perspective]
```

### Smart Defaults

Templates use your actual data:

```
Creating "Work Dashboard" from template...

✓ Found "Work" folder
✓ Detected 3 active work projects
✓ Found common work tags: @computer, @office, @calls
✓ Applied your preferred grouping: by project
✓ Applied your preferred sorting: flagged first, then due date

Perspective created!
```

## Context-Aware Perspective Switching

Automatically switch perspectives based on your current context.

### Automatic Switching

| Context Change | Suggested Perspective |
|----------------|----------------------|
| Arrive at office | Office Tasks |
| Start of workday | Morning Planning |
| Calendar shows 15 min gap | Quick Wins |
| End of week | Weekly Review |
| Travel to errand location | Errands Near You |

### Switch Behavior

```
┌────────────────────────────────────────────┐
│ 📍 You're now at the office                │
│                                            │
│ Switch to "Office Tasks" perspective?      │
│ (12 available tasks)                       │
│                                            │
│ [Switch] [Not Now] [Don't Ask Again]       │
└────────────────────────────────────────────┘
```

### Manual Context Hints

Provide context manually to get perspective recommendations:

```
Context: Working from home today

Recommended perspectives:
  • Home Office Tasks (8 tasks)
  • Personal Projects (3 tasks)
  • Quick Wins (14 tasks under 15 min)
```

### Smart Defaults

The system learns your preferences:
- If you always accept office switches, it switches automatically
- If you decline home task switches, it stops suggesting
- If you prefer certain perspectives at certain times, it adapts

## Usage-Based Learning

Perspectives improve based on how you use them.

### What The System Learns

**Usage Patterns**
- When you typically view each perspective
- How long you spend in each perspective
- Which tasks you complete from which perspectives

**Optimization Opportunities**
- Filters that match too many or too few items
- Grouping/sorting that doesn't match your workflow
- Perspectives that are never used

**Workflow Changes**
- New projects requiring new perspectives
- Completed projects allowing perspective removal
- Changed work patterns suggesting different filters

### Proactive Optimization

```
💡 Perspective Improvement Suggestion

"Quick Wins" perspective (last used 2 weeks ago)

We noticed:
  • You now have fewer tasks under 15 minutes
  • 85% of your quick tasks are actually under 30 minutes

Update filter from "< 15 min" to "< 30 min"?
This would show 23 tasks instead of 3.

[Update] [Keep As Is] [Delete Perspective]
```

### Performance Optimization

For complex perspectives with slow loading:

```
⚡ Performance Improvement Available

"All Projects Status" perspective takes 2.1s to load.

Simplify by:
  • Reducing nesting depth (5 levels → 3 levels)
  • Removing text search (slower)
  • Caching project status (refresh every 5 min)

Expected improvement: 2.1s → 0.3s

[Apply Optimizations] [Learn More] [Dismiss]
```

## Intelligent Grouping & Sorting

Recommendations for how to organize perspective results.

### Grouping Recommendations

Based on your filter rules:

```
Perspective: Work Tasks
Current grouping: ungrouped

💡 Recommended grouping: by project
Why: You're viewing 47 tasks across 8 projects.
Grouping by project would make this easier to scan.

[Apply] [Try It] [Dismiss]
```

### Sorting Recommendations

Based on task characteristics:

```
Perspective: Today's Tasks
Current sorting: by name

💡 Recommended sorting:
  1. Flagged first
  2. Then by due date

Why: 65% of tasks have due dates and 23% are flagged.
This sorting prioritizes urgent items.

[Apply] [Customize] [Dismiss]
```

### Dynamic Grouping

Grouping can adapt to the number of items:

| Item Count | Suggested Grouping |
|------------|-------------------|
| < 10 tasks | Ungrouped (flat list) |
| 10-30 tasks | By project or tag |
| 30-100 tasks | By due date or folder |
| > 100 tasks | By folder with project subgroups |

## Perspective Discovery

Help users find the perspectives they need.

### Quick Search

Type to find or create perspectives:

```
Search: "errands"

Existing:
  • Errands (custom) - 12 tasks

Create New:
  • "Show me errands" → Create perspective
  • "Errands near downtown" → Location-filtered
  • "Quick errands under 20 min" → Duration-filtered
```

### Perspective Browser

Organized view of all perspectives:

```
My Perspectives (8)
  ├─ Quick Wins (14 tasks)
  ├─ Work Dashboard (47 tasks)
  └─ Home Projects (8 tasks)

Suggested (3)
  ├─ 💡 Morning Planning
  ├─ 💡 Blocked Tasks (5 tasks)
  └─ 💡 Project Alpha Focus

Templates (12)
  ├─ Energy Zones
  ├─ Weekly Review
  └─ ...
```

### Usage Analytics

See which perspectives you actually use:

```
Perspective Usage (Last 30 Days)

Most Used:
  1. Inbox (daily) - 89 views
  2. Today (daily) - 67 views
  3. Work Dashboard (3x/week) - 34 views

Rarely Used:
  • Personal Projects - Last used 3 weeks ago
  • Errands - Last used 2 months ago

[Archive Unused] [Keep All]
```

## Perspective Maintenance

AI-assisted perspective cleanup and optimization.

### Automatic Cleanup

```
🧹 Perspective Maintenance

3 perspectives haven't been used in 2+ months:
  • "Conference Prep" (project completed)
  • "Holiday Planning" (seasonal)
  • "Q1 Goals" (outdated)

Archive these perspectives?
(You can restore them later if needed)

[Archive All] [Review Each] [Keep All]
```

### Duplicate Detection

```
⚠️ Similar Perspectives Detected

"Work Tasks" and "Office Tasks" have very similar filters:
  • Both filter by Work folder
  • Both show available tasks
  • 90% of tasks appear in both

Merge these perspectives?

[Merge] [Keep Separate] [Compare]
```

### Health Checks

Regular perspective health monitoring:

| Issue | Recommendation |
|-------|---------------|
| Empty perspective | "No matching tasks - update filters?" |
| Overly broad | "Shows 300+ tasks - consider narrowing" |
| Broken references | "Project X no longer exists - remove filter?" |
| Slow performance | "Complex rules detected - simplify?" |
| Never used | "Last used 6 months ago - archive?" |

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| AI perspective creation | On | Enable natural language perspective creation |
| Smart suggestions | On | Suggest perspectives based on patterns |
| Context switching | Ask | Auto/Ask/Off for context-based switching |
| Usage learning | On | Learn from how you use perspectives |
| Proactive optimization | On | Suggest improvements to perspectives |
| Template recommendations | On | Suggest relevant templates |
| Maintenance reminders | Weekly | Prompt to clean up unused perspectives |
| Min suggestion confidence | 70% | Only suggest high-confidence perspectives |

## Privacy

- Usage patterns stored locally by default
- No perspective content shared externally
- Context signals (location, calendar) processed on-device when possible
- User can disable any learning or suggestions
- Option to clear all learned patterns

## Edge Cases

### No Matching Items
- Show "No tasks match these filters"
- Suggest adjustments to see results
- Option to create anyway for future use

### Ambiguous Natural Language
- Present multiple interpretations
- Ask clarifying questions
- Learn from user's choice

### Very Complex Requests
- Break into multiple simpler perspectives
- Suggest combining perspectives with focus mode
- Offer step-by-step filter building

### Conflicting Suggestions
- Prioritize by confidence and recency
- Show trade-offs between options
- Allow user to choose or combine

### New User (No Patterns)
- Focus on templates and guided creation
- Explain perspective concepts clearly
- Learn quickly from initial usage

## Related Specifications

- `specs/perspectives.md` - Core perspective framework
- `specs/custom-perspectives.md` - Advanced customization
- `specs/focus-mode.md` - Narrowing scope
- `specs/availability.md` - Task status filtering
- `improved_specs/ai-suggestions.md` - Task recommendations
- `improved_specs/ai-search.md` - Natural language search
- `improved_specs/mcp-integration.md` - External tool integration

## Sources

- [Perspectivist approaches to natural language processing](https://link.springer.com/article/10.1007/s10579-024-09766-4)
- [When large language models meet personalization](https://link.springer.com/article/10.1007/s11280-024-01276-1)
- [Natural Language Processing in 2025: Trends & Use Cases](https://www.aezion.com/blogs/natural-language-processing/)
- [The 2025 Conference on Empirical Methods in Natural Language Processing](https://aclanthology.org/events/emnlp-2025/)
