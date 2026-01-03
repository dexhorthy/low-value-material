# MCP/Tool Integration Specification

This specification extends `specs/task.md` with Model Context Protocol (MCP) integration capabilities. Tasks can connect to external tools, trigger automations, and pull contextual data from connected systems.

## Overview

MCP (Model Context Protocol) provides a standardized way for AI systems to integrate with external tools and data sources. In a task management context, this enables:
- **Task automation**: Trigger external actions on task events
- **Context enrichment**: Pull relevant data into tasks
- **Bi-directional sync**: Create tasks from external events
- **Progress tracking**: Monitor external work within tasks
- **Smart notifications**: Route alerts through connected channels

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Task Management System                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Tasks     │  │   Events     │  │  Automation  │      │
│  │              │←─│   Engine     │──│   Runner     │      │
│  └──────────────┘  └──────┬───────┘  └──────┬───────┘      │
│                           │                  │               │
│                    ┌──────▼──────────────────▼──────┐       │
│                    │      MCP Gateway               │       │
│                    │  (connection management)       │       │
│                    └──────────────┬─────────────────┘       │
│                                   │                          │
└───────────────────────────────────┼──────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         │                          │                          │
    ┌────▼────┐              ┌──────▼──────┐            ┌──────▼──────┐
    │  Slack  │              │   GitHub    │            │  Calendar   │
    │  MCP    │              │    MCP      │            │    MCP      │
    └─────────┘              └─────────────┘            └─────────────┘
```

## Data Model

### MCP Connection

```typescript
interface MCPConnection {
  id: UUID;
  name: string;                    // "GitHub - Work"
  server_type: string;             // "github", "slack", "calendar"
  server_url?: string;             // For remote MCP servers
  auth_config: AuthConfig;
  status: ConnectionStatus;
  capabilities: MCPCapability[];
  last_sync: DateTime;
  created_at: DateTime;
}

interface AuthConfig {
  type: "oauth" | "api_key" | "client_credentials";
  credentials: Record<string, string>;  // Encrypted storage
  scopes?: string[];
  expires_at?: DateTime;
}

enum ConnectionStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  AUTH_REQUIRED = "auth_required",
  ERROR = "error"
}

interface MCPCapability {
  type: "tool" | "resource" | "prompt";
  name: string;
  description: string;
  schema?: object;
}
```

### Task MCP Binding

```typescript
interface TaskMCPBinding {
  id: UUID;
  task_id: UUID;
  connection_id: UUID;
  binding_type: BindingType;
  config: BindingConfig;
  status: BindingStatus;
  last_triggered: DateTime | null;
  trigger_count: number;
}

enum BindingType {
  ON_CREATE = "on_create",         // When task is created
  ON_COMPLETE = "on_complete",     // When task is completed
  ON_DUE = "on_due",               // When due date arrives
  ON_UPDATE = "on_update",         // When task is modified
  MANUAL = "manual",               // User-triggered
  SCHEDULED = "scheduled",         // Cron-like schedule
  WEBHOOK = "webhook"              // External trigger
}

interface BindingConfig {
  tool_name: string;               // MCP tool to invoke
  input_template: object;          // Input with {{task.field}} variables
  output_handling: OutputHandling;
  retry_policy: RetryPolicy;
  conditions?: BindingCondition[];
}

interface OutputHandling {
  action: "append_note" | "update_field" | "create_subtask" | "notify" | "ignore";
  field?: string;
  template?: string;
}

interface RetryPolicy {
  max_retries: number;
  backoff_seconds: number;
  retry_on: string[];              // Error types to retry
}

interface BindingCondition {
  field: string;
  operator: "eq" | "neq" | "contains" | "gt" | "lt";
  value: any;
}
```

### External Task Link

```typescript
interface ExternalTaskLink {
  id: UUID;
  task_id: UUID;
  connection_id: UUID;
  external_id: string;             // ID in external system
  external_url?: string;           // Link to external item
  sync_status: SyncStatus;
  sync_direction: "inbound" | "outbound" | "bidirectional";
  field_mappings: FieldMapping[];
  last_sync: DateTime;
}

interface FieldMapping {
  local_field: string;
  external_field: string;
  direction: "in" | "out" | "both";
  transform?: string;              // Optional transformation
}

enum SyncStatus {
  SYNCED = "synced",
  PENDING = "pending",
  CONFLICT = "conflict",
  ERROR = "error"
}
```

## Task Event Triggers

### Event Types

| Event | Trigger | Common Use Cases |
|-------|---------|------------------|
| `task.created` | New task created | Post to Slack, create GitHub issue |
| `task.completed` | Task marked done | Close issue, send notification |
| `task.due_approaching` | Due date within threshold | Send reminder via email/Slack |
| `task.due_passed` | Due date exceeded | Escalation notification |
| `task.updated` | Any task modification | Sync changes to external system |
| `task.note_added` | Note added to task | Update linked doc, log activity |
| `task.tag_added` | Tag applied | Trigger tag-specific workflow |
| `task.assigned` | Task assigned to user | Notify assignee via preferred channel |

### Event Payload

```typescript
interface TaskEvent {
  id: UUID;
  type: TaskEventType;
  task: Task;
  changes?: TaskChanges;          // For update events
  triggered_at: DateTime;
  metadata: Record<string, any>;
}

interface TaskChanges {
  field: string;
  old_value: any;
  new_value: any;
}
```

### Conditional Triggers

Only trigger automations when conditions match:

```typescript
const binding: TaskMCPBinding = {
  // ... other fields
  config: {
    tool_name: "slack__send_message",
    conditions: [
      { field: "tags", operator: "contains", value: "urgent" },
      { field: "project.name", operator: "eq", value: "Client Work" }
    ],
    input_template: {
      channel: "#client-updates",
      message: "Task completed: {{task.title}}"
    }
  }
};
```

## Common MCP Integrations

### Slack Integration

```typescript
// Available tools
const slackTools = [
  "slack__send_message",
  "slack__create_thread",
  "slack__add_reaction",
  "slack__update_status",
  "slack__create_reminder"
];

// Example: Notify on task completion
const slackBinding: BindingConfig = {
  tool_name: "slack__send_message",
  input_template: {
    channel: "{{task.tags | find: '@' | default: '#general'}}",
    text: "✅ *{{task.title}}* completed",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Task completed by {{user.name}}\n*Project:* {{task.project.name}}"
        }
      }
    ]
  },
  output_handling: {
    action: "append_note",
    template: "Slack notification sent to {{output.channel}}"
  }
};
```

### GitHub Integration

```typescript
// Available tools
const githubTools = [
  "github__create_issue",
  "github__close_issue",
  "github__add_comment",
  "github__create_pr",
  "github__list_issues",
  "github__get_file"
];

// Example: Create GitHub issue from task
const githubBinding: BindingConfig = {
  tool_name: "github__create_issue",
  input_template: {
    repo: "{{task.project.metadata.github_repo}}",
    title: "{{task.title}}",
    body: "{{task.note}}\n\n---\nCreated from task: {{task.url}}",
    labels: "{{task.tags | filter: 'gh-' | map: 'remove_prefix'}}"
  },
  output_handling: {
    action: "update_field",
    field: "external_links",
    template: "{{output.html_url}}"
  }
};
```

### Calendar Integration

```typescript
// Available tools
const calendarTools = [
  "calendar__create_event",
  "calendar__get_events",
  "calendar__find_free_time",
  "calendar__update_event",
  "calendar__delete_event"
];

// Example: Block time for task
const calendarBinding: BindingConfig = {
  tool_name: "calendar__create_event",
  input_template: {
    title: "🎯 {{task.title}}",
    start_time: "{{task.planned_date}}",
    duration_minutes: "{{task.estimated_duration | default: 30}}",
    description: "Task: {{task.url}}\n\n{{task.note}}"
  },
  output_handling: {
    action: "update_field",
    field: "calendar_event_id"
  }
};
```

### Email Integration

```typescript
// Available tools
const emailTools = [
  "email__send",
  "email__search",
  "email__get_thread",
  "email__create_draft"
];

// Example: Send reminder email
const emailBinding: BindingConfig = {
  tool_name: "email__send",
  input_template: {
    to: "{{task.assigned_to.email}}",
    subject: "Reminder: {{task.title}} due {{task.due_date | relative}}",
    body: "This task is due {{task.due_date | relative}}.\n\n{{task.note}}"
  }
};
```

## Inbound Task Creation

### Webhook Endpoint

External systems can create tasks via webhook:

```
POST /api/webhooks/tasks
Headers:
  X-Webhook-Secret: <secret>
  Content-Type: application/json

Body: {
  source: "github",
  event_type: "issue.opened",
  payload: {
    title: "Bug: Login fails on mobile",
    body: "Steps to reproduce...",
    labels: ["bug", "mobile"],
    url: "https://github.com/org/repo/issues/123"
  }
}
```

### Webhook Configuration

```typescript
interface WebhookConfig {
  id: UUID;
  name: string;
  source: string;                  // "github", "slack", "custom"
  secret: string;                  // For validation
  enabled: boolean;
  mapping: WebhookMapping;
  target_project?: UUID;
  default_tags?: string[];
}

interface WebhookMapping {
  title: string;                   // "{{payload.title}}"
  note: string;                    // "{{payload.body}}"
  due_date?: string;
  tags?: string;
  external_id?: string;
  external_url?: string;
}
```

### Common Inbound Sources

| Source | Events | Mapping |
|--------|--------|---------|
| GitHub | issue.opened, issue.assigned | Issue → Task |
| Slack | reaction_added, message | Message → Task |
| Email | New email with tag/label | Email → Task |
| Calendar | Event reminder | Event → Task |
| Forms | Form submission | Submission → Task |

## Context Enrichment

### Pulling External Data

Tasks can fetch context from connected systems:

```typescript
interface ContextEnrichment {
  task_id: UUID;
  connection_id: UUID;
  trigger: "on_view" | "on_demand" | "scheduled";
  tool_name: string;
  query_template: object;
  display: ContextDisplay;
  cache_ttl: Duration;
}

interface ContextDisplay {
  type: "sidebar" | "inline" | "expandable";
  title: string;
  format: "text" | "list" | "table" | "card";
}
```

### Example: GitHub Issue Status

```typescript
const githubContext: ContextEnrichment = {
  trigger: "on_view",
  tool_name: "github__get_issue",
  query_template: {
    repo: "{{task.external_links.github.repo}}",
    issue_number: "{{task.external_links.github.number}}"
  },
  display: {
    type: "sidebar",
    title: "GitHub Issue",
    format: "card"
  },
  cache_ttl: { minutes: 5 }
};
```

### Context UI

```
┌─────────────────────────────────────────────────────────┐
│ Task: Fix login bug                                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ 📋 Details                                              │
│ ...                                                      │
│                                                          │
│ 🔗 GitHub Issue #123                      [↗️ Open]      │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Status: Open                                        │ │
│ │ Assignee: @developer                                │ │
│ │ Labels: bug, priority-high                          │ │
│ │ Comments: 5                                         │ │
│ │ Last updated: 2 hours ago                           │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ 📅 Calendar Event                         [↗️ Open]      │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Focus time: Tomorrow 2-4 PM                         │ │
│ │ Status: Confirmed                                   │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Progress Tracking

### External Progress Sync

Track progress of linked external items:

```typescript
interface ProgressTracker {
  task_id: UUID;
  connection_id: UUID;
  external_id: string;
  progress_type: ProgressType;
  current_value: number;
  target_value: number;
  last_updated: DateTime;
  auto_complete: boolean;         // Complete task when external done
}

enum ProgressType {
  PERCENTAGE = "percentage",
  COUNT = "count",                // e.g., 3/5 subtasks
  STAGE = "stage",                // e.g., "In Review"
  BINARY = "binary"               // Done/not done
}
```

### Example: PR Progress

```typescript
// Track GitHub PR progress
const prTracker: ProgressTracker = {
  progress_type: ProgressType.STAGE,
  stages: ["Draft", "Open", "In Review", "Approved", "Merged"],
  auto_complete: true              // Complete task when PR merged
};
```

## Smart Notifications

### Multi-Channel Routing

Route notifications based on context:

```typescript
interface NotificationRoute {
  id: UUID;
  name: string;
  conditions: RouteCondition[];
  channels: NotificationChannel[];
  schedule?: NotificationSchedule;
}

interface NotificationChannel {
  type: "slack" | "email" | "sms" | "push" | "webhook";
  config: Record<string, any>;
  priority: number;
}

interface NotificationSchedule {
  quiet_hours?: TimeRange;
  batch_window?: Duration;        // Batch notifications
  max_per_day?: number;
}
```

### Routing Example

```typescript
const urgentRoute: NotificationRoute = {
  name: "Urgent Task Notifications",
  conditions: [
    { field: "tags", operator: "contains", value: "urgent" },
    { field: "due_date", operator: "lt", value: "{{now + 24h}}" }
  ],
  channels: [
    { type: "push", priority: 1 },
    { type: "slack", config: { channel: "#urgent" }, priority: 2 },
    { type: "sms", priority: 3 }
  ]
};
```

## API Endpoints

### Connections

```
GET /api/mcp/connections
POST /api/mcp/connections
GET /api/mcp/connections/{id}
DELETE /api/mcp/connections/{id}
POST /api/mcp/connections/{id}/test
POST /api/mcp/connections/{id}/refresh-auth
```

### Task Bindings

```
GET /api/tasks/{task_id}/bindings
POST /api/tasks/{task_id}/bindings
DELETE /api/tasks/{task_id}/bindings/{binding_id}
POST /api/tasks/{task_id}/bindings/{binding_id}/trigger
```

### Webhooks

```
GET /api/webhooks
POST /api/webhooks
GET /api/webhooks/{id}
DELETE /api/webhooks/{id}
POST /api/webhooks/{id}/test
```

### Tool Invocation

```
POST /api/mcp/invoke
Body: {
  connection_id: UUID,
  tool_name: string,
  input: object
}

Response: {
  output: any,
  execution_time_ms: number
}
```

## Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `mcp.enabled` | Boolean | true | Enable MCP integrations |
| `mcp.auto_sync` | Boolean | true | Auto-sync linked items |
| `mcp.sync_interval` | Duration | 5m | How often to sync |
| `mcp.max_retries` | Integer | 3 | Retry failed operations |
| `mcp.timeout` | Duration | 30s | Tool invocation timeout |
| `mcp.rate_limit` | Integer | 100 | Max requests per minute |
| `notifications.quiet_hours` | TimeRange | null | Suppress notifications |
| `notifications.batch_window` | Duration | 5m | Batch similar notifications |

## Security Considerations

### Authentication
- OAuth 2.0 with PKCE for user-facing integrations
- Client credentials for machine-to-machine
- API keys with scoped permissions
- Credentials encrypted at rest

### Authorization
- Per-connection permission scopes
- User can revoke any connection
- Audit log of all tool invocations
- Rate limiting per connection

### Data Privacy
- Webhook secrets validated
- External data cached with TTL
- User controls what data is shared
- No automatic data sharing without consent

## Error Handling

```typescript
interface MCPError {
  code: MCPErrorCode;
  message: string;
  connection_id?: UUID;
  tool_name?: string;
  retryable: boolean;
  retry_after?: Duration;
}

enum MCPErrorCode {
  AUTH_FAILED = "auth_failed",
  RATE_LIMITED = "rate_limited",
  TIMEOUT = "timeout",
  TOOL_NOT_FOUND = "tool_not_found",
  INVALID_INPUT = "invalid_input",
  SERVER_ERROR = "server_error",
  CONNECTION_ERROR = "connection_error"
}
```

## Performance

| Operation | Target Latency |
|-----------|---------------|
| Tool invocation | < 5s |
| Webhook processing | < 500ms |
| Context fetch (cached) | < 100ms |
| Context fetch (fresh) | < 2s |
| Connection test | < 3s |

## Related Specifications

- `specs/task.md` - Task data model
- `improved_specs/ai-capture.md` - Task creation from external sources
- `improved_specs/ai-suggestions.md` - Context-aware suggestions
- `improved_specs/ai-processing-reference.md` - Claude Agent SDK tools

## Sources

- [MCP Specification 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25)
- [One Year of MCP](https://blog.modelcontextprotocol.io/posts/2025-11-25-first-mcp-anniversary/)
- [MCP Prompts for Automation](http://blog.modelcontextprotocol.io/posts/2025-07-29-prompts-for-automation/)
- [Complete Guide to MCP](https://www.keywordsai.co/blog/introduction-to-mcp)
- [Zapier Webhooks](https://zapier.com/apps/webhook/integrations)
