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

Effective tag systems require ongoing maintenance. Without it, tags sprawl into unusable states—duplicates accumulate, naming conventions drift, and valuable categorizations become buried. The system helps users keep their tags organized through regular health reports and cleanup suggestions.

### Recurring Cleanup Suggestions

The system periodically analyzes tags and presents cleanup opportunities to users:

**Types of suggestions:**
- Duplicate tags that could be merged
- Unused tags that could be archived
- Inconsistent tagging patterns
- Tags that might need restructuring

Users can review suggestions and decide what to apply, making the system adaptive to their preferences.

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

### Tag Consolidation Suggestions

The system identifies related tags and suggests consolidating them:

**Common consolidation opportunities:**
- Similar tags with different naming (e.g., @calls, @call, @phone)
- Synonym tags that serve the same purpose
- Tags that form a natural hierarchy (e.g., @work-meetings, @work-admin under @work)

The system shows which tasks are affected and previews the result before merging, preserving all task history.

### Tag Suggestions During Cleanup

When reviewing the health report, the system can suggest applying missing tags to tasks. For example, it might notice that many tasks mention "budget" but aren't tagged with @finance, and offer to apply the tag to matching tasks in batch.

## User Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Auto-suggest tags | On | Show tag suggestions when creating tasks |
| Breakdown threshold | 2 hours | Suggest breakdown for tasks estimated longer |
| Detect project clusters | On | Find related inbox items |
| Show related tasks | On | Display related tasks when viewing a task |
| Learn from my choices | On | Improve suggestions based on corrections |
| Tag cleanup frequency | Monthly | How often to review tag health |
| Max tags per task | 10 | Warn when exceeding this many tags |

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
