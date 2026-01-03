# AI Integration Specification

This specification defines how AI capabilities integrate with the task management system, enabling intelligent capture, processing, organization, and task execution through structured AI outputs, tool calling, and agent dispatch.

## Overview

The AI integration layer provides:
- **Structured extraction**: Parse unstructured input into typed task data
- **Tool calling**: Allow AI agents to interact with the task system
- **Agent dispatch**: Delegate complex tasks to locally-running AI agents
- **MCP integration**: Connect external tools and services to tasks

## AI Schema Definitions (BAML-Inspired)

Define strongly-typed schemas for AI extraction and generation. These schemas ensure type-safe interactions between AI models and the task system.

### Core Type Definitions

```baml
// Priority levels with semantic descriptions for AI understanding
enum Priority {
  URGENT @description("Must be done today, blocking other work")
  HIGH @description("Important, should be done this week")
  NORMAL @description("Standard priority, no special urgency")
  LOW @description("Nice to have, can be deferred indefinitely")
  SOMEDAY @description("Aspirational, no commitment to complete")
}

// Energy/focus level required
enum EnergyLevel {
  HIGH @description("Requires deep focus, creative thinking, or complex problem solving")
  MEDIUM @description("Moderate attention needed, routine but not trivial")
  LOW @description("Can be done while tired, waiting, or multitasking")
}

// Time estimates with semantic ranges
enum TimeEstimate {
  QUICK @description("Under 5 minutes")
  SHORT @description("5-15 minutes")
  MEDIUM @description("15-60 minutes")
  LONG @description("1-4 hours")
  EXTENDED @description("More than 4 hours, may need breaking down")
}

// Context/location hints
enum ContextHint {
  HOME @description("Requires being at home")
  OFFICE @description("Requires being at work/office")
  COMPUTER @description("Requires a computer with internet")
  PHONE @description("Can be done from a phone")
  ERRANDS @description("Requires being out, running errands")
  ANYWHERE @description("No location constraints")
}
```

### Extracted Task Schema

```baml
class ExtractedTask {
  title string @description("Concise action starting with a verb, 5-50 chars")
  note string? @description("Additional context, details, or background")
  priority Priority?
  energy EnergyLevel?
  time_estimate TimeEstimate?
  context_hints ContextHint[]
  due_date string? @description("ISO 8601 date if deadline mentioned")
  defer_until string? @description("ISO 8601 date if should wait until")
  suggested_project string? @description("Project name if obvious from context")
  suggested_tags string[] @description("Tag names inferred from content")
  dependencies string[] @description("Other tasks this depends on")
  is_waiting_for bool @description("True if blocked on external input")
  waiting_for_whom string? @description("Person/entity being waited on")
}

class ExtractedTaskBatch {
  tasks ExtractedTask[]
  suggested_project_for_all string? @description("If all tasks belong to same project")
  source_summary string @description("Brief summary of where tasks came from")
}
```

### AI Extraction Functions

```baml
// Extract tasks from unstructured text (meeting notes, emails, voice memos)
function ExtractTasks(input: string, context?: string) -> ExtractedTaskBatch {
  client Claude
  prompt #"
    Extract actionable tasks from the following input.

    Guidelines:
    - Each task title should start with a verb (Call, Email, Review, Create, etc.)
    - Identify dependencies between tasks when mentioned
    - Mark tasks as "waiting for" when blocked on external parties
    - Infer reasonable priority, energy, and time estimates
    - Suggest tags based on content (people mentioned, tools, topics)

    {{ ctx.output_format }}

    {{ _.role("user") }}
    Input:
    ---
    {{ input }}
    ---

    {% if context %}
    Additional context:
    {{ context }}
    {% endif %}
  "#
}

// Suggest organization for an inbox item
function SuggestOrganization(
  task_title: string,
  task_note: string?,
  existing_projects: string[],
  existing_tags: string[]
) -> OrganizationSuggestion {
  client Claude
  prompt #"
    Suggest how to organize this inbox item.

    Available projects: {{ existing_projects | join(", ") }}
    Available tags: {{ existing_tags | join(", ") }}

    {{ ctx.output_format }}

    {{ _.role("user") }}
    Task: {{ task_title }}
    {% if task_note %}Note: {{ task_note }}{% endif %}
  "#
}

class OrganizationSuggestion {
  recommended_project string? @description("Existing project name or null for new/inbox")
  create_new_project bool @description("True if task warrants a new project")
  new_project_name string? @description("Suggested name if creating new project")
  recommended_tags string[] @description("Tags from existing list")
  suggested_new_tags string[] @description("New tags to create")
  confidence float @description("0-1 confidence in suggestions")
  reasoning string @description("Brief explanation of suggestions")
}
```

## Tool Definitions for AI Agents

Define tools that AI agents can invoke to interact with the task system. Uses Vercel AI SDK patterns for tool calling.

### Task Tools

```typescript
import { tool } from 'ai';
import { z } from 'zod';

// Create a new task
const createTask = tool({
  name: 'create_task',
  description: 'Create a new task in the system',
  inputSchema: z.object({
    title: z.string().min(1).max(500).describe('Task title starting with a verb'),
    note: z.string().optional().describe('Extended notes'),
    project_id: z.string().uuid().optional().describe('Parent project ID'),
    parent_task_id: z.string().uuid().optional().describe('Parent task for subtasks'),
    due_date: z.string().datetime().optional().describe('Hard deadline'),
    defer_date: z.string().datetime().optional().describe('When task becomes available'),
    flagged: z.boolean().default(false).describe('Mark as important'),
    tags: z.array(z.string().uuid()).default([]).describe('Tag IDs to assign'),
    estimated_minutes: z.number().positive().optional().describe('Time estimate in minutes'),
  }),
  execute: async (args) => {
    const task = await taskService.create(args);
    return {
      success: true,
      task_id: task.id,
      message: `Created task: ${task.title}`,
    };
  },
});

// Complete a task
const completeTask = tool({
  name: 'complete_task',
  description: 'Mark a task as completed',
  inputSchema: z.object({
    task_id: z.string().uuid().describe('ID of task to complete'),
    completion_note: z.string().optional().describe('Note about completion'),
  }),
  execute: async (args) => {
    const task = await taskService.complete(args.task_id, args.completion_note);
    return {
      success: true,
      message: `Completed: ${task.title}`,
      next_available: task.nextAvailable?.title, // For sequential projects
    };
  },
});

// Query tasks
const queryTasks = tool({
  name: 'query_tasks',
  description: 'Search and filter tasks',
  inputSchema: z.object({
    status: z.enum(['active', 'completed', 'dropped']).optional(),
    project_id: z.string().uuid().optional(),
    tag_ids: z.array(z.string().uuid()).optional(),
    flagged_only: z.boolean().optional(),
    available_only: z.boolean().optional(),
    due_before: z.string().datetime().optional(),
    search_text: z.string().optional(),
    limit: z.number().min(1).max(100).default(20),
  }),
  execute: async (args) => {
    const tasks = await taskService.query(args);
    return {
      count: tasks.length,
      tasks: tasks.map(t => ({
        id: t.id,
        title: t.title,
        project: t.project?.title,
        due_date: t.due_date,
        flagged: t.flagged,
        available: t.isAvailable,
      })),
    };
  },
});

// Process inbox item
const processInboxItem = tool({
  name: 'process_inbox_item',
  description: 'Move an inbox item to a project or complete it',
  inputSchema: z.object({
    task_id: z.string().uuid().describe('Inbox item ID'),
    action: z.enum(['assign_project', 'assign_task', 'complete', 'drop', 'convert_to_project']),
    target_id: z.string().uuid().optional().describe('Project or parent task ID'),
    new_project_type: z.enum(['parallel', 'sequential', 'single_actions']).optional(),
  }),
  execute: async (args) => {
    const result = await inboxService.process(args);
    return { success: true, ...result };
  },
});
```

### Project Tools

```typescript
const createProject = tool({
  name: 'create_project',
  description: 'Create a new project to group related tasks',
  inputSchema: z.object({
    title: z.string().min(1).max(500),
    type: z.enum(['parallel', 'sequential', 'single_actions']).default('parallel'),
    folder_id: z.string().uuid().optional(),
    note: z.string().optional(),
    due_date: z.string().datetime().optional(),
    tags: z.array(z.string().uuid()).default([]),
    review_interval_days: z.number().min(1).default(7),
  }),
  execute: async (args) => {
    const project = await projectService.create(args);
    return { success: true, project_id: project.id };
  },
});

const getProjectStatus = tool({
  name: 'get_project_status',
  description: 'Get detailed status of a project including task breakdown',
  inputSchema: z.object({
    project_id: z.string().uuid(),
  }),
  execute: async (args) => {
    const project = await projectService.getWithStats(args.project_id);
    return {
      title: project.title,
      status: project.status,
      type: project.type,
      total_tasks: project.stats.total,
      completed_tasks: project.stats.completed,
      available_tasks: project.stats.available,
      next_action: project.nextAction?.title,
      is_stalled: project.isStalled,
      needs_review: project.needsReview,
    };
  },
});
```

### Organizational Tools

```typescript
const suggestNextActions = tool({
  name: 'suggest_next_actions',
  description: 'Get AI-suggested next actions based on context',
  inputSchema: z.object({
    context: z.enum(['morning', 'afternoon', 'evening', 'quick_break', 'deep_work', 'low_energy']),
    available_minutes: z.number().positive().optional(),
    location: z.enum(['home', 'office', 'mobile', 'anywhere']).optional(),
    limit: z.number().min(1).max(10).default(5),
  }),
  execute: async (args) => {
    const suggestions = await aiService.suggestNextActions(args);
    return {
      suggestions: suggestions.map(s => ({
        task_id: s.task.id,
        title: s.task.title,
        project: s.task.project?.title,
        reason: s.reason,
        estimated_minutes: s.task.estimatedMinutes,
      })),
    };
  },
});

const analyzeWorkload = tool({
  name: 'analyze_workload',
  description: 'Analyze current workload and commitments',
  inputSchema: z.object({
    time_horizon_days: z.number().min(1).max(90).default(7),
  }),
  execute: async (args) => {
    const analysis = await aiService.analyzeWorkload(args.time_horizon_days);
    return {
      overdue_count: analysis.overdue,
      due_soon_count: analysis.dueSoon,
      total_estimated_hours: analysis.totalEstimatedHours,
      available_hours_estimate: analysis.availableHours,
      overcommitted: analysis.isOvercommitted,
      recommendations: analysis.recommendations,
    };
  },
});
```

## Agent Dispatch (Claude Agent SDK Integration)

For complex multi-step workflows, dispatch tasks to locally-running AI agents that can use tools and maintain context across operations.

### Agent Task Definition

```typescript
interface AgentTask {
  id: UUID;
  type: AgentTaskType;
  status: 'pending' | 'running' | 'completed' | 'failed';
  task_id?: UUID;          // Related system task (optional)
  prompt: string;          // What the agent should accomplish
  allowed_tools: string[]; // Which tools agent can use
  max_turns: number;       // Limit agent iterations
  timeout_seconds: number; // Maximum runtime
  result?: AgentTaskResult;
  created_at: Timestamp;
  started_at?: Timestamp;
  completed_at?: Timestamp;
}

enum AgentTaskType {
  INBOX_PROCESSING    // Process and organize multiple inbox items
  PROJECT_PLANNING    // Break down a goal into project + tasks
  WEEKLY_REVIEW       // Conduct a GTD weekly review
  TASK_RESEARCH       // Research needed to complete a task
  TASK_EXECUTION      // Actually perform the task (with MCP tools)
  DAILY_PLANNING      // Plan today's work
  STALLED_PROJECT_FIX // Identify next actions for stalled projects
}
```

### Agent Dispatch Operations

```typescript
// Dispatch an agent to process inbox
async function dispatchInboxProcessor(options: {
  batch_size?: number;
  auto_apply?: boolean;  // Apply suggestions automatically vs. queue for review
}): Promise<AgentTask> {
  const inboxItems = await inboxService.list({ limit: options.batch_size ?? 20 });

  return agentService.dispatch({
    type: AgentTaskType.INBOX_PROCESSING,
    prompt: `Process these inbox items by:
      1. Extracting any sub-tasks from notes
      2. Suggesting project assignments
      3. Adding appropriate tags
      4. Setting due dates when mentioned
      5. Marking waiting-for items

      Inbox items: ${JSON.stringify(inboxItems.map(i => ({ id: i.id, title: i.title, note: i.note })))}`,
    allowed_tools: [
      'query_tasks',
      'create_task',
      'process_inbox_item',
      'create_project',
    ],
    max_turns: 50,
    timeout_seconds: 300,
  });
}

// Dispatch weekly review agent
async function dispatchWeeklyReview(): Promise<AgentTask> {
  return agentService.dispatch({
    type: AgentTaskType.WEEKLY_REVIEW,
    prompt: `Conduct a GTD weekly review:
      1. Get inbox to zero - process all items
      2. Review all active projects - identify stalled ones
      3. Check for projects needing review
      4. Identify tasks overdue or due soon
      5. Suggest tasks to drop or defer
      6. Generate a summary report`,
    allowed_tools: [
      'query_tasks',
      'complete_task',
      'process_inbox_item',
      'get_project_status',
      'analyze_workload',
    ],
    max_turns: 100,
    timeout_seconds: 600,
  });
}
```

### Agent with MCP Server Integration

```python
from claude_agent_sdk import tool, create_sdk_mcp_server, ClaudeAgentOptions

# Define task execution tools that connect to external services
@tool("send_email", "Send an email message", {
    "to": str,
    "subject": str,
    "body": str,
    "task_id": str  # Link back to the task being executed
})
async def send_email(args):
    result = await email_service.send(
        to=args["to"],
        subject=args["subject"],
        body=args["body"]
    )
    # Mark the associated task as complete
    if args.get("task_id"):
        await task_service.complete(args["task_id"],
            completion_note=f"Email sent to {args['to']}")
    return {"content": [{"type": "text", "text": f"Email sent: {result.id}"}]}

@tool("calendar_create_event", "Create a calendar event", {
    "title": str,
    "start_time": str,
    "end_time": str,
    "attendees": list
})
async def calendar_create_event(args):
    event = await calendar_service.create_event(**args)
    return {"content": [{"type": "text", "text": f"Event created: {event.url}"}]}

@tool("web_search", "Search the web for information", {
    "query": str,
    "task_id": str  # Task this research is for
})
async def web_search(args):
    results = await search_service.search(args["query"])
    return {"content": [{"type": "text", "text": format_search_results(results)}]}

# Create MCP server with execution tools
execution_tools = create_sdk_mcp_server(
    name="task-execution",
    version="1.0.0",
    tools=[send_email, calendar_create_event, web_search]
)

# Dispatch agent with execution capabilities
async def dispatch_task_executor(task_id: str):
    task = await task_service.get(task_id)

    options = ClaudeAgentOptions(
        mcp_servers={"execution": execution_tools},
        allowed_tools=[
            "mcp__execution__send_email",
            "mcp__execution__calendar_create_event",
            "mcp__execution__web_search",
        ],
        max_turns=20
    )

    async for message in query(
        prompt=f"Execute this task: {task.title}\n\nNotes: {task.note or 'None'}",
        options=options
    ):
        if message.type == "result":
            return message.result
```

## MCP Server Connectivity

Enable tasks to connect to external tools and services through MCP servers.

### Task-Level MCP Connections

Extend the task data model to support MCP tool connections:

```
// Additional Task fields for MCP integration
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `mcp_connections` | MCPConnection[] | [] | Connected MCP servers and tools |
| `execution_config` | ExecutionConfig | null | How to execute this task via agent |
```

### MCP Connection Schema

```typescript
interface MCPConnection {
  server_name: string;      // MCP server identifier
  tool_name: string;        // Specific tool on that server
  input_mapping: Record<string, string>;  // Task fields → tool inputs
  auto_execute: boolean;    // Execute when task becomes available?
  execution_conditions: {
    require_confirmation: boolean;
    time_window?: { start: string; end: string }; // Only execute during these hours
    retry_on_failure: boolean;
    max_retries: number;
  };
}

interface ExecutionConfig {
  agent_type: AgentTaskType;
  prompt_template: string;  // Template with {{task.title}}, {{task.note}}, etc.
  allowed_tools: string[];
  max_turns: number;
  timeout_seconds: number;
}
```

### Example: Email Follow-up Task with MCP

```json
{
  "id": "task-123",
  "title": "Follow up with Alice about proposal",
  "note": "Check if she reviewed the Q4 budget proposal",
  "mcp_connections": [{
    "server_name": "email",
    "tool_name": "send_email",
    "input_mapping": {
      "to": "alice@example.com",
      "subject": "Following up: Q4 Budget Proposal",
      "body": "{{task.note}}"
    },
    "auto_execute": false,
    "execution_conditions": {
      "require_confirmation": true,
      "time_window": { "start": "09:00", "end": "17:00" },
      "retry_on_failure": false
    }
  }],
  "execution_config": {
    "agent_type": "TASK_EXECUTION",
    "prompt_template": "Send a polite follow-up email about: {{task.title}}",
    "allowed_tools": ["mcp__email__send_email"],
    "max_turns": 5,
    "timeout_seconds": 60
  }
}
```

## AI-Assisted Workflows

### Intelligent Capture

When text is captured (voice, email, paste), the AI extraction pipeline:

1. **Parse** - Use `ExtractTasks` to identify actionable items
2. **Enrich** - Add priority, energy, time estimates
3. **Organize** - Use `SuggestOrganization` to recommend projects/tags
4. **Queue** - Add to inbox with tentative assignments
5. **Review** - User confirms or adjusts suggestions

### Smart Review

During review cycles, AI assists by:

1. **Identifying stalled projects** - No available next action
2. **Suggesting task breakdown** - Tasks estimated > 4 hours
3. **Flagging overdue** - Tasks past due or slipping
4. **Recommending drops** - Tasks not touched in 30+ days
5. **Workload balancing** - Too many due dates clustered

### Contextual Next Actions

When user asks "what should I work on?", consider:

1. **Time available** - Filter by estimate
2. **Energy level** - Match task energy requirements
3. **Location/context** - Filter by context tags
4. **Due dates** - Prioritize urgent
5. **Dependencies** - Only show unblocked tasks
6. **User patterns** - Learn from completion history

## Out of Scope (Future Specs)

- AI model configuration and provider switching (see `specs/ai-config.md`)
- Training on user data for personalization (see `specs/ai-learning.md`)
- Voice interface integration (see `specs/voice.md`)
- Natural language querying (see `specs/nl-query.md`)
