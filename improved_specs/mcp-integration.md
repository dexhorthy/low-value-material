# MCP/Tool Integration Specification

This specification extends `specs/task.md` with Model Context Protocol (MCP) integration capabilities. Tasks can connect to external tools, trigger automations, and pull contextual data from connected systems.

## Overview

MCP (Model Context Protocol) provides a standardized way for AI systems to integrate with external tools and data sources. In a task management context, this enables:
- **Task automation**: Trigger external actions on task events
- **Context enrichment**: Pull relevant data into tasks
- **Bi-directional sync**: Create tasks from external events
- **Progress tracking**: Monitor external work within tasks
- **Smart notifications**: Route alerts through connected channels

## Connections

Users connect external services to enable integrations. Each connection represents a link to a specific service account.

### Connection States

| Status | Meaning | User Action |
|--------|---------|-------------|
| Active | Connected and working | None needed |
| Inactive | Paused by user | Re-enable when ready |
| Auth Required | Credentials expired | Re-authenticate |
| Error | Connection failing | Check service status |

### Supported Integrations

| Service | What It Enables |
|---------|-----------------|
| Slack | Send notifications, create tasks from messages |
| GitHub | Sync issues, track PRs, auto-close on completion |
| Calendar | Block time for tasks, see availability |
| Email | Send reminders, create tasks from emails |

## Task Automations

Automations trigger actions when task events occur. Users configure what happens and when.

### Trigger Events

| Event | When It Fires | Example Use |
|-------|---------------|-------------|
| Task created | New task added | Post to Slack channel |
| Task completed | Marked done | Close linked GitHub issue |
| Due approaching | Within threshold of due date | Send reminder email |
| Due passed | Past due date | Escalation notification |
| Task updated | Any modification | Sync changes to external system |
| Note added | Note attached to task | Update linked document |
| Tag added | Tag applied | Trigger tag-specific workflow |

### Automation Actions

When a trigger fires, users can:
- **Send notification**: Post to Slack, email, SMS, or push
- **Update external system**: Close issue, update status, add comment
- **Modify task**: Add note, update field, create subtask
- **Block calendar time**: Create event for the task

### Conditional Automations

Automations can be filtered by conditions:
- Only trigger for tasks with specific tags
- Only trigger for tasks in certain projects
- Only trigger during work hours
- Only trigger when task has certain properties

**Example scenario:**
> "When I complete a task tagged #client in the 'Acme Corp' project, post to #client-updates Slack channel"

## Inbound Task Creation

External systems can create tasks automatically.

### Sources That Create Tasks

| Source | Event | Result |
|--------|-------|--------|
| GitHub | New issue assigned to you | Task created from issue |
| Slack | React with task emoji | Task created from message |
| Email | Forward to task address | Task created from email |
| Calendar | Event with task keyword | Task created from event |
| Forms | Submission received | Task created from form data |

### How It Works

1. User configures which events create tasks
2. External event occurs (e.g., GitHub issue opened)
3. System creates task with mapped fields
4. Task links back to original source

## Context Enrichment

Tasks linked to external items can display live context.

### What Users See

When viewing a task linked to a GitHub issue:

```
Task: Fix login bug
─────────────────────────────────────────────────

Details
  ...

GitHub Issue #123                    [Open in GitHub]
┌─────────────────────────────────────────────────┐
│ Status: Open                                    │
│ Assignee: @developer                            │
│ Labels: bug, priority-high                      │
│ Comments: 5                                     │
│ Last updated: 2 hours ago                       │
└─────────────────────────────────────────────────┘

Calendar Event                       [Open in Calendar]
┌─────────────────────────────────────────────────┐
│ Focus time: Tomorrow 2-4 PM                     │
│ Status: Confirmed                               │
└─────────────────────────────────────────────────┘
```

### Context Types

| Integration | Context Shown |
|-------------|---------------|
| GitHub | Issue/PR status, assignees, labels, comments |
| Calendar | Scheduled time blocks, availability |
| Slack | Related thread, reactions, participants |
| Email | Thread status, latest reply |

## Progress Tracking

Tasks can track progress from external systems.

### Progress Types

| Type | Example | Auto-Complete |
|------|---------|---------------|
| Percentage | PR review: 75% approved | Optional |
| Count | 3 of 5 subtasks done | Optional |
| Stage | Draft → Open → Review → Merged | Optional |
| Binary | Done / Not done | Optional |

When enabled, tasks automatically complete when external progress reaches 100% or final stage.

## Smart Notifications

Route notifications through preferred channels based on context.

### Routing Rules

Users configure where notifications go:
- **Urgent tasks**: Push notification + SMS
- **Work tasks**: Slack to #work channel
- **Personal tasks**: Push notification only
- **After hours**: Batch until morning

### Quiet Hours

Suppress non-urgent notifications during configured times. Urgent notifications still come through immediately.

### Batching

Group similar notifications to reduce interruptions:
- Multiple task completions → One summary
- Multiple due date reminders → Combined digest

## User Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Enable integrations | On | Master toggle for all MCP features |
| Auto-sync linked items | On | Keep external context up to date |
| Sync frequency | 5 minutes | How often to refresh external data |
| Quiet hours | Not set | Suppress notifications during these times |
| Batch notifications | 5 minutes | Group notifications within this window |

## Privacy & Security

### User Controls
- Connect and disconnect services at any time
- Choose which data is shared with each service
- Review all automation activity in audit log
- Revoke access to any connection instantly

### Data Handling
- Credentials encrypted at rest
- External data cached briefly, not stored permanently
- No data shared without explicit user consent
- Webhook secrets validated for inbound requests

## Related Specifications

- `specs/task.md` - Task data model
- `improved_specs/ai-capture.md` - Task creation from external sources
- `improved_specs/ai-suggestions.md` - Context-aware suggestions

## Sources

- [MCP Specification 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25)
- [One Year of MCP](https://blog.modelcontextprotocol.io/posts/2025-11-25-first-mcp-anniversary/)
- [MCP Prompts for Automation](http://blog.modelcontextprotocol.io/posts/2025-07-29-prompts-for-automation/)
- [Complete Guide to MCP](https://www.keywordsai.co/blog/introduction-to-mcp)
- [Zapier Webhooks](https://zapier.com/apps/webhook/integrations)
