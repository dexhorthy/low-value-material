# AI-Powered Organization Specification

This specification extends `specs/project.md`, `specs/folder.md`, and `specs/tag.md` with intelligent organization capabilities.

## Overview

Traditional task managers require manual organization. AI-native organization assists by:
- **Auto-tagging**: Suggesting tags based on task content analysis
- **Task breakdown**: Decomposing large tasks into actionable subtasks
- **Project clustering**: Detecting when loose tasks should become a project
- **Template recommendations**: Suggesting project structures for common goals
- **Related task discovery**: Finding similar or connected tasks

## Auto-Tagging

### User Experience

When a user creates or edits a task, the system analyzes the content and suggests relevant tags. Tags appear as dismissible chips below the task input.

**Example flow:**
1. User types: "Call John about Q2 budget review"
2. System suggests: `@calls`, `@John`, `@finance`
3. User accepts `@calls` and `@John`, dismisses `@finance`
4. Over time, the system learns this user's preferences

### Tag Matching Strategies

Tags are suggested based on multiple signals, ranked by confidence:

| Strategy | Example | Confidence |
|----------|---------|------------|
| Exact keyword match | "email" → `@email` | High |
| Entity detection | "John" → `@John` | High |
| Semantic similarity | "budget review" → `@finance` | Medium |
| Pattern learning | User always tags calls with `@phone` | Medium |
| Similar task history | Past tasks like this had `@work` | Lower |

### Entity Extraction

The system detects and can create tags for:
- **People**: Names mentioned in tasks
- **Places**: Locations referenced
- **Organizations**: Companies, teams
- **Action types**: Call, email, write, review, buy, etc.

### Learning from Corrections

When users dismiss suggestions or add different tags, the system learns:
- Which suggestions to suppress for this user
- Patterns in how the user categorizes work
- Personal vocabulary and naming conventions

## Task Breakdown

### When Breakdown is Offered

The system offers to break down tasks when:
- Estimated duration exceeds 2 hours
- Title contains multiple verbs or "and"
- Task is vague: "Work on project", "Handle the situation"
- User explicitly requests: "Break this down"
- A task is being converted to a project

### User Experience

**Example:**

User creates: "Plan company offsite"

System responds:
```
Break down into subtasks?

Suggested (sequential):
☑ Set date and get headcount (30 min)
☑ Research venue options (1 hr)
☑ Book venue (15 min)
☑ Plan agenda and activities (1 hr)
☑ Send calendar invites (15 min)
☐ Arrange catering (optional)

Total: ~3.5 hours

[Create as Project] [Create Subtasks] [Cancel]
```

### Breakdown Principles

- Each subtask should be a single, clear action
- Subtasks should be at similar levels of granularity
- Dependencies are identified (what must happen before what)
- Optional items are marked separately
- Time estimates are provided when determinable
- User can edit, remove, or add subtasks before creation

## Project Clustering

### Detection

When the inbox contains multiple related tasks, the system notices patterns and suggests grouping them into a project.

**Signals considered:**
- Semantic similarity (tasks about the same topic)
- Shared tags
- Temporal proximity (created around the same time)
- Shared entities (same people/places mentioned)
- Logical workflow (tasks form a sequence)

### User Experience

**Example notification:**

```
Related tasks detected

These 4 inbox items seem related:

  • Research venue options
  • Get catering quotes
  • Send team survey for dates
  • Book conference room backup

Create project "Team Offsite Planning"?

[Create Project] [Not Related] [Remind Later]
```

### Minimum Threshold

Clustering requires at least 3 related tasks to avoid false positives.

## Project Templates

### Concept

Pre-defined structures for common project types. When a user creates a project or task that matches a template pattern, the system offers to scaffold the work.

### Built-in Templates

**Event Planning**
- Set date and budget
- Book venue
- Send invitations
- Confirm catering
- Final preparations

**Content Creation (Blog Post)**
- Research topic
- Create outline
- Write first draft
- Edit and revise
- Add images
- Publish and promote

**Hiring Process**
- Write job description
- Post to job boards
- Review applications
- Schedule interviews
- Conduct interviews
- Check references
- Make offer

### Template Variables

Templates can include placeholders filled by the user:
- `{{event_name}}` → "Team Offsite"
- `{{event_date}}` → "March 15"
- `{{role}}` → "Senior Engineer"

### Custom Templates

Users can save their own task structures as reusable templates.

## Related Task Discovery

### When to Surface

When viewing a task, the system can show related tasks to help users:
- Avoid duplicates
- Find relevant context
- See connected work
- Identify dependencies

### Relationship Types

| Type | Example |
|------|---------|
| Same project | Other tasks in "Q2 Planning" |
| Same tags | Tasks also tagged `@John` and `@finance` |
| Semantic similarity | Tasks about the same topic |
| Prerequisite | Tasks that should be done first |
| Follow-up | Tasks that logically come after |
| Duplicate | Nearly identical tasks |

### Display

```
Task: "Call John about Q2 budget"

Related:
├── Same project: Q2 Planning
│   └── ☐ Finalize Q2 projections
├── Same tags: @John, @finance
│   └── ☐ Review John's expense report
└── Similar tasks:
    └── ☐ Email John meeting notes
```

## Tag Lifecycle Management

Effective tag systems require ongoing maintenance. Without it, tags sprawl into unusable states—duplicates accumulate, naming conventions drift, and valuable categorizations become buried. AI-native tag management transforms this from a manual burden into an automated, continuous process.

### Tag Lifecycle States

Every tag moves through a lifecycle:

```
Created → Active → Declining → Dormant → Archived/Deleted
    ↑                              │
    └──────── Revived ─────────────┘
```

The system tracks usage metrics (total uses, active/completed task counts), temporal data (when created, last applied), and trend analysis to determine a tag's health score (0-100).

### State Transitions

| State | Definition | Trigger |
|-------|------------|---------|
| Active | Regular use, healthy | Used in last 30 days |
| Declining | Usage dropping | 50%+ drop vs previous period |
| Dormant | No recent activity | No use in 90+ days |
| Archived | Preserved but hidden | User or auto-archive action |

### Recurring Cleanup Schedules

The system runs automated analysis at configurable intervals (weekly, monthly, or quarterly). Users choose:

**What to check:**
- Duplicates, unused tags, inconsistent tagging
- Orphaned tags, semantic clusters, hierarchy patterns

**Automation level:**
- Auto-archive dormant tags after a threshold
- Auto-merge exact duplicates (case differences)
- Apply consistent naming conventions

**Notifications:**
- Summary, detailed, or actionable-only reports

### Weekly Tag Health Report

```
┌─────────────────────────────────────────────────────────────────┐
│ Weekly Tag Health Report                           Jan 6, 2026  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Overview: 47 tags analyzed                                       │
│ ════════════════════════════════════════════════════            │
│ ✅ Healthy: 38        ⚠️ Needs attention: 6        ❌ Issues: 3 │
│                                                                  │
│ This Week's Activity:                                           │
│   • Tags used: 23                                                │
│   • New tags created: 2 (@q1-planning, @vendor-review)          │
│   • Tags becoming dormant: 1 (@holiday-party)                   │
│                                                                  │
│ Recommended Actions:                                            │
│ ─────────────────────────────────────────────────               │
│ 🔄 Merge duplicates (3 pairs detected)                          │
│    @email ← @emails, @Email                                     │
│    @john ← @John, @john-smith                                   │
│                                                                  │
│ 🗑️ Consider archiving (2 dormant 90+ days)                      │
│    @summer-project (last used: 142 days ago)                    │
│    @temp (last used: 98 days ago, 0 active tasks)               │
│                                                                  │
│ 📊 Inconsistent tagging opportunities:                          │
│    8 tasks mention "meeting" without @meetings tag              │
│                                                                  │
│ [Review All]  [Auto-fix Safe]  [Snooze 1 Week]                 │
└─────────────────────────────────────────────────────────────────┘
```

### Semantic Tag Clustering

AI groups tags by meaning to surface consolidation opportunities and reveal implicit hierarchies. Each cluster has:
- A descriptive name (e.g., "Communication", "People")
- A relationship type: synonyms, hierarchy, related, or workflow
- A suggested action: merge, create parent tag, rename, split, or none

**Example Clusters Detected:**

```
┌─────────────────────────────────────────────────────────────────┐
│ Semantic Tag Clusters                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ 📧 Communication (synonyms detected)                             │
│    @email, @emails, @mail → Merge into @email?                  │
│    @call, @calls, @phone → Merge into @calls?                   │
│                                                                  │
│ 👥 People (hierarchy candidate)                                  │
│    @john, @sarah, @mike, @team-lead                             │
│    → Create parent tag @people?                                  │
│                                                                  │
│ 📍 Contexts (related workflow)                                   │
│    @home, @office, @errands, @online                            │
│    → These form a location context system                       │
│                                                                  │
│ 💰 Finance (semantic overlap)                                    │
│    @budget, @finance, @money, @expenses                          │
│    → Consider consolidating to @finance + @expenses             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Duplicate Detection

The system identifies duplicate tags using multiple signals and compares usage to recommend which tag should survive a merge.

**Duplicate Detection Rules:**

| Signal | Example | Confidence |
|--------|---------|------------|
| Case difference | `@Email` vs `@email` | 100% (auto-merge) |
| Plural/singular | `@meeting` vs `@meetings` | 95% |
| Common abbreviation | `@mtg` vs `@meeting` | 90% |
| Typo (edit distance ≤ 2) | `@finace` vs `@finance` | 85% |
| Semantic similarity | `@phone` vs `@calls` | 70% |
| Hyphenation variance | `@follow-up` vs `@followup` | 95% |

### Tag Merge Operation

When merging tags, all historical references are preserved. The merge operation:
- Reassigns tasks from source tags to the target tag
- Preserves audit trail of the merge
- Optionally keeps old names as searchable aliases

**Merge UI:**

```
┌─────────────────────────────────────────────────────────────────┐
│ Merge Tags                                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Merging:                                                         │
│   @emails (12 tasks) ──┐                                        │
│   @Email (3 tasks) ────┼──→ @email (will have 23 tasks)         │
│   @email (8 tasks) ────┘                                        │
│                                                                  │
│ Options:                                                         │
│   ☑ Keep "emails" and "Email" as searchable aliases             │
│   ☑ Apply to completed tasks (142 historical)                   │
│   ☐ Also merge similar: @e-mail (2 tasks)                       │
│                                                                  │
│ [Preview Changes]              [Merge]              [Cancel]    │
└─────────────────────────────────────────────────────────────────┘
```

### Tag Hierarchy Inference

The system detects implicit parent-child relationships and suggests formalizing them based on:
- **Naming patterns**: Tags like @work-meetings, @work-admin suggest @work as parent
- **Co-occurrence**: Tags always used together
- **Semantic subsumption**: "finance" conceptually contains "budget"
- **User behavior**: User applies parent after children

**Detected Hierarchies:**

```
┌─────────────────────────────────────────────────────────────────┐
│ Inferred Tag Hierarchies                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Pattern detected: @work-* naming convention                      │
│                                                                  │
│   @work (inferred parent)                                       │
│   ├── @work-meetings                                            │
│   ├── @work-admin                                               │
│   └── @work-projects                                            │
│                                                                  │
│ Formalize this hierarchy?                                        │
│ Benefits: Filter all work tags at once, cleaner perspectives    │
│                                                                  │
│ [Create Hierarchy]  [Suggest Renames]  [Ignore Pattern]         │
└─────────────────────────────────────────────────────────────────┘
```

### Inconsistent Tagging Detection

The system finds tasks that should have tags based on content analysis. For each tag, it identifies candidate tasks that are missing the tag, showing a confidence score and the reason (e.g., "Contains keyword 'budget'").

**Batch Tagging Interface:**

```
┌─────────────────────────────────────────────────────────────────┐
│ Tagging Consistency Check: @finance                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ 8 tasks may be missing @finance tag:                            │
│                                                                  │
│ ☑ Review Q3 budget allocations                    95% match     │
│ ☑ Submit expense report                           92% match     │
│ ☑ Update financial projections                    90% match     │
│ ☑ Call accountant about tax forms                 88% match     │
│ ☐ Research new project management tool            45% match     │
│                                                                  │
│ Pattern: Tasks containing "budget", "expense", "financial",     │
│          "tax", "accountant" typically get @finance              │
│                                                                  │
│ [Apply Selected (4)]  [Apply All]  [Dismiss]                    │
└─────────────────────────────────────────────────────────────────┘
```

### Tag Governance Rules

Organizations can define rules for tag management:

**Naming conventions:**
- Case style (lowercase, Title Case, or preserve)
- Separator style (hyphen, underscore, or none)
- Prefix patterns (e.g., @context-*, @person-*)

**Creation controls:**
- Suggest existing tags before allowing new ones
- Block exact duplicates
- Auto-apply naming conventions

**Lifecycle rules:**
- Auto-archive after days of inactivity
- Warn before archiving
- Protect system tags from archiving

**Limits:**
- Maximum tags per task
- Maximum total tags
- Warning thresholds

### Tag Analytics Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│ Tag Analytics                                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Tag Health Score: 78/100                                         │
│ ████████████████████░░░░░                                       │
│                                                                  │
│ Top Issues:                                                      │
│   • 12 dormant tags (unused 90+ days)                           │
│   • 4 duplicate pairs detected                                   │
│   • 3 tags with >50 tasks (may need splitting)                  │
│                                                                  │
│ Most Active Tags (30 days):           Fastest Growing:          │
│   1. @work (89 tasks)                 1. @q1-planning (+15)     │
│   2. @calls (45 tasks)                2. @vendor (+ 8)          │
│   3. @meetings (38 tasks)             3. @migration (+6)        │
│                                                                  │
│ Tag Distribution:                                                │
│   0 tags: ███ 12%                                               │
│   1-2 tags: ████████████ 48%                                    │
│   3-5 tags: ████████ 32%                                        │
│   6+ tags: ██ 8%                                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Automated Actions

Safe actions the system can perform automatically:

| Action | Trigger | User Control |
|--------|---------|--------------|
| Normalize casing | Tag created with inconsistent case | Auto (configurable) |
| Suggest existing tag | New tag matches existing | Prompt before create |
| Archive dormant | No use in X days | Notify + 7-day delay |
| Merge exact duplicates | Case-only difference | Auto (configurable) |
| Apply consistent styling | Hyphen vs underscore | Prompt on cleanup |

### Cleanup Workflow

Recommended monthly cleanup process:

1. **Review health report** - Acknowledge or dismiss issues
2. **Process duplicates** - Merge or mark as intentional
3. **Handle dormant tags** - Archive, delete, or retain
4. **Check consistency** - Apply missing tags or update patterns
5. **Evaluate clusters** - Formalize hierarchies or reorganize

### Legacy Tag Migration

When importing from other systems, users can configure:
- **Mapping rules**: Transform source tag patterns to target format (e.g., "context:*" → "@*")
- **Case transformation**: Lowercase, preserve, or titlecase
- **Duplicate handling**: Merge, rename, or keep both
- **Post-migration cleanup**: Automatically run tag health analysis after import

## User Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Auto-suggest tags | On | Show tag suggestions when creating tasks |
| Suggestion threshold | 70% | Minimum confidence to show a suggestion |
| Breakdown threshold | 2 hours | Suggest breakdown for tasks estimated longer |
| Detect project clusters | On | Find related inbox items |
| Show related tasks | On | Display related tasks when viewing a task |
| Learn from my choices | On | Improve suggestions based on corrections |
| Tag cleanup frequency | Monthly | How often to run tag health analysis |
| Tag cleanup auto-actions | Conservative | Level of automation (conservative/moderate/aggressive) |
| Auto-merge case duplicates | On | Automatically merge tags differing only by case |
| Auto-archive dormant days | 180 | Days of inactivity before auto-archive (0 = off) |
| Warn before archive | On | Notify before archiving dormant tags |
| Tag naming convention | lowercase | Enforce naming style (lowercase/titlecase/preserve) |
| Max tags per task | 10 | Warn when exceeding this many tags |
| Show tag health score | On | Display health indicators on tag list |
| Semantic clustering | On | Group related tags by meaning |
| Hierarchy inference | On | Detect and suggest tag hierarchies |

## Privacy

- Content analysis happens on-device when possible
- AI features use task titles only (not notes) by default
- Users can disable pattern learning
- No task content shared externally without consent

## Related Specifications

- `specs/project.md` - Project data model
- `specs/tag.md` - Tag system
- `specs/folder.md` - Folder hierarchy
- `specs/inbox.md` - Inbox processing
- `improved_specs/ai-capture.md` - Task capture with extraction
- `improved_specs/ai-search.md` - Semantic search and tag-based filtering
- `improved_specs/ai-review.md` - Review process including tag health

## Sources

Research informing this specification:

- [A Complete Guide to Tagging for Personal Knowledge Management](https://fortelabs.com/blog/a-complete-guide-to-tagging-for-personal-knowledge-management/) - Forte Labs principles on action-based tagging and avoiding tag sprawl
- [AI-Powered Tag Management Trends 2025](https://superagi.com/ai-driven-tag-management-trends-2025-industry-insights-and-best-practices-for-data-privacy-and-compliance/) - Industry insights on automated tag management
- [Intelligent Tagging System Trends](https://www.typedef.ai/resources/intelligent-tagging-system-trends) - Enterprise tagging system patterns
- [Auto-tagging: How AI tags improve content management](https://kontent.ai/blog/ai-based-auto-tagging-of-content-what-you-need-to-know/) - Content management auto-tagging approaches
- [AI Data Labeling Best Practices 2025](https://labelyourdata.com/articles/ai-data-labeling) - QA infrastructure and error taxonomy patterns
- [Top Knowledge Management Trends 2025](https://enterprise-knowledge.com/top-knowledge-management-trends-2025/) - Taxonomy design and semantic layer architecture
